import {
    readFileSync,
    existsSync,
    readdirSync,
} from "node:fs";

import {ActionResultWithOutput} from "./models/index.js";
import {mapErrorToActionResult} from "./utility/error-functions.js";

/**
 * Attempts to scan a given directory for QFX files to process.
 */
function findSourceFiles(inputFileDir: string): ActionResultWithOutput<Array<string>> {
    const result: ActionResultWithOutput<Array<string>> = {
        success: true
    };

    if (!existsSync(inputFileDir)) {
        result.success = false;
        result.diagnostic = {
            comment:  "Input directory doesn't exist"
        };

        return result;
    }

    let fileList: Array<string> | undefined;

    try {
        fileList = readdirSync(inputFileDir);
    } catch (e) {
        mapErrorToActionResult(result, e, 'Unable to iterate files.');

        return result;
    }

    result.output = fileList.filter((y) => y.endsWith('.qfx'));

    if (result.output.length < 1) {
        result.success = false;
        result.diagnostic = { comment: 'No source files found.' }
    }

    return result;
}

/**
 * Reads the raw contents of an input file.
 */
function readInputFile(inputFilePath: string): ActionResultWithOutput<string> {
    const result: ActionResultWithOutput<string> = {
        success: true
    };

    let fileContents: string | undefined;

    try {
        const fileData = readFileSync(inputFilePath);

        fileContents = fileData.toString();
    } catch (e) {
        mapErrorToActionResult(result, e, 'Unable to read source file.');
    }

    if (fileContents) {
        result.output = fileContents;
    }

    return result;
}

export {
    findSourceFiles,
    readInputFile
};