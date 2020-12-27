'use strict';

//Step 1:  Bring in our modules/dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');

//Step 2:  Set up our application
const app = express();
const PORT = process.env.PORT;
app.use(cors());

//Routes

app.get('/', (request, response) => {
  response.send('Hello World');
});

app.get('/location', locationHandler);

app.use('*', (request, response)=> {
  response.send('404. Sorry!');
});

function locationHandler(request, response){
  
}

//Start our server
app.listen(PORT, () => {
  console.log(`Now listening on port, ${PORT}`);
});
