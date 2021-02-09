'use strict'

class Nil {}

class Pair {
    constructor(car, cdr = null) {
        if (car === undefined) {
            throw new Error('car must not be undefined')
        }

        this.car = car
        this.cdr = cdr
    }

    *[Symbol.iterator]() {
        let pair = this

        while (pair !== null) {
            yield pair.car
            pair = pair.cdr
        }
    }

    toArray() {
        const array = []

        for (const car of this) {
            array.push(car)
        }

        return array
    }
}

module.exports = {
    Nil,
    Pair,
}
