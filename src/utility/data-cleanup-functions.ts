/**
 * Replaces all space entries with a single space.
 *
 * @remarks
 *  Mostly used to remove multiple spaces.
 */
function removeSpacesFromString(value: string): string {
    return value.replace(/\s+/g, ' ');
}

export {
    removeSpacesFromString
};