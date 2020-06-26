import { Test } from "../lib/decorators/testDecorator.ts";

export class Tests {

    @Test({
        name: "Regular test",
        description: "Unknown test"
    })
    public myTest() {
        throw new Error("Unknown");
    }
}