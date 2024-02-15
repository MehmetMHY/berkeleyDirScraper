const {Builder} = require('selenium-webdriver');

async function savePageSource(url, filePath) {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to the given webpage
        await driver.get(url);

        // Wait for the page to fully load
        // This step may need to be customized based on how the page loads content
        await driver.sleep(10000); // Example: wait for 10 seconds

        // Get the source of the loaded page
        const pageSource = await driver.getPageSource();

        // Save the page source to a file
        const fs = require('fs');
        fs.writeFileSync(filePath, pageSource);
        console.log('Page source saved to:', filePath);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await driver.quit();  // Ensure the driver quits regardless of outcome
    }
}

// Example usage
const url = 'https://www.berkeley.edu/directory/?search-term=csu%40berkeley.edu';
const filePath = 'pageSource.html';  // Path where you want to save the HTML file

savePageSource(url, filePath)
    .then(() => console.log('Done'))
    .catch(error => console.error('Scraping failed:', error));

