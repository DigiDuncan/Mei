"use strict";

const ordinal = require("ordinal");
const escapeStringRegexp = require("escape-string-regexp");

const { choose, capitalize, chunkArray, chooseMember, getMentioned, AliasMap } = require("./misc");
const lewdsdb = require("./lewds");
const datadb = require("./data");
const peopledb = require("./people");
const ids = require("./ids");

// Map of subtype aliases to subtypes
// TODO: convert to json file
var subtypeAliasMap = AliasMap([
    {
        name: "boob",
        aliases: ["boobs", "tit", "tits", "breast", "breasts"],
        emoji: ":melon:"
    },
    {
        name: "butt",
        aliases: ["bum", "bums", "butts", "ass"],
        emoji: ":peach:"
    },
    {
        name: "vagina",
        aliases: ["pussy", "insertion", "cunt", "cunny"],
        emoji: ":sweat_drops:"
    },
    {
        name: "foot",
        aliases: ["foote", "feet"],
        emoji: ":footprints:"
    },
    {
        name: "panty",
        aliases: ["panties", "pantie", "underwear", "thong", "thongs"],
        emoji: ":bikini:"
    },
    {
        name: "vore",
        aliases: ["mouth"],
        emoji: ":lips:"
    },
    {
        name: "hand",
        aliases: ["hands"],
        emoji: ":raised_back_of_hand:"
    },
    {
        name: "leg",
        aliases: ["legs", "thighs", "thigh"],
        emoji: ":dancer:"
    },
    {
        name: "proposal",
        aliases: ["mary", "wed", "marriage"],
        emoji: ":ring:"
    },
    {
        name: "cloth",
        aliases: ["clothes", "clothing", "bra", "pants"],
        emoji: ":shirt:"
    },
    {
        name: "toy",
        aliases: ["dildo", "beads", "object", "plug"],
        emoji: ":battery:"
    },
    {
        name: "misc",
        aliases: ["alt", "other"],
        emoji: ":question:"
    },
    {
        name: "Random",
        aliases: [],
        emoji: ":question:"
    }
]);

// Guild specific character names
// TODO: convert to json file
var defaultCharacterNames = ["Mei", "Sucy", "2B", "Mt. Lady", "Vena", "Miku", "Lexi", "Baiken", "Ryuko", "Sombra", "Wolfer", "Gwen", "Mercy", "Gwynevere", "Tracer", "Aqua", "Megumin", "Cortana", "Yuna", "Lulu", "Rikku", "Rosalina", "Samus", "Princess Peach", "Palutena", "Shin", "Kimmy", "Zoey", "Camilla", "Lillian", "Narumi", "D.va"];
var guildCharacterNames = {
    // Krumbly's ant farm only
    [ids.guilds.krumblysantfarm]: ["Mei", "Sucy", "2B", "Mt. Lady", "Rika", "Miku", "Lexi", "Lucy", "Ryuko", "Krumbly"],
    // r/Macrophilia Only
    [ids.guilds.r_macrophilia]: ["Miau"],
    // Giantess Archive
    [ids.guilds.giantessarchive]: ["Brittany", "Bethany", "Alicia", "Katie", "Cali", "Asuna", "Cat", "Brianna", "Emily", "Alice", "Yuri", "Monica", "Brie", "Sierra"],
    // The Big House Only
    [ids.guilds.bighouse]: defaultCharacterNames.concat(["Zem", "Ardy", "Vas"]),
    // Small World Only
    [ids.guilds.smallworld]: defaultCharacterNames.concat([{name: "Docop", gender: "male"}, "Mikki", "Spellgirl"]),
    // The Giantess Club Only
    [ids.guilds.giantessclub]: ["Yami", "Mikan", "Momo", "Nana", "Yui", "May", "Dawn", "Hilda", "Rosa", "Serena", "Palutena", "Wii Fit Trainer", "Lucina", "Robin", "Corrin", "Bayonetta", "Zelda", "Sheik", "Tifa", "Chun-li", "R. Mika", "Daisy", "Misty", "Gardevoir", "Lyn", "Cammy", "Angewomon", "Liara", "Samara", "Tali", "Miranda", "Cus", "Marcarita", "Vados", "Wendy", "Sabrina", "Cana", "Erza", "Levy", "Lucy", "Wendy Marvell"]
};

