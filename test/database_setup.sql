/* first drop any tables you had before so we have a clean database */
DROP SCHEMA public cascade;
CREATE SCHEMA public;
/* create the people table */
CREATE TABLE people(
  id SERIAL PRIMARY KEY,
  email VARCHAR(254) UNIQUE,
  password VARCHAR(54) not null
);
