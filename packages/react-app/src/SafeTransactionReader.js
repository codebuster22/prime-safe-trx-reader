const SAFE = "0x52F50f557704938Df066EC4Db7426D66538E7796";
// https://safe-client.gnosis.io/v1/chains/137/safes/0x32e84c857DbB3358bDB75550b2062DfEF1fDb349/transactions/queued
const baseURI = `https://safe-transaction.mainnet.gnosis.io/api/v1/safes/${SAFE}/multisig-transactions/`;
const nonceURI = `https://safe-transaction.mainnet.gnosis.io/api/v1/safes/${SAFE}/`;

const sortPendingRequests = (requests, latestNonce) =>
  requests.filter((request) => request.nonce >= latestNonce);

const sortCompletedRequests = (requests, latestNonce) =>
  requests.filter((request) => request.nonce < latestNonce);

const sortRequests = (requests) =>
  requests.filter(
    (request) =>
      request?.dataDecoded?.method === "deployLBPManager" ||
      request?.dataDecoded?.method === "deploySeed"
  );

export const getTransactions = async (
  setPendingRequests,
  setCompletedRequests,
  setRequests,
  setLoaded
) => {
  const response = await (await fetch(baseURI)).json(); // this will return all the transactions done using Gnosis Safe
  const latestNonce = (await (await fetch(nonceURI)).json()).nonce;
  const requests = sortRequests(response.results); // this will just keep transactions that are `deploySeed` or `deployLbpManager`
  setRequests(requests); // for the application, setting sate
  setPendingRequests(
    // for the application, setting state
    sortPendingRequests(requests, latestNonce) // sorting transactions based on if they are executed or not
  );
  setCompletedRequests(
    // for the application, setting state
    sortCompletedRequests(requests, latestNonce) // sorting transactions based on if they are executed or not
  );
  if (requests.length) setLoaded(true); // for the application, setting state
};

function hexToString(str) {
  // for converting the hexadecimal to string
  const buf = new Buffer(str, "hex");
  return buf.toString("utf8");
}

export const loadMetadata = async (
  request,  // the transaction object that is returned by Gnosis Safe
  metadata, // for application, using state
  setMetadata,  // for application, using state
  setIsLoaded   // for application, using state
) => {
  if (!metadata?.version && request?.nonce) {
    const hashInBytes =
      request.dataDecoded.parameters[request.dataDecoded.parameters.length - 1] // deploySeed and deployLbpManager have different number of parameters
        .value;
    const hash = hexToString(hashInBytes.slice(2));
    const response = await fetch(`https://ipfs.io/ipfs/${hash}`);
    const data = await response.json();
    setMetadata(JSON.parse(data));
    if (data) {
      setIsLoaded(true);
    }
  }
};

// How a transaction returned from Gnosis looks like
//   
//       {
//         "safe": "0x52F50f557704938Df066EC4Db7426D66538E7796",
//         "to": "0xf50c85e4F8903b38Cd6Cc2D73678a5BE1FaC5e0a",
//         "value": "0",
//         "data": "0xfd3bd38a00000000000000000000000093b7a833d0e0990cf1d68ef47d90b9c6f46a1a2f00000000000000000000000052f50f557704938df066ec4db7426d66538e7796000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000...",
//         "operation": 0,
//         "gasToken": "0x0000000000000000000000000000000000000000",
//         "safeTxGas": 704169,
//         "baseGas": 0,
//         "gasPrice": "0",
//         "refundReceiver": "0x0000000000000000000000000000000000000000",
//         "nonce": 11,
//         "executionDate": null,
//         "submissionDate": "2021-12-26T02:41:59.236024Z",
//         "modified": "2021-12-26T02:41:59.236024Z",
//         "blockNumber": null,
//         "transactionHash": null,
//         "safeTxHash": "0x1b0a7c2d53a15348823dd91d6c2270668f46a175868e0677f7f3fe534137c58d",
//         "executor": null,
//         "isExecuted": false,
//         "isSuccessful": null,
//         "ethGasPrice": null,
//         "gasUsed": null,
//         "fee": null,
//         "origin": null,
//         "dataDecoded": {     
//                          // This is where we find details of the method that is going to be invoked  
//                          // This is only going to be returned if the contract is verified on etherscan, 
//                          // else, they won't be able to decode the data
//           "method": "deployLBPManager",
//           "parameters": "[{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, …]"
//         },
//         "confirmationsRequired": null,
//         "confirmations": [],
//         "signatures": null
//       },

