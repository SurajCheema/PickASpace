# Instructions to Run the Vue.js Node.js Project

This guide will walk you through the steps to clone and run the Vue.js and Node.js project from the GitLab repository, as well as install and configure PostgreSQL, Sequelize, and pgAdmin 4.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js**: Download and install from [nodejs.org](https://nodejs.org/).
- **Git**: Download and install from [git-scm.com](https://git-scm.com/).
- **PostgreSQL**: Download and install from [postgresql.org](https://www.postgresql.org/download/).
- **pgAdmin 4**: Download and install from [pgadmin.org](https://www.pgadmin.org/download/).

## Step 1: Clone the Repository

First, clone the repository from GitLab to your local machine: 'https://campus.cs.le.ac.uk/gitlab/ug_project/23-24/ssc26.git`

```sh
git clone https://campus.cs.le.ac.uk/gitlab/ug_project/23-24/ssc26.git
```

Navigate to the project directory:

```sh
cd ssc26
```

## Step 2: Install Dependencies

Both the frontend (Vue.js) and backend (Node.js) parts of the project have their own dependencies. You need to install them separately.

### Install Backend Dependencies

Navigate to the backend directory and install the dependencies:

```sh
cd backend
npm install
```

### Install Frontend Dependencies

Navigate to the frontend directory and install the dependencies:

```sh
cd ../pickaspace-front-end
npm install
```

## Step 3: Configure PostgreSQL

### Install PostgreSQL

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/).
2. During installation, set a password for the `postgres` user.

### Configure PostgreSQL

1. Open `pgAdmin 4` from your applications.
2. Create a new database:
    - Right-click on "Servers" and select "Create" > "Server".
    - Name the server and configure the connection with the password you set during installation.
    - Create a new database by right-clicking on the server, selecting "Create" > "Database", and providing a name.

### Setup Sequelize

Sequelize is used for interacting with the PostgreSQL database. Navigate to the backend.

1. Ensure you have Sequelize CLI installed:

```sh
npm install -g sequelize-cli
```

2. Initialize Sequelize in your backend directory (main directory):

```sh
npx sequelize init
```

3. Configure the `config/config.json` file with your PostgreSQL database details. The `config/config.json` should look like this:

```json
{
  "development": {
    "username": "postgres",
    "password": "admin",
    "database": "PICKASPACEdb",
    "host": "localhost",
    "dialect": "postgres",
    "port": 5432,
    "timezone": "+00:00"
  }
}
```

Make sure you use the same configuration to run the project without any changes.

## Step 4: Confirm Environment Variables

Ensure you have the .env files available, in front end and backend. They should contain the API keys and email credentials. Do not change these.

## Step 5: Run Database Migrations

Run the Sequelize migrations to set up the database schema:

```sh
cd backend
npx sequelize db:migrate
```

## Step 6: Run Database Seeders

Run the Sequelize seeders to set up the database dummy data:

```sh
cd backend
npx sequelize-cli db:seed:all
```

## Step 7: Run the Backend Server

Navigate to the backend directory and start the server:

```sh
cd backend
node server.js
```

This will start the backend server on the specified port.

## Step 8: Run the Frontend Development Server

Navigate to the frontend directory and start the development server:

```sh
cd .\pickaspace-front-end\
npm run serve
```

This will start the frontend development server, and you can access the application in your web browser.

## Additional Notes

- **Backend Server**: Make sure the backend server is running before starting the frontend server, as the frontend will make API calls to the backend.
- **Port Configuration**: Ensure that the ports configured in the `.env` files do not conflict with other services running on your machine.

## Conclusion

By following these steps, you should be able to clone the repository and run the project successfully. If you encounter any issues, refer to the project's documentation or contact me by email at `ssc26@student.le.ac.uk`.