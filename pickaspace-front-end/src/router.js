// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import UserRegister from './views/UserRegister.vue'; 
import UserLogin from './views/UserLogin.vue'; 
import UserDashboard from './views/UserDashboard.vue';
import UserCreateCarPark from './views/UserCreateCarPark.vue';

const routes = [
  { path: '/register', name: 'UserRegister', component: UserRegister },
  { path: '/login', name: 'UserLogin', component: UserLogin },
  {
    path: '/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true } // Requires authentication
  },
  {
    path: '/create-carpark',
    name: 'UserCreateCarPark',
    component: UserCreateCarPark,
    meta: { requiresAuth: true } // Requires authentication
  },
]; 

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global beforeEach guard to check for routes requiring authentication
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Assuming 'token' is stored in localStorage when the user is logged in
    if (!localStorage.getItem('token')) {
      // User is not authenticated, redirect to login
      next({ name: 'UserLogin' });
    } else {
      // User is authenticated, proceed to route
      next();
    }
  } else {
    // Route does not require authentication, proceed as normal
    next();
  }
});

export default router;
