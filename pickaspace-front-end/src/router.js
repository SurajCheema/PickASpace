// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import UserRegister from './views/UserRegister.vue'; 

const routes = [
  {
    path: '/register',
    name: 'UserRegister',
    component: UserRegister
  },  
  {
    path: '/login',
    name: 'UserLogin',
    component: UserLogin
  }, 
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
