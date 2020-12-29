'use strict';

// Step 1: App modules/dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');

//Step 2:  Set up our application
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Routes

// app.get('/', (request, response) => {
//   response.send('Hello World');
// });
app.get('/', homeHandler);
// app.get('/location', locationHandler);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
// app.use('*', (request, response) => {
//   response.send('404. Sorry!');
// });
app.use('*', notFoundHandler);

//function Handlers
function locationHandler(request, response) {
  // This function will do two things:
  // request data from our files:
  // tailor/normalize the data using a constructor
  // respond with the data (show up in the browser) proof of life
  const location = require('./data/location.json');
  const city = request.query.city;
  const locationData = new Location(city, location);

  response.send(locationData);
}
function homeHandler(request, response) {
  response.send('hello World');
}
function notFoundHandler(request, response) {
  response.send('404, Sorry!');
}
function weatherHandler(request, response) {
  // This function will do two things:
  // request data from our files:
  // tailor/normalize the data using a constructor
  // respond with the data (show up in the browser) proof of life
  const data = require('./data/weather.json');
  const weatherArr = [];
  data.

}

// Constructor
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function Restaurant(result) {
  this.restaurant = 
  this. cuisines = 
  this.locality = 
}



//Start our server
app.listen(PORT, () => {
  console.log(`Now listening on port, ${PORT}`);
});
