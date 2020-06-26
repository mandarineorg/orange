import { green, gray, bold } from "https://deno.land/std/fmt/colors.ts";

export class CoreUtils {

    public static formatFinalTestName(description: string, methodName: string): string {
        let newName: string;

        if(description) {
            newName = `
                [${gray(description)}] 
                    [${methodName}()] ${bold("...")} = `;
        } else {
            newName = `
                [${methodName}()] ${bold("...")} = `;
        }

        return newName;
    }

    public static getClassName(target: any): string {
        let className:string = target.constructor.name;
        if(className === "Function") return target.name;
        return className;
    }

    public static fileDirExists(path: string): boolean  {
        try {
          Deno.statSync(path);
          return true;
        } catch (error) {
          return false;
        }
    }

}