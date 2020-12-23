import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64';

import * as crypto from 'crypto';

import express from 'express';
import { enc, SHA256 } from 'crypto-js';
import { Collection, Db, MongoClient } from 'mongodb';
import { allowedNodeEnvironmentFlags } from 'process';
import { json } from 'body-parser';
import * as fetch from 'node-fetch';
import { v4 } from 'uuid';

const uri = "mongodb://127.0.0.1:27017/"
const client = new MongoClient(uri);

const app = express()
const PORT = process.env.PORT || 3000

const kFactor = 32;

const getToken = async () => {
  //https://open.spotify.com/get_access_token?reason=transport&productType=web_player
  return (await (await fetch.default("https://open.spotify.com/get_access_token?reason=transport&productType=web_player")).json()).accessToken;
}

let token: string;
getToken().then(t => { token = t })

export const authedFetch = (url: string, options: any = {}) => {
  if (!options.headers)
    options.headers = {}
  options.headers["Authorization"] = `Bearer ${token}`
  return fetch.default(url, options)
}

const getTrack = async (id: string) => {
  return await (await authedFetch(`https://api.spotify.com/v1/tracks/${id}`)).json();
}

const getTracks = async (ids: [string]) => {
  return await (await authedFetch(`https://api.spotify.com/v1/tracks?ids=${ids.join(",")}`)).json();
}


const chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "_", ".", "-", "~"]
for (const x of Array(26).keys()) {
  chars.push(String.fromCharCode('a'.charCodeAt(0) + x))
  chars.push(String.fromCharCode('A'.charCodeAt(0) + x))
}
// console.log(chars)

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

const battles: { [token: string]: { a: string, b: string } } = {};

app.get('/api/battle', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const sample: any = await coll.aggregate([{ '$sample': { 'size': 2 } }]).toArray();
  const token = v4();
  const a = sample[0].id;
  const b = sample[1].id;
  battles[token] = { a, b };
  res.json({ token, a, b });
})

app.post('/api/battle/win/:token', async (req, res) => {
  console.log(req.params.token)
  console.log(req.query.winner)

  if (!req.query.winner || !(req.query.winner == "0" || req.query.winner == "1"))
    return res.status(400).json({ code: 400, message: "No winner provided!" });

  if (!req.params.token) return res.status(400).json({ code: 400, message: "No battle token provided!" });
  const tok: string = req.params.token as string;
  if (!battles[tok]) return res.status(404).json({ code: 401, message: "Invalid battle!" })
  const battle = battles[tok];
  const a: any = await coll.findOne({ id: battle.a });
  const b: any = await coll.findOne({ id: battle.b });
  const qa = Math.pow(10, a.rating / 400);
  const qb = Math.pow(10, b.rating / 400);
  const qsum = qa + qb;
  const ea = qa / (qsum);
  const eb = qb / (qsum);
  const aScore = (req.query.winner == "0") ? 1 : 0;
  const bScore = (req.query.winner == "1") ? 1 : 0;
  const nA = a.rating + kFactor * (aScore - ea);
  const nB = b.rating + kFactor * (bScore - eb);
  coll.updateOne({ id: battle.a }, {
    "$set": { rating: nA },
    "$inc": { battles: 1 },
  })
  coll.updateOne({ id: battle.b }, {
    "$set": { rating: nB },
    "$inc": { battles: 1 },
  })
  console.log(`updating song '${battle.a}' to rating ${nA}`)
  console.log(`updating song '${battle.b}' to rating ${nB}`)

  delete battles[tok]; // TODO: delete battles after timeout

  // TODO: match history (for reverting bad battles)

  res.status(200).json({
    code: 200,
  })
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

app.options('/api/addtracks', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Method", "POST")
  res.setHeader("Access-Control-Allow-Headers", "*")
  res.setHeader("Access-Control-Max-Age", "120")

  res.send();
})

app.post('/api/addtracks', async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  if (!req.body.tracks) return res.status(403).send();
  const tracks = (await getTracks(req.body.tracks)).tracks;
  let count = 0;
  for (let i = 0; i < req.body.tracks.length; i++) {
    if (!tracks[i] || !req.body.tracks[i]) continue;
    if (req.body.tracks[i] != tracks[i].id) continue;
    // console.log(tracks[i].id)
    coll.insertOne({
      _id: tracks[i].id,
      id: tracks[i].id,
      rating: 500,
      battles: 0,
    }).then(() => {
      count += 1;
    }).catch((err) => {
      if (err.code != 11000)
        console.error(err);
    })
  }
  res.json({ code: 200, count })
})

app.get('/*', (req, res) => {
  res.sendFile(__dirname + "/index.html");
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
