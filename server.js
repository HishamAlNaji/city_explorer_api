'use strict';

// variables :
require('dotenv').config();
const express = require('express');
var cors = require('cors');
const pg = require("pg");

// init the server :
const server = express();
server.use(cors());

// console.log(process.env.DATABASE_URL)

//create connection to database
var db = new pg.Client(process.env.DATABASE_URL);
// console.log(db)

// Use super agent
const superagent = require("superagent");

// Declare a port
const PORT = process.env.PORT || 2000;

//API key for locations
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

//API key for weather
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

//API key for hiking
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;

const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

const YELP_API_KEY = process.env.YELP_API_KEY;


db.connect().then(() => {
    server.listen(PORT, () => {
        console.log('I am listening to port: ', PORT);
    });
});



// localhost:2000/location
server.get('/location', async(request, response) => {
    let city = request.query.city;
    let status = 200;
    // getLocation(city).then(res => {
    //     response.send(res);
    // })

    let dataRetrived = await getLocationDB(city);
    if (dataRetrived.length === 0) {
        await getLocation(city).then((data) => {
            saveLocationToDB(data).then((savedData) => {
                response.status(status).send(savedData);
            });
        });
    } else {
        delete dataRetrived[0].id;
        response.status(status).send(dataRetrived[0]);
    }
});


// localhost:2000/weather
server.get('/weather', async(request, response) => {
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    let status = 200;
    response.status(status).send(await getWeather(lat, lon));
});

// localhost:3010/trails
server.get("/trails", async(request, response) => {
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    let status = 200;
    response.status(status).send(await getTrails(lat, lon));
});

// localhost:3010/movies
server.get("/movies", async(request, response) => {
    let region = request.query.region;
    let status = 200;
    response.status(status).send(await getMovies(region));
});

// localhost:3010/yelp
server.get("/yelp", async(request, response) => {
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    let page = request.query.page;
    let status = 200;
    response.status(status).send(await getYelp(lat, lon, page));
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
    let url = "https://api.locationiq.com/v1/autocomplete.php";
    let queryParams = {
        key: GEOCODE_API_KEY,
        q: city,
    };
    let data = superagent
        .get(url)
        .query(queryParams)
        .then((res) => {
            // console.log(res);
            return new Location(city, res.body);
            // return res.body;
        }).catch(e => {
            console.log(e);
        });
    return data;
}

// function to check the database for exist value
function getLocationDB(city) {
    let sql = `SELECT * FROM location WHERE search_query=$1;`;
    let values = [city];
    return db.query(sql, values).then((result) => {
        return result.rows;
    });
}

// Save location data to database
function saveLocationToDB(data) {
    // console.log('save', data);
    let sql = `INSERT INTO location (search_query,formatted_query,latitude,longitude,region) VALUES ($1,$2,$3,$4,$5)`;
    let values = [
        data.search_query,
        data.formatted_query,
        data.latitude,
        data.longitude,
        data.region,
    ];
    return db
        .query(sql, values)
        .then((result) => {
            return data;
        })
        .catch((error) => {
            console.log("error", error);
        });
}


// function to get weather data
function getWeather(lat, lon) {
    let url = "https://api.weatherbit.io/v2.0/forecast/daily";
    let queryParams = {
        key: WEATHER_API_KEY,
        lat: lat,
        lon: lon,
        days: 5,
    };
    let data = superagent
        .get(url)
        .query(queryParams)
        .then((res) => {
            return res.body.data.map((e) => {
                return new Weather(e);
            });
        });
    return data;
}

function getTrails(lat, lon) {
    let url = "https://www.hikingproject.com/data/get-trails";
    let queryParams = {
        key: TRAIL_API_KEY,
        lat: lat,
        lon: lon,
        maxDistance: 1000,
    };
    let data = superagent
        .get(url)
        .query(queryParams)
        .then((res) => {
            return res.body.trails.map((e) => {
                return new Trails(e);
            });
        })
        .catch((error) => {
            // console.log(error);
        });
    return data;
}

// movies function :

function getMovies(region) {
    let url = "https://api.themoviedb.org/3/movie/top_rated";
    let queryParams = {
        api_key: MOVIE_API_KEY,
        language: 'en-US',
        page: 1,
        region: region,
    };
    let data = superagent
        .get(url)
        .query(queryParams)
        .then((res) => {
            return res.body.results.map((e) => {
                return new Movies(e);
            });
        })
        .catch((error) => {
            console.log(error);
        });
    return data;
}

// Yelp function :

function getYelp(lat, lon, page) {
    let offset = (page - 1) * 5;
    let url = "https://api.yelp.com/v3/businesses/search";
    let queryParams = {
        term: 'restaurants',
        latitude: lat,
        longitude: lon,
        limit: 5,
        offset: offset,
    };
    let data = superagent
        .get(url)
        .query(queryParams)
        .set("Authorization", `Bearer ${YELP_API_KEY}`)
        .then((res) => {
            return res.body.businesses.map((e) => {
                return new Yelp(e);
            });
        })
        .catch((error) => {
            console.log(error);
        });
    return data;
}



// constructor function formate the location responed data
function Location(city, data) {
    this.search_query = city;
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
    this.region = data[0].address.country_code.toUpperCase();

}

// constructor function formate the weather responed data
function Weather(data) {
    this.forecast = data.weather.description;
    const dateObj = new Date(data.valid_date);
    this.time = dateObj.toDateString();
}

// constructor function formate the location responed data
function Trails(data) {
    this.name = data.name;
    this.location = data.location;
    this.lenght = data.length;
    this.stars = data.stars;
    this.star_votes = data.starVotes;
    this.summary = data.summary;
    this.trail_url = data.url;
    this.conditions = data.conditionDetails;
    let day = new Date(data.conditionDate);
    this.condition_date = day.toLocaleDateString();
    this.condition_time = day.toLocaleTimeString("en-US");
}

// constructor function formate the location responed data
function Movies(data) {
    this.title = data.title;
    this.overview = data.overview;
    this.average_votes = data.vote_average;
    this.total_votes = data.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
    this.popularity = data.popularity;
    this.released_on = data.release_date;
}

// constructor function formate the location responed data
function Yelp(data) {
    this.name = data.name;
    this.image_url = data.image_url;
    this.price = data.price;
    this.rating = data.rating;
    this.url = data.url;
}