"use strict";

const path = require("path");
const fs = require("fs");

/*
    Lewds
    data = {
        "[type]": {
            "[subtype]": [
                "lewd story",
                "lewd story",
                "lewd story",
                ...
            },
            "[subtype]": [
                ...
            ],
            "[subtype]": [
                ...
            ]
        },
        "[type]": {
            ...
        },
        "[type]": {
            ...
        }
    }
 */

// Try loading a file from a path. Return undefined on failure.
function loadFrom(path) {
    var data = undefined;
    try {
        var rawdata = fs.readFileSync(path, "utf8");
        data = JSON.parse(rawdata);
    }
    catch (err) {
        console.error(`Error loading ${path}: ${err}`);
    }
    return data;
}

function load() {
    const dbpath = path.join(__dirname, "db", "lewds.json");

    var data = loadFrom(dbpath);
    // If we weren't able to load the data, then throw an error
    if (!data) {
        throw "Unable to load db";
    }
    return data;
}

module.exports = {
    load
};
