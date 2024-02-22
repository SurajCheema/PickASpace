<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a id="brand-name" class="navbar-brand" href="#">PickASpace</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul id="menu-options" class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="create-carpark">Rent out your space</a>
        </li>
        <li class="nav-item" v-if="isLoggedIn">
          <a class="nav-link" href="dashboard">Dashboard</a>
        </li>
        <li class="nav-item" v-if="!isLoggedIn">
          <a class="nav-link" href="login">Login</a>
        </li>
        <li class="nav-item" v-if="!isLoggedIn">
          <a class="nav-link" href="register">Register</a>
        </li>
        <li class="nav-item" v-if="isLoggedIn">
          <a class="nav-link" href="login" @click.prevent="logout">Logout</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavbarComponent',
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      // Additional logout logic here
      this.$router.push('/login');
      alert('You have been logged out successfully.');
    }
  }
}
</script>

<style>
#brand-name{
  padding-left: 1.5em;
}
#menu-options{
  padding-right: 1.5em;
}
</style>
