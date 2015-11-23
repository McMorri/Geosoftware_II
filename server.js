//  author: Timon Gottschlich, Moritz Migge, Marvin Gehrt, Tobias Steinblum, Daniel Schäperklaus


"use strict";

// change these, if you need another port config
var config = {
    httpPort: 8080,
    mongoPort: 27017
}

var express    = require('express');
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');

var app = express();
app.use(bodyParser.urlencoded({extended: true, limit:'100mb'})); // enable processing of the received post content



/* init database connection */
mongoose.connect('mongodb://localhost:' + config.mongoPort + '/Abschlussaufgabe');
var database = mongoose.connection;

database.on('error', console.error.bind(console, 'ABORTING. database connection error:'));

// once db connection is open, start http server
database.once('open', function (callback) {
    
    console.log('connection to database established on port ' + config.mongoPort);
    app.listen(config.httpPort, function(){
        console.log('http server now running on port ' + config.httpPort);
    });
});


/** http routing **/

// code which is executed on every request
app.use(function(req, res, next) {
    console.log(req.method + ' ' + req.url + ' was requested');
    next();
});

/* web app */

// deliver all contents of the folder '/webapp' under '/'
app.use(express.static(__dirname + '/webapp'));