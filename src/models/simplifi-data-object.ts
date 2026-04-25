import {DateTime} from "luxon";

export type SimplifiDataObject = {
    Date: DateTime;
    Payee: string;
    Amount: number;
    Tags: string;
}