// Pool of lewd stories
var storyPool = {};

function getSubtype(subtypeName) {
    var subtype = subtypeAliasMap[subtypeName.toLowerCase()] || subtypeAliasMap.Random;
    return subtype;
}

// Characters
function getAllCharacters(userdata, guildid) {
    var userCharacters = getUserCharacters(userdata);
    var guildCharacters = getGuildCharacters(guildid);
    var allCharacters = userCharacters.concat(guildCharacters);
    return allCharacters;
}

function getCharacters(userdata, guildid) {
    var characters = getUserCharacters(userdata);
    if (characters.length === 0) {
        characters = getGuildCharacters(guildid);
    }
    return characters;
}

function getGuildCharacters(guildid) {
    var characters = guildCharacterNames[guildid] || defaultCharacterNames;
    characters = characters.map(function(character) {
        // Convert character names into character objects
        if (typeof character === "string") {
            character = {
                name: character,
                gender: "female"
            };
        }
        return character;
    });
    return characters;
}

function getUserCharacters(userdata) {
    var userCharacterNames = userdata && userdata.names && Object.keys(userdata.names) || [];
    var userCharacters = userCharacterNames.map(function([name]) {
        return {
            name: name,
            gender: userdata.names[name]
        };
    });
    return userCharacters;
}

// Summary of available character names
function getNamesSummary(userdata, guildid, perLine) {
    var characters = getCharacters(userdata, guildid);

    var names = characters.map(c => c.name);
    if (perLine === undefined) {
        perLine = 4;
    }

    // Group names in groups of [perLine] per line
    var namesString = chunkArray(names, perLine).map(function(chunk) {
        return chunk.join(", ");
    }).join(",\n");

    return "**Names available: **" + characters.length + "\n" + namesString;
}

// Summary of lewds
function getLewdCountsSummary(type) {
    var friendlyTypes = {
        "violent": "Smushes",
        "tf": "TF's",
        "gentle": "Gentles"
    };
    var friendlyType = friendlyTypes[type];

    var total = 0;
    var lines = [];
    var typepool = storyPool[type];
    Object.keys(typepool).forEach(function(subtype) {
        var subtypepool = typepool[subtype];
        var count = subtypepool.length;
        total += count;
        lines.push("**" + capitalize(subtype) + " " + friendlyType + ":** " + count);
    });
    lines.unshift("**Total " + friendlyType + ":** " + total);

    var output = lines.join("\n\n");
    return output;
}

function getLewdSummary(userdata, guildid, type) {
    var namesSummary = getNamesSummary(userdata, guildid);

    var lewdCountsSummary = getLewdCountsSummary(type);

    var summaryString = namesSummary + "\n \n" + lewdCountsSummary;
    return summaryString;
}

