import { Orange } from "../core.ns.ts";
import { CoreUtils } from "../utils/core.utils.ts";

const processLastTest = () => {
    if((Orange.Core.testsMetadata.numberOfTests - Orange.Core.testsMetadata.numberOfTestsIgnored) == Orange.Core.testsMetadata.numberOfTestsRan) {
        Orange.Core.generateTable();
    }
}

export const TestProxy = async (testMethod: Function, testSuiteClass: any, testSuiteConfig: Orange.Options, isAsync: boolean, testOptions: Orange.TestOptions, methodName: string) => {

    let testStatus: Orange.TestStatus = {
        testSuiteClass: testSuiteClass,
        name: testOptions.name,
        description: testOptions.description,
        ignore: testOptions.ignore || testSuiteConfig.ignore,
        passed: false,
        error: undefined,
        testSuiteName: undefined,
        time: undefined
    }
    
    let startTime = Date.now();

    try {
        if(isAsync) {
            await testMethod();
        } else {
            testMethod();
        }

        testStatus.passed = true;
    } catch(error) {
        testStatus.error = error;
    }

    testStatus.time = `${Date.now() - startTime}ms`;
    testStatus.testSuiteName = testSuiteConfig.testSuiteName;

    Orange.Core.addTest(testMethod, testStatus);

    return () => {
        Orange.Core.testsMetadata.numberOfTestsRan++;
        processLastTest();
        Deno.stdout.writeSync(new TextEncoder().encode(CoreUtils.formatFinalTestName(testOptions.description, methodName)));
        if(testStatus.passed) {
            return;
        } else {
            if(!Orange.Core.getOrangeConfig().showExceptions) {
                throw "";
            } else {
                throw testStatus.error;
            }
        }
    }
}

