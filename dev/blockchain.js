const sha256 = require('sha256');
const uuid = require('uuid/v1');
const currentNodeUrl = process.argv[3];

function Blockchain() {
    this.chain = [];
    this.pendingTransactions = [];
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
}

Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length-1];
}

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
    const transactionId = uuid().split('-').join('') + Date.now().toString();

    const newTransaction = {
        transactionId,
        amount,
        sender,
        recipient
    }

    return newTransaction;

    
}

Blockchain.prototype.addTransactionToPendindgTransactions = function (transactionObj) {
    this.pendingTransactions.push(transactionObj);

    return this.getLastBlock().index + 1;
}

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
    const dataAsString = previousBlockHash + nonce.toString() +JSON.stringify(currentBlockData);
    const hash = sha256(dataAsString);

    return hash;
}

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (hash.substring(0,4) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
}

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

Blockchain.prototype.isValidChainBlock = function(currentBlock, prevBlock) {
    const blockHash = this.hashBlock(prevBlock.hash, {transactions: currentBlock.transactions, index: currentBlock.index}, currentBlock.nonce);

    if (blockHash.substring(0,4) !== '0000' || currentBlock.previousBlockHash !== prevBlock.hash){
        return false;
    }

    return true;
}


module.exports = Blockchain;