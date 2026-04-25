import {XMLParser} from "fast-xml-parser";
import {DateTime} from "luxon";

import {ActionResultWithOutput,QfxObject, QfxTransaction, SimplifiDataObject} from "../models/index.js";
import {cleanInputIfHeadersPresent} from "../utility/qfx-functions.js";
import {removeSpacesFromString} from "../utility/data-cleanup-functions.js";

/**
 * Converts a QFX object to an array of SimplifiDataObject.
 */
function mapQFXToSimplifiObject (source: QfxObject): Array<SimplifiDataObject> {
    return source.transactions.map(y => {
        return {
            Date: y.postedDate,
            Payee: y.name,
            Amount: y.transactionAmount,
            Tags: ''
        };
    });
}

/**
 * Parses the contents of a QFX file into a QfxObject.
 */
function parseQFX(qfxContents: string): ActionResultWithOutput<QfxObject> {
    const result: ActionResultWithOutput<QfxObject> = {
        success: true
    };

    const standardizedContent = cleanInputIfHeadersPresent(qfxContents);

    // FITID is a number string that the parser will convert to a number.
    // Use the fix below to bypass conversion for that single tag.
    const stringOnlyTags = ['FITID'];
    const parser = new XMLParser({
        tagValueProcessor: (tagName, val, _jpath, _hasAttributes, _isLeafNode) =>
            stringOnlyTags.includes(tagName) ? null : val,
    });
    const parsedContent = parser.parse(standardizedContent);

    if (!parsedContent.OFX) {
        result.success = false;
        result.diagnostic = {
            comment: 'No OFX object found in QFX file.'
        };

        return result;
    }

    if (parsedContent.OFX.CREDITCARDMSGSRSV1) {
        result.output = populateFromCCAccount(parsedContent);
    } else if (parsedContent.OFX.BANKMSGSRSV1) {
        result.output = populateFromBankAccount(parsedContent);
    } else {
        result.success = false;
        result.diagnostic = {
            comment: 'Account type not recognized'
        };
    }

    return result;
}

function populateFromBankAccount(parsedContent: any): QfxObject {
    let object: QfxObject = {
        transactions: populateTransactionsFromBankTransactionList(
            parsedContent.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST
        )
    };

    const accountIdString = parsedContent.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.ACCTID.toString();

    object.bankAccount = {
        bankId: parsedContent.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.BANKID,
        accountId: accountIdString,
        type: parsedContent.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKACCTFROM.ACCTTYPE,
        shortAccountId: accountIdString.substring(
            accountIdString.length - 4
        )
    };

    return object;
}

function populateFromCCAccount(parsedContent: any): QfxObject  {
    let object: QfxObject = {
        transactions: populateTransactionsFromBankTransactionList(
            parsedContent.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST
        )
    };

    object.creditCardAccount = {
        accountId: parsedContent.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.CCACCTFROM.ACCTID,
        shortAccountId: parsedContent.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.CCACCTFROM.ACCTID.split('|')[1]
    };

    return object;
}

function populateTransactionsFromBankTransactionList(parsedBankTransList: any): Array<QfxTransaction> {
    return parsedBankTransList.STMTTRN.map(
        (y: {
            TRNTYPE: string,
            DTPOSTED: string,
            TRNAMT: number,
            FITID: string,
            REFNUM: string,
            NAME: string,
            MEMO: string
        }) => {
            return {
                transactionType: y.TRNTYPE,
                postedDate: DateTime.fromFormat(`${y.DTPOSTED.split(':')[0]}]`, 'yyyyMMddHHmmss.SSS[Z]'),
                transactionAmount: y.TRNAMT,
                transactionId: y.FITID,
                name: removeSpacesFromString(y.NAME),
                memo: removeSpacesFromString(y.MEMO)
            }
        }
    );
}

export {
    mapQFXToSimplifiObject,
    parseQFX
};