// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import UserRegister from './views/UserRegister.vue'; 
import UserLogin from './views/UserLogin.vue'; 
import UserDashboard from './views/UserDashboard.vue';
import UserCreateCarPark from './views/UserCreateCarPark.vue';

const routes = [
    { path: '/register', name: 'UserRegister', component: UserRegister },
    { path: '/login', name: 'UserLogin', component: UserLogin },
    { path: '/dashboard', name: 'UserDashboard', component: UserDashboard },
    { path: '/create-carpark', name: 'UserCreateCarPark', component: UserCreateCarPark },
  ]; 

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
