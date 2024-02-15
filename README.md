# Berkeley Campus Directory Scraper

## About

A simple web scraper for [Berkeley's Campus Directory](https://www.berkeley.edu/directory/).

## How To Setup

1. This was only tested on MacOS, so I am assuming your running this on MacOS or a Unix-Based operating systems.
2. Install [Node.js](https://nodejs.org/en)
3. Install [git](https://git-scm.com/download/mac)
4. Open the Terminal app
5. Clone this repo:
    ```
    git clone https://github.com/MehmetMHY/BerkeleyDirScraper
    ```
6. Go into the cloned repo:
    ```
    cd BerkeleyDirScraper/
    ```
7. Install dependencies:
    ```
    npm install
    ```
8. Run the script:
    ```
    node index.js
    ```
9.  Input the name or path to your xlsx file. You can use the "example.xlsx" file to try it out (hit ENTER to submit the input):
    ```
    XLSX Filename/Path: example.xlsx 
    ```
10. You should not see some console prints. Wait for the script to finish running.
11. After the script is done running, you should see two new files named something like "NEW_example.json" and "NEW_example.xlsx" containing the updated data. You can see and open the files by running the following commands (examples):
    ```
    # show all the files
    ls

    # checkout new xlsx file
    open example.xlsx

    # checkout new json file
    open example.json
    ```

