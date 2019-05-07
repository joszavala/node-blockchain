const express = require('express');
const bodyParser = require ('body-parser');
const uuid = require('uuid/v1');
const rp = require('request-promise');
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

app.post('/register-and-broadcast-node', (req, res) =>{
    const { newNodeUrl } = req.body;
    
    if (caronte.networkNodes.indexOf(newNodeUrl) === -1)
        caronte.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];

    caronte.networkNodes.forEach(networkNodeUrl => {
        const requestOption = {
            uri: `${networkNodeUrl}/register-node`,
            method: 'POST',
            body: {newNodeUrl},
            json: true
        };

        regNodesPromises.push(rp(requestOption));
    });

    Promise.all(regNodesPromises)
    .then(data => {
        const bulkRegisterOptions = {
            uri: `${newNodeUrl}/register-nodes-bulk`,
            method: 'POST',
            body: { allNetworkNodes: [ ...caronte.networkNodes, caronte.currentNodeUrl ] },
            json: true
        };

        rp(bulkRegisterOptions);
    })
    .then(data => {
        res.json({ note: 'New node registered with network successfully' });
    })
    .catch(err => {
        console.log('Error:', err);
    });
});

app.post('/register-node', (req, res) => {
    const { newNodeUrl } = req.body;
    const nodeNotAlreadyPresent = caronte.networkNodes.indexOf(newNodeUrl) === -1;
    const notCurrentNode = caronte.currentNodeUrl !== newNodeUrl;
    
    if (nodeNotAlreadyPresent && notCurrentNode) caronte.networkNodes.push(newNodeUrl);

    res.json({ note: 'new node register successfully with node' });
});

app.post('/register-nodes-bulk' , (req, res) => {
    const { allNetworkNodes} = req.body;

    allNetworkNodes.forEach(networkNodeUrl => {
        const nodeAlreadyPresent = caronte.networkNodes.indexOf(networkNodeUrl) == -1;
        const notCurrentNode = caronte.currentNodeUrl !== networkNodeUrl;
        if (nodeAlreadyPresent && notCurrentNode) caronte.networkNodes.push(networkNodeUrl);
    });

    res.json({ note: 'Bulk registration successful.'});
}); 

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});