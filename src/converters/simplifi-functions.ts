import {parse} from "csv-parse/sync";
import {DateTime} from "luxon";
import {ActionResultWithOutput, SimplifiDataObject, SimplifiCsvObject} from "../models/index.js";
import {mapErrorToActionResult} from '../utility/error-functions.js'
import {toJSPropertyName} from "../utility/string-functions.js";

function ParseSimplifiCSV(csvContents: string): ActionResultWithOutput<Array<SimplifiDataObject>> {
    const result: ActionResultWithOutput<Array<SimplifiDataObject>> = {
        success: true
    };

    let parsed: Array<SimplifiCsvObject> | undefined;

    try {
        parsed = parse<SimplifiCsvObject>(csvContents, {
            columns: (header) => header.map(
                (column) => toJSPropertyName(column)
            ),
            skip_empty_lines: true
        });
    } catch (e) {
        mapErrorToActionResult(result, e, 'Unable to parse Simplifi csv contents.');

        return result;
    }

    if (!parsed || parsed.length < 1) {
        result.success = false;
        result.diagnostic = {
            comment: 'No records found in Simplifi csv.'
        };
    } else {
        result.output = parsed.map(y => {
            return {
                Date: DateTime.fromFormat(y.Postedon, "M/d/yyyy"),
                Payee: y.Payee,
                Amount: parseFloat(y.Amount.replace(/[$,]/g, '')),
                Tags: y.Tags
            }
        });
    }

    return result;
}

function IsSimplifiCSV(contents: string): boolean {
    return contents.includes("state") && contents.includes("postedOn") && contents.includes("payee");
}

export {
    IsSimplifiCSV,
    ParseSimplifiCSV
}