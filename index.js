const fs = require('fs');
const csv = require('@fast-csv/parse');

// parent array for holding parsed transactions from mempool.csv 
// [ratio, txn_id, fees, weight, parent_txn[]]
let transactions = [];

// open and parse the csv
csv.parseFile('mempool.csv', {headers: false, skipLines: 1})
    .on('data', row => {
        // split parent txn_ids into a separate array
        const parentTxns = row[3].split(';');

        // add new parameter of fee / weight for sorting transactions
        const feeToWeightRatio = Number(row[1] / row[2]);
        
        // create a new row from the parsed csv row push it to transactions
        // [ratio, txn_id, fees, weight, parent_txn[]]
        const currentTxn = [feeToWeightRatio, row[0], Number(row[1]), Number(row[2]), parentTxns];
        transactions.push(currentTxn);  
    })
    .on('end', () => {
        // reverse sort the parsed transactions on the basis of fee / weight ratio
        transactions = transactions.sort(function (txnA, txnB) {
            // if the ratio is same, the one having smaller parent_txn size should come before
            // as the chance of encountering a pending transaction there is less
            if(txnA[0] === txnB[0]) {
                return txnA[4].size - txnB[4].size;
            }

            return txnB[0] - txnA[0];
        });
        
        // create a write stream to the block.txt file
        let writeStream = fs.createWriteStream('block.txt');
        
        // the current weight processed and the total fee collected
        let currWt = 0, totalFees = 0, entriesWritten = 0;

        // store all the txn_ids already processed
        let processed = {};
        
        // traverse the sorted transactions and greedily select the valid transactions
        transactions.forEach((row) => {
            // skip if this txn weight exceeds the limit
            if(currWt + row[3] > 4e6) {
                return;
            }
            
            // bool to check if all parents have been validated
            let allParentsDone = 1;

            // if parent_txn present
            if(row[4].size > 0) {
                row[4].forEach((txn_id) => {
                    // if a parent is not validated, mark the bool as false
                    if(!processed.hasOwnProperty(txn_id)) {
                        allParentsDone = 0;
                        return;
                    }
                })
            }
            
            // if any one of the parent txn is incomplete, skip it
            if(!allParentsDone) {
                return;
            }
            
            // store this txn as processed
            processed[row[1]] = 1;

            // increase the collected fee, weight and entries written
            currWt += row[3];
            totalFees += row[2];
            entriesWritten += 1;
            
            // output the processed txn_id to block file
            writeStream.write(`${row[1]}\n`);
            
        });
        
        // log the net fees collected and weight processed
        console.log(`\nIn block.txt:`);
        console.log(`\ttotal fees collected (in satoshis): ${totalFees.toLocaleString()}`);
        console.log(`\ttotal weight processed: ${currWt.toLocaleString()}`);
        console.log(`\ttotal entries written: ${entriesWritten.toLocaleString()}`);

        // close the stream
        writeStream.end();
    });


