const { Builder, By } = require('selenium-webdriver');
const XLSX = require('xlsx');

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

function readXlsxFile(filePath) {
    // read the XLSX file
    const workbook = XLSX.readFile(filePath);

    // get the name of the first sheet
    const sheetName = workbook.SheetNames[0];

    // convert the sheet to JSON
    const sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    return sheetJson;
}

// {
//     "Attention Name": " Cox Lab, RM 375E",
//     "Row Labels": "okie@berkeley.edu",
//     " Sum of Ext Price ": 562.79,
//     "First Order": 44201.59869212963,
//     "Last Order": 44321.89335648148
// },
// {
//     "Attention Name": " Nicholas Hadler",
//     X "First Name": "Nicholas ",
//     X "Last Name": "Hadler",
//     X "Address": "CCHEM - Dept Of Chemistry",
//     "Row Labels": "nhadler@berkeley.edu",
//     " Sum of Ext Price ": 558.12,
//     "First Order": 44964.886979166666,
//     "Last Order": 45125.880949074075
// },

async function main() {
    const spreadSheet = readXlsxFile('ucb_customer_list.xlsx')
    for(let row of spreadSheet) {
        if (!Object.keys(row).includes("Attention Name")) {
            continue
        }

        const email = row["Row Labels"].replaceAll(" ", "")
        const url = `https://www.berkeley.edu/directory/?search-term=${email}`

        const scrape = await fetchAndExtractData(url, 1*1000)

        if (scrape === undefined) {
            console.log(`error - failed to scrape ${url}`)
            continue
        }

        // extract first and last name from scrape
        let fullName = scrape["name"].split(" ")
        let firstName = ""
        let lastName = ""
        if (fullName.length === 3) {
            firstName = fullName[0]
            lastName = fullName[2]
        } else if (fullName.length === 2) {
            firstName = fullName[0]
            lastName = fullName[1]
        }

        row["First Name"] = firstName
        row["Last Name"] = lastName
        row["Address"] = scrape["homeDepartment"]

        console.log(JSON.stringify(row, null, indent=4))
        console.log("\n")
        break
    }
}

// async function main(){
//     const url = 'https://www.berkeley.edu/directory/?search-term=jfletcher@berkeley.edu'
//     const timeDelay = 1 // seconds
//     const output = await fetchAndExtractData(url, timeDelay*1000)
//     console.log(JSON.stringify(output, null, indent=4))
// }

// main function calls
main().then()