// Generate Lewd Story
function generateStoryMessage(userdata, bigchar, guildid, type, subtype) {
    //=============get names==================
    if (!bigchar) {
        bigchar = choose(getCharacters(userdata, guildid));
    }

    //=========panty info============

    var sides = ["front", "back"];
    var types1 = {
        "female": ["panties", "underwear", "thongs"],
        "male": ["underwear", "boxers", "briefs"],
        "futa": ["panties", "underwear", "thongs", "boxers", "briefs"]
    };

    var types2 = {
        "female": ["panty", "thong", "underwear"],
        "male": ["underwear"],
        "futa": ["panty", "thong", "underwear"]
    };

    var side = choose(sides);
    var type1 = choose(types1[bigchar.gender]);
    var type2 = choose(types2[bigchar.gender]);

    //============feet info================
    var adjectivesFeet = ["stinky", "smelly", "sweaty", "damp", "pungent", "odorous", "sweet-scented", "huge", "powerful", "godly", "beautiful", "dirty", "filthy", "disgusting", "rancid", "giant", "massive", "moist", "sweat-soaked", "victim-covered", "soft", "lotion-scented"];
    var adjectivesFootwear = ["stinky", "smelly", "sweaty", "damp", "pungent", "odorous", "sweet-scented", "huge", "stinky, sweaty", "dirty", "filthy", "disgusting", "rancid", "giant", "massive", "moist", "sweat-soaked", "victim-covered", "old", "worn out", "grimy"];

    var adjectiveFeet = "";
    var adjectiveFootwear = "";

    var roll = Math.floor(Math.random() * 20) + 1; // roll from 1-20
    if (roll > 0 && roll < 16) { // If the roll is between 1-5
        adjectiveFeet = choose(adjectivesFeet) + " ";
        adjectiveFootwear = choose(adjectivesFootwear) + " ";
        if (roll > 0 && roll < 7) {
            var adjectiveFeet1 = choose(adjectivesFeet);
            var adjectiveFeet2 = choose(adjectivesFeet);
            if (adjectiveFeet1 === adjectiveFeet2) {
                adjectiveFeet2 = choose(adjectivesFeet);
            }
            adjectiveFeet = adjectiveFeet1 + ", " + adjectiveFeet2 + " ";

            var adjectiveFootwear1 = choose(adjectivesFootwear);
            var adjectiveFootwear2 = choose(adjectivesFootwear);
            if (adjectiveFootwear1 === adjectiveFootwear2) {
                adjectiveFootwear2 = choose(adjectivesFootwear);
            }
            adjectiveFootwear = adjectiveFootwear1 + ", " + adjectiveFootwear2 + " ";
        }
    }

    var nakedFeetPlurals = ["bare feet", "heels", "arches", "big toes", "toes", "soles"];
    var nakedFeetSingulars = ["bare foot", "heel", "arch", "big toe", "toe", "sole"];
    var footwearPlurals = ["shoes", "boots", "sandals", "flip flops", "sneakers", "pumps", "heels", "socks", "stockings", "nylons", "fishnets", "hose"];
    var footwearSingulars = ["shoe", "boot", "sandal", "flip flop", "sneaker", "pump", "heel", "sock", "stocking", "nylons", "fishnets", "hose"];
    var nakedFeetPlural = adjectiveFeet + choose(nakedFeetPlurals);
    if (bigchar.gender === "male") {
        footwearPlurals = Array.from(new Set([].concat(footwearPlurals, ["shoes", "boots", "sandals", "flip flops", "sneakers", "boots", "socks"])));
        footwearSingulars = Array.from(new Set([].concat(footwearSingulars, ["shoe", "boot", "sandal", "flip flop", "sneaker", "boot", "sock"])));
    }

    var nakedFeetSingular = adjectiveFeet + choose(nakedFeetSingulars);
    var footwearPlural = adjectiveFootwear + choose(footwearPlurals);
    var footwearSingular = adjectiveFootwear + choose(footwearSingulars);

    var plurals = Array.from(new Set([].concat(nakedFeetPlural, footwearPlural)));
    var singulars = Array.from(new Set([].concat(nakedFeetSingular, footwearSingular)));
    var nakedFoots = Array.from(new Set([].concat(nakedFeetSingular, nakedFeetPlural)));
    var footwears = Array.from(new Set([].concat(footwearSingular, footwearPlural)));
    var feets = Array.from(new Set([].concat(nakedFeetPlural, nakedFeetSingular, footwearPlural, footwearSingular)));

    var plural = choose(plurals);
    var singular = choose(singulars);
    var nakedFoot = choose(nakedFoots);
    var footwear = choose(footwears);
    var feet = choose(feets);

    //==========select from pool
    var candidates = storyPool[type][subtype] || [];
    if (candidates.length === 0) {
        Object.values(storyPool[type]).forEach(function(subpool) {
            candidates = candidates.concat(subpool);
        });
    }

    var lewdmessage = choose(candidates);

    //==================perform replacements==============

    var replacements = {
        "name": bigchar.name,
        "side": side,
        "type1": type1,
        "type2": type2,
        "feet": feet,
        "nakedfoot": nakedFoot,
        "nakedfeetplural": nakedFeetPlural,
        "nakedfeetsingular": nakedFeetSingular,
        "plural": plural,
        "footwearsingular": footwearSingular,
        "footwearplural": footwearPlural,
        "footwear": footwear,
        "singular": singular
    };

    Object.entries(replacements).forEach(function([oldVal, newVal]) {
        // Regex to allow global replacement
        var re = RegExp(`\\[${oldVal}\\]`, "g");
        lewdmessage = lewdmessage.replace(re, newVal);
    });

    var genderReplacements = {
        "male": {
            "her": "his",
            "she": "he",
            "GTS": "GT",
            "breasts": "chest",
            "pussy": "dick",
            "girlfriend": "boyfriend",
            "vagina": "dick",
            "cunt": "dick",
            "clit": "urethra",
            "womanhood": "manhood",
            "labia": "foreskin"
        },
        "female": {
            "his": "her",
            "he": "she",
            "chest": "breasts",
            "dick": "pussy",
            "boyfriend": "girlfriend"
        },
        "futa": {
            "pussy": "dick",
            "vagina": "dick",
            "cunt": "dick",
            "clit": "urethra",
            "labia": "foreskin"
        }
    };

    var toReplace = genderReplacements[bigchar.gender];
    if (bigchar.gender === "futa" && (Math.floor(Math.random() * 10) !== 0)) {
        toReplace = {};
    }

    Object.entries(toReplace).forEach(function([oldVal, newVal]) {
        var re = new RegExp("\\b" + escapeStringRegexp(oldVal) + "\\b", "ig");
        lewdmessage = lewdmessage.replace(re, newVal);
    });

    return lewdmessage;
}

