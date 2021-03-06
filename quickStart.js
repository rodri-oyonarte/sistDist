var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var express = require('express');
var http = require('http');
var app = express();

var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-api-quickstart.json';



// Load client secrets from a local file.
module.exports = {
  start: function(accion,resp1,datos){
    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      // Authorize a client with the loaded credentials, then call the
      // Google Calendar API.
      switch (accion) {
        case "getEvent": authorize(JSON.parse(content),getEvent,resp1,datos);; break;
        case "listEvents": authorize(JSON.parse(content),listEvents,resp1,datos); break;
        case "deleteEvent": authorize(JSON.parse(content),deleteEvent,resp1,datos); break;
        case "updateEvent": authorize(JSON.parse(content),updateEvent,resp1,datos); break;
        case "addEvent": authorize(JSON.parse(content),addEvent,resp1,datos); break;
      }
    });
}}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback,resp1,datos) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback,resp1,datos);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client,resp1,datos);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback,resp1,datos) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client,resp1,datos);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}



/**
 * Lists the next 10 events on the user's primary calendar.
 * lista de los siguientes 10 eventos
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
 //lista de los siguientes 10 eventos  metodo GET
function listEvents(auth,resp1,datos) {
  var calendar = google.calendar('v3');
  var eventos= [];
  calendar.events.list({
    auth: auth,
    calendarId: datos.calendarId,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
      eventos = "no upcoming events found.";
    } else {
      //console.log('Upcoming 10 events:');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        eventos.push(event);
      }
    }
    resp1.json({eventos: eventos});
  });
}


//obtener evento  metodo GET
function getEvent(auth,resp1,datos){
  var calendar = google.calendar('v3');
  
  calendar.events.get({
    auth: auth,
    calendarId: datos.calendarId,
    eventId: datos.eventId,
  }, function(err, response) {
    if (err) {
      console.log('(event get)There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event geted: ');
    var evento = response;
    console.log(JSON.stringify(evento, null, 2));
    resp1.json(evento)
  });
  
}


//borrar un evento metodo DELETE
function deleteEvent(auth,resp1,datos){
  var calendar = google.calendar('v3');
  
  calendar.events.delete({
    auth: auth,
    calendarId: datos.calendarId,
    eventId: datos.eventId,
  }, function(err, response) {
    if (err) {
      console.log('(event delete)There was an error contacting the Calendar service: ' + err);
      resp1.send('(event delete)There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event deleted: ');
    resp1.json({});

  });
  
}


//editar un evento metodo PUT
function updateEvent(auth,resp1,datos) {
  var calendar = google.calendar('v3');

  var event = datos.eventUpdate; 
  
  calendar.events.update({
    auth: auth,
    calendarId: datos.calendarId,
    eventId: datos.eventId,
    resource: event,
  }, function(err, event) { //event es la respuesta del metodo (va a ser el evento creado)
    if (err) {
      console.log('(event edit)There was an error contacting the Calendar service: ' + err);
      resp1.send('(event edit)There was an error contacting the Calendar service: ' + err);
      return;
    }
    console.log('Event updated: %s', event.htmlLink);
    resp1.json(event);
  });
}

//agregar evento metodo post POST
function addEvent(auth,resp1,datos) {
  var calendar = google.calendar('v3');

  var event = datos.eventAdd;
  
  calendar.events.insert({
    auth: auth,
    calendarId: datos.calendarId,
    resource: event,
  }, function(err, event) { //event es la respuesta del metodo (va a ser el evento creado)
    if (err) {
      console.log('There was an error contacting the Calendar service: ' + err);
      resp1.send('There was an error contacting the Calendar service: ' + err);

      return;
    }
    console.log('Event created: %s', event.htmlLink);
    resp1.json(event);

  });
}