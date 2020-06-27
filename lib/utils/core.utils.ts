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
        try{
            return target.constructor.name;
        } catch(error) {
            return target.name;
        }
    }

    public static fileDirExists(path: string): boolean  {
        try {
          Deno.statSync(path);
          return true;
        } catch (error) {
          return false;
        }
    }

    public static getStandardDate() {
        var today = new Date();
        return today.toISOString().substring(0, 10);
    }

}