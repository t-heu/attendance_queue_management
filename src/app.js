const express = require('express');
const path = require('path');
const helmet = require('helmet');
require('dotenv/config');

const routes = require('./routes');

const app = express();

app.set('view engine', 'ejs');
app.use('/', express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' securetoken.googleapis.com www.googleapis.com wss://s-usc1c-nss-398.firebaseio.com wss://inspired-skill-159220.firebase www.google-analytics.com; frame-src 'self' s-usc1c-nss-398.firebaseio.com; font-src 'self' cdnjs.cloudflare.com; img-src 'self' www.googletagmanager.com www.google-analytics.com; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; script-src 'self' 'unsafe-eval' 'nonce-G-SQ2MFD61V6' data: s-usc1c-nss-398.firebaseio.com inspired-skill-159220.firebaseio.com www.gstatic.com www.googletagmanager.com www.google-analytics.com;",
  );
  next();
});
app.use(routes);

module.exports = { app };
