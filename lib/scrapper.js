const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function scrapeBerkDirByEmail(email, timeDelay = 10000) {
    // (2-14-2024) hardcoded URL
    const url = `https://www.berkeley.edu/directory/?search-term=${email}`;

    let output = {}

    // set chrome options
    let options = new chrome.Options()
    options.addArguments('headless')
    options.addArguments('disable-gpu')

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    try {
        // navigate to the given webpage
        await driver.get(url);

        // wait for the page to fully load
        await driver.sleep(timeDelay);

        // helper function to safely attempt to get text or attribute
        async function safeGetText(selector, attribute = '') {
            try {
                let element;
                if (selector.startsWith('//')) { // xpath
                    element = await driver.findElement(By.xpath(selector));
                } else { // css
                    element = await driver.findElement(By.css(selector));
                }
                if (attribute) {
                    return await element.getAttribute(attribute);
                }
                return await element.getText();
            } catch (err) {
                if (process.env.DEBUG === "true") {
                    console.log(err)
                }
                return ""
            }
        }

        // extract relevant data
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

    } catch (err) {
        if (process.env.DEBUG === "true") {
            console.log(err)
        }
        output = undefined
    } finally {
        await driver.quit()
    }

    return output
}

module.exports = {
    scrapeBerkDirByEmail
}

