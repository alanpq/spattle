import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64';

import * as crypto from 'crypto';

import express from 'express';
import { enc, SHA256 } from 'crypto-js';
import { Collection, Db, MongoClient } from 'mongodb';
import { allowedNodeEnvironmentFlags } from 'process';
import { json } from 'body-parser';
import * as fetch from 'node-fetch';

const uri = "mongodb://127.0.0.1:27017/"
const client = new MongoClient(uri);

const app = express()
const PORT = process.env.PORT || 3000

const kFactor = 32;


const getTrack = async (id: string) => {
  return await (await fetch.default(`https://api.spotify.com/v1/tracks/${id}`)).json();
}

const getToken = async () => {
  //https://open.spotify.com/get_access_token?reason=transport&productType=web_player
  return (await (await fetch.default("https://open.spotify.com/get_access_token?reason=transport&productType=web_player")).json()).accessToken;
}

let token;
getToken().then(t => { token = t })

const chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "_", ".", "-", "~"]
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

let db: Db;
let coll: Collection;

client.connect().then(() => {
  db = client.db('spattle');
  coll = db.collection('trackRatings');
})


app.use(json())

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

app.get('/api/battle', async (req, res) => {
  const out: { a: string, b: string } = { a: '', b: '' }
  let first = true;
  await coll.aggregate([{ '$sample': { 'size': 2 } }]).forEach((item) => {
    out[first ? 'a' : 'b'] = item.id;
    first = false;
  })
  res.json(out);
})

app.post('/api/addtrack/:id', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  console.log(req.params.id)
  if (await coll.indexExists(req.params.id))
    return res.status(304).send();

  const track = await getTrack(req.params.id);
  if (track.id !== req.params.id) return res.status(404).send();
  coll.insertOne({
    _id: req.params.id,
    id: req.params.id,
    rating: 500,
    battles: 0,
  })
  res.status(200).json({ code: 200 })
})

app.post('/api/addtracks', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  console.log(req.body.tracks)
  res.json({ code: 500 })
})

// app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});


function exitHandler(options: any, exitCode: any) {
  client.close();
  if (options.cleanup) console.log('clean');
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
