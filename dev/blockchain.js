const sha256 = require('sha256');
const uuid = require('uuid/v1');
const currentNodeUrl = process.argv[3];

function Blockchain() {
    this.chain = [{
        "index": 1,
        "timestamp": 1557321665906,
        "transactions": [],
        "nonce": 100,
        "hash": "0",
        "previousBlockHash": "0"
        },
        {
        "index": 2,
        "timestamp": 1557323198287,
        "transactions": [
        {
        "transactionId": "ae54e370719711e9904a072e6112db231557323189031",
        "amount": 105,
        "sender": "AG3MN752323NCLJ5800BNHY0087",
        "recipient": "MRN0JI6312XCMM90052JHGMNS67"
        },
        {
        "transactionId": "afa7f050719711e9904a072e6112db231557323191253",
        "amount": 105,
        "sender": "AG3MN752323NCLJ5800BNHY0087",
        "recipient": "MRN0JI6312XCMM90052JHGMNS67"
        },
        {
        "transactionId": "b00ea160719711e9904a072e6112db231557323191926",
        "amount": 105,
        "sender": "AG3MN752323NCLJ5800BNHY0087",
        "recipient": "MRN0JI6312XCMM90052JHGMNS67"
        }
        ],
        "nonce": 84415,
        "hash": "00002a6f4164cbf619aca9c8a3bfce3fc234d49a056330d529926a0cab1c8fd7",
        "previousBlockHash": "0"
        },
        {
        "index": 3,
        "timestamp": 1557323228867,
        "transactions": [
        {
        "transactionId": "b3df0a50719711e9904a072e6112db231557323198325",
        "amount": 12.5,
        "sender": "00",
        "recipient": "227a7520719411e9904a072e6112db23"
        },
        {
        "transactionId": "c38dc7c0719711e9904a072e6112db231557323224636",
        "amount": 105,
        "sender": "MRN0JI6312XCMM90052JHGMNS67",
        "recipient": "AG3MN752323NCLJ5800BNHY0087"
        },
        {
        "transactionId": "c413c0a0719711e9904a072e6112db231557323225514",
        "amount": 105,
        "sender": "MRN0JI6312XCMM90052JHGMNS67",
        "recipient": "AG3MN752323NCLJ5800BNHY0087"
        }
        ],
        "nonce": 52148,
        "hash": "00006d82933dfa59385aa53563bbbc47ed9dfcf8713c24360a303dd5c4d7eece",
        "previousBlockHash": "00002a6f4164cbf619aca9c8a3bfce3fc234d49a056330d529926a0cab1c8fd7"
        },
        {
        "index": 4,
        "timestamp": 1557323248511,
        "transactions": [
        {
        "transactionId": "c613af50719711e9904a072e6112db231557323228869",
        "amount": 12.5,
        "sender": "00",
        "recipient": "227a7520719411e9904a072e6112db23"
        },
        {
        "transactionId": "cf2bdef0719711e9904a072e6112db231557323244127",
        "amount": 225,
        "sender": "AG3MN752323NCLJ5800BNHY0087",
        "recipient": "MRN0JI6312XCMM90052JHGMNS67"
        }
        ],
        "nonce": 56581,
        "hash": "0000c3854f462d86cee80a7e4bc2a8ea54c6202d7ee6265139c2e96eb3629577",
        "previousBlockHash": "00006d82933dfa59385aa53563bbbc47ed9dfcf8713c24360a303dd5c4d7eece"
        },
        {
        "index": 5,
        "timestamp": 1557323264907,
        "transactions": [
        {
        "transactionId": "d1c91f10719711e9904a072e6112db231557323248513",
        "amount": 12.5,
        "sender": "00",
        "recipient": "227a7520719411e9904a072e6112db23"
        },
        {
        "transactionId": "d95186f0719711e9904a072e6112db231557323261151",
        "amount": 225,
        "sender": "AG3MN752323NCLJ5800BNHY0088",
        "recipient": "MRN0JI6312XCMM90052JHGMNS67"
        },
        {
        "transactionId": "d9cd6db0719711e9904a072e6112db231557323261963",
        "amount": 225,
        "sender": "AG3MN752323NCLJ5800BNHY0088",
        "recipient": "MRN0JI6312XCMM90052JHGMNS67"
        }
        ],
        "nonce": 34562,
        "hash": "0000fd96900dda7e5768d114653aae8bd2c90503ddb295af3b0b512edfbdad48",
        "previousBlockHash": "0000c3854f462d86cee80a7e4bc2a8ea54c6202d7ee6265139c2e96eb3629577"
        }];
    this.pendingTransactions = [
        {
            "transactionId": "db8ef3d0719711e9904a072e6112db231557323264909",
            "amount": 12.5,
            "sender": "00",
            "recipient": "227a7520719411e9904a072e6112db23"
        }
    ];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    this.createNewBlock(100, '0', '0');
}

