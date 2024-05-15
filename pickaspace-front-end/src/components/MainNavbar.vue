<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <div class="content-container">
        <router-link id="brand-name" class="navbar-brand" to="/">
          <img src="../assets/logo.jpg" alt="PickASpace Logo" class="navbar-logo"> <!-- Logo image added here -->
          <span class="blue">PickASpace</span>
        </router-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul id="menu-options" class="navbar-nav ms-auto">
            <li class="nav-item" v-if="isLoggedIn">
              <router-link class="nav-link" to="/create-carpark">Rent out your space</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <router-link class="nav-link" to="/dashboard">Search Carpark</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <router-link class="nav-link" to="/user/dashboard">Profile</router-link>
            </li>
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li class="nav-item" v-if="!isLoggedIn">
              <router-link class="nav-link" to="/register">Register</router-link>
            </li>
            <li class="nav-item" v-if="isLoggedIn">
              <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>


<script>
import { eventBus } from '../eventBus.js';

export default {
  name: 'MainNavbar',
  data() {
    return {
      isLoggedIn: false,
    };
  },
  created() {
    this.checkLogin();
    eventBus.on('login', () => {
      this.isLoggedIn = true;
    });
    eventBus.on('logout', () => {
      this.isLoggedIn = false;
    });
  },
  methods: {
    checkLogin() {
      this.isLoggedIn = !!localStorage.getItem('token');
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
      eventBus.emit('logout');
    }
  }
}
</script>

<style>
#brand-name {
  padding-left: 1.5em;
}

#menu-options {
  padding-right: 1.5em;
}

.navbar {
  background-color: #6495ed; /* Darker shade of blue */
  width: 100%; /* Navbar takes full width */
}

.navbar-logo {
  height: 40px; /* Adjust the height to fit the navbar */
  width: auto; /* Maintain aspect ratio */
  margin-right: 10px; /* Space between logo and brand name */
}


.container-fluid {
  width: 100%; /* Ensure the container-fluid takes full width */
}

.content-container {
  width: 60%; /* Limit content width to 60% */
  margin: 0 auto; /* Center the content horizontally */
  display: flex;
  align-items: center;
  flex-grow: 1;
}

@media (max-width: 992px) {
  .content-container {
    width: 100%; /* Full width on smaller screens */
    flex-direction: column; /* Stack items vertically on smaller screens */
  }
}
</style>

