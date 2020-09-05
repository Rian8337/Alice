/*
 * Copyright (c) 2018 Martin von Gagern
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

var Parser = require("./parser.js");

function listParser(cls, fields, data) {
    // var size_or_capacity = data[0].readInt32BE(0);
    fields.list = data.slice(1);
    return fields;
}

function mapParser(cls, fields, data) {
    var capacity = data[0].readInt32BE(0);
    var size = data[0].readInt32BE(4);
    var map = new Map();
    var obj = {};
    for (var i = 0; i < size; ++i) {
        var key = data[2*i + 1];
        var value = data[2*i + 2];
        map.set(key, value);
        if (typeof key === "string") {
            obj[key] = value;
        }
    }
    fields.map = map;
    fields.obj = obj;
    return fields;
}

function enumMapParser(cls, fields, data) {
    var size = data[0].readInt32BE(0);
    var map = new Map();
    var obj = {};
    for (var i = 0; i < size; ++i) {
        var key = data[2*i + 1];
        var value = data[2*i + 2];
        map.set(key, value);
        obj[key] = value;
    }
    fields.map = map;
    fields.obj = obj;
    return fields;
}

function hashSetParser(cls, fields, data) {
    var capacity = data[0].readInt32BE(0);
    var loadFactor = data[0].readFloatBE(4);
    var size = data[0].readInt32BE(8);
    if (data.length !== size + 1)
        throw new Error("Expected " + size + " elements " +
                        "but parsed " + (data.length - 1));
    fields.set = new Set(data.slice(1));
    return fields;
}

Parser.register("java.util.ArrayList", "7881d21d99c7619d",  listParser);
Parser.register("java.util.ArrayDeque", "207cda2e240da08b", listParser);
Parser.register("java.util.Hashtable", "13bb0f25214ae4b8",  mapParser);
Parser.register("java.util.HashMap", "0507dac1c31660d1", mapParser);
Parser.register("java.util.EnumMap", "065d7df7be907ca1", enumMapParser);
Parser.register("java.util.HashSet", "ba44859596b8b734", hashSetParser);
