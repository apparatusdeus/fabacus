## Description

An independent microservice written for Fabacus that is capable of seat reservation.

## Installation

```bash
$ npm install
```

## Running the app

### Docker

```bash
$ docker compose up --build --attach service
```

### Locally

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

## e2e tests
#$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Endpoints

### POST /events

#### Request
```
{
  "name": string,
  "numberOfSeats": number(min: 10, max: 1000)
}
```

#### Response
```
{
  "_id": string,
  "name": string,
  "numberOfSeats": number,
  "seats": string[],
  "reservations": {},
}
```

### GET /events

#### Response
```
[
  {
    "_id": string,
    "name": string,
    "numberOfSeats": number,
    "seats": string[],
    "reservations": {},
  }
]
```

### GET /events/:eventId

#### Response
```
{
  "_id": string,
  "name": string,
  "numberOfSeats": number,
  "seats": string[],
  "reservations": {},
}
```

### GET /events/:eventId/seats

Returns a list of unheld, unreserved seats

#### Response
```
string[]
```

### POST /events/:eventId/holds

Creates a hold on a seat for a user against an event for 60 seconds

#### Request
```
{
  "seatName": string,
  "userId": string
}
```

#### Response
If the seat was successfully reserved
```
boolean
```

### POST /events/:eventId/reservations

Creates a permanent reservation on a seat for a user against an event
Note: The user must already have a hold on the seat

#### Request
```
{
  "seatName": string,
  "userId": string
}
```

#### Response
If the seat was successfully reserved
```
boolean
```

## Notes
I added MongoDB into the mix as an actual data store. I know that Redis is capable of storing data long term, but it
isn't really designed for it. Equally I know that I could have accomplished an identical timed locking system using
DynamoDB but the specification specifically requested the inclusion of Redis.

I've provided a Docker compose file to make running the service easier.

I have put into place a foundation for unit tests, but I have not written any as the code is heavily reliant on both
Redis and MongoDB. I would have to mock both of these services in order to write tests, and I don't have the time to do
at the moment.

I've accepted that userId will be passed to the service directly and trusted be if this were a production service it
should be validating the origin of the request and ensuring that the userId is at minimum provided be a trusted source.

I had started writing endpoints to release holds and reservations but since Delete requests aren't normally suppose to
contain bodies and I'm not receiving the userId through a header or JWT it would have required some refactoring.
