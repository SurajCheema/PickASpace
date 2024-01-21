# PickASpace 

## Information about this repository

This is the repository that you are going to use **individually** for developing your project. Please use the resources provided in the module to learn about **plagiarism** and how plagiarism awareness can foster your learning.

Regarding the use of this repository, once a feature (or part of it) is developed and **working** or parts of your system are integrated and **working**, define a commit and push it to the remote repository. You may find yourself making a commit after a productive hour of work (or even after 20 minutes!), for example. Choose commit message wisely and be concise.

Please choose the structure of the contents of this repository that suits the needs of your project but do indicate in this file where the main software artefacts are located.


# PickASpace - Car Parking Web Application

## Description

PickASpace is a car parking web application developed using Node.js, Vue.js, Express, Sequelize, JavaScript, and PostgreSQL. It is designed to manage and streamline the process of car parking for students.

## Initial Setup

To get the project running after cloning, follow these steps:

### Prerequisites

Ensure you have the following installed:

- Node.js (visit [Node.js Download](https://nodejs.org/en/download/))
- PostgreSQL (visit [PostgreSQL Downloads](https://www.postgresql.org/download/))

### Installation

1. **Clone the Repository**:
git clone https://campus.cs.le.ac.uk/gitlab/ug_project/23-24/ssc26.git
cd ssc26


2. **Install Dependencies**:
Navigate to the project directory and install the necessary packages:
npm install


3. **Database Setup**:
- Create a PostgreSQL database in pAdmin named `PICKASPACEdb`.
- Update the `config/config.json` file with your database credentials.
- Run the database migrations:
  ```
  npx sequelize-cli db:migrate
  ```

4. **Start the Application**:
- To run the backend server:
  ```
  node server.js
  ```
- To run the Vue.js frontend (in a separate terminal):
  ```
  cd pickaspace-frontend
  npm run serve
  ```

5. **Access the Application**:
- The application should now be running at `http://localhost:3000` (backend) and `http://localhost:8080` (frontend).

## Additional Notes

- The `node_modules` directory and other configurations are excluded from the repository for efficiency and are generated during the installation process.

