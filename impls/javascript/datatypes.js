class Nil {}

class Pair {
    constructor(car, cdr = null) {
        if (car === undefined) {
            throw new Error('car must not be undefined')
        }

        this.car = car
        this.cdr = cdr
    }
}

module.exports = {
    Nil,
    Pair,
}
