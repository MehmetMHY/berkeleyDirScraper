const {Builder, By, until} = require('selenium-webdriver');

async function scrapeWebsiteText(url, elementId) {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to the given webpage
        await driver.get(url);

        // Wait for the specific element to be loaded
        await driver.wait(until.elementLocated(By.id(elementId)), 10000);

        // Find the element and get its text
        let elementText = await driver.findElement(By.id(elementId)).getText();
        return elementText;  // Return the text of the element
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await driver.quit();  // Ensure the driver quits regardless of outcome
    }
}

// Example usage:
const url = 'https://www.berkeley.edu/directory/?search-term=csu%40berkeley.edu';
const elementId = 'directory-search-result';

scrapeWebsiteText(url, elementId)
    .then(text => console.log('Element text:', text))
    .catch(error => console.error('Scraping failed:', error));

