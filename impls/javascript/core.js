'use strict'

const { Nil, Pair } = require('./datatypes')

const coreEnv = new Map()

coreEnv.set(Symbol.for('+'), (...xs) => xs.reduce((x, y) => x + y, 0))

coreEnv.set(Symbol.for('-'), (...xs) => {
    if (xs.length === 0) return 0
    return xs.reduce((x, y) => x - y)
})

coreEnv.set(Symbol.for('*'), (...xs) => xs.reduce((x, y) => x * y, 1))

coreEnv.set(Symbol.for('/'), (...xs) => {
    if (xs.length < 2) return Math.floor(xs.reduce((x, y) => x / y, 1))
    return Math.floor(xs.reduce((x, y) => x / y))
})

coreEnv.set(Symbol.for('cons'), (x, y) => new Pair(x, y))

coreEnv.set(Symbol.for('list'), (...xs) => {
    let list = new Nil()
    let tail

    for (const x of xs) {
        if (list instanceof Nil) {
            list = new Pair(x)
            tail = list
        } else {
            tail.cdr = new Pair(x)
            tail = tail.cdr
        }
    }

    return list
})

coreEnv.set(Symbol.for('pair?'), (pair) => pair instanceof Pair)

coreEnv.set(Symbol.for('car'), (pair) => {
    if (pair instanceof Pair) return pair.car
    throw new Error('The given value is not a pair')
})

coreEnv.set(Symbol.for('cdr'), (pair) => {
    if (pair instanceof Nil || pair === null) return pair
    if (pair instanceof Pair) return pair.cdr
    throw new Error('The given value is not a pair')
})

module.exports = {
    coreEnv,
}