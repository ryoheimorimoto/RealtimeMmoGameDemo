/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var routes = require('../routes');

var app = express();
app.set('port', process.env.PORT || 20902);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', routes.index);

var httpServer = http.createServer(app);
httpServer.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

var gameServer = require('./gameServer.js');
var GameServer = gameServer({
	httpServer : httpServer
});

