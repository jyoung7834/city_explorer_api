'use strict';

// Step 1: App dependencies/modules
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

//Load environment variables from .env file
require('dotenv').config();


//Step 2:  Set up our application
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

//Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.err(err));

// Routes

app.get('/location', (request, response) => {
  getLocation(request.query.data)
    .then(location => {
      console.log('server.js line 27', location);
      response.send(location)
    })
    .catch(error => handleError(error, response));
})



app.get('/weather', getWeather);

app.get('/meetups', getMeetups);

//Route for the Movie API
app.get('/movies', getMovies);

//Route for Trails Project API
app.get('/trails', getTrails);

//ROUTE FOR YELP FUSION API
app.get('/yelp', getYelp);


//STARTS OUR SERVER
app.listen(PORT, () => {
  console.log(`Now listening on port, ${PORT}`);
});


//FUNCTION HANDLERS

function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.formatted_address;
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

functionTrail(trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = this.star_votes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.condition_date = trail this.condition_date.slice(0,10);
  this.condition_time = trail.conditionDate.slice(11, 19);
  this.conditions = trail.conditionDetails;
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

function getLocation(query) {
  //create query string to check for the existence of the location
  const SQL ='SELECT * FROM locations WHERE search_query=$1;';
  const values = [query];

  //create the query of the database3
  return client.query(SQL, values)
  .then(result => {
    //Check to see if the location was found and return the results
    if (result.rowCount > 0) {
      console.log('From SQL');
      return result.rows[0];

      //otherwise get the location information from the Google API
    } else {
      console.log('New API call');
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

      return superagent.get(url)
      .then (data => {
        console.log('From location API');
        //Show an error if there is a problem with the API request
        if (!data.body.results.length) {throw 'no Data'}
        
        // otherwise create an instance of Location 
        else {
          let location = new Location(query, data.body.results[0]);
          console.log('location object from location API', location);

        // make a query string to Insert a new record with the location data
        let newSQL = `insert into LOCATIONS (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RERURNING id;`;
        console.log('newSQL', newSQL)
        let newValues = Object.values(location);
        console.log('newValues', newValues)

        //add the record to the database
        return client.query(newSQL, newValues)
        .then(result => {
          console.log('result.rows', result.rows);
          //attach the id of the newly created record to the instance of location.
          // this will be used to connect the location the other databases.
          console.log('result.rows[0].id', result.rows[0].id)
          location.id = result.rows[0].id;
          return location;
        })
        .catch(console.error);
        }
      })
      .catch(error => console.log('Error in SQL Call'));
    }
  });
}

function getWeather(request, response) {
  // Create query string to check for existence of the location
  const SQL = `SELECT * FROM weathers WHERE location_id=$1;`;
  const values = [request.query.data.id];

  //Query the DB
  return client.query(SQL, values)
  .then(result => {
    //check to see if the location was found and return the results
    if (result.rowCount > 0) {
      console.log('From SQL');
      response.send(result.rows); // Removed '[0]
      //otherwise get the location information from Dark Sky API
      } else {
        const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

        superagent.get(url)
        .then(result => {
         console.log('From weather API');
         const weatherSummaries = result.body.daily.data.map(day => {
           const summary = new Weather(day);
           return summary;
         });
         let newSQL = `INSERT INTO weathers(forcast, time, location_id) VALUES ($1, $2, $3);`;
         console.log('weatherSummaries', weatherSummaries) // Array of objects
         weatherSummaries.forEach(summary => {
           let newValues = Object.values(summary);
           newValues.push(request.query.data.id);
           //add the record to the database
           return client.query(newSQL, newValues)
            .catch(console.error);
         })
         response.send(seatherSummaries);
        })
        .catch(error => handleError(error. response));
      }
  })
}

function getMeetups(request, response) {
  // Create query string to check for existence of the location
  const SQL = `SELECT * FROM meetups WHERE location_id=$1;`;
  const values = [request.query.data.id];

  //Query the DB
  return client.query(SQL, values)
  .then(result => {
    //check to see if the location was found and return the results
    if (result.rowCount > 0) {
      console.log('From SQL');
      response.send(result.rows); // Removed '[0]
      //otherwise get the location information from Dark Sky API
      } else {
        const url = `https://api.meetup.com/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

        superagent.get(url)
        .then(result => {
         console.log('From weather API');
         const weatherSummaries = result.body.daily.data.map(day => {
           const summary = new Weather(day);
           return summary;
         });
         let newSQL = `INSERT INTO weathers(forcast, time, location_id) VALUES ($1, $2, $3);`;
         console.log('weatherSummaries', weatherSummaries) // Array of objects
         weatherSummaries.forEach(summary => {
           let newValues = Object.values(summary);
           newValues.push(request.query.data.id);
           //add the record to the database
           return client.query(newSQL, newValues)
            .catch(console.error);
         })
         response.send(seatherSummaries);
        })
        .catch(error => handleError(error. response));
      }
  })
}

function getWeather(request, response) {
  // Create query string to check for existence of the location
  const SQL = `SELECT * FROM weathers WHERE location_id=$1;`;
  const values = [request.query.data.id];

  //Query the DB
  return client.query(SQL, values)
  .then(result => {
    //check to see if the location was found and return the results
    if (result.rowCount > 0) {
      console.log('From SQL');
      response.send(result.rows); // Removed '[0]
      //otherwise get the location information from Dark Sky API
      } else {
        const url = `https://aap.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

        superagent.get(url)
        .then(result => {
         console.log('From weather API');
         const weatherSummaries = result.body.daily.data.map(day => {
           const summary = new Weather(day);
           return summary;
         });
         let newSQL = `INSERT INTO weathers(forcast, time, location_id) VALUES ($1, $2, $3);`;
         console.log('weatherSummaries', weatherSummaries) // Array of objects
         weatherSummaries.forEach(summary => {
           let newValues = Object.values(summary);
           newValues.push(request.query.data.id);
           //add the record to the database
           return client.query(newSQL, newValues)
            .catch(console.error);
         })
         response.send(seatherSummaries);
        })
        .catch(error => handleError(error. response));
      }
  })
}

function getWeather(request, response) {
  // Create query string to check for existence of the location
  const SQL = `SELECT * FROM weathers WHERE location_id=$1;`;
  const values = [request.query.data.id];

  //Query the DB
  return client.query(SQL, values)
  .then(result => {
    //check to see if the location was found and return the results
    if (result.rowCount > 0) {
      console.log('From SQL');
      response.send(result.rows); // Removed '[0]
      //otherwise get the location information from Dark Sky API
      } else {
        const url = `https://aap.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

        superagent.get(url)
        .then(result => {
         console.log('From weather API');
         const weatherSummaries = result.body.daily.data.map(day => {
           const summary = new Weather(day);
           return summary;
         });
         let newSQL = `INSERT INTO weathers(forcast, time, location_id) VALUES ($1, $2, $3);`;
         console.log('weatherSummaries', weatherSummaries) // Array of objects
         weatherSummaries.forEach(summary => {
           let newValues = Object.values(summary);
           newValues.push(request.query.data.id);
           //add the record to the database
           return client.query(newSQL, newValues)
            .catch(console.error);
         })
         response.send(seatherSummaries);
        })
        .catch(error => handleError(error. response));
      }
  })
}

function getWeather(request, response) {
  // Create query string to check for existence of the location
  const SQL = `SELECT * FROM weathers WHERE location_id=$1;`;
  const values = [request.query.data.id];

  //Query the DB
  return client.query(SQL, values)
  .then(result => {
    //check to see if the location was found and return the results
    if (result.rowCount > 0) {
      console.log('From SQL');
      response.send(result.rows); // Removed '[0]
      //otherwise get the location information from Dark Sky API
      } else {
        const url = `https://aap.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;

        superagent.get(url)
        .then(result => {
         console.log('From weather API');
         const weatherSummaries = result.body.daily.data.map(day => {
           const summary = new Weather(day);
           return summary;
         });
         let newSQL = `INSERT INTO weathers(forcast, time, location_id) VALUES ($1, $2, $3);`;
         console.log('weatherSummaries', weatherSummaries) // Array of objects
         weatherSummaries.forEach(summary => {
           let newValues = Object.values(summary);
           newValues.push(request.query.data.id);
           //add the record to the database
           return client.query(newSQL, newValues)
            .catch(console.error);
         })
         response.send(seatherSummaries);
        })
        .catch(error => handleError(error. response));
      }
  })
}




