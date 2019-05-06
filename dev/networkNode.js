const express = require('express');
const bodyParser = require ('body-parser');
const uuid = require('uuid/v1');
const Blockchain = require ('./blockchain');
const port = process.argv[2];

const nodeAddress = uuid().split('-').join('');

const caronte = new Blockchain();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/blockchain', (req, res) => {
    res.send(caronte);
});

app.post('/transaction', (req, res) => {
    const { amount, sender, recipient } = req.body;
    const blockIndex = caronte.createNewTransaction(amount, sender, recipient);

    res.json({note: `Transaction will be added in block ${blockIndex}.`});
});

app.get('/mine', (req, res) => {
    const lastBlock = caronte.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: caronte.pendingTransactions,
        index: lastBlock['index'] + 1
    };

    const nonce = caronte.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = caronte.hashBlock(previousBlockHash,currentBlockData, nonce);

    caronte.createNewTransaction(12.5, "00", nodeAddress);

    const newBlock = caronte.createNewBlock(nonce,previousBlockHash, blockHash);

    res.json({
        notes: "New block mined successfully.",
        block: newBlock
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});