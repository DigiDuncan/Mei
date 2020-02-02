"use strict";

const escapeStringRegexp = require("escape-string-regexp");

const ids = require("../ids");
const commands = require("../commands");

module.exports = {
    // eslint-disable-next-line no-unused-vars
    main: async function(Bot, m, args, prefix) {
        if (m.author.id !== ids.users.chocola) {
            return;
        }

        // Remove prefix from command name, if it exists
        var commandName = args.replace(new RegExp("^" + escapeStringRegexp(prefix)), "").toLowerCase();

        if (commandName === "") {
            await m.reply(`To load a command, say \`${prefix}load <command>\`.`);
            return;
        }

        try {
            commands.load(commandName);
        }
        catch (err) {
            if (err instanceof commands.CommandsError) {
                m.reply(err.message);
                return;
            }
            throw err;
        }

        m.reply(`Loaded ${commandName}`);
    },
    help: "Load a command",
    hidden: true
};
