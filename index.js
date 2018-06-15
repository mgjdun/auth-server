// -----------------------------------------------------------------------------
// Main starting point of the application
// -----------------------------------------------------------------------------

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// DB setup
// -----------------------------------------------------------------------------

mongoose.connect('mongodb://localhost:27017/cook');

// -----------------------------------------------------------------------------
// App setup
// -----------------------------------------------------------------------------

// Morgan is a logging framework, handy for debugging
app.use(morgan('combined'));

// Bodyparser is a framework for parsing incoming requests
// In this case, it will attempt to parse any type into json:
app.use(bodyParser.json({ type: '*/*' }));
router(app);

// -----------------------------------------------------------------------------
// Server setup
// -----------------------------------------------------------------------------

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('Server listens to port: ', port);
