'use strict';

// Step 1: App dependencies/modules
const express = require('express'); //web framework
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
//request
app.get('/location', getLocation);
app.get('/weather', getWeather);
// //Route for the Movie API
app.get('/movies', getMovies);
// //ROUTE FOR YELP FUSION API
app.get('/yelp', getRestaurant);
app.get('*', handleError);





//  HELPER FUNCTIONS

function handleError(err, res) {
  console.error(err);
  if (res) res.status(404).send('Sorry, not found');
}

// Object Constructor
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

// Location Handler
function getLocation(req, res) {
  const city = req.query.city; // request=retrieve from frontend
  // For API: 1.KEY 2. API url
  const key = process.env.GEODATA_API_KEY;
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

  // Use Database
  // For database: SQL statement, safe values
  const searchSQL = `SELECT *
                    FROM locations
                    WHERE search_query LIKE $1`;

  const safeValues = [city];
  client.query(searchSQL, safeValues) // Talks to database
    .then(value => {
      // if database gives nothing
      if (value.rowCount === 0) {
        //request to API using superagent (how you talk to the API)
        superagent.get(url) //superagent.get asyncronist call
          .then(value => { //response from the API is .then

            const locationData = value.body[0]; //everytime you receive data from the API value.body
            // tailor
            const location = new Location(city, locationData);
            // add to database
            const addSQL = `INSERT INTO locations
                           (search_query, formatted_query, latitude, longitude)
                           VALUES ($1, $2, $3, $4)`;

            const safeValues = [location.search_query, location.formatted_query, location.latitude, location.longitude];
            client.query(addSQL, safeValues);

            // response
            res.status(200).json(location);
          });
        // database gives you data
      } else if (value.rowCount === 1) {
        res.status(200).json(value.rows[0]);
      }

    });
}

function Restaurant(restaurant) {
  this.name = restaurant.name;
  this.image_url = restaurant.image_url;
  this.price = restaurant.price;
  this.rating = restaurant.rating;
  this.url = restaurant.url;
}

function getRestaurant(req, res) {
  const numPerPage = 5;
  const page = req.query.page || 1;
  const start = ((page - 1) * numPerPage + 1);
  const url = `https://api.yelp.com/v3/businesses/search`;
  let queryList = {
    latitude: req.query.latitude,
    longitude: req.query.longitude,
    limit: numPerPage,
    offset: start
  };

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query(queryList)
    .then(value => {
      const restaurantData = value.body.businesses.map(restaurant => {
        return new Restaurant(restaurant);
      });
      res.status(200).json(restaurantData);
    });

}

function Weather(day) {
  this.forecast = day.weather.description;
  this.time = day.datetime;
  // this.time = new Date(day.time * 1000).toString().slice(0, 5);
}

function getWeather(req, res) {
  const lat = req.query.latitude;
  const lon = req.query.longitude;
  const key = process.env.WEATHERBIT_API_KEY;
  const url = `http://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&key=${key}`;

  superagent.get(url)
    .then(value => {
      const weatherData = value.body.data;
      const weather = weatherData.map(value => {
        console.log(value);
        return new Weather(value);

      });
      console.log(weather);
      res.status(200).json(weather);

    });

}


function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.votes_average;
  this.total_votes = movie.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/original${movie.poster_path}`;
  this.popularity = movie.popularity;
  this.released_on = movie.release_date;
}

function getMovies(req, res) {
  const url = `https://api.themoviedb.org/3/search/movie`;
  const queryList = {
    api_key: process.env.MOVIE_API_KEY,
    query: req.query.search_query
  };

  superagent.get(url)
    .query(queryList)
    .then(value => {
      const movieData = value.body.results.map(movie => {
        return new Movie(movie);
      });
      res.status(200).json(movieData);
    });

}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Now listening on port, ${PORT}`);
    });

  });
