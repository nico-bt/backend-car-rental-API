## Description
Rest API for car rental app.

Brief comment on business logic:  
It doesn't align with calendar-based planning and/or combinatorial booking/logic of reservations/dates.  
It's designed to function in real-time within the office.  

Transactions are recorded based on the entry/exit of cars.  
When a car and a customer exit, both resources are flagged with a boolean (is_rented, is_renting) to disable them for future transactions until the ongoing transaction is completed, and then they are re-enabled.  

It's similar to the check-in/check-out process of items from a warehouse.

## Techs used
- Nest.js
- Prisma as ORM
- Cloud Postgres db in Supabase for the live version
- Local db instance with Docker to run locally and to run e2e tests

## Live deploys to see UI and interaction:
- Frontend: https://frontend-car-rental-ivory.vercel.app/
- API: https://car-rental-api.adaptable.app/api/clients

(Obs: The free tier goes to sleep after a while, and the first load may take a few seconds.)

## API docs and Endpoints
Full docs with body requests and responses. 
API Docs: https://car-rental-api.adaptable.app/docs

### API Endpoints:
Basic routes, for more info see the previous link
| Resource     | HTTP Method | Endpoint                       | Description                                |
|:------------:|-------------|--------------------------------|--------------------------------------------|
|     Cars     | POST        | /api/car                       | Create a new car                           |
|              | GET         | /api/car                       | Get a list of cars                         |
|              | GET         | /api/car/{id}                  | Get details of a specific car by ID        |
|              | PATCH       | /api/car/{id}                  | Update specific details of a car by ID     |
|              | DELETE      | /api/car/{id}                  | Delete a specific car by ID                |
|--------------|-------------|--------------------------------|--------------------------------------------|
|   Clients    | POST        | /api/clients                   | Create a new client                        |
|              | GET         | /api/clients                   | Get a list of clients                      |
|              | GET         | /api/clients/{id}              | Get details of a specific client by ID     |
|              | PATCH       | /api/clients/{id}              | Update specific details of a client by ID  |
|              | DELETE      | /api/clients/{id}              | Delete a specific client by ID             |
|--------------|-------------|--------------------------------|--------------------------------------------|
| Transactions | POST        | /api/transactions              | Create a new transaction                   |
|              | GET         | /api/transactions              | Get a list of all transactions             |
|              | GET         | /api/transactions?active=true  | Get a list of active transactions only                |
|              | GET         | /api/transactions/{id}         | Get details of a specific transaction by ID|
|              | PUT         | /api/transactions/{id}         | Replace a specific transaction by ID       |
|              | PATCH       | /api/transactions/{id}         | Finish a transaction and free the associated car and client|


## Running locally
```bash
# clone repo and install dependencies
$ git clone --single-branch --branch development https://github.com/nico-bt/backend-car-rental-API.git
$ npm install

# setup local DB - You need to have Docker installed on your pc
$ npm run prestart:dev

# run Nest app
$ npm run start:dev

# Once you finish, to put down container
$ docker compose down

```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
# First you need to start a test db - required Docker installed on yuor pc
$ npm run pretest:e2e
$ npm run test:e2e

```