async function getStory(m, args, command, type, isNSFW, responseColor) {
    var guildid = m.guild.id;
    var guildMembers = m.guild.members;
    var authorNick = m.member && m.member.nick || m.author.username;

    if (isNSFW && !m.channel.nsfw) {
        return "This command can only be used in NSFW channels";
    }

    var argparts = args.toLowerCase().split(" ").filter(p => p);

    // Parse out arguments
    var argLength = false;
    var argSomeone = false;
    var argInvert = false;
    argparts = argparts.filter(function(part) {
        if (part === "length") {
            argLength = true;
            return false;
        }
        else if (part === "someone") {
            argSomeone = true;
            return false;
        }
        else if (part === "invert" || part === "inverse") {
            argInvert = true;
            return false;
        }
        return true;
    });

    var smalluser;
    if (argSomeone) {
        smalluser = chooseMember(guildMembers);
    }
    else {
        smalluser = getMentioned(m, argparts);
    }

    if (!smalluser) {
        smalluser = m.author;
    }

    var peopledata = await peopledb.load();
    var userdata = peopledata.people[smalluser.id];

    // Lewd Summary
    if (argLength) {
        var lewdSummary = getLewdSummary(userdata, guildid, type);
        return {
            embed: {
                "color": 0xA260F6,
                "description": lewdSummary
            }
        };
    }

    var bigchar;
    if (argInvert) {
        bigchar = authorNick;
    }
    else {
        var names = getAllCharacters(userdata, guildid);
        bigchar = names.find(n => argparts.includes(n.toLowerCase()));
    }

    var subtype = getSubtype(args);

    var lewdmessage = generateStoryMessage(userdata, bigchar, guildid, type, subtype.name);

    var data = await datadb.load();
    var usageCount = data.commands[command].users[m.author.id];
    var usageStr = ordinal(+usageCount);

    return {
        embed: {
            color: responseColor,
            title: `${subtype.emoji} ${subtype.name}`,
            description: smalluser.tag + ", " + lewdmessage,
            timestamp: new Date().toISOString(),
            footer: {
                text: `${usageStr} response`,
                icon_url: m.author.avatarURL
            }
        }
    };
}

function init() {
    // Load the story pool on init
    storyPool = lewdsdb.load();
}
init();

module.exports = getStory;
