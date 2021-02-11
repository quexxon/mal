'use strict'


function symbolize(stringOrSymbol) {
    return (typeof stringOrSymbol === 'symbol'
        ? stringOrSymbol
        : Symbol.for(stringOrSymbol)
    )
}

class Env {
    constructor(outer, binds, exprs) {
        this.outer = outer
        this.env = new Map()

        if (Array.isArray(binds) && Array.isArray(exprs)) {
            let nParams = binds.length
            // Handle variadic parameters
            if (binds[binds.length - 2] === Symbol.for('&')) {
                const key = binds[binds.length - 1]
                nParams = binds.length - 2
                this.env.set(key, exprs.slice(nParams))
            }

            for (let i = 0; i < nParams; i++) {
                this.env.set(binds[i], exprs[i])
            }
        }
    }

    set(key, value) {
        this.env.set(symbolize(key), value)
    }

    get(key) {
        key = symbolize(key)
        const value = this.env.get(key)

        if (value === undefined && this.outer === undefined) {
            throw new Error(`'${key.description}' not found`)
        }

        return value === undefined ? this.outer.get(key) : value
    }
}

module.exports = {
    Env,
}
