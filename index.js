const {Builder, By} = require('selenium-webdriver');
const fs = require('fs');

async function fetchAndExtractData(url, filePath) {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        // Navigate to the given webpage
        await driver.get(url);

        // Wait for the page to fully load
        await driver.sleep(1000); // Adjust based on actual page load time

        // Optional: Save the page source to a file for archival or further processing
        const pageSource = await driver.getPageSource();
        fs.writeFileSync(filePath, pageSource);
        console.log('Page source saved to:', filePath);

        // Directly extract the required information
        const name = await driver.findElement(By.css('directory-search-result h2')).getText();
        const title = await driver.findElement(By.xpath("//p[label[contains(text(), 'Title')]]")).getText();
        const address = await driver.findElement(By.xpath("//p[label[contains(text(), 'Address')]]")).getText();
        const website = await driver.findElement(By.xpath("//p[label[contains(text(), 'Website')]]/a")).getAttribute("href");
        const mobile = await driver.findElement(By.xpath("//p[label[contains(text(), 'Mobile')]]/a")).getAttribute("href");
        const homeDepartment = await driver.findElement(By.xpath("//p[label[contains(text(), 'Home department')]]")).getText();
        const uid = await driver.findElement(By.xpath("//p[label[contains(text(), 'UID')]]")).getText();

        console.log(`Name: ${name}`);
        console.log(`Title: ${title}`);
        console.log(`Address: ${address}`);
        console.log(`Website: ${website}`);
        console.log(`Mobile: ${mobile}`);
        console.log(`Home Department: ${homeDepartment}`);
        console.log(`UID: ${uid}`);
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await driver.quit(); // Ensure the driver quits regardless of outcome
    }
}

const url = 'https://www.berkeley.edu/directory/?search-term=csu%40berkeley.edu';
const filePath = 'pageSource.html'; // Path where you want to save the HTML file

fetchAndExtractData(url, filePath)
    .then(() => console.log('Data extraction complete.'))
    .catch(error => console.error('Extraction failed:', error));

