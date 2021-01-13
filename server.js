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
  console.log('request', request.query);
  getLocation(request.query.city)
    .then(location => {
      console.log('this is the location', location);
      response.send(location);
    })
    .catch(error => handleError(error, response));
});



app.get('/weather', getWeather);
// //Route for the Movie API
app.get('/movies', getMovies);
// //ROUTE FOR YELP FUSION API
app.get('/yelp', getYelp);
app.get('*', status404)



//FUNCTION HANDLERS

function Location(req, res) {
  this.latitude = req.geometry.location.lat;
  this.longitude = res.geometry.location.lng;
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 5);
}

function Movie(movie) {
  this.title = movie.title;
  this.released_on = movie.release_date;
  this.total_votes = movie.vote_count;
  this.average_votes = movie.votes_average;
  this.popularity = movie.popularity;
  this.image_url = `https://image.tmdb.org/t/p/original$movie.poster_path}`;
  this.overview = movie.overview;
}


function Yelp(biz) {
  this.name = biz.name;
  this.url = biz.url;
  this.rating = biz.rating;
  this.price = biz.price;
  this.image_url = biz.image_url;
}


//  HELPER FUNCTIONS

function handleError(req, res) {
  console.error(req);
  if (res) res.status(404).send('Sorry, not found');
}


function getLocation(query) {
  console.log('query', query);
  // Make query string to check for the existence of the location
  const SQL = `SELECT * FROM locations WHERE search_query=$1;`;
  const values = [query];

  // create the query of the database
  return client.query(SQL, values)
    .then(result => {
      if (result.rowCount > 0) {
        console.log('SQL working');
        return result.rows[0];

        //then retrieve information from API
      } else {
        console.log('New API request');
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&format=json&q=${process.env.GEOCODE_API_KEY}`;

        return superagent.get(url)
          .then(data => {
            console.log('From API location');

            //Make err if problem occures with API request
            if (!data.body.results.length) { throw 'no data' };

            //If so, create an instance of Locating
            else {
              let location = location = new Location(query, data.body.results[0]);
              console.log('location object from location API', location);

              //make query string to INSERT a new record with the location data
              let newSQL = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) Values ($1, $2, $3, $4) RETURNING id;';
              console.log('newValues', newSQL);
              let newValues = Object.values(location);
              console.log('neValues', newValues);

              //Place the record to the database
              return client.query(newSQL, newValues)
                .then(result => {
                  console.log('result.rows', result.rows);
                  // attach the id of the newly created record to the instance of location.
                  // this will be used to connect the location to the other databases.
                  console.log('result.rows[0].id', result.rows[0].id);
                  location.id = result.rows[0].id;
                  return location;
                })
                .catch(console.error);
            }
          })
          .catch(error => console.log('Error in SQL Call', error));

      }
    });
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Now listening on port, ${PORT}`);
    });

  });
