﻿"use strict";

const fs = require("fs");

var timestampPath = "db/timestamps.txt";

class Profiler {
    constructor() {
        this.timestamps = [];
    }

    get start() {
        if (this.timestamps.length === 0) {
            return undefined;
        }
        return this.timestamps[0].time;
    }

    get end() {
        if (this.timestamps.length === 0) {
            return undefined;
        }
        return this.timestamps[this.timestamps.length - 1].time;
    }

    get elapsed() {
        if (!(this.end && this.start)) {
            return 0;
        }
        return this.end - this.start;
    }

    toString() {
        return `${this.elapsed}ms | ${this.timestamps.map(t => t.time).join(", ")}`;
    }

    // Supports optional labels for future expansion
    mark(label) {
        var now = Date.now();
        label = label || String(this.timestamps.length + 1);
        this.timestamps.push({
            label: label,    
            time: now
        });
    }

    save() {
        fs.appendFileSync(timestampPath, this.toString() + "\n");
    }
}

module.exports = Profiler;
