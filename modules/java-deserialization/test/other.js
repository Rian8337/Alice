"use strict";

const chai = require('chai');
const expect = chai.expect;
const javaDeserialization = require('../');
const parse = javaDeserialization.parse;

describe('Special cases', function() {

    it('Example from format specification', function() {
        // From bottom of https://docs.oracle.com/javase/7/docs/platform/serialization/spec/protocol.html
        const buf = Buffer.from((
            'ac ed 00 05 73 72 00 04 4c 69 73 74 69 c8 8a 15' +
            '40 16 ae 68 02 00 02 49 00 05 76 61 6c 75 65 4c' +
            '00 04 6e 65 78 74 74 00 06 4c 4c 69 73 74 3b 78' +
            '70 00 00 00 11 73 71 00 7e 00 00 00 00 00 13 70' +
            '71 00 7e 00 03').replace(/ /g, ''), 'hex');
        const res = parse(buf);
        expect(res, 'res').to.have.lengthOf(2);
        expect(res[0].value).to.equal(17);
        expect(res[0].next).to.equal(res[1]);
        expect(res[1].value).to.equal(19);
        expect(res[1].next).to.equal(null);
    });

});
