'use strict';

// Step 1: App dependencies/modules
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

//Load environment variables from .env file
require('dotenv').config();


//Step 2:  Set up our application and specify your port 
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

//Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.err(err));

// Routes/end points

app.get('/location', (request, response) => {
  getLocation(request.query.data)
    .then(location => {
      console.log('server.js, location);
      response.send(location)
    })
    .catch(error => handleError(error, response));
})



app.get('/weather', getWeather);
app.get('/meetups', getMeetups);
//Route for the Movie API
app.get('/movies', getMovies);
//Route for Trails Project API
// app.get('/trails', getTrails);
//ROUTE FOR YELP FUSION API
app.get('/yelp', getYelp);


app.listen(PORT, () => {
  console.log(`Now listening on port, ${PORT}`);
});


//FUNCTION HANDLERS

function Location(value, res) {
  this.latitude = rew.geometry.location.lat;
  this.longitude = res.geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.tome * 1000).toString().slice(0,5);
}
function Meetup(meetup) {
  this.link = meetup.link;
  this.name = meetup.group.name;
  this.creation_date = new Date(meetup.group.created).toString().slice(0,15);
}

function Movie(movie){
  this.title = movie.title;
  this.released_on = movie.release_date;
  this.total_votes = movie.vote_count;
  this.average_votes = movie.votes_average;
  this.popularity = movie.popularity;
  this.image_url = `https://image.tmdb.org/t/p/original$movie.poster_path}`;
  this.overview = movie.overview;
}


functionYelp(biz) {
    this.name = biz.name;
    this.url = biz.url;
    this.rating = biz.rating;
    this.price = biz.price;
    this.image_url = biz.image_url;
}


//  HELPER FUNCTIONS

function handleError(err, response) {
console.error(err);
if (res) res.status(500).send('Sorry');
}





