"use strict";

const fs = require("fs");

const conf = require("./conf");

var dataPath = "./db/data.json";
var backupPath = "/home/badmin/backup/Mei/db/data.json";

module.exports = {
    load: function() {
        var data = fs.readFileSync(dataPath, "utf8");
        if (data.includes(conf.chocolaId)) {
            try {
                return JSON.parse(fs.readFileSync(dataPath));
            }
            catch (err) {
                console.log(err);
            }
        }
        else {
            console.log("JSON error, attempting restore");
            try {
                var backup = JSON.parse(fs.readFileSync(backupPath));
                fs.writeFileSync(dataPath, JSON.stringify(backup, null, "\t"));
                console.log("Restore Successful");
                return JSON.parse(fs.readFileSync(dataPath));
            }
            catch (err) {
                console.log(err);
            }
        }
    },
    save: function(data) {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, "\t"));
    }
};
