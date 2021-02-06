const readline = require('readline')

function READ(x) {
    return x
}

function EVAL(x) {
    return x
}

function PRINT(x) {
    return x
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
        const result = rep(line.trim())
        console.log(result)
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
