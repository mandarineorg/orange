import { Test } from "../lib/decorators/testDecorator.ts";
import { Orange } from "../lib/core.ns.ts";
import * as assert from "https://deno.land/std@v0.58.0/testing/asserts.ts";

export class MathTests {

    @Test({
        name: "Sum",
        description: "2+2 should be equal to 4"
    })
    public calculateTwoPlusTwo() {
        assert.assertEquals(2 + 2, 4);
    }

    @Test({
        name: "Substraction",
        description: "6-3 should be equal to 3"
    })
    public substract6minus3() {
        assert.assertEquals(6 - 3, 3);
    }

}

export class StringTests {

    @Test({
        description: "Elon Musk is Jeff bezos",
    })
    public elonIsNotJeffBezos() {
        assert.assertEquals("Elon Musk", "Jeff Bezos");
    }

    @Test({
        ignore: true
    })
    public ignoredTest() {
        throw Error();
    }
}