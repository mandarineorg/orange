import { yellow } from "https://deno.land/std@0.84.0/fmt/colors.ts";
import { Orange } from "../core.ns.ts";
import { TestProxyAsync, TestProxySync } from "../proxy/testProxy.ts";

const DefineTest = (target: any) => {
    Orange.Core.testsMetadata.numberOfTests++;
    Orange.Core.updateTestSuiteStats(target, "NumTests");
    Orange.Core.addTestSuite(target);
}

const ExecuteBeforeHooks = (testSuiteStats: Orange.TestSuiteStats, beforeAllHook: Function, beforeEachHook: Function) => {
    if(testSuiteStats.numberOfTestsRan == 0 && beforeAllHook) beforeAllHook();
    if(beforeEachHook) beforeEachHook();
}

const ExecuteAfterEachHook = (testSuiteStats: Orange.TestSuiteStats, afterEachHook: Function) => {
    if(afterEachHook && !Orange.Core.isLastTest(testSuiteStats.numberOfTests, testSuiteStats.numberOfTestsIgnored, testSuiteStats.numberOfTestsRan)) afterEachHook();
}

export const Test = (options: Orange.TestOptions) => {
    return (target: any, propertyKey: string) => {
        let testName = (options.name) ? options.name : propertyKey;
        testName = `
            [${yellow(testName)}]`;
            
        // Define test  
        DefineTest(target);

        let testMethod = Orange.Core.getTestSuite(target)[propertyKey];
        let testSuiteConfig = Orange.Core.getTestSuiteConfig(target);

        let beforeAllHook: Function | undefined = testSuiteConfig.hooks?.beforeAll;
        let beforeEachHook: Function | undefined = testSuiteConfig.hooks?.beforeEach;
        let afterEachHook: Function | undefined = testSuiteConfig.hooks?.afterEach;

        let ignore = options.ignore || testSuiteConfig.ignore; 

        if(ignore)  {
            Orange.Core.updateTestSuiteStats(target, "NumTestsIgnored");
            Orange.Core.testsMetadata.numberOfTestsIgnored++;
        }

        let testSuiteStats = Orange.Core.getTestSuiteStats(target);
        let testFunction: () => void | Promise<void>;

        if(testMethod instanceof Orange.AsyncFunction) {
            testFunction = async () => {
                ExecuteBeforeHooks(testSuiteStats, <Function>beforeAllHook, <Function> beforeEachHook);
                (await TestProxyAsync(testMethod, target, testSuiteConfig, options, propertyKey))();
                ExecuteAfterEachHook(testSuiteStats, <Function>afterEachHook);
            };
        } else {
            testFunction = () => {
                ExecuteBeforeHooks(testSuiteStats, <Function> beforeAllHook, <Function> beforeEachHook);
                TestProxySync(testMethod, target, testSuiteConfig, options, propertyKey)();
                ExecuteAfterEachHook(testSuiteStats, <Function> afterEachHook);
            }
        }

        Deno.test({
            name: testName,
            ignore: ignore,
            fn: testFunction
        })
    }
}