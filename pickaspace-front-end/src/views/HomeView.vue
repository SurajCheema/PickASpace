<template>
  <div class="container mt-5">
    <!-- Bootstrap Row for Grid Layout -->
    <div class="row">
      <!-- Left Column: Text Content -->
      <div class="col-md-6">
        <h1 class="text-center mb-3 blue">PickASpace</h1>
        <h2 class="text-center text-muted mb-5 blue">Smart, Stress-Free City Parking</h2>
        <p class="lead text-center mb-5">
          Welcome to PickASpace, the innovative car parking app currently under development. Our mission is to make urban
          parking not just easier, but smarter. With PickASpace, you'll be able to find and secure parking spaces with
          unprecedented ease and efficiency.
        </p>
        <div class="d-flex justify-content-center gap-2">
          <router-link to="/login" class="btn btn-primary btn-wide">Login</router-link>
          <router-link to="/register" class="btn btn-secondary btn-wide">Register</router-link>
        </div>
      </div>

      <!-- Right Column: Image -->
      <div class="col-md-6 d-flex align-items-center justify-content-center">
        <img src="../assets/images/frontpage.jpg" alt="Frontend Image" style="width: 40vw; height: 80vh; object-fit: cover;" class="rounded shadow">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
};
</script>

<style scoped>
h1 {
  padding-top: 5vw;
}

.blue {
  color: blue;
}

.btn-wide {
  width: 150px; /* Set the desired width */
  text-align: center; /* Center the text */
}

.d-flex .gap-2 > * {
  flex: 1 1 auto; /* Ensure buttons have equal width and spacing */
}

.container{
  padding-bottom: 50px;
}
</style>
