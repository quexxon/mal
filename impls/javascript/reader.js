const { Nil, Pair } = require('./datatypes')

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
    let list = new Nil()
    let tail

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

        if (list instanceof Nil) {
            list = new Pair(readForm(reader))
            tail = list
        } else {
            tail.cdr = new Pair(readForm(reader))
            tail = tail.cdr
        }
    }
}

function readVector(reader) {
    const vector = []

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

        vector.push(readForm(reader))
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

    return new Pair(Symbol.for(name), new Pair(readForm(reader)))
}

function readMetadata(reader) {
    reader.next()
    const hashMap = readHashMap(reader)
    const form = readForm(reader)

    return new Pair(Symbol.for('with-meta'), new Pair(form, new Pair(hashMap)))
}

function readHashMap(reader) {
    const hashMap = {
        type: 'hash-map',
        contents: []
    }

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

        hashMap.contents.push(readForm(reader))
        nextIsKey = !nextIsKey
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
