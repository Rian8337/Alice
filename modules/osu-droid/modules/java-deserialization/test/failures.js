"use strict";

const expect = require('chai').expect;
const javaDeserialization = require('../');

const STREAM_MAGIC = "aced";
const STREAM_VERSION = "0005";
const TC_NULL = "70";
const TC_REFERENCE = "71";
const TC_CLASSDESC = "72";
const TC_OBJECT = "73";
const TC_STRING = "74";
const TC_ARRAY = "75";
const TC_CLASS = "76";
const TC_BLOCKDATA = "77";
const TC_ENDBLOCKDATA = "78";
const TC_RESET = "79";
const TC_BLOCKDATALONG = "7a";
const TC_EXCEPTION = "7b";
const TC_LONGSTRING = "7c";
const TC_PROXYCLASSDESC = "7d";
const TC_ENUM = "7e";
const baseWireHandle = "7e0000";
const SC_WRITE_METHOD = 0x01; //if SC_SERIALIZABLE
const SC_BLOCK_DATA = 0x08;    //if SC_EXTERNALIZABLE
const SC_SERIALIZABLE = 0x02;
const SC_EXTERNALIZABLE = 0x04;
const SC_ENUM = 0x10;

const tmpBuf = Buffer.alloc(8);

function utf8(str) {
    return Buffer.from(str, "utf8").toString("hex");
}

function uint8(i) {
    tmpBuf.writeUInt8(i, 0);
    return tmpBuf.toString("hex", 0, 1);
}

function uint16(i) {
    tmpBuf.writeUInt16BE(i, 0);
    return tmpBuf.toString("hex", 0, 2);
}

function uint32(i) {
    tmpBuf.writeUInt32BE(i, 0);
    return tmpBuf.toString("hex", 0, 4);
}

function int32(i) {
    tmpBuf.writeInt32BE(i, 0);
    return tmpBuf.toString("hex", 0, 4);
}

function str(str) {
    const chars = utf8(str);
    return uint16(chars.length >>> 1) + chars;
}

function parsing(hex) {
    const buf = Buffer.from(hex, "hex");
    return function() {
        return javaDeserialization.parse(buf);
    };
}

function template1(overrides) {
    const flags = overrides.flags !== undefined
          ? overrides.flags : SC_SERIALIZABLE;
    const fieldType = utf8(overrides.fieldType || "I");
    const classDesc = overrides.classDesc || TC_CLASSDESC;
    const hex=
          STREAM_MAGIC + STREAM_VERSION + TC_OBJECT +
          classDesc + str("SomeClass") + "1234567887654321" + uint8(flags) +
          "0001" + fieldType + str("foo") + TC_ENDBLOCKDATA + TC_NULL +
          "01234567";
    return hex;
}

describe("Failure scenarios", function() {

    it("bad stream magic", function() {
        const good = parsing("aced0005")();
        expect(good).to.be.empty;
        expect(parsing("acde0005")).to.throw("STREAM_MAGIC not found");
    });

    it("bad stream version", function() {
        const good = parsing("aced0005")();
        expect(good).to.be.empty;
        expect(parsing("aced0004")).to.throw(/protocol version/);
    });

    it("string too long", function() {
        const good = parsing(
            STREAM_MAGIC + STREAM_VERSION +
            TC_LONGSTRING + "0000000000000007" + utf8("abcdefg"))();
        expect(good).to.be.an("array").which.is.deep.equal(["abcdefg"]);
        expect(parsing(
            STREAM_MAGIC + STREAM_VERSION +
            TC_LONGSTRING + "7000000000000000" + utf8("abcdefg")
        )).to.throw(/bytes in a string/);
    });

    it("premature end", function() {
        const good = parsing(
            STREAM_MAGIC + STREAM_VERSION +
            TC_STRING + "0007" + utf8("abcdefg"))();
        expect(good).to.be.an("array").which.is.deep.equal(["abcdefg"]);
        expect(parsing(
            STREAM_MAGIC + STREAM_VERSION +
            TC_STRING + "0008" + utf8("abcdefg")
        )).to.throw("Premature end of input").with.all.keys(["buf", "pos"]);
        expect(parsing(
            STREAM_MAGIC + STREAM_VERSION +
            TC_STRING + "00"
        )).to.throw("Premature end of input").with.all.keys(["buf", "pos"]);
    });

    it("reset not supported", function() {
        expect(parsing(STREAM_MAGIC + STREAM_VERSION + TC_RESET))
            .to.throw("Don't know how to handle Reset");
    });

    it("exception not supported", function() {
        expect(parsing(STREAM_MAGIC + STREAM_VERSION + TC_EXCEPTION))
            .to.throw("Don't know how to handle Exception");
    });

    it("proxy class description not supported", function() {
        expect(parsing(STREAM_MAGIC + STREAM_VERSION + TC_PROXYCLASSDESC))
            .to.throw("Don't know how to handle ProxyClassDesc");
    });

    it("unknown type", function() {
        expect(parsing(STREAM_MAGIC + STREAM_VERSION + "67"))
            .to.throw("Don't know about type 0x67");
    });

    it("check template", function() {
        const good = parsing(template1({}))();
        expect(good[0].foo).to.equal(0x1234567);
    });

    it("bad flags", function() {
        expect(parsing(template1({flags: 0})))
            .to.throw("Don't know how to deserialize class with flags 0x0");
    });
    
    it("version 1 external", function() {
        expect(parsing(template1({flags: SC_EXTERNALIZABLE})))
            .to.throw("Can't parse version 1 external content");
    });
    
    it("unknown primitive", function() {
        expect(parsing(template1({fieldType: "Q"})))
            .to.throw("Don't know how to read field of type 'Q'");
    });
    
    it("bad classDesc", function() {
        expect(parsing(template1({classDesc: TC_OBJECT})))
            .to.throw("Object not allowed here");
    });

    it("Wrong hash set size", function() {
        const hex=
              STREAM_MAGIC + STREAM_VERSION + TC_OBJECT + TC_CLASSDESC +
              str("java.util.HashSet") + "ba44859596b8b734" +
              uint8(SC_SERIALIZABLE | SC_WRITE_METHOD) + "0000" +
              TC_ENDBLOCKDATA + TC_NULL +
              TC_BLOCKDATA + "0c" + "00000003" + "00000000" + "0000000?" +
              TC_STRING + str("foo") + TC_ENDBLOCKDATA;
        const good = parsing(hex.replace("?", "1"));
        expect(parsing(hex.replace("?", "3")))
            .to.throw("Expected 3 elements but parsed 1");
    });

});
