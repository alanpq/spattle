import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64';

import * as crypto from 'crypto';

import express from 'express';
import { enc, SHA256 } from 'crypto-js';
const app = express()
const PORT = process.env.PORT || 3000


const chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]//, "_", ".", "-", "~"]
for (const x of Array(26).keys()) {
  chars.push(String.fromCharCode('a'.charCodeAt(0) + x))
  chars.push(String.fromCharCode('A'.charCodeAt(0) + x))
}
// console.log(chars)

const openVerifiers: { [challenge: string]: string } = {};

const genChallenge = () => {
  const buf = crypto.randomBytes(128);
  const final = new Array(128); // TODO: test perf of using array vs string concat, etc
  let i = 0;
  for (const x of buf) {
    // TODO: stop using modulo to reduce (fucks with distribution)
    final[i] = chars[x % chars.length]
    i++;
  }

  return final.join('');
}


app.use('/dist', express.static('dist'))
app.use('/', express.static('dist'))
app.get('/api/challenge', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  const verifier = genChallenge();
  const challenge = crypto.createHash('sha256')
    // updating data 
    .update(verifier)
    // Encoding to be used 
    .digest('base64')
    .replace("+", '-') // thanks spotify
    .replace("/", "_") // thanks spotify
    .replace("=", "") // thanks spotify
  // console.log(verifier);
  // console.log(challenge);
  res.json({ verifier, challenge: challenge })
})

// app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});