DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS weather;
DROP TABLE IF EXISTS trails;

CREATE TABLE location
(id SERIAL PRIMARY KEY NOT NULL,
search_query  VARCHAR(255),
formatted_query VARCHAR(255),
latitude VARCHAR(255),
longitude VARCHAR(255),
region VARCHAR(255)
);

CREATE TABLE weather
(id SERIAL PRIMARY KEY NOT NULL,
forecast  VARCHAR(255),
time VARCHAR(255));

CREATE TABLE trails
(id SERIAL PRIMARY KEY NOT NULL,
name  VARCHAR(255),
location VARCHAR(255),
lenght VARCHAR(255),
stars VARCHAR(255),
star_votes VARCHAR(255),
summary VARCHAR(255),
trail_url VARCHAR(255),
conditions VARCHAR(255),
condition_date VARCHAR(255),
condition_time VARCHAR(255));