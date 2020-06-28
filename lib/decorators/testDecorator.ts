import { setColorEnabled, yellow } from "https://deno.land/std/fmt/colors.ts";
import { Orange } from "../core.ns.ts";
import { TestProxy } from "../proxy/testProxy.ts";

export const Test = (options: Orange.TestOptions) => {
    return (target: any, propertyKey: string) => {
        let testName = (options.name) ? options.name : propertyKey;
        testName = `
            [${yellow(testName)}]`;

        // Define test  
        Orange.Core.testsMetadata.numberOfTests++;
        Orange.Core.addTestSuite(target);

        let testMethod = Orange.Core.getTestSuite(target)[propertyKey];
        let testSuiteConfig = Orange.Core.getTestSuiteConfig(target);
        let ignore = options.ignore || testSuiteConfig.ignore; 
        if(ignore) Orange.Core.testsMetadata.numberOfTestsIgnored++;
        Deno.test({
            name: testName,
            ignore: ignore,
            fn: async () => {
                (await TestProxy(testMethod, target, testSuiteConfig, testMethod instanceof Orange.AsyncFunction, options, propertyKey))();
            }
        });
    }
}