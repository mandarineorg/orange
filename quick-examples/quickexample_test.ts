import * as assert from "https://deno.land/std@v0.58.0/testing/asserts.ts";
import { Orange } from "../lib/core.ns.ts";
import { Test } from "../lib/decorators/testDecorator.ts";

export class MathTests {

    public number: number = 0;

    constructor() {
        Orange.setOptions(this, {
            testSuiteName: "Math Tests",
            hooks: {
                beforeAll: () => console.log(`${this.number = 100}`),
                afterAll: () => console.log(`After all ${this.number}`),
                beforeEach: () => console.log(`${this.number++}`),
                afterEach: () => console.log(`${this.number = this.number + 5}`)
            }
        })
    }

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
        this.number = this.number * 2;
        assert.assertEquals(6 - 3, 3);
    }

}

export class StringTests {

    @Test({
        description: "Elon Musk is Jeff bezos",
    })
    public async elonIsNotJeffBezos() {
        assert.assertEquals("Elon Musk", "Jeff Bezos");
    }

    @Test({
        ignore: true
    })
    public ignoredTest() {
        throw Error();
    }
}