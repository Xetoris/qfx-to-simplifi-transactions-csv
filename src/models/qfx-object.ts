import {DateTime} from "luxon";

/*
 * Best example I could find of this file format:
 * https://www.exactsoftware.com/docs/DocView.aspx?DocumentID=%7B6e02f9a5-ee40-4d2f-b8ea-4bee57825907%7D
 *
 * Combined that plus the two examples I had to come up with these models.
 */


interface QfxTransaction {
    /**
     * A free-form string value to help identify the transaction type.
     *
     * @remarks
     *  Not important.
     */
    transactionType: string;

    /**
     * Date the transaction was posted.
     *
     * @example: 20260329000000.000[-05:EST]
     *
     * @remarks:
     *  Format: YYYYMMDD (Time blanked, offset in brackets at the end?)
     */
    postedDate: DateTime;

    /**
     * Amount of the transaction.
     *
     * @remarks
     *  Positive / negative value indicates cash flow: Negative = cash out, Positive = cash in
     */
    transactionAmount: number;

    /**
     * Unique identifier for the transaction.
     *
     * @remarks
     *  Assigned by the financial institution.
     */
    transactionId: number;

    /**
     * A name value assigned to the transaction.
     */
    name: string;

    /**
     * Optional memo field for extra context.
     */
    memo?: string;
}

interface QfxCreditCardAccount {
    /**
     * Identifier of the account inside the Credit Card organization.
     */
    accountId: string;

    /**
     * A short account ID representation.
     */
    shortAccountId: string;
}

interface QfxBankAccount {
    /**
     * Identifier for the Banking organization.
     */
    bankId: number;

    /**
     * Identifier for the Account inside the Banking organization.
     */
    accountId: string;

    /**
     * A string to help identify the account type.
     */
    type?: string;

    /**
     * A short account ID representation.
     */
    shortAccountId: string;
}

/**
 * Represents a group of transactions from a QBO file export.
 */
interface QfxObject {
    /**
     * Provided when transactions are linked to a Bank account.
     *
     * @remarks
     *  Exclusive with {@link creditCardAccount} field.
     */
    bankAccount?: QfxBankAccount;

    /**
     * Provided when transactions are linked to a Credit Card account.
     *
     * @remarks
     *  Exclusive with {@link bankAccount} field.
     */
    creditCardAccount?: QfxCreditCardAccount;

    /**
     * List of transactions for the associated account.
     */
    transactions: QfxTransaction[];
}

export {
    QfxBankAccount,
    QfxCreditCardAccount,
    QfxObject,
    QfxTransaction
};