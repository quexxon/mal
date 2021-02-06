const { Nil, Pair } = require('./datatypes')

function printString(form) {
    if (form === null) {
        return 'nil'
    }

    if (form instanceof Nil) {
        return '()'
    }

    if (form === true || form === false) {
        return form.toString()
    }

    if (typeof form === 'symbol') {
        return form.description
    }

    if (typeof form === 'number') {
        return form.toString()
    }

    if (form instanceof Pair) {
        const contents = []

        while (form !== null) {
            contents.push(printString(form.car))
            form = form.cdr
        }

        return `(${contents.join(' ')})`
    }

    if (Array.isArray(form)) {
        const contents = []

        for (const subform of form) {
            contents.push(printString(subform))
        }

        return `[${contents.join(' ')}]`
    }

    if (form.type === 'hash-map') {
        const contents = []

        for (const subform of form.contents) {
            contents.push(printString(subform))
        }

        return `{${contents.join(' ')}}`
    }

    if (typeof form === 'string') {
        return form
    }

    throw new Error('Unrecognized form')
}

module.exports = {
    printString
}
