var express = require('express'),
    mysql = require('mysql'),
    path = require('path'),
    bodyParser = require('body-parser'),
    _und = require('underscore'),
    clearDbAccessor = require('./ClearDBAccessor'),
    app = express();

var dbconfig = {
    connectionLimit: 100, //important
    debug: false,
    host: 'us-cdbr-iron-east-02.cleardb.net',
    user: 'b17bd3ffac20b3',
    password: 'd64c505b20f19d7',
    database: 'heroku_a6679b0da499276'
};

var pool = mysql.createPool(dbconfig);

app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('port', (process.env.PORT || 8080));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

/***********************************************************DC *****************************************/
app.get('/dc', function(req, res) {
    clearDbAccessor.filterAllDC(function(err, dbResult) {
        if (err) {
            return res.send(err);
        } else {
        	return res.send(dbResult);
        }
    });
});

/********************************************** MARVEL category link ******************************************************
    Query information from database and return result to jquery to display*/
app.get('/marvel', function(req, res) {
    clearDbAccessor.filterAllMarvel(function(err, dbResult) {
        if (err) {
            return res.send(err);
        } else {
        	return res.send(dbResult);
        }
    });
});

/*************************************************MANGA *******************************************************
                                    Query information from database and return result to jquery to display*/
app.get('/manga', function(req, res) {
    clearDbAccessor.filterAllManga(function(err, dbResult) {
        if (err) {
            return res.send(err);
        } else {
        	return res.send(dbResult);
        }
    });
});

app.listen(app.get('port'), function() {
    console.log("Node app is running at localhost:" + app.get('port'))
});