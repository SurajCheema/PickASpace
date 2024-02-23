<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a id="brand-name" class="navbar-brand" href="#">PickASpace</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul id="menu-options" class="navbar-nav ms-auto">
        <li class="nav-item" v-if="isLoggedIn">
          <router-link class="nav-link" to="/create-carpark">Rent out your space</router-link>
        </li>
        <li class="nav-item" v-if="isLoggedIn">
          <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
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
</style>