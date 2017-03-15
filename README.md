# fit-O-matic

[![Coverage Status](https://coveralls.io/repos/github/GLSea1979/fit-O-matic/badge.svg?branch=master)](https://coveralls.io/github/GLSea1979/fit-O-matic?branch=master)
[![Build Status](https://travis-ci.org/GLSea1979/fit-O-matic.svg?branch=staging)](https://travis-ci.org/GLSea1979/fit-O-matic)
# fit-O-matic RESTful API

### Overview

This RESTful API allows users to create an account, input basic measurments, and receive recommendations for bikes that will fit their personal morphology.

# Current Version: 0

# Architecture

### Summary

### Schema
 - User
    - User ID
    - Email address
    - password
    - Username
    - Admin Status
    - Token
 - User Profile
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

### Testing

mocha test runner
chai(expect)
bluebird Promise library
eslint

### Continuous integration

travis-cl i integrated in this project.

