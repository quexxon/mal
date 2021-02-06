const readline = require('readline')
const { Reader } = require('./reader')
const printer = require('./printer')

function READ(string) {
    return Reader.readString(string)
}

function EVAL(x) {
    return x
}

function PRINT(form) {
    return printer.printString(form)
}

function rep(input) {
    return PRINT(EVAL(READ(input)))
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
            const result = rep(line)
            console.log(result)
        } catch (error) {
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
