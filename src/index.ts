import {resolve} from 'node:path';
import {homedir} from 'node:os';

import {parseQFX, mapQFXToSimplifiObject} from './converters/index.js';
import {ActionResult} from "./models/index.js";
import {findSourceFiles, readInputFile} from "./reader.js";
import {writeOutSimplifiCsvFile} from "./writer.js";

function auditActionResultFailure(result: ActionResult, warningMessage: string): void {
    console.warn(warningMessage);

    if (result.diagnostic?.comment) {
        console.info(`Diagnostic Comment: ${result.diagnostic.comment}`);
    }

    if (result.diagnostic?.error) {
        console.error(result.diagnostic.error);
    }
}

/**
 * Attempts to parse QFX files in our target directory. Converts each of them to a Simplifi CSV transaction csv file.
 * This can then be imported into Simplifi accounts.
 */
const inputDirectory = resolve(homedir(), './Documents/Finances/exports');
const outputDirectory = resolve(homedir(), './Documents/Finances/imports');
const filesResult = findSourceFiles(inputDirectory);

if (!filesResult.success) {
    auditActionResultFailure(filesResult,'Failed to identify files.');
}

for(let file of filesResult.output ?? []) {
    const inputFilePath = resolve(inputDirectory, file);
    const contentResult = readInputFile(inputFilePath);

    if (!contentResult.success || !contentResult.output) {
        auditActionResultFailure(contentResult, 'Failed to read source file.');
        continue;
    }

    const parserResult = parseQFX(contentResult.output);

    if (!parserResult.success || !parserResult.output) {
        auditActionResultFailure(parserResult, 'Failed to parse QFX file.');
        continue;
    }

    const translationResult = mapQFXToSimplifiObject(parserResult.output);

    if (!translationResult) {
        console.warn( 'Failed to translate QFX model to Simplifi model.');
        continue;
    }

    const shortAcctNumber = parserResult.output.creditCardAccount ?
        parserResult.output.creditCardAccount.shortAccountId :
        parserResult.output.bankAccount!.shortAccountId;


    const writerResult =
        writeOutSimplifiCsvFile(outputDirectory, shortAcctNumber, translationResult);

    if (!writerResult.success) {
        auditActionResultFailure(writerResult, 'Failed to write import file.');
    }
}