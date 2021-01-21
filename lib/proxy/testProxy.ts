import { setColorEnabled } from "https://deno.land/std@0.84.0/fmt/colors.ts";
import { Orange } from "../core.ns.ts";
import { CoreUtils } from "../utils/core.utils.ts";

const processLastTest = (testSuiteClass: any, testSuiteConfig: Orange.Options) => {
    // Process all LAST TEST in the current test suite
    const testSuiteStat = Orange.Core.getTestSuiteStats(testSuiteClass);
    if(testSuiteClass) {
       if(Orange.Core.isLastTest(testSuiteStat.numberOfTests, testSuiteStat.numberOfTestsIgnored, testSuiteStat.numberOfTestsRan)) {
            let afterAllHook = testSuiteConfig.hooks?.afterAll;
            let afterEach = testSuiteConfig.hooks?.afterEach;

            if(afterEach) afterEach();
            if(afterAllHook) afterAllHook();
       }
    }

    // Process all LAST TESTS among all Test Suites
    if(Orange.Core.isLastTest(Orange.Core.testsMetadata.numberOfTests, Orange.Core.testsMetadata.numberOfTestsIgnored, Orange.Core.testsMetadata.numberOfTestsRan)) {
        Orange.Core.generateTable();
    }
}

function getTestStatus(testSuiteClass: any, testSuiteConfig: Orange.Options, testOptions: Orange.TestOptions, methodName: string) {

    let testStatus: Orange.TestStatus = {
        testSuiteClass: testSuiteClass,
        name: testOptions.name || methodName,
        description: testOptions.description,
        ignore: testOptions.ignore || testSuiteConfig.ignore,
        passed: false,
        error: <any><unknown>undefined,
        testSuiteName: <string>testSuiteConfig.testSuiteName,
        time: <any><unknown>undefined
    }

    return testStatus;
}

function defineTestStatusTime(testStatus: Orange.TestStatus, startTime: number) {
    testStatus.time = `${Date.now() - startTime}ms`;
}

function denoTest(testStatus: Orange.TestStatus, testSuiteClass: any, testSuiteConfig: Orange.Options, testOptions: Orange.TestOptions, methodName: string): Function {
    return () => {
        Orange.Core.testsMetadata.numberOfTestsRan++;
        Orange.Core.updateTestSuiteStats(testSuiteClass, "NumTestsRan");
        processLastTest(testSuiteClass, testSuiteConfig);
        Deno.stdout.writeSync(new TextEncoder().encode(CoreUtils.formatFinalTestName(<string>testOptions.description, methodName)));
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

export const TestProxyAsync = async (testMethod: Function, testSuiteClass: any, testSuiteConfig: Orange.Options, testOptions: Orange.TestOptions, methodName: string) => {

    let testStatus: Orange.TestStatus = getTestStatus(testSuiteClass, testSuiteConfig, testOptions, methodName);
    let startTime = Date.now();

    setColorEnabled(false);
    let handler = Orange.Core.getTestSuite(testSuiteClass);
    try {
        await handler[methodName]();
        testStatus.passed = true;
    } catch(error) {
        testStatus.error = error;
    }
    setColorEnabled(true);

    defineTestStatusTime(testStatus, startTime);

    Orange.Core.addTest(testMethod, testStatus);

    return denoTest(testStatus, testSuiteClass, testSuiteConfig, testOptions, methodName);
}


export const TestProxySync = (testMethod: Function, testSuiteClass: any, testSuiteConfig: Orange.Options, testOptions: Orange.TestOptions, methodName: string) => {

    let testStatus: Orange.TestStatus = getTestStatus(testSuiteClass, testSuiteConfig, testOptions, methodName);
    let startTime = Date.now();

    setColorEnabled(false);
    let handler = Orange.Core.getTestSuite(testSuiteClass);
    try {
        handler[methodName]();
        testStatus.passed = true;
    } catch(error) {
        testStatus.error = error;
    }
    setColorEnabled(true);

    defineTestStatusTime(testStatus, startTime);

    Orange.Core.addTest(testMethod, testStatus);

    return denoTest(testStatus, testSuiteClass, testSuiteConfig, testOptions, methodName);
}

