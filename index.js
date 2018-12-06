var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config');
var morgan = require('morgan');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

const auth = require('./authentication');
app.use('/auth', auth.getToken);

var metaRouter = require('./routes/MetaRoute');
metaRouter.use(function (req, res, next) {auth.filter(req, res, next)});
app.use('/meta', metaRouter);

var server = app.listen(config.network.port);

module.exports = server;