import { yellow } from "https://deno.land/std/fmt/colors.ts";
import { Orange } from "../core.ns.ts";
import { TestProxy } from "../proxy/testProxy.ts";

export const Test = (options: Orange.TestOptions) => {
    return (target: any, propertyKey: string) => {
        let testName = (options.name) ? options.name : propertyKey;
        testName = `
            [${yellow(testName)}]`;
            
        // Define test  
        Orange.Core.testsMetadata.numberOfTests++;
        Orange.Core.updateTestSuiteStats(target, "NumTests");
        Orange.Core.addTestSuite(target);

        let testMethod = Orange.Core.getTestSuite(target)[propertyKey];
        let testSuiteConfig = Orange.Core.getTestSuiteConfig(target);

        let ignore = options.ignore || testSuiteConfig.ignore; 
        if(ignore)  {
            Orange.Core.updateTestSuiteStats(target, "NumTestsIgnored");
            Orange.Core.testsMetadata.numberOfTestsIgnored++;
        }

        let testSuiteStats = Orange.Core.getTestSuiteStats(target);
        
        Deno.test({
            name: testName,
            ignore: ignore,
            fn: async () => {
                let beforeAllHook: Function = testSuiteConfig.hooks?.beforeAll;
                let beforeEachHook: Function = testSuiteConfig.hooks?.beforeEach;
                let afterEachHook: Function = testSuiteConfig.hooks?.afterEach;

                if(testSuiteStats.numberOfTestsRan == 0 && beforeAllHook) beforeAllHook();
                if(beforeEachHook) beforeEachHook();

                (await TestProxy(testMethod, target, testSuiteConfig, options, propertyKey))();

                if(afterEachHook && !Orange.Core.isLastTest(testSuiteStats.numberOfTests, testSuiteStats.numberOfTestsIgnored, testSuiteStats.numberOfTestsRan)) afterEachHook();
            }
        });
    }
}