const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const mysql = require('mysql');
//const path = require('path');
const jwt = require('jsonwebtoken');
//const crypto = require('crypto');
const bcrypt = require('bcrypt');
const helmet = require('helmet');

const config = require('./config');

const pool = mysql.createPool(config.pool);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/dist/news-portal'));
//app.use(express.static(__dirname + '/src'));

app.use(cors());
app.use(helmet());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \ Authorization');
  next();
});

app.use(morgan('dev'));

//const authRouter = require('./app/routes/authenticate')(express, pool, jwt, config.secret, crypto);
const authRouter = require('./app/routes/authenticate')(express, pool, jwt, config.secret, bcrypt);
app.use('/authenticate', authRouter);

const apiRouter = require('./app/routes/api')(express, pool, jwt, config.secret);
app.use('/api', apiRouter);

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname + '/dist/news-portal/index.html'));
});

app.listen(config.port, () => {
  console.log("Running on port --> " + config.port);
});
