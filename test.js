const fs = require('fs');
const csv = require('@fast-csv/parse');

const readline = require('readline');

let transactions = {};

// open and parse the csv for transaction information
csv.parseFile('mempool.csv', {headers: false, skipLines: 1})
    .on('data', row => {
        // store transactions in an object mapping txn_id -> [txn fee, txn weight]
        transactions[row[0]] = [Number(row[1]), Number(row[2])];
    })
    .on('end', () => {
        // get the file to test from argv or default to ./block.txt
        const testFileName = process.argv[2] || 'block.txt';

        // create a read stream on the specified file
        const testFileStream = fs.createReadStream(testFileName);

        // use readline to get a line by line stream from file having newline separated txn_id
        const testFile  = readline.createInterface({
            input: testFileStream,
        });

        let totalFees = 0, totalWeight = 0, entries = 0;

        // for every line read, add the total fees, weight and entries
        testFile.on('line', (line) => {
            totalFees += transactions[line][0];
            totalWeight += transactions[line][1];
            entries += 1;
        });

        // when the file ends
        testFileStream.on('end', () => {
            // log the net fees collected and weight processed
            console.log(`\nIn ${testFileName}:`);
            console.log(`\ttotal fees collected (in satoshis): ${totalFees.toLocaleString()}`);
            console.log(`\ttotal weight processed: ${totalWeight.toLocaleString()}`);
            console.log(`\ttotal entries written: ${entries.toLocaleString()}`);
        });
    });