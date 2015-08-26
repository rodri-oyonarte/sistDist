var express = require('express');
var google = require('./quickStart');
var http = require('http');
var app = express();


var datos={}
var server = app.listen(3000, function() {
    console.log('Escuchando en el puerto %d', server.address().port);
});

app.get('/calendar/:calendarId/event', function (req1, resp1){
  google.start('listEvents',resp1,datos);
});

app.get('/calendar/:calendarId/event/:eventId', function (req1, resp1){
    google.start('getEvent',resp1,datos);
});

app.delete('/calendar/:calendarId/event/:eventId', function (req1, resp1){
    google.start('listEvents',resp1,datos);
});

app.put('/calendar/:calendarId/event/:eventId', function (req1, resp1){
    google.start('updateEvent',resp1,datos);
});

app.post('/calendar/:calendarId/event', function (req, res){
    google.start('addEvent',res,datos);
});