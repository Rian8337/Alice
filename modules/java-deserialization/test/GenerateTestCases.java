import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.io.PrintStream;
import java.lang.reflect.Method;
import java.util.Base64;
import java.util.zip.GZIPOutputStream;

class GenerateTestCases {

    public static void main(String[] args) throws Exception {
        System.out.print
            ("'use strict';\n" +
             "\n" +
             "const chai = require('chai');\n" +
             "const expect = chai.expect;\n" +
             "const zlib = require('zlib');\n" +
             "const javaDeserialization = require('../');\n" +
             "\n" +
             "function testCase(b64data, checks) {\n" +
             "  return function() {\n" +
             "    let bytes = Buffer.from(b64data, 'base64');\n" +
             "    if (b64data.substring(0, 4) === 'H4sI')\n" +
             "      bytes = zlib.gunzipSync(bytes);\n" +
             "    const res = javaDeserialization.parse(bytes);\n" +
             "    const begin = res[0];\n" +
             "    const end = res[res.length - 1];\n" +
             "    expect(begin[0]).to.equal('Begin');\n" +
             "    expect(begin[1]).to.equal(begin);\n" +
             "    expect(end[0]).to.equal(end);\n" +
             "    expect(end[1]).to.equal('End');\n" +
             "    expect(res.length,\n" +
             "      'Number of serialized objects must match args list'\n" +
             "    ).to.equal(checks.length + 2);\n" +
             "    return checks.apply(null, res.slice(1, -1));\n" +
             "  };\n" +
             "}\n" +
             "\n" +
             "describe('Deserialization of', function() {\n\n");
        runTests(TestCases.class);
        System.out.print("});\n");
    }

    private static String uncamelWords(String camelString) {
        StringBuilder buf = new StringBuilder(camelString);
        for (int i = buf.length() - 1; i > 0; --i) {
            if (Character.isUpperCase(buf.charAt(i)))
                buf.insert(i, ' ');
        }
        return buf.toString().toLowerCase();
    }

    private static void runTests(Class<? extends GenerateTestCases> cases)
        throws Exception
    {
        for (Method m: cases.getMethods()) {
            SerializationTestCase a =
                m.getAnnotation(SerializationTestCase.class);
            if (a == null)
                continue;
            StringBuilder desc = new StringBuilder(m.getName());
            for (int i = desc.length() - 1; i > 0; --i) {
                if (Character.isUpperCase(desc.charAt(i)))
                    desc.insert(i, ' ');
            }
            GenerateTestCases instance = cases.newInstance();
            String description = a.description();
            if (description.length() == 0) {
                description = m.getName();
                description = uncamelWords(description);
            }
            instance.description = description;
            instance.prepare();
            m.invoke(instance);
            instance.finish();
        }
    }

    protected String description;

    private PrintStream out = System.out;

    private ByteArrayOutputStream dataBuf;

    private ByteArrayOutputStream checkBuf;

    protected String args = "itm";

    protected ObjectOutputStream data;

    protected PrintStream check;

    protected void writeObject(Object obj) throws IOException {
        data.writeObject(obj);
    }

    protected void checkLine(String chk)  {
        check.print("      " + chk + "\n");
    }

    protected void expect(String lhs, String rhs) {
        String lhss = lhs.replace("\\", "\\\\").replace("\"", "\\\"");
        checkLine("expect(" + lhs + ", \"" + lhss + "\")." + rhs + ";");
    }

    protected void expect(String lhs, String op, String rhs) {
        expect(lhs, op + "(" + rhs + ")");
    }

    protected void checkThat(String chk) {
        expect(chk, "to.be.true");
    }

    protected void checkStrictEqual(String actual, String expected) {
        expect(actual, "to.equal", expected);
    }

    protected void checkLooseEqual(String actual, String expected) {
        // https://github.com/chaijs/chai/issues/906
        checkThat(actual + " == " + expected);
    }

    protected void checkNotStrictEqual(String actual, String expected) {
        expect(actual, "to.not.equal", expected);
    }

    protected void checkNotLooseEqual(String actual, String expected) {
        // https://github.com/chaijs/chai/issues/906
        checkThat(actual + " != " + expected);
    }

    protected void checkInstanceof(String actual, String type) {
        expect(actual, "to.be.an.instanceof", type);
    }

    protected void checkLength(String actual, int length) {
        expect(actual, "to.have.lengthOf", Integer.toString(length));
    }

    protected void checkKeys(String actual, String keys) {
        if (keys.length() == 0)
            expect(actual, "to.be.an('object').that.is.empty");
        else
            expect(actual, "to.have.all.keys", "[" + keys + "]");
    }

    protected void checkArray(String actual) {
        expect(actual, "to.be.an('Array')");
    }

    private void prepare() throws Exception {
        dataBuf = new ByteArrayOutputStream();
        data = new ObjectOutputStream(dataBuf);
        checkBuf = new ByteArrayOutputStream();
        check = new PrintStream(checkBuf, false, "UTF-8");
        Object[] canary = { "Begin", null };
        canary[1] = canary;
        writeObject(canary);
    }

    private void finish() throws Exception {
        Object[] canary = { null, "End" };
        canary[0] = canary;
        writeObject(canary);

        out.print("  it('");
        out.print(description);
        out.print("', testCase(\n    '");
        byte[] bytes1 = dataBuf.toByteArray();
        dataBuf.reset();
        GZIPOutputStream zip = new GZIPOutputStream(dataBuf);
        zip.write(bytes1);
        zip.close();
        byte[] bytes2 = dataBuf.toByteArray();
        byte[] bytes = bytes1;
        if (bytes2.length * 3 < bytes1.length * 2)
            bytes = bytes2;
        String b64 = Base64.getEncoder().encodeToString(bytes);
        int chunklen = 1024;
        int i;
        for (i = 0; i + chunklen < b64.length(); i += chunklen) {
            out.print(b64.substring(i, i + chunklen));
            out.print("' +\n    '");
        }
        out.print(b64.substring(i));
        out.print("',\n    function(");
        out.print(args);
        out.print(") {\n");
        checkBuf.writeTo(out);
        out.print("    }));\n\n");
    }

}
