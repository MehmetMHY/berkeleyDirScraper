/*
February 15, 2024

Here is an example of how to extract users' information from,
UC Berkeley's Campus Directory website just though a users',
email.
*/

const utils = require("./lib/utils")

async function main() {
    const emails = [
        "doudna@berkeley.edu",
        "example@berkeley.edu"
    ]

    const output = await utils.extractByEmails(emails)

    console.log(JSON.stringify(output, null, indent=4))
}

// main function call(s)
main().then()
