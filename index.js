const { Builder, By } = require('selenium-webdriver');

async function fetchAndExtractData(url, timeDelay=10000) {
    let output = {}

    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // navigate to the given webpage
        await driver.get(url);

        // wait for the page to fully load
        await driver.sleep(timeDelay); // Adjust based on actual page load time

        // helper function to safely attempt to get text or attribute
        async function safeGetText(selector, attribute = '') {
            try {
                let element;
                if (selector.startsWith('//')) { // XPath
                    element = await driver.findElement(By.xpath(selector));
                } else { // CSS
                    element = await driver.findElement(By.css(selector));
                }
                if (attribute) {
                    return await element.getAttribute(attribute);
                }
                return await element.getText();
            } catch (error) {
                return ""
            }
        }

        // extract information if available
        const name = await safeGetText('directory-search-result h2');
        const title = await safeGetText("//p[label[contains(text(), 'Title')]]");
        const address = await safeGetText("//p[label[contains(text(), 'Address')]]");
        const website = await safeGetText("//p[label[contains(text(), 'Website')]]/a", 'href');
        const mobile = await safeGetText("//p[label[contains(text(), 'Mobile')]]/a", 'href');
        const homeDepartment = await safeGetText("//p[label[contains(text(), 'Home department')]]");
        const uid = await safeGetText("//p[label[contains(text(), 'UID')]]");

        output = {
            "name": name,
            "title": title.split('\n').pop(),
            "address": address.split('\n').pop(),
            "website": website,
            "mobile": mobile.replace('tel:', ''),
            "homeDepartment": homeDepartment.split('\n').pop(),
            "uid": uid.split('\n').pop()
        }

    } catch (error) {
        output = undefined
    } finally {
        await driver.quit();
    }

    return output
}

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
            // (2-14-2024) hardcoded URL
            const url = `https://www.berkeley.edu/directory/?search-term=${email}`;

            // use a 1 second delay, it works but you might need to tune this
            let scrape = await fetchAndExtractData(url, 1 * 1000);
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

// NOTE: this is just an example, learn from it and remove it when you are done
async function example() {
    const emails = [
        "doudna@berkeley.edu",
        "example@berkeley.edu"
    ]

    const output = await extractByEmails(emails)

    console.log(JSON.stringify(output, null, indent=4))
}

// main function call(s)
example().then()

