DROP TABLE IF EXISTS location;

CREATE TABLE location
(id SERIAL PRIMARY KEY NOT NULL,
search_query  VARCHAR(255),
formatted_query VARCHAR(255),
latitude VARCHAR(255),
longitude VARCHAR(255),
region VARCHAR(255)
);
