[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/Orange)
# Orange
Orange is a testing framework for Deno. It was originally created for [Mandarine Framework](https://github.com/mandarineorg/mandarinets) but it can be used in different projects no mandarine-related.

# Decorator-driven
Orange uses decorator as its modality to declare tests. The reason behind this is to be as similar as the internal functionalities of Mandarine thus providing readability & reducing the lines of codes.

# Deno & Orange
Under the hood, Orange uses the Deno API, although, it is required to use a **tsconfig.json** file.

### tsconfig.json
```javascript
{
    "compilerOptions": {
        "strict": false,
        "noImplicitAny": false,
        "noImplicitThis": false,
        "alwaysStrict": false,
        "strictNullChecks": false,
        "strictFunctionTypes": true,
        "strictPropertyInitialization": false,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "allowUmdGlobalAccess": false,
    }
}
```
### Running
- All tests
```bash
$ deno test --config tsconfig.json --allow-run --allow-read --allow-write
```
- Specific test file
```bash
deno test --config tsconfig.json --allow-run --allow-read --allow-write myTestFile.ts
```

For more information, visit the official [Deno testing API documentation](https://deno.land/manual/testing)
# Orange usage
In Orange, everything is a test suite, this means, all your tests will be located under a class, the methods of that class decorated with the decorator `@Test` will be considered a test.

### `@Test` Decorator
The `@Test` decorator as mentioned before handles the creation of the proxy between the Orange's core and the Deno API.
**Syntax**: 
```typescript
@Test(options: Orange.TestOptions)
```
**Orange.TestOptions**:
- name
    - Name of the test to run
    - **Default**: Name of method
- description
    - Descriptive information of the test to run
- ignore
    - condition when to ignore the test
    - **Default**: false

### Example
```typescript
import { Test, Orange } from "https://x.nest.land/Orange@0.0.1/mod.ts";

export class Tests {

    @Test({ name: "Should fail", description: "Just a test" })
    public myTest() {
        throw new Error("There was an error processing this test. Try again");
    }

    @Test({
        name: "Should pass"
    })
    public mytest2() {
        return true;
    }
}
```
```bash
deno test --config tsconfig.json --allow-run --allow-read --allow-write
```
### Result
```
running 2 tests
test 
            [Should fail] ... 
                [Just a test] 
                    [myTest()] ... = FAILED (101ms)
test 
            [Should pass] ... 
                [mytest2()] ... = ok (28ms)

failures:
            [Should fail]

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out (129ms)
```

### Setting a Test Suite Configuration
Orange lets you set a custom configuration to your test suite such as its name, whether ignore the whole test suite under a condition, or whether it should be count for the final report.
You can set your custom configuration by adding using `Orange.setOptions` in the constructor of your _test suite_.
**Syntax**: `Orange.setOptions(testInstance: any, options: Orange.Options)`
**Orange.Options**:
- testSuiteName
    - Name of the test suite to run
    - **Default**: Name of the class
- ignore
    - Conditional to decide whether the whole test suite should be ignored
    - **Default**: false
- generateReport
    - Conditional to decide whether the test suite results should be added to the final report file
    - **Default**: true
```typescript
export class Tests {

    constructor() {
        Orange.setOptions(this, {
            testSuiteName: "My set of tests",
            ignore: false,
            generateReport: true
        })
    }
}
```
# Orange Configuration
By creating a file called `orange-test.json` you can decide some of the behaviors Orange uses under the hood.
`orange-test.json` must contain a json which must follow `Orange.Core.OrangeConfiguration`
**Orange.Core.OrangeConfiguration**:
- testsFolder: string
    - Directory where the **results** of the tests will be created
        - Use `[date]` to attach `yyyy-mm-dd` to the folder's name.
        - Use `[timestamp]` to attach the timestamp to the folder's name
        - **Example**: "./tests/[date]/[timestamp]/"
- showExceptions: boolean
    - Whether stacktraces of failed tests should be shown when running `deno test`

```json
// ./orange-test.json
{
    "testsFolder": "./tests/",
    "showExceptions": false
}
```
# Orange results
After running `deno test`, Orange will generate a `.txt` file with the results of your tests in a table.  
**Note**: If no `orange-test.json` is defined, Orange will generate the output in `./tests/[date]/test-results.txt`.

**test-results.txt**: [See testing file here](https://github.com/mandarineorg/orange/blob/master/quick-examples/quickexample_test.ts)
```
MathTests
┌─────────┬──────────────┬──────────────────────────┬────────┬────────────┬─────────────┬───────────────┬──────┐
│ Test ID │     Name     │       Description        │ Status │ Suite Name │ Error Class │ Error Message │ Time │
├─────────┼──────────────┼──────────────────────────┼────────┼────────────┼─────────────┼───────────────┼──────┤
│    0    │     Sum      │ 2+2 should be equal to 4 │   Ok   │ MathTests  │      -      │       -       │ 0ms  │
│    1    │ Substraction │ 6-3 should be equal to 3 │   Ok   │ MathTests  │      -      │       -       │ 0ms  │
└─────────┴──────────────┴──────────────────────────┴────────┴────────────┴─────────────┴───────────────┴──────┘

StringTests
┌─────────┬───────────┬─────────────────────────┬────────┬─────────────┬────────────────┬──────────────────────────────────────────────────────────────────────────────────┬──────┐
│ Test ID │   Name    │       Description       │ Status │ Suite Name  │  Error Class   │                                  Error Message                                   │ Time │
├─────────┼───────────┼─────────────────────────┼────────┼─────────────┼────────────────┼──────────────────────────────────────────────────────────────────────────────────┼──────┤
│    0    │ undefined │ Elon Musk is Jeff bezos │ FAILED │ StringTests │ AssertionError │ Values are not equal:    [Diff] Actual / Expected-   "Elon Musk"+   "Jeff Bezos" │ 1ms  │
└─────────┴───────────┴─────────────────────────┴────────┴─────────────┴────────────────┴──────────────────────────────────────────────────────────────────────────────────┴──────┘

| Total Tests: 4 |  Ran: 3 | Ignored: 1 | Passed: 2 | Failed: 1 |
```