/**
 * nonce => a probe that we create a block.
 */
Blockchain.prototype.createNewBlock = function (nonce, previousBlockHash, hash) {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions,
        nonce,
        hash,
        previousBlockHash
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length-1];
};

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const transactionId = uuid().split('-').join('') + Date.now().toString();

    const newTransaction = {
        transactionId,
        amount,
        sender,
        recipient
    }

    return newTransaction;
};

Blockchain.prototype.addTransactionToPendindgTransactions = function (transactionObj) {
    this.pendingTransactions.push(transactionObj);

    return this.getLastBlock().index + 1;
};

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() +JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);

    return hash;
};

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (hash.substring(0,4) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
};

Blockchain.prototype.chainIsValid = function (blockchain) {
    let validChain = validateGenesisBlock(blockchain[0]);

    if (validChain) {
        for (var i = 1; i < blockchain.length; i++) {
            if(!this.isValidChainBlock(blockchain[i], blockchain[i-1])){
                validChain = false;
                break;
            }
        }
    }
    console.log(validChain);
    return validChain;
};

Blockchain.prototype.isValidChainBlock = function(currentBlock, prevBlock) {
    const blockHash = this.hashBlock(prevBlock.hash, {transactions: currentBlock.transactions, index: currentBlock.index}, currentBlock.nonce);

    if (blockHash.substring(0,4) !== '0000' || currentBlock.previousBlockHash !== prevBlock.hash){
        return false;
    }

    return true;
};

Blockchain.prototype.getBlock = function (blockHash) {
    let blockData = null;

    this.chain.forEach(block => {
        if (block.hash === blockHash) blockData = block;
    });

    return blockData;
};

Blockchain.prototype.getTransaction = function (transactionId) {
    let transactionData = null;
    let blockData = null;

    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.transactionId === transactionId) {
                transactionData = transaction;
                blockData = block;
            }
        });
    });

    return {
        transaction: transactionData,
        block: blockData
    }
};

Blockchain.prototype.getAddress = function (address) {
    const sendTransactions = [];
    const receiveTransactions = [];
    const balanceTransactions = {
        amountSent: 0,
        amountReceived: 0,
        totalAmount: 0
    };

    this.chain.forEach(block => {
        block.transactions.forEach(transaction => {
            if (transaction.sender === address){
                sendTransactions.push(transaction);
                balanceTransactions.amountSent+= transaction.amount;
            }

            if (transaction.recipient === address){
                receiveTransactions.push(transaction);
                balanceTransactions.amountReceived+= transaction.amount;
            }
        });
    });

    return {
        transactions: {
            send: sendTransactions,
            receive: receiveTransactions
        },
        balance: {
            sendAmount: balanceTransactions.amountSent,
            receiveAmount: balanceTransactions.amountReceived,
            totalBalance: getTotalAmount(balanceTransactions)
        }
    };
}

function validateGenesisBlock (blockchain) {
    const genesisVerifiedData = {
        nonce: 100,
        previousBlockHash: '0',
        hash: '0',
        transactions: 0
    };

    if (blockchain.nonce !== genesisVerifiedData.nonce || blockchain.previousBlockHash !== genesisVerifiedData.previousBlockHash || blockchain.hash !== genesisVerifiedData.hash || blockchain.transactions.length !== genesisVerifiedData.transactions)
        return  false;

    return true;
}

function getTotalAmount (balance) {
    const {amountSent, amountReceived} = balance;

    return amountReceived - amountSent;
}

module.exports = Blockchain;