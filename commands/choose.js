"use strict";

const misc = require("../misc");

module.exports = {
    main: async function (Bot, m, args, prefix) {
        var list = m.cleanContent.replace(prefix, "").replace(/choose/i, "");

        if (!list) {
            Bot.createMessage(m.channel.id, "You need to add your choices, seperated by ` | `");
            return;
        }

        var choiceList = list.split("|");

        var choice = misc.choose(choiceList).trim();

        var comments = [
            "I think `{choice}` is the best choice",
            "It's `{choice}` obviously",
            "Is that even a choice? `{choice}` Duh",
            "I may be wrong, but I'm not, `{choice}` is the right answer"
        ];

        var msg = misc.choose(comments).replace("{choice}", choice);

        Bot.createMessage(m.channel.id, msg);
    },
    help: "This or that?"
};
