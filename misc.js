"use strict";

const escapeStringRegexp = require("escape-string-regexp");

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Misc functions
function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function chooseHand() {
    var hands = [":ok_hand::skin-tone-1:", ":ok_hand::skin-tone-2:", ":ok_hand::skin-tone-3:", ":ok_hand::skin-tone-4:", ":ok_hand::skin-tone-5:", ":ok_hand:"];
    return choose(hands);
}

function chunkArray(arr, chunkSize) {
    var chunkCount = Math.ceil(arr.length / chunkSize);
    // eslint-disable-next-line no-unused-vars
    return Array(chunkCount).fill().map(function(_, index) {
        var begin = index * chunkSize;
        return arr.slice(begin, begin + chunkSize);
    });
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function chooseMember(members) {
    var choices = members.filter(m =>
        !m.bot
        && m.status !== "offline");

    var member = choose(choices);

    return member && member.id;
}

// Find the member/user of a mentioned user
// This won't work if a user has a space in their name
function getMentioned(m, argparts) {
    var mentioned = m.mentions[0];
    if (!mentioned) {
        mentioned = m.guild.members.find(m => argparts.includes(m.username) || argparts.includes(m.nick));
    }
    return mentioned;
}

function isObject(value) {
    return value && typeof value === "object" && value.constructor === Object;
}

function isString(value) {
    return typeof value === "string" || value instanceof String;
}

function isNum(num) {
    if (typeof num === "number") {
        return num - num === 0;
    }
    if (typeof num === "string" && num.trim() !== "") {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
    }
    return false;
}

function toNum(num) {
    if (!isNum(num)) {
        return NaN;
    }
    return Number(num);
}

// Because javascript bit-wise operations are limited to 32 bits :P
function leftShift(n, s) {
    return n * (2 ** s);
}

function timestampToSnowflake(d) {
    var epoch = 1421280000000;
    var dateFieldOffset = 22;
    var snowflake = leftShift(d - epoch, dateFieldOffset);
    return snowflake;
}

function splitArray(arr, predicate) {
    var trueArr = [];
    var falseArr = [];
    arr.forEach(function(i) {
        if (predicate(i)) {
            trueArr.push(i);
        }
        else {
            falseArr.push(i);
        }
    });
    return [trueArr, falseArr];
}

function deleteIn(timeout) {
    return async function(sentMsg) {
        await delay(timeout);
        sentMsg.delete("Timeout");
    };
}

// Create a map of aliases to objects
function AliasMap(items) {
    var aliasMap = {};

    for (let item of items) {
        for (let alias of item.aliases) {
            aliasMap[alias] = item;
        }
    }

    return aliasMap;
}

module.exports = {
    choose,
    chooseHand,
    chunkArray,
    capitalize,
    chooseMember,
    getMentioned,
    isObject,
    isString,
    isNum,
    toNum,
    leftShift,
    timestampToSnowflake,
    splitArray,
    delay,
    deleteIn,
    AliasMap
};
