/**
 * Attempts to close the XML tags in a QFX file.
 *
 * @remarks
 * Sometimes we get QFX files that have bad XML formatting. This will attempt to close the tags for us.
 */
function closeValueTags(input: string): string {
    const lines = input.split(/\r?\n/);

    return lines.map((line) => {
        const trimmed = line.trim();

        // Leave closing tags and blank lines alone
        if (!trimmed || trimmed.startsWith('</')) {
            return line;
        }

        // Match lines like: <CODE>0  or  <SEVERITY>INFO
        // but not lines that contain another tag like <STATUS> or <FI>
        const match = trimmed.match(/^<([A-Za-z0-9._:-]+)>([^<]*)$/);
        if (!match) {
            return line;
        }

        const [, tagName, value] = match;

        // If the value is empty, leave it unchanged
        if (value === '') {
            return line;
        }

        return line.replace(trimmed, `<${tagName}>${value}</${tagName}>`);
    }).join('\n');
}

/**
 * Removes any header information up to the opening <OFX> tag.
 *
 * @remarks
 * Some sources add a header to the file for some reason. This attempts to remove it.
 */
function cleanInputIfHeadersPresent(input: string): string {
    let result: string;
    const trimmed = input.trim();

    if (!trimmed.startsWith('<')) {
        result = closeValueTags(`<OFX>${trimmed.split('<OFX>')[1]}`);
    } else {
        result = trimmed;
    }

    return result;
}

export {
    closeValueTags,
    cleanInputIfHeadersPresent
};