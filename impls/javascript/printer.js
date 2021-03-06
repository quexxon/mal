'use strict'

const { nil, Cons, List } = require('./datatypes')

function printString(form) {
    if (form === null) {
        return 'nil'
    }

    if (form === nil) {
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

    if (typeof form === 'string') {
        return form
    }

    if (typeof form === 'function') {
        return '#<function>'
    }

    if (form instanceof Cons) {
        return `(${printString(form.car)} . ${printString(form.cdr)})`
    }

    if (form instanceof List) {
        const contents = []

        for (const subform of form) {
            contents.push(printString(subform))
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

    if (form instanceof Map) {
        const contents = []

        for (const [key, value] of form) {
            contents.push(printString(key))
            contents.push(printString(value))
        }

        return `{${contents.join(' ')}}`
    }

    throw new Error('Unrecognized form')
}

module.exports = {
    printString
}
