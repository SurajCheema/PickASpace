// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import UserRegister from './views/UserRegister.vue'; 
import UserLogin from './views/UserLogin.vue'; 
import UserDashboard from './views/UserDashboard.vue';

const routes = [
    { path: '/register', name: 'UserRegister', component: UserRegister },
    { path: '/login', name: 'UserLogin', component: UserLogin },
    { path: '/dashboard', name: 'UserDashboard', component: UserDashboard },
  ]; 

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
