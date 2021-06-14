# Summer of Bitcoin Solution Challenge 🚀☀️

This is my submission for the summer of bitcoin challenge 2021, built using NodeJS.

<img src="https://img.shields.io/badge/built%20with-NodeJS-green?style=flat&logo=node.js">

## Code Structure 📚

This repository contains 2 main files:
1. ```index.js```: Holding the core solution code.
2. ```test.js```: Accepts a ```block.txt``` like list of transactions as an argument and generates the fee earned, weight processed and number of entities in that ordering. If no file provided as an argument, it defaults to ```./block.txt```

## How to run 🛠️

This project is built using [NodeJS](https://nodejs.org/en/), so please ensure it is installed in your system.

1. **Installing dependencies**: Run ```npm install``` in the project folder from your terminal to install all project dependencies.
2. **Running code**: In the project folder:
   - For the solution code: ```node index.js``` - It will generate a new ```block.txt``` file with the ordering of transactions.
   - Testing a transaction ordering: ```node test.js <file.txt>```

## The Solution ✔️

### Approach 🏗️

**Observation 1**: We aim to order the transactions in such a way that we, at any point in time, are able to minimize and limit the weight processed but maximize the fee earned. </br> 
Therefore, the best way to achieve this would be to order the transactions on the basis of the ratio of ```fee/weight``` i.e. the transactions having the highest such ratio should be processed first because they provide us the maximum fee per weight processed. 

**Observation 2**: In case of two transactions having the same ```fee/weight``` ratio, we can then sort them on the basis of the number of their required parent transactions. </br>
The transaction requiring smaller number of parent transactions has a higher probability that all of its parent transactions would have been processed before.

### Implementation 🌱

The following steps were used in the implementation of the code:

1. Create an empty ```transactions``` array for storing every parsed transaction from the csv. 
2. Parse ```mempool.csv``` using [fast-csv](https://www.npmjs.com/package/fast-csv) and for every row
   - Calculate the ```fee/weight``` ratio
   - Append a new row to the ```transactions``` matrix for this transaction having the format 
      ```
      [
           fee/weight ratio - Number,
           transaction id - String,
           transaction fee - Number
           transaction weight - Number,
           parent transactions - String[]
      ]
      ```
3. Sort the ```transactions``` array:
   - reverse sort on the basis of ```fee/weight``` ratio
   - if two have the same ratio, sort on the basis of the size of the parent transactions array.
4. Create a ```processed``` object to store transaction ids of all the processed transactions.
5. For every transaction in the ```transactions``` array, validate it if:
   - ```processed weight + transaction weight``` is lesser than or equal to 4000000
   - all of the parent transactions have been processed before i.e. their ids are present in the ```processed``` object.
6. If both the conditions are valid, process this transaction: 
   - increase the values of the processed weight and the fee 
   - add this transaction id to the ```processed``` object.
   - append this transaction's id to the ```block.txt``` file.
   - increase the count of processed transactions
7. Log the total processed weight, fee earned and the number of transactions processed.

### Space and Time Complexity 📈
Assuming ```mempool.csv``` has ```n``` number of transactions.

**Time Complexity**:
1. Parsing the CSV file: ```O(n)```
2. Sorting the ```transactions``` array: ```O(nlogn)```
3. Traversing the array for processing valid transactions: ```O(n)```
   
Therefore the time complexity is ```O(nlogn)```

**Space Complexity**: 
1. ```transactions``` array: ```O(n)```
2. ```processed``` object: ```O(n)``` 

Therefore the time complexity is ```O(n)```

**Assumptions**:
1. Storing data in an object and retrieving it is a constant time operation.




