/**
 * Represents the outcome of an action that returns a value.
 */
export type ActionResultWithOutput<T> = ActionResult & {
    output?: T;
}

/**
 * Represents the outcome of an action.
 */
export type ActionResult = {
    success: boolean;
    diagnostic?: {
        error?: Error;
        comment?: string;
    }
}