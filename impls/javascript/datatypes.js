'use strict'

const nil = Symbol.for('nil')

class Cons {
    constructor(car, cdr = nil) {
        if (car === undefined || cdr === undefined) {
            throw new Error('undefined is not allowed')
        }

        this.car = car
        this.cdr = cdr
    }
}

class List {
    #value
    #tail
    #length

    static isList(x) {
        return x === nil || x instanceof List
    }

    constructor(...xs) {
        if (xs.length === 0) {
            this.#value = nil
            this.#length = 0
        } else {
            this.#value = new Cons(xs[0])
            this.#tail = this.#value
            this.#length = xs.length

            for (let i = 1; i < xs.length; i++) {
                this.#tail.cdr = new Cons(xs[i])
                this.#tail = this.#tail.cdr
            }
        }
    }

    *[Symbol.iterator]() {
        let list = this

        while (!list.isEmpty()) {
            yield list.car
            list = list.cdr
        }
    }

    get car() {
        return this.#value.car
    }

    get cdr() {
        const list = new List()

        if (this.#value.cdr === nil) {
            return list
        }

        list.#value = this.#value.cdr
        list.#tail = this.#value.tail
        list.#length = this.#length - 1

        return list
    }

    get length() {
        return this.#length
    }

    isEmpty() {
        return this.#value === nil
    }

    toArray() {
        const array = []

        for (const x of this) {
            array.push(x)
        }

        return array
    }

    cons(x) {
        this.#value = new Cons(x, this.#value)
        this.#length++
        return this
    }

    extend(x) {
        if (this.isEmpty()) {
            this.#value = new Cons(x)
            this.#tail = this.#value
        } else {
            this.#tail.cdr = new Cons(x)
            this.#tail = this.#tail.cdr
        }
        this.#length++
    }
}

module.exports = {
    nil,
    Cons,
    List,
}
