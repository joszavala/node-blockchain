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
    const newTransaction = req.body;
    const blockIndex = caronte.addTransactionToPendindgTransactions(newTransaction);

    res.json({note: `Transaction will be added en block ${blockIndex}`});
});

app.post('/transaction/broadcast', (req, res) => {
    const { sender, amount, recipient } = req.body;
    const newTransaction = caronte.createNewTransaction(amount, sender, recipient);
    const reqPromises = [];

    caronte.addTransactionToPendindgTransactions(newTransaction);

    caronte.networkNodes.forEach(networkNodeUrl => {
        const requestOptions = {
            uri: `${networkNodeUrl}/transaction`,
            method: 'POST',
            body: newTransaction,
            json: true
        };

        reqPromises.push(rp(requestOptions));
    });

    Promise.all(reqPromises)
    .then(data => {
        res.json({note: 'Transaction created and broadcast successfully'});
    })
    .catch(err => {
        res.json({error: err});
    });
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
    const newBlock = caronte.createNewBlock(nonce,previousBlockHash, blockHash);
    const requestPromises = [];

    caronte.networkNodes.forEach(networkNodeUrl =>{
        const requestOptions = {
            uri: `${networkNodeUrl}/receive-new-block`,
            method: 'POST',
            body: { newBlock },
            json: true
        };

        requestPromises.push(rp(requestOptions));
    });

    Promise.all(requestPromises)
    .then(data => {
        const requestOptions = {
            uri: `${caronte.currentNodeUrl}/transaction/broadcast`,
            method: 'POST',
            body: {
                amount: 12.5,
                sender: "00",
                recipient: nodeAddress
            },
            json: true
        };

        return rp(requestOptions);
    })
    .then(data => {
        res.json({
            notes: "New block mined and broadcast successfully.",
            block: newBlock
        });
    })
    .catch(err => {
        res.json({error: err});
    });
});

app.post('/receive-new-block', (req, res) => {
    const newBlock = req.body.newBlock;
    const lastBlock = caronte.getLastBlock();
    const correctHash = lastBlock.hash === newBlock.previousBlockHash;
    const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

    if (correctHash  && correctIndex) {
        caronte.chain.push(newBlock);
        caronte.pendingTransactions = [];
        res.json({
            note:'New block received and accepted',
            newBlock
        });
    } else {
        res.json({
            note: 'New block rejected',
            newBlock
        });
    }
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