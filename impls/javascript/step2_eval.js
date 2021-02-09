const { coreEnv } = require('./core')
const { Nil, Pair } = require('./datatypes')
const { Reader } = require('./reader')
const printer = require('./printer')
const readline = require('readline')

function READ(string) {
    return Reader.readString(string)
}

function EVAL(ast, env) {
    if (ast?.type === 'list' && ast?.value?.length === 0) {
        return new Nil()
    }

    if (ast?.type === 'list') {
        const list = evalAst(ast, env)

        if (typeof list.car !== 'function') {
            throw new Error('First item in list must be a function')
        }

        const args = list.cdr === null ? [] : list.cdr.toArray()
        return list.car.apply(null, args)
    }

    return evalAst(ast, env)
}

function PRINT(form) {
    return printer.printString(form)
}

function evalAst(ast, env) {
    if (typeof ast === 'symbol') {
        if (ast.description.startsWith(':')) return ast

        const value = env.get(ast)

        if (value === undefined) {
            throw new Error(`Unknown symbol: ${ast.description}`)
        }

        return value
    }

    if (ast?.type === 'list') {
        let list, tail
        for (const x of ast.value) {
            if (list === undefined) {
                list = new Pair(EVAL(x, env))
                tail = list
            } else {
                tail.cdr = new Pair(EVAL(x, env))
                tail = tail.cdr
            }
        }
        return list
    }

    if (ast?.type === 'vector') {
        const vector = []
        for (const x of ast.value) {
            vector.push(EVAL(x, env))
        }
        return vector
    }

    if (ast?.type === 'hash-map') {
        const hashMap = new Map()

        let nextIsKey = true
        let key
        for (const x of ast.value) {
            if (nextIsKey) {
                key = EVAL(x, env)
            } else {
                hashMap.set(key, EVAL(x, env))
            }
            nextIsKey = !nextIsKey
        }
        return hashMap
    }

    return ast
}

function rep(input, env) {
    return PRINT(EVAL(READ(input), env))
}

function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    rl.setPrompt('user> ')

    rl.prompt()

    rl.on('line', (line) => {
        try {
            const result = rep(line, coreEnv)
            console.log(result)
        } catch (error) {
            console.log(error)
            console.error(error.message)
        }
        rl.prompt()
    }).on('close', () => {
        process.exit(0)
    })
}

try {
    main()
} catch (error) {
    console.error(`Unexpected error: ${error.message}`)
}
