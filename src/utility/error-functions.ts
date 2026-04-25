import {ActionResult} from "../models/index.js";

/**
 * Checks if the object is a JS Error type.
 *
 * @remarks
 *  A really silly comparison method, but sufficient for our use cases.
 */
function isError(obj: any): obj is Error {
    return typeof (obj) == "object" &&
        obj.message &&
        typeof (obj.message) === "string" &&
        obj.name &&
        typeof (obj.name) === "string";
}

/**
 * Simple wrapper to easily set the ActionResult's state from an Error object.
 */
function mapErrorToActionResult(result: ActionResult, error?: unknown, comment?: string): void {
    result.success = false;
    result.diagnostic = {
        comment: comment
    };

    if (error && isError(error)) {
        result.diagnostic.error = error;
    }
}


export {
    isError,
    mapErrorToActionResult
};