const scrapper = require("./scrapper")

function filterValidEmails(arr) {
    const processedArr = arr
        .map(str => str.replace(/\s+/g, '')) // remove spaces
        .filter(str => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) // keep valid emails
        .filter((value, index, self) => self.indexOf(value) === index); // remove duplicates

    return processedArr;
}

async function extractByEmails(emails) {
    emails = filterValidEmails(emails)

    const output = {}
    for (let email of emails) {
        try {
            // use a 1 second delay, it works but you might need to tune this
            scrape = await scrapper.scrapeBerkDirByEmail(email, 1 * 1000)
            if (scrape === undefined) {
                scrape = null
            }

            output[email] = scrape
        } catch(err) {
            output[email] = null
        }
    }

    return output
}

module.exports = {
    filterValidEmails,
    extractByEmails
}

