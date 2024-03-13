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

    console.log(`Scrapping ${emails.length} Berkeley users' data`)
    console.log(`Estimated Runtime: ${((emails.length * 1) * 4).toFixed(2)} seconds`)

    const output = await utils.extractByEmails(emails)

    console.log(`Scrapped Data (Output):`)
    console.log(JSON.stringify(output, null, indent=4))
}

// main function call(s)
main().then()
