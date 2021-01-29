DROP TABLE IF EXISTS locations, weather, movies, restaurants;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255), 
  formatted_query VARCHAR(255),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7)
);

CREATE TABLE weather (
  id SERIAL PRIMARY KEY,
  forecast VARCHAR(255),
  time CHAR(15),
  location_id INTERGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255);
  released_on VARCHAR(255),
  total_votes INTEGER NOT NULL,
  average_votes NUMERIC(7, 2),
  POPULARITY NUMERIC(3, 1),
  image_url VARCHAR(255),
  overvieWs VARCHAR(1000),
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  image_url VARCHAR(255);,
  rating NUMERIC(2,1),
  price VARCHAR(10),
  image_url VARCHAR(255),
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES location (id)
);
