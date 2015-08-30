var express = require('express');
var bodyParser = require('body-parser');
var google = require('./quickStart');
var http = require('http');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


var datos={}
var server = app.listen(3000, function() {
    console.log('Escuchando en el puerto %d', server.address().port);
});

app.get('/calendar/:calendarId/event', function (req1, resp1){
	datos.calendarId = req1.params.calendarId;
  	google.start('listEvents',resp1,datos);
});

app.get('/calendar/:calendarId/event/:eventId', function (req1, resp1){
	datos.calendarId = req1.params.calendarId;
	datos.eventId = req1.params.eventId;
    google.start('getEvent',resp1,datos);
});

app.delete('/calendar/:calendarId/event/:eventId', function (req1, resp1){
	datos.calendarId = req1.params.calendarId;
	datos.eventId = req1.params.eventId;
    google.start('deleteEvent',resp1,datos);
});

app.put('/calendar/:calendarId/event/:eventId', function (req1, resp1){
	datos.calendarId = req1.params.calendarId;
	datos.eventId = req1.params.eventId;
	datos.eventUpdate = req1.body;
    google.start('updateEvent',resp1,datos);
});

app.post('/calendar/:calendarId/event', function (req, res){
	var today = new Date();
	datos.calendarId = req.params.calendarId;
	req.body.summary = req.body.summary + " creado por APIsistDist"
	datos.eventAdd = req.body;
    google.start('addEvent',res,datos);
});