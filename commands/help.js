const fs = require("fs");

module.exports = {
    main: function(Bot, m, args, prefix) {
        var args = args.replace("!", "")
        if (args != "") {
            var commands = fs.readdirSync("./commands/");
            if (commands.indexOf(args + ".js") > -1) {
                var cmd = require("./" + args + ".js");
                if (!cmd.hidden) {
                  Bot.createMessage(m.channel.id, "`"+ prefix + args + "`, " + cmd.help);
                }
            } else {
                Bot.createMessage(m.channel.id, "That command doesn't exist.");
            }
        } else {
            Bot.createMessage(m.channel.id, "To show a help for a certain command, say `!help <command>`.\nIf you want a list of commands, say `!commands`.");
        }
    },
    help: "Displays descriptions of commands."
}
