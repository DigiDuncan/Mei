module.exports = {
    main: function(Bot, m, args, prefix) {
        var prettyMs = require('pretty-ms');
        var prettyUptime = prettyMs(Bot.uptime, {
            verbose: true
        })
        Bot.createMessage(m.channel.id, "I have been running for:\n:alarm_clock: " + prettyUptime + " :alarm_clock:")
    },
    help: "Shows bot uptime"
}
