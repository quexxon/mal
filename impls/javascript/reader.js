'use strict'

const MAL_TOKEN_REGEX = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g

function tokenize(string) {
    const tokens = []

    for (const match of string.matchAll(MAL_TOKEN_REGEX)) {
        const token = match[1]
        if (token !== '') {
            tokens.push(token)
        }
    }

    return tokens
}

function readList(reader) {
    const list = { type: 'list', value: [] }

    reader.next()

    while (true) {
        const next = reader.peek()

        if (next === undefined) {
            throw new Error('Reached EOF before closing paren')
        }

        if (next === ')') {
            reader.next()
            return list
        }

        list.value.push(readForm(reader))
    }
}

function readVector(reader) {
    const vector = { type: 'vector', value: [] }

    reader.next()

    while (true) {
        const next = reader.peek()

        if (next === undefined) {
            throw new Error('Reached EOF before closing bracket')
        }

        if (next === ']') {
            reader.next()
            return vector
        }

        vector.value.push(readForm(reader))
    }
}

function readHashMap(reader) {
    const hashMap = { type: 'hash-map', value: [] }

    reader.next()

    let nextIsKey = true
    while (true) {
        const next = reader.peek()

        if (next === undefined) {
            throw new Error('Reached EOF before closing brace')
        }

        if (next === '}') {
            if (!nextIsKey) {
                throw new Error('Unmatched key/value pair in hash map')
            }
            reader.next()
            return hashMap
        }

        hashMap.value.push(readForm(reader))
        nextIsKey = !nextIsKey
    }
}

function readAtom(reader) {
    const atom = reader.next()

    const maybeInt = parseInt(atom)
    if (!Number.isNaN(maybeInt)) {
        return maybeInt
    }

    return Symbol.for(atom)
}

function readerMacro(reader, name) {
    reader.next()

    return {
        type: 'list',
        value: [ Symbol.for(name), readForm(reader) ],
    }
}

function readMetadata(reader) {
    reader.next()
    const hashMap = readHashMap(reader)
    const form = readForm(reader)

    return {
        type: 'list',
        value: [ Symbol.for('with-meta'), form, hashMap ],
    }
}

function readString(reader) {
    let string = reader.next()

    if (string.length < 2 || string[string.length - 1] !== '"') {
        throw new Error('Reached EOF before closing double quote')
    }

    let backslashes = 0
    let previous = ''
    for (const chr of string.slice(1, -1)) {
        if (chr === '\\') {
            backslashes++
        } else if (previous === '\\') {
            if (chr === '"' || chr === 'n') {
                if (backslashes % 2 !== 1) {
                    throw new Error('unbalanced string escape')
                }
            } else if (backslashes % 2 !== 0) {
                throw new Error('unbalanced string escape')
            }

            backslashes = 0
        }

        previous = chr
    }
    if (backslashes % 2 !== 0) {
        throw new Error('unbalanced string escape')
    }

    return string
}

function readForm(reader) {
    switch (reader.peek()) {
        case '(':
            return readList(reader)

        case '[':
            return readVector(reader)

        case '{':
            return readHashMap(reader)

        case "'":
            return readerMacro(reader, 'quote')

        case '`':
            return readerMacro(reader, 'quasiquote')

        case '~':
            return readerMacro(reader, 'unquote')

        case '~@':
            return readerMacro(reader, 'splice-unquote')

        case '@':
            return readerMacro(reader, 'deref')

        case '^':
            return readMetadata(reader)

        case 'true':
            reader.next()
            return true

        case 'false':
            reader.next()
            return false

        case 'nil':
            reader.next()
            return null

        default:
            if (reader.peek().startsWith('"')) {
                return readString(reader)
            }

            return readAtom(reader)
    }
}

class Reader {
    static readString(string) {
        const reader = new Reader(tokenize(string))

        return readForm(reader)
    }

    constructor(tokens) {
        this.tokens = tokens
    }

    next() {
        return this.tokens.shift()
    }

    peek() {
        return this.tokens[0]
    }
}

module.exports = {
    Reader
}
