<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <div class="content-container">
        <router-link id="brand-name" class="navbar-brand" to="/">
          <img src="../assets/logo.jpg" alt="PickASpace Logo" class="navbar-logo">
          <span class="blue">PickASpace</span>
        </router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>a
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
            <li class="nav-item" v-if="isLoggedIn && isAdmin">
              <router-link class="nav-link" to="/admin/dashboard">Admin Dashboard</router-link>
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
import { jwtDecode } from 'jwt-decode';

export default {
  name: 'MainNavbar',
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false,
    };
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken = jwtDecode(token);
        this.isLoggedIn = true;
        this.isAdmin = decodedToken.role === 'admin';
      } else {
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
      eventBus.emit('logout');
      this.isLoggedIn = false;
      this.isAdmin = false;
    },
  },
  created() {
    this.checkLoginStatus();
    eventBus.on('login', () => {
      this.checkLoginStatus();
    });
    eventBus.on('logout', () => {
      this.isLoggedIn = false;
      this.isAdmin = false;
    });
  },
};
</script>

<style scoped>
#brand-name {
  padding-left: 1.5em;
  color: #6495ed;
  font-weight: bold;
  padding: 10px 20px;
  background-color: #fff;
  border-radius: 5px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
}

#brand-name:hover {
  transform: scale(1.05); /* Grow in size on hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add a subtle shadow on hover */
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

.nav-link {
  color: #fff;
  font-weight: bold;
  margin: 0 10px;
  padding: 10px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-link:hover {
  background-color: #ffffff;
  color: #6495ed;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-decoration: none;
}

/* Specific rule for logout link hover state */
.nav-link[href='#']:hover {
  background-color: #dc3545; /* Red background color */
  color: white; /* White text color */
}

.nav-item {
  margin: 0 5px;
}

.navbar-toggler {
  border: none;
}

.navbar-toggler:focus {
  outline: none;
}

@media (max-width: 992px) {
  .content-container {
    width: 100%; /* Full width on smaller screens */
    flex-direction: column; /* Stack items vertically on smaller screens */
  }

  .nav-link {
    margin: 5px 0;
    text-align: center;
    padding: 10px 15px;
  }

  #menu-options {
    padding-right: 0;
  }
}

@media (max-width: 992px) {
  .content-container {
    width: 100%;
    flex-direction: column;
  }

  .nav-link {
    margin: 5px 0;
    text-align: center;
    padding: 10px 15px;
  }

  #menu-options {
    padding-right: 0;
  }

  .navbar-collapse {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #6495ed;
    z-index: 999;
    padding: 10px;
  }

  .navbar-nav {
    flex-direction: column;
  }

  .navbar-toggler {
    position: absolute;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
  }
}

</style>
