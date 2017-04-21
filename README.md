![fit-O-matic logo](img/fit-O-matic.png)

[![Coverage Status](https://coveralls.io/repos/github/GLSea1979/fit-O-matic/badge.svg?branch=master)](https://coveralls.io/github/GLSea1979/fit-O-matic?branch=master)
[![Build Status](https://travis-ci.org/GLSea1979/fit-O-matic.svg?branch=staging)](https://travis-ci.org/GLSea1979/fit-O-matic)
# fit-O-matic RESTful API

### Overview


This RESTful API allows users to create an account, input basic measurements, and receive recommendations for bikes that will fit their personal morphology.
Users can save bikes to a collection to reference at any time.

# Current Version: 0.5.0

# Architecture
This app is built entirely with JS and uses a MongoDB database. Although a front end has yet to be built, this is a MEAN stack app in the making and will follow MVC principles.

## Entity Relationship Diagram
![fit-O-matic ERD](img/entityRelationshipDiagramFitOMatic.png)

### Summary
The fit-O-matic API allows users to create profile, input some measurements, and receive a list of bicycles which will best fit them.

### About The Team

Gary Lundgren:
  As a software developer my focus has been on building high quality applications. I have specialized in utilizing the MEAN stack for development and am always on a journey to learn and use new technologies.

Zachary Crumbo:
   I'm a full stack developer with a background in design,  photography, and ecommerce. I love to learn, to debug, and to find connections.

Regan O'Neill:
  After gaining development experience at a digital marketing agency, I wanted to learn more about the backend and front-end frameworks.

## Schemas

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

## POST: /api/signup
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
## GET: /api/signin
Example: https://fitomatic.herokuapp.com/api/signin
Required data:
    - Login credentials in authorization header:
```
      {
        Authorization: `Basic username:password`
      }

```
    - Returned will be a token for any subsequent requests

## PUT: /api/newPassword
Required data:
    - Username and password. In response you will receive your user information with a hash of the new password:
```
    { _id: '58cadfb05f2ff5567c974e41',
  username: 'some new name',
  email: 'test email',
  password: '$2a$10$.fxE4md8/a6msDdntIWfEe0/d7aR0nPjx/aY1nPJDZy41NzRMKxJG',
  admin: true,
  __v: 0 }
 ```
## DELETE: /api/remove/:id
Required data:
  - Provide user id to delete the user (and their profile), then receive a 204 status in return.

## POST: /api/profile/:userid
Required data:
  - Provide a profile id and receive user properties:
```
  { __v: 0,
  name: 'Fresh Name',
  gender: 'female',
  photo: 'katze.png',
  userID: '58cae148f6877b56d197f597',
  _id: '58cae148f6877b56d197f598',
  geoID: [],
  createdOn: '2017-03-16T19:02:32.927Z' }
```
## GET: /api/profile/:id
Required data:
  - Provide an id and receive all profile properties for that user:
```
  { _id: '58cae3a8c9b2cc57255bac7f',
  name: 'tested',
  gender: 'man',
  photo: 'greatphoto.png',
  userID: '58cae3a8c9b2cc57255bac7e',
  __v: 0,
  geoID: [],
  createdOn: '2017-03-16T19:12:40.976Z' }
```

## GET: /api/profile/:id/bikes
Required data:
  - Provide an id and receive an object containing the bikes related to this user:
```
  { _id: '58cae200d188fa56f60f5e79',
    name: 'Mrs. Test Name',
    gender: 'female',
    photo: 'doje.png',
    userID: '58cae200d188fa56f60f5e75',
    __v: 0,
    geoID:
     [ { _id: '58cae200d188fa56f60f5e78',
         bikeSizeName: 'new size for you',
         __v: 0,
         bikeID: [Object] } ],
    createdOn: '2017-03-16T19:05:36.743Z' }
```
## PUT: /api/profile/:id
Required data:
  - Provide an id and update properties on a user profile. Returned will be the updated profile object:
```
  { _id: '58cae47911c05657461beb86',
  name: 'Mr. Updated Name',
  gender: 'female',
  photo: 'doje.png',
  userID: '58cae47911c05657461beb85',
  __v: 0,
  geoID: [],
  createdOn: '2017-03-16T19:16:09.253Z' }
```

## DELETE: /api/profile/:id
Required data:
  - Provide an id and receive a status code of 204 in return.

## POST: /api/bike/:bikeID/geometry
Required data:
  - Provide a bikeID to save a bike geometry to the database and receive confirmation:
```
{ __v: 0,
  bikeSizeName: 'test size',
  topTubeLength: 52,
  _id: '58cad65164b684551c2a39e1',
  bikeID: [ '58cad65064b684551c2a39e0' ] }
```

## GET /api/bike/:bikeID
Required data:
  - Provide a bike ID and receive an object:
```
  { _id: '58cad308d70f5054a910c306',
    bikeName: 'sample name',
    category: 'sample category',
    photoKey: 'photodest.jpg',
    photoURI: 'photodest.jpg',
    mfrID: '58cad308d70f5054a910c305',
    __v: 0,
    created: '2017-03-16T18:01:44.456Z' }
```

## POST: /api/mfr/:mfrID/bike
Required data:
  - Provide a manufacturer ID with bike details and receive an object with those details:
```
{ __v: 0,
  bikeName: 'sample name',
  category: 'sample category',
  photoKey: 'bb12a98d4c559806581c3d2bf66848c3.jpg',
  photoURI: 'https://fttic.s3.amazonaws.com/bc3.jpg',
  mfrID: '58cad46d60fedf54d07f7fc0',
  _id: '58cad46d60fedf54d07f7fc1',
  created: '2017-03-16T18:07:41.876Z' }
```

## GET: /api/geo/?height=&inseam=
Required data:
  - Provide your height and inseam in the query string to receive a list of bikes fit for you:
```
  { topTube: 52,
  geo:
   [ { _id: '58cad7044711ad553cf0e255',
       bikeSizeName: 'test size',
       topTubeLength: 52,
       __v: 0,
       bikeID: [Object] } ] }
```

## PUT: /api/geo/:geoID
Required data:
  - Passing a geometry ID will return an object:
```
  { _id: '58cad7b0ec3e58555cb8b681',
  bikeSizeName: 'updated name',
  topTubeLength: 52,
  __v: 0,
  bikeID:
   [ '58cad7afec3e58555cb8b67b',
     '58cad7afec3e58555cb8b67c',
     '58cad7b0ec3e58555cb8b680' ] }
```

## POST: /api/mfr
Required data:
  - Name and website will return a new Mfr object:
```
  { __v: 0,
    name: 'test brand',
    website: 'www.testerbrand.com',
    _id: '58cadb6554a4a655c10c8ba0' }
```
## PUT: /api/mfr/:id
Required data:
  - Manufacturer's ID will return:
  ```
  { _id: '58cb22f463c6155c777fd0d7',
  name: 'updated name',
  website: 'www.testeroooo.com',
  __v: 0 }
  ```

## GET: /api/mfr/:id
Required data:
   - Manufacturer's ID will return information about that mfr:
```
   { _id: '58cadcdeed15e355e2bb053b',
  name: 'test brand',
  website: 'www.testerbrand.com',
  __v: 0 }
```
## DELETE: /api/mfr/:id
Required data: mfr id
  - Returns a status code of 204.

### Testing
mocha test runner
chai(expect)
bluebird promise library
eslint

### Continuous integration

travis-cl integrated in this project.

### Code Coverage

coveralls.io linked through gitHub.
