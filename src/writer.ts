import {stringify} from 'csv-stringify/sync';
import {resolve} from 'node:path';
import {mkdirSync, writeFileSync} from 'node:fs';

import {ActionResult, SimplifiDataObject} from "./models/index.js";
import {mapErrorToActionResult} from "./utility/error-functions.js";

/**
 * Writes out a Simplifi formatted csv transactions file.
 *
 * @param outputDir - Directory to write the file out to.
 * @param accountNumber - Number for the account the transactions belong to. Used in file naming.
 * @param records - Records to write to the file.
 */
function writeOutSimplifiCsvFile(
    outputDir: string,
    accountNumber: string,
    records: Array<SimplifiDataObject>): ActionResult {

    const result: ActionResult = {
        success: true
    };

    if (records.length < 1) {
        result.success = false;
        result.diagnostic = {
            comment: "No records to export."
        };
    }

    try {
        mkdirSync(outputDir, { recursive: true });
    } catch (e) {
        mapErrorToActionResult(result, e, 'Unable to ensure output directory exists.');

        return result;
    }

    let fileContents: string;

    try {
        fileContents = stringify(records.map(y => {
            return {
                Date: y.Date.toFormat("MM/dd/yyyy"),
                Payee: y.Payee,
                Amount: y.Amount,
                Tags: y.Tags
            };
        }), {
            header: true
        });
    } catch (e) {
        mapErrorToActionResult(result, e, 'Unable to serialize Simplifi records.');

        return result;
    }

    try {
        const latestRecord = records.sort((x, y) => x.Date < y.Date ? -1 : 1)[0];
        const outputFilePath = resolve(outputDir, `${accountNumber}-${latestRecord.Date.toFormat("MMdd")}-import.csv`);

        writeFileSync(outputFilePath, fileContents, {});
    } catch (e) {
        mapErrorToActionResult(result, e, 'Unable to write output file.');
    }

    return result;
}

export {
    writeOutSimplifiCsvFile
};