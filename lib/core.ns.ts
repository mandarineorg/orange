import { bold, yellow } from "https://deno.land/std/fmt/colors.ts";
import { Table } from "./table.ts";
import { CoreUtils } from "./utils/core.utils.ts";
export namespace Orange {

    export const AsyncFunction = (async () => {}).constructor;

    export const TEST_SUITE_CLASS_KEY = "ORANGE_TESTSUITE_OPTIONS";

    export interface TestOptions {
        name?: string,
        description?: string,
        ignore?: boolean
    }

    export interface OrangeTest extends TestOptions {
        test: void;
    }

    export interface TestStatus extends TestOptions {
        testSuiteClass: any;
        testSuiteName: string;
        passed: boolean;
        error: Error;
        time: string;
    }

    export interface TestStatusForTable {
        ["Name"]?: string;
        ["Description"]?: string;
        ["Status"]?: "Ignored" | "FAILED" | "Ok";
        ["Error Class"]?: string;
        ["Error Message"]?: string;
        ["Suite Name"]?: string;
        ["Time"]?: string;
    }

    export interface OrangeConfiguration {
        testsFolder?: string;
        showExceptions?: boolean;

    }

    export interface Options {
        testSuiteName?: string;
        ignore?: boolean;
        generateReport?: boolean;
    }

    export namespace Defaults {

        export const DEFAULT_OPTIONS: Options = {
            ignore: false,
            generateReport: true
        }

        export const DEFAULT_ORANGE_CONFIG: OrangeConfiguration = {
            testsFolder: "./tests/[date]/",
            showExceptions: false
        }
    }

    export class Core {

        public static orangeConfiguration: OrangeConfiguration;

        public static testsMetadata = {
            numberOfTests: 0,
            numberOfTestsRan: 0,
            numberOfTestsIgnored: 0
        };

        public static tests: Map<Function, TestStatus> = new Map<Function, TestStatus>();
        public static testSuites: Map<any, any> = new Map<any, any>();

        public static addTest(testMethod: Function, status: TestStatus) {
            if(!this.tests.has(testMethod)) this.tests.set(testMethod, status);
        }

        public static addTestSuite(classSource: any) {
            let instance;

            try {
                instance = new classSource.constructor();
            } catch(error) {
                instance = new classSource();
            }
            if(!this.testSuites.has(classSource)) this.testSuites.set(classSource, instance);
        }

        public static getTestSuite(classSource: any) {
            return this.testSuites.get(classSource);
        }

        public static setTestSuiteConfig(options: Options, classSource: any) {
            if(options == undefined) options = Orange.Defaults.DEFAULT_OPTIONS;
            if(options.testSuiteName == undefined) options.testSuiteName = CoreUtils.getClassName(classSource);
            if(options.ignore == undefined) options.ignore = Orange.Defaults.DEFAULT_OPTIONS.ignore;
            if(options.generateReport == undefined) options.generateReport = Orange.Defaults.DEFAULT_OPTIONS.generateReport;
            return options;
        }

        public static getTestSuiteConfig(classSource: any): Options {
            let options = this.testSuites.get(classSource)[TEST_SUITE_CLASS_KEY];
            let configFromClass: Options = Object.assign({}, options);
            if(!options) {
                configFromClass = this.setTestSuiteConfig(configFromClass, classSource);
            }
            return configFromClass;
        }

        public static getTableContent(classSource?: any) {
            let testStatuses: Array<TestStatusForTable> = new Array<TestStatusForTable>();

            Array.from(this.tests.values()).filter(item => (classSource == undefined) ? true : item.testSuiteClass == classSource).forEach((item) => {
               const description = item.description;
               const suiteName = item.testSuiteName;
               const errorClassName = item.error?.constructor?.name;
               const errorMessage = item.error?.message;

               let testStatusTable: TestStatusForTable = {};
               testStatusTable["Name"] = item.name;
               testStatusTable["Description"] = (description) ? description : "-";
               testStatusTable["Status"] = (item.ignore) ? "Ignored" : (item.passed) ? "Ok" : "FAILED";
               testStatusTable["Suite Name"] = (suiteName) ? suiteName : "-";
               testStatusTable["Error Class"] = (errorClassName) ? errorClassName : "-";
               testStatusTable["Error Message"] = (errorMessage) ? errorMessage : "-";
               testStatusTable["Time"] = item.time;
               testStatuses.push(testStatusTable);
            });
            
            return testStatuses;
        }

        public static generateTable(): Array<string> {
            const availableTestSuites: Array<any> = Array.from(this.testSuites.keys());

            let tables: Array<string> = new Array<string>();
            availableTestSuites.forEach((item) => {
                let testSuiteConfig = this.getTestSuiteConfig(item);
                if(!testSuiteConfig.generateReport) return;
                let tableContent = this.getTableContent(item);
                tableContent = tableContent.map((item) => {
                    item["Error Message"] = item["Error Message"].replace(/(\r\n|\n|\r)/gm, "");
                    return item;
                })
                let table = Table(tableContent, true, false, "Test ID");
                table = (<string>table).replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
                tables.push(`${testSuiteConfig.testSuiteName}\n${(tableContent.length == 0) ? " - No tests were found or they were ignored" : table}\n`);
            });

            tables.push(`\n`);
            let tests = Array.from(this.tests.values());
            tables.push(`| Total Tests: ${this.testsMetadata.numberOfTests} |  Ran: ${this.testsMetadata.numberOfTestsRan} | Ignored: ${this.testsMetadata.numberOfTestsIgnored} | Passed: ${tests.filter((item) => item.passed).length} | Failed: ${tests.filter((item) => !item.passed).length} |`)

            Deno.writeTextFileSync(`${this.getTestingFolder()}/test-result.txt`, <string>tables.join(`\n`));

            return tables;
        }

        public static getOrangeConfig(): OrangeConfiguration {
            if(this.orangeConfiguration == undefined) {
                if(CoreUtils.fileDirExists(`orange-test.json`)) {
                    let config;
                    try {
                        config = JSON.parse(new TextDecoder().decode(Deno.readFileSync('orange-test.json')));

                        if(config.testsFolder == undefined) config.testsFolder = Defaults.DEFAULT_ORANGE_CONFIG.testsFolder;
                        if(config.showExceptions == undefined) config.showExceptions = Defaults.DEFAULT_ORANGE_CONFIG.showExceptions;
                        
                    } catch(error) {
                        console.log(yellow(`${bold("Warning: `orange-test.json`")} could not be read. Default values are now used`));
                        config = Defaults.DEFAULT_ORANGE_CONFIG;
                    }
                    this.orangeConfiguration = config;
                } else {
                    this.orangeConfiguration = Defaults.DEFAULT_ORANGE_CONFIG;
                }
                return this.orangeConfiguration;
            } else {
                return this.orangeConfiguration;
            }
        }

        public static getTestingFolder() {
            let config = this.getOrangeConfig();
            let testFolder = this.parseKeywords(config.testsFolder);
            if(!CoreUtils.fileDirExists(testFolder)) Deno.mkdirSync(testFolder, { recursive: true });
            return testFolder;
        }

        public static parseKeywords(input: string) {
            input = input.replace("[date]", CoreUtils.getStandardDate());
            input = input.replace("[timestamp]", new Date().valueOf().toString());
            return input;
        }

    }

    export const setOptions = (sourceClass: any, options: Options) => {
        Core.setTestSuiteConfig(options, sourceClass);
        //console.log(options);
        sourceClass[TEST_SUITE_CLASS_KEY] = options;
    }
}