const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/routes.js');
const app = express();
// const fileupload = require('express-fileupload');
const cors = require('cors');
const fileupload = require('express-fileupload'); 

app.use(fileupload({useTempFiles: true}))

// app.use(
//   fileupload({
//       createParentPath: true,
//   }),
// );

// app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());


// app.use(express.json())

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Put all API endpoints under '/api'
app.get('/api/status', (req, res) => {
  res.json({message: 'ok'})
});

app.use('/api', routes)

// const MONGO_URI = 'mongodb+srv://user_leandro:lalalapapito@clusterdata.mz8da.mongodb.net/heroku_jhg1mkfp?retryWrites=true&w=majority';

const MONGO_URI = 'mongodb+srv://institutocrearapp:mVljagJpQleMIe9L@cluster0.xorrnvy.mongodb.net/institutocrear?retryWrites=true&w=majority';

try {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected!'));
}catch (e) {
  console.log('Connection error!', JSON.stringify(e))
}

const port = 3001;
app.listen(port);

console.log(`App running and listening on ${port}`);
