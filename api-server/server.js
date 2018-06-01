'use strict'

const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const bodyParser = require('body-parser');
const Eos = require('eosjs')

//set server options
const app = express();
const port = process.env.API_PORT || 3001;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//eos config options
const config = {
  chainId: null, // 32 byte (64 char) hex string
  httpEndpoint: 'http://eosio:8888',
  mockTransactions: () => 'pass', // or 'fail'
  transactionHeaders: (expireInSeconds, callback) => {
    callback(null/*error*/, headers)
  },
  expireInSeconds: 60,
  broadcast: true,
  debug: false,
  sign: true
}

const eos = Eos.Localnet(config)

// eos.getBlock(1).then(blockInfo => {console.log(blockInfo)});
// eos.getInfo({}).then(result => console.log(result));

//define graphQL query schema
const schema = buildSchema(`
  type Query {
    block(numbers: [Int]): String
  }
`);

//define root query
const root = { 
  block: (number) => "24c38025d3df33rw3d3231"
};

//function for fetching block date
async function getBlockInfo(blockNum){
  blockNum = blockNum || -1;
  if (blockNum === -1){
    const data = eos.getInfo({});
    console.log(await data);
  } 
  else {
    try{
      let data = await eos.getBlock(blockNum)
      console.log(await data)
    }
    catch(e){
      console.log("error: " + String(e))
    }
  }
}

getBlockInfo(5);

//api-route for eos block info
app.use('/block', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

//set server to listen on port on any interface (0.0.0.0)
app.listen(port, "0.0.0.0", function() {
  console.log(`api running on port ${port}`);
});
