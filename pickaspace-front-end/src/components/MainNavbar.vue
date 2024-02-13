<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="#">PickASpace</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <!-- Your navigation items here -->
      </ul>
      <ul class="navbar-nav">
        <li class="nav-item" v-if="isLoggedIn">
          <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
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
.navbar {
  margin-bottom: 100px; /* Adjustable, creates space between body and navbar */
}
</style>
