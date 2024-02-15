const { Builder, By } = require('selenium-webdriver');

async function fetchAndExtractData(url, timeDelay=10000) {
    let output = {}

    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to the given webpage
        await driver.get(url);

        // Wait for the page to fully load
        await driver.sleep(timeDelay); // Adjust based on actual page load time

        // Helper function to safely attempt to get text or attribute
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

        // Extract information if available
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

async function main(){
    const url = 'https://www.berkeley.edu/directory/?search-term=rinaest@berkeley.edu'
    const timeDelay = 1 // seconds
    const output = await fetchAndExtractData(url, timeDelay*1000)
    console.log(JSON.stringify(output, null, indent=4))
}

// main function calls
main().then()
