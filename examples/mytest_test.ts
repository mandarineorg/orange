import { Test } from "../lib/decorators/testDecorator.ts";
import { Orange } from "../lib/core.ns.ts";

export class Tests {

    constructor() {
        Orange.setOptions(this, {
            testSuiteName: "My set of tests",
            ignore: false
        })
    }

    @Test({
        name: "Why not",
        description: "Just a test"
    })
    public myTest() {
        throw new Error("There was an error processing this test. Try again");
    }

    @Test({
        name: "Why not 2"
    })
    public mytest2() {
        return true;
    }
}