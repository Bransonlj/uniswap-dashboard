# Uniswap Dashboard

## Table of Contents
- [Running the Application](#running-the-application)
- [Introduction](#introduction)
- [Frontend](#frontend)
- [Backend](#backend)
- [API](#api)

## Running the Application
There are 2 ways to run the application: with Docker or locally.

### Run with Docker

* Navigate to the root folder (containing the `docker-compose.yaml` file)
* Run the command
```
docker-compose up
```
* Front end url will be: http://localhost:8080/

### Run Locally

* Ensure you have a MongoDB local server installed.
* Run the backend server with the following commands
```
cd backend
npm install
npm run dev
```
* In a separate terminal, run the react application with the following commands
```
cd frontend
npm install
npm run dev
```
* Front end url will be: http://localhost:8080/

## Introduction
This application provides a Dashboard for tracking transactions within the Uniswap V3 USDC/ETH pool. 

The Frontend is a single-page application with a query form that allows users to search for transactions based on specific time ranges. It displays the requested transactions in a table and defaults to showing live transaction data if no query filter is applied.

The backend server monitors and records live transactions the moment each transaction is confirmed on the blockchain. This system is designed to support both real-time data recording and the processing of historical batch data requests, providing RESTful APIs for both types of requests.

## Frontend

I used React.js for the Frontend as it is a popular frontend library that is Component-Based, which promotes reusability and modularity, making it easier to maintain and add functionality to the application. I used Tailwind CSS as it allows for quick styling of components, saving development time.

### QueryForm Component

The QueryForm component handles the user input of search filters for the transactions, and then fetches the transactions from the API. If no filters are set, the component will fetch the live transaction data from the API.

Currently, the live transaction data does not automatically fetch new data from the API, and the user will have to manually press the `Refresh` button to query the API for new live data. This design was chosen due to simplicity, however some other techniques that could have been used are:

* Socket: connection between Backend Server and Client, server will emit an event everytime it receives new live transaction data. 

* Polling: client will continuously request for new live transaction data from the server every X interval.

The `Summary` Component similarly displays the live price for ETH/USDT but does not automatically update by fetching new data from API. The similar methods mentioned above can also be used to keep this data fresh.

### Testing

Unit tests for Components and Services were written with `Jest` and `React Testing Library`. To run the tests, navigate to the frontend folder and run `npm install` then `npm test`.

## Backend

The backend server uses a monolithic architecture built with Node.js using Express. It provides RESTful API for fetching live transaction data, historical transaction data, price data etc. MongoDB was used as the database for saving transaction data as it is fast to setup and use.

### Architecture

A monolithic architecture was chosen due to its simplicity and speed of implementation. Some limitations of this is inefficient scaling as whole application has to be replicated to scale with demand, rather than just specific parts of the application. Components are also more tightly coupled, making it harder to modify or replace individual components without affecting the whole application.

An alternative could be to use a microservice architecutre, with different services for recording live data, fetching historical batch data, connecting with client to transmit live data etc. A microservice architecture would alleviate many of these limitations.

### Recording Live Transaction Data

In order to record live transaction data, upon startup, the server will query the Etherscan API at regular intervals for transaction data between the time of last query and current time. It will then process the data (eg. calculate USDT fee) and save it in the database.

If the server goes offline, once it comes back online, it will continue querying from where it last stopped by checking the database for the most recent transaction timestamp, and continue querying from there. 

The limitation for this project is since there is alot of transaction data coming from the API, so if this server goes offline for too long, the amount of data from the most recent transaction recorded and to when the server starts again may be too large to query from the API effectively (100s of pages long). Therefore for this project, I chose to set the max time limit the server queries from when it starts to an arbitrary 5 minutes before.

### Testing

Unit tests for the Controller and Services were written with `Jest`. To run the tests, navigate to the backend folder and run `npm install` then `npm test`.

## API

Click to [View API Documentation](docs/apidoc.md).
