"use strict";

const dbmanager = require("./dbmanager");

const dbname = "people";

async function load() {
    return await dbmanager.load(dbname);
}

async function save(data) {
    return await dbmanager.save(dbname, data);
}

module.exports = {
    load,
    save
};
