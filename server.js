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



// app.get('/weather', getWeather);
// //Route for the Movie API
// app.get('/movies', getMovies);
// //ROUTE FOR YELP FUSION API
// app.get('/yelp', getYelp);
// app.get('*', status404)






// function Weather(day) {
//   this.forecast = day.summary;
//   this.time = new Date(day.time * 1000).toString().slice(0, 5);
// }

// function Movie(movie) {
//   this.title = movie.title;
//   this.released_on = movie.release_date;
//   this.total_votes = movie.vote_count;
//   this.average_votes = movie.votes_average;
//   this.popularity = movie.popularity;
//   this.image_url = `https://image.tmdb.org/t/p/original$movie.poster_path}`;
//   this.overview = movie.overview;
// }


// function Yelp(biz) {
//   this.name = biz.name;
//   this.url = biz.url;
//   this.rating = biz.rating;
//   this.price = biz.price;
//   this.image_url = biz.image_url;
// }


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

// Handler
function getLocation(req, res) {
  const city = req.query.city;
  // For API: 1.KEY 2.url
  const key = process.env.GEODATA_API_KEY:
  const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`

  // Use Database
  // For database: SQL statement, safe values
  const searchSQL = `SELECT *
                    FROM locations
                    WHERE search_query LIKE $1`

  const safeValues = [city]
  client.query(searchSQL, safeValues)
    .then(value => {
      // if database gives nothing 
      if (value.rowCount === 0) {
        //request to API using superagent
        superagent.get(url)
          .then(value => {

            const locationData = value.body[0];
            // tailor
            const location = new Location(city, locationData)

            const addSQL = `INSERT INTO locations
                           (search_query, formatted_query, latitude, longitude)
                           VALUES ($1, $2, $3, $4)`
            
            const safeValues = [locations.search_query, locations.formatted_query, locations.latitude, locations.longitude]
            client.query(addSQL, safeValues)

            // response
            res.status(200).json(location)
          })
          // database gives you data 
      } else if (value.rowCount === 1 ) {
        res.status(200).json(value.rows[0])
      }

    })




}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Now listening on port, ${PORT}`);
    });

  });
