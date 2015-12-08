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




var publicationSchema = mongoose.Schema({
  pubid: String,
  token: String,
  pubname: String,
  authorname: [String],
  releasedate:	Date
});

var publication = mongoose.model('publication', publicationSchema);


app.post("/savepub", function(req,res){
	
	
	

	var temppub = new publication({			
		pubid: req.body.pubid,
		token: req.body.token,
		pubname: req.body.pubname,
		authorname: req.body.authorname,
		releasedate: req.body.releasedate
	});

	
	temppub.save(function (err, savedpub) {
				if (err){
					res.send("Error: "+err); 
				}
				res.send(savedpub);
			});
  
	
});


app.get("/getpub", function (req,res){
	
	
	//...umändern
	publication.find ({ abschnittID: req.body.abschnittID }).exec (function (err, routes) {
							return res.send(routes);	//Send Response with a Array full of routes.
	});
	
});










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
