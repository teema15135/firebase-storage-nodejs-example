const express = require("express");
const app = express();
const Multer = require('multer');

const admin = require('firebase-admin');

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const serviceAccount = require('./firebase-config.json');
const FirebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "firestore-example-7e462.appspot.com"
});
const storage = FirebaseApp.storage();
const bucket = storage.bucket();

app.use('/site', express.static('public'));

app.all('/', (req,res) => res.status(200).send('Welcome to example firestorage api'));

app.post('/upload', multer.single('img'), (req, res) => {
  const folder = 'profile'
  const fileName = `${folder}/${Date.now()}`
  const fileUpload = bucket.file(fileName);
  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });

  blobStream.on('error', (err) => {
    res.status(405).json(err);
  });

  blobStream.on('finish', () => {
    res.status(200).send('Upload complete!');
  });

  blobStream.end(req.file.buffer);
});

app.get('/profile/:id', (req, res) => {
  const file = bucket.file(`profile/${req.params.id}`);
  file.download().then(downloadResponse => {
    res.status(200).send(downloadResponse[0]);
  });
});

module.exports = app;