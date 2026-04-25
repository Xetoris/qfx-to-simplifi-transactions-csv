const NotAlphaNumeric = /[^a-zA-Z0-9\s]/g;

function toSentenceCase(input: string): string {
    return `${input[0].toUpperCase()}${input.slice(1).toLowerCase()}`
}

function toJSPropertyName(input: string): string {
    return input.replace(NotAlphaNumeric, '').split(/\s/g)
        .filter(x => x.trim().length > 0)
        .map((y) => toSentenceCase(y)
        ).join('')
}

export {
    toJSPropertyName,
    toSentenceCase
}