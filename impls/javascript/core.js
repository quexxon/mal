'use strict';

const { Env } = require('./env')
const { nil, List, Cons } = require('./datatypes')
const { printString } = require('./printer')

const env = new Env()

env.set('nil', nil)

env.set('+', (...xs) => xs.reduce((x, y) => x + y, 0))

env.set('-', (...xs) => {
    if (xs.length === 0) return 0
    return xs.reduce((x, y) => x - y)
})

env.set('*', (...xs) => xs.reduce((x, y) => x * y, 1))

env.set('/', (...xs) => {
    if (xs.length < 2) return Math.floor(xs.reduce((x, y) => x / y, 1))
    return Math.floor(xs.reduce((x, y) => x / y))
})

env.set('cons', (x, y) => {
    if (y === nil) {
        return new List(x)
    }

    return y instanceof List ? y.cons(x) : new Cons(x, y)
})

env.set('list', (...xs) => new List(...xs))

env.set('list?', List.isList)

env.set('empty?', (x) => {
    const t = type(x).description

    switch (t) {
        case ':list': return x.isEmpty()
        case ':vector': return x.length === 0
        case ':hash-map': return x.size === 0
    }

    throw new Error(`Unsupported type: ${t}`)
})

env.set('count', (x) => {
    const t = type(x).description

    switch (t) {
        case ':nil': return 0
        case ':list': return x.length
        case ':vector': return x.length
        case ':hash-map': return x.size
    }

    throw new Error(`Unsupported type: ${t}`)
})

const type = (x) => {
    if (x === true || x === false) {
        return Symbol.for(':boolean')
    }

    if (x === null) {
        return Symbol.for(':nil')
    }

    if (typeof x === 'number') {
        return Symbol.for(':number')
    }

    if (typeof x === 'string') {
        return Symbol.for(':string')
    }

    if (typeof x === 'function') {
        return Symbol.for(':function')
    }

    if (x instanceof Cons) {
        return Symbol.for(':cons')
    }

    if (List.isList(x)) {
        return Symbol.for(':list')
    }

    if (Array.isArray(x)) {
        return Symbol.for(':vector')
    }

    if (x instanceof Map) {
        return Symbol.for(':hash-map')
    }

    if (typeof x === 'symbol') {
        if (x.description.startsWith(':')) {
            return Symbol.for(':keyword')
        }

        return Symbol.for(':symbol')
    }

    throw new Error('Encountered value of unknown type')
}

env.set('type', type)

const isPair = (x) => x instanceof Cons || (x instanceof List && !x.isEmpty())

env.set('pair?', isPair) 

env.set('car', (x) => {
    if (isPair(x)) return x.car
    throw new Error('The given value is not a pair')
})

env.set('cdr', (x) => {
    if (isPair(x)) return x.cdr
    throw new Error('The given value is not a pair')
})

env.set('prn', (x) => {
    console.log(printString(x))
    return null
})

const isEqual = (...xs) => {
    if (xs.length < 2) return true

    let v = xs[0]
    let vType = type(v).description

    for (let i = 1; i < xs.length; i++) {
        const x = xs[i]
        const xType = type(x).description

        if (
            (vType === ':list' && xType === ':vector') ||
            (vType === ':vector' && xType === ':list')
        ) {
            if (x.length !== v.length) return false
            const [vector, list] = vType === ':vector' ? [v, x] : [x, v]

            let i = 0
            for (const l of list) {
                if (!isEqual(l, vector[i++])) return false
            }

            return true
        }
        
        if (xType !== vType) return false

        switch (vType) {
            case ':cons':
                if (!isEqual(x.car, v.car) || !isEqual(x.cdr, v.cdr)) {
                    return false
                }
                break;

            case ':list':
                if (x.length !== v.length) return false
                const xIter = x[Symbol.iterator]()
                const vIter = v[Symbol.iterator]()
                let next
                while (!(next = xIter.next()).done) {
                    if (!isEqual(next.value, vIter.next().value)) {
                        return false
                    }
                }
                break;

            case ':vector':
                if (x.length !== v.length) return false
                for (let i = 0; i < x.length; i++) {
                    if (!isEqual(x[i], v[i])) return false
                }
                break;

            case ':hash-map':
                if (x.size !== v.size) return false
                for (const key of x.keys()) {
                    if (!v.has(key)) return false
                    if (!isEqual(x.get(key), v.get(key))) return false
                }
                break;

            default:
                if (x !== v) return false
                break;
        }
    }

    return true
}

env.set('=', isEqual)

module.exports = {
    env,
}
