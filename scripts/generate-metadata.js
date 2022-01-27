const axios = require('axios');
const letterData = require('../src/data/letterData.js');

const alpha = '0123456789abcdefghijklmnopqrstuvwxyz';
const letters = Array.from(alpha);

const pinJSONToIPFS = (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  return axios
    .post(url, JSONBody, {
      headers : {
        pinata_api_key : '3635086c6041cdc46886',
        pinata_secret_api_key : 'f821d39122127a13bdd7621ad61d537313ee4b08c46d75e472f797e7b2853bb3'
      }
    });
};

for (let i = 0; i < letters.length; i++) {
  const letter = letters[i];
}
