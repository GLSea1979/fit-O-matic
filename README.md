# fit-O-matic ![fit-O-matic logo](img/fit-O-matic.png)

[![Coverage Status](https://coveralls.io/repos/github/GLSea1979/fit-O-matic/badge.svg?branch=master)](https://coveralls.io/github/GLSea1979/fit-O-matic?branch=master)
[![Build Status](https://travis-ci.org/GLSea1979/fit-O-matic.svg?branch=staging)](https://travis-ci.org/GLSea1979/fit-O-matic)
# fit-O-matic RESTful API

### Overview

This RESTful API allows users to create an account, input basic measurements, and receive recommendations for bikes that will fit their personal morphology.
Users can save bikes to a collection to reference at any time.

# Current Version: 0.5.0

# Architecture
This app is built entirely with JS and uses a MongoDB database. Although a front end has yet to be built, this is a MEAN stack app in the making and will follow MVC principles.

### Summary
The fit-O-matic API allows users to create profile, input some measurements, and receive a list of bicycles which will best fit them.

### Schemas

### User
    - User ID
    - Email address
    - Password
    - Username
    - Admin Status
    - Token

### Profile
    - Name
    - Gender
    - Photo
    - Inseam
    - Torso
    - Height
    - User ID
    - Created On
    - [Bike Geometries]
    - Fit Model ID

### Bike
    - bikeName
    - mfrID
    - category
    - photoURI
    - url
    - price
    - modelYear
    - created

### Mfr
    - name
    - website

### Geometry
    - bikeID
    - bikeSizeName
    - wheelSize
    - bbDrop
    - forkLength
    - forkOffset
    - topTubeLength
    - headTubeLength
    - seatTubeAngle
    - stack
    - reach

# Routes

## POST:api/signup
Example: https://fitomatic.herokuapp.com/api/signup
Required Data:
  -  Provide username, password, email as JSON requests

This route will create a new user in the database, create a hash for the password, create a token and return the token to the user.
This token will required for any subsequent requests
Example post data
{  username: 'test username', email: 'test email', password: 'testpassword', admin: true }

Example response(token):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6IjdlNzdjOGIzNzRlM2IxYzVjZTZhOTMxZDQ5YThhZTUxZTY2ZDk4MGEwZjU0NzEwNzMwOGZiYjk5ZjMzODEwYmQiLCJpYXQiOjE0ODk0NDkyMDl9.5TR57rBwP2ZeqPDk49vacNwhPtWaFmVTsI1OzODqpmo
```
## GET: api/signin
Example: https://fitomatic.herokuapp.com/api/signin
Required data
    -Login credentials in authorization header
    ```{
        Authorization: `Basic username:password`
      }
    ```
## POST: /api/profile/:userid
Required data
  -User id
## GET: /api/profile/:id
Required data
  -User id
## PUT: /api/profile/:id
Required data
  -User id
## DELETE: /api/profile/:id
Required data
  -User id

## POST: /api/bike/:bikeID/geometry
Required data
  -Provide a bikeID to save a bike geometry to the database.
## GET: /api/geo/?height=&inseam=
Required data
  -Provide your height and inseam in the querystring to receive a list of bikes fit for you
## PUT: /api/geo/:geoID
Required data
  -Geometry ID

##POST: /api/mfr
 Required data
  -name and website
##GET: /api/mfr/:id
  Required data
    -Manufacturer's ID

### Testing
mocha test runner
chai(expect)
bluebird promise library
eslint

### Continuous integration

travis-cl i integrated in this project.
