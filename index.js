const { Builder, By } = require('selenium-webdriver');
const XLSX = require('xlsx');
const fs = require('fs');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

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

function readXlsxFile(filePath) {
    // read the XLSX file
    const workbook = XLSX.readFile(filePath);

    // get the name of the first sheet
    const sheetName = workbook.SheetNames[0];

    // convert the sheet to JSON
    const sheetJson = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    return sheetJson;
}

function saveJsonToFile(jsonData, filePath) {
    // convert JSON object to string
    const dataString = JSON.stringify(jsonData, null, 2); // pretty-print with 2 spaces indentation

    // write the string to a file
    fs.writeFile(filePath, dataString, 'utf8', (err) => {
        if (err) {
            console.error('An error occurred while saving the JSON to file:', err);
            return;
        }
        console.log('JSON saved successfully to', filePath);
    });
}

async function main(spreadSheetPath) {
    const spreadSheet = readXlsxFile(spreadSheetPath);

    if (spreadSheet.length === 0) {
        console.log(`info - spreadsheet is empty, so we are not scrapping`);
        return;
    }

    const columnOrder = Object.keys(spreadSheet[0]);

    let rowNumber = -1;
    for (let row of spreadSheet) {
        rowNumber += 1;

        console.log(`\nProcessing row ${rowNumber} / ${spreadSheet.length}`);

        if (!Object.keys(row).includes("Attention Name")) {
            continue;
        }

        if (row["First Name"] !== undefined) {
            console.log(`info - row ${rowNumber} has a "First Name" so it's being skipped...`);
            continue;
        }

        const email = row["Row Labels"].replaceAll(" ", "");

        // (2-14-2024) hardcoded URL
        const url = `https://www.berkeley.edu/directory/?search-term=${email}`;

        const scrape = await fetchAndExtractData(url, 1 * 1000);

        console.log(`info - raw scrape: ${JSON.stringify(scrape)}`)

        if (scrape === undefined) {
            console.log(`error - failed to scrape ${url}`);
            continue;
        }

        // extract first and last name from scrape
        let fullName = scrape["name"].split(" ");
        let firstName = "";
        let lastName = "";
        if (fullName.length === 3) {
            firstName = fullName[0];
            lastName = fullName[2];
        } else if (fullName.length === 2) {
            firstName = fullName[0];
            lastName = fullName[1];
        }

        let updatedRow = {};
        for (let column of columnOrder) {
            switch (column) {
                case "First Name":
                    updatedRow[column] = firstName;
                    break;
                case "Last Name":
                    updatedRow[column] = lastName;
                    break;
                case "Address":
                    updatedRow[column] = scrape["homeDepartment"];
                    break;
                default:
                    updatedRow[column] = row[column]; // Copy original value for other columns
            }
        }

        // replace the original row in the spreadsheet with the updated row
        spreadSheet[rowNumber] = updatedRow;

        console.log(`info - finished processing ${url} (row = ${rowNumber}) : ${JSON.stringify(updatedRow)}`);
    }

    console.log()

    saveJsonToFile(spreadSheet, `NEW_${spreadSheetPath.replace(".xlsx", "")}.json`)

    // after processing all rows, save the updated data to a new XLSX file
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(spreadSheet, {header: columnOrder});
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Updated Data');
    XLSX.writeFile(newWorkbook, `NEW_${spreadSheetPath}`);

    console.log('All done!');
}

async function promptAndExecute() {
    readline.question('XLSX Filename/Path: ', (fileName) => {
        main(fileName).then(() => {
            readline.close();
        }).catch((error) => {
            readline.close();
        });
    });
}

// main function call(s)
promptAndExecute();

