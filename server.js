'use strict';

// variables :
const express = require('express');
var cors = require('cors');
require('dotenv').config();

// init the server :
const server = express();
server.use(cors());

// Declare a port
const PORT = process.env.PORT || 2500;

server.listen(PORT, () => {
    console.log('I am listening to port: ', PORT);
});

// localhost:2000/location
server.get('/location', (request, response) => {
    let city = request.query.city;
    let status = 200;
    response.status(status).send(getLocation(city));
});


// localhost:2000/weather
server.get('/weather', (request, response) => {
    let status = 200;
    response.status(status).send(getWeather());
});

// 404 error
server.all('*', (request, response) => {
    let status = 404;
    response.status(status).send('Not Found');
});

// 500 error
server.all('*', (request, response) => {
    let status = 500;
    response.status(status).send('Internal server error');
});

// function to get location data
function getLocation(city) {
    let data = require('./data/location.json');
    return new Location(city, data);
}

// function to get weather data
function getWeather() {
    let weatherData = require('./data/weather.json');
    return weatherData.data.map((e) => {
        return new Weather(e);
    });
}

// constructor function formate the location responed data
function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
}

// constructor function formate the weather responed data
function Weather(data) {
    this.forecast = data.weather.description;
    const dateObj = new Date(data.valid_date);
    this.time = dateObj.toDateString();
}