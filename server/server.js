'use strict';

//Step 1:  Bring in our modules/dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');

//Step 2:  Set up our application
const app = express();
const PORT = process.env.PORT;
app.use(cors());

// Routes

app.get('/', (request, response) => {
  response.send('Hello World');
});

app.get('/location', locationHandler);

app.use('*', (request, response) => {
  response.send('404. Sorry!');
});

//function Handlers
function locationHandler(request, response) {
  //   //This function will do two things:
  //     // request data from our files:
  //     // tailor/normalize the data using a constructor
  //     // respond with the data (show up in the browser) proof of life
  const location = require('./data/location.json');
  const city = request.query.city;
  const locationData = new Location(city, location);

  response.send(locationData);

}

// Constructor
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}



//Start our server
app.listen(PORT, () => {
  console.log(`Now listening on port, ${PORT}`);
});
