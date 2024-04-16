# Transaction Validator with NestJS, TypeORM and PostgreSQL

This is a simple API that validates transactions. It is built using the NestJS framework and uses a PostgreSQL database to store the transactions. Admins are able to create custom denoms, and users are able to create transactions with the denoms created by the admins. The admins needs to approve the transaction before it is considered valid so balances can be updated accordingly for each user.

## Transaction Validator Flow

The application has a simple flow that allows users to create transactions with custom denoms created by admins. The flow is as follows:

1. **Admin creates a new denom:** The admin creates a new denom with a name and a value that represents the amount of the denom.

2. **User creates a new transaction:** The user creates a new transaction with an amount, a denom, and a receiver. The receiver is the user that will receive the transaction.

3. **Admin approves the transaction:** The admin approves the transaction, which updates the balances of the users accordingly.

4. **List all transactions:** The admin can list all transactions to see the status of each transaction.

5. **List all users:** The admin can list all users to see the balances of each user.

6. **List all denoms:** The admin can list all denoms to see the custom denoms created.

## Installation

First, you will need to have a PostgreSQL instance running on your local machine. You can download the installer from the [official website](https://www.postgresql.org/download/). Or simple run the following command to run a local Postgres with Docker:

```bash
$ npm run infra:db:setup
```

This will create a new PostgreSQL container with the following credentials:

- **Username:** `validator`
- **Password:** `validator`
- **Database:** `validator`

### Application Setup
After that, you can create a new `.env` file in the root of the project by copying the `.env.example` file and updating the values accordingly.

For local development, the `.env` does not need to be updated. The default values are already set to the values used by the Docker container.

Then, you can install the dependencies by running the following command:

```bash
$ npm install
```

### Seeding the Database (Local Development Only)

To seed the database with some initial data, you can run the following command:

```bash
$ npm run seed
```

This will create a new admin user and two regular users with the following credentials:

- **Admin User**
  - **Username:** `admin`
  - **Password:** `passadmin`
- **Regular User 1**
  - **Username:** `john`
  - **Password:** `passjohn`
- **Regular User 2**
  - **Username:** `kelly`
  - **Password:** `passkelly`

## Running the app

After the database has been set up and the dependencies have been installed, you can run the application using the following command:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

The application will be running on `http://localhost:3000` by default.


# API Documentation

The API has several endpoints that can be accessed by users and admins. The endpoints are protected by guards to ensure that only authorized users can access them. The API has the following endpoints:

### Authentication

API endpoints that require authentication are protected using JWT tokens. To access these endpoints, you will need to sign up and log in to get a JWT token. The token should be passed in the `Authorization` header of the request with the value `Bearer <token>`.

- ***Sign up a new user***:
  - **POST /auth/signup**
    - Body parameters: username, password, isAdmin (boolean)
- ***Log in a user***:
  - **POST /auth/login**
    - Body parameters: username, password

***NOTE: The `isAdmin` parameter is used to determine if the user is an admin or not, and it is set to `false` by default. This was provide only for testing purposes. On a real application, the `isAdmin` parameter should not be exposed to the client.***

For all the Admin Only endpoints, you will need to sign up as an admin user by setting the `isAdmin` parameter to `true` when signing up.

### Denoms CRUD Operations (Admin Only)

A denom is a custom currency that can be created by an admin. Denoms have a name and a value that represents the amount of the denom.

- ***Create a new denom***:
  - **POST /denoms**
    - Body:
      ```json
      {
        "ticker": "USD"
      }
      ```
- ***List all denoms***:
  - **GET /denoms**
- ***Delete a denom by ID***:
  - **DELETE /denoms/:id**

### Users Management Operations (Admin Only)

- ***List all users***:
  - **GET /users**
- ***Remove a user by ID***:
  - **DELETE /users/:id**

### Transactions Operations (Admin Only)

- ***List all transactions***:
  - **GET /transactions**
- ***Approve a transaction by ID***:
  - **POST /transactions/validate/:id**
    - Body:
      ```json
      {
        "status": "approved" | "rejected"
      }
      ```

***Once a transaction has been approved, the balances of the users will be updated accordingly.***

### Transactions Operations (User Only)

- ***Create a new transaction***:
  - **POST /transactions**
    - Body:
      ```json
      {
        "amount": 500,
        "denomId": 1,
        "receiverId": 3
      }
      ```

## Test

Before running the tests, you will need to manually create the `e2e_test` database in your local PostgreSQL instance. The database can be created by running the following command:

```sql
CREATE DATABASE e2e_test;
```

Then you can run the tests using the following command:

```bash
# e2e tests
$ npm run test:e2e
```

A pretest and posttest script has been added to the package.json file to run the test script before and after the test:e2e script for seeding the `e2e_test` database with test data and then resetting the database after the tests have been run.

If you need to manually reset the e2e_test database, just execute the followijng command:

```bash
$ npm run posttest:e2e
```

## Contributing and Code Guidelines

When adding new features and endpoint to the API, there are several guidelines that is encouraged to be followed in order to maintain the codebase clean and consistent. The guidelines are as follows:

### Guards and Decorators

All endpoints are protected by guards to ensure that only authorized users can access them. The following guards are used in the application:

- **AdminGuard:** This guard is used to protect routes that only admins should have access to. It checks if the user is an admin by checking the `isAdmin` property of the user object in the request object.

  Use the `@Admin()` decorator to protect routes that only admins should have access to.

- **@Public()** decorator: This decorator is used to mark routes that are public and do not require authentication. This is useful for routes like the login route, where users need to be able to access it without being authenticated.

  Use the `@Public()` decorator to mark routes that are public and do not require authentication.

- **@UserReq()** decorator: This decorator is used to get the user object from the request object. This is useful for routes that require the user object to be passed to the controller method.

Example of using the decorators and guards:

```typescript
@Post()
  async createTransaction(
    @UserReq() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    ...
  }
```
