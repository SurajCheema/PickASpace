// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import UserRegister from './views/UserRegister.vue';
import UserLogin from './views/UserLogin.vue';
import CarParkDashboard from './views/CarParkDashboard.vue';
import UserCreateCarPark from './views/UserCreateCarPark.vue';
import BayBooking from './views/BayBooking.vue';
import HomeView from './views/HomeView.vue';
import UserDashboard from './views/UserDashboard.vue';
import UserProfile from './views/UserProfile.vue';
import UserBookingLogs from './views/UserBookingLogs.vue';
import UserPaymentLogs from './views/UserPaymentLogs.vue';
import AdminDashboard from './views/AdminDashboard.vue';
import AdminRefundManagement from './views/AdminRefundManagement.vue';
import RequestPasswordReset from './views/RequestPasswordReset.vue';
import ResetPassword from './views/ResetPassword.vue'; 

const routes = [
  { path: '/register', name: 'UserRegister', component: UserRegister },
  { path: '/login', name: 'UserLogin', component: UserLogin },
  {
    path: '/carparks',
    name: 'CarParkDashboard',
    component: CarParkDashboard,
    meta: { requiresAuth: true } // Requires authentication
  },
  {
    path: '/create-carpark',
    name: 'UserCreateCarPark',
    component: UserCreateCarPark,
    meta: { requiresAuth: true } // Requires authentication
  },
  {
    path: '/booking/:carparkId',
    name: 'BayBooking',
    component: BayBooking,
    props: true,
    meta: { requiresAuth: true } // Requires authentication
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  // User settings routes
  { path: '/user/profile', name: 'UserProfile', component: UserProfile, meta: { requiresAuth: true } },
  { path: '/user/bookings', name: 'UserBookingLogs', component: UserBookingLogs, meta: { requiresAuth: true } },
  { path: '/user/payments', name: 'UserPaymentLogs', component: UserPaymentLogs, meta: { requiresAuth: true } },
  { path: '/user/dashboard', name: 'UserDashboard', component: UserDashboard, meta: { requiresAuth: true } },
  { path: '/user/requestpasswordreset', name: 'RequestPasswordReset', component: RequestPasswordReset, meta: { requiresAuth: false } },

  // Admin routes
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/refunds',
    name: 'AdminRefundManagement',
    component: AdminRefundManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    props: true, 
    meta: { requiresAuth: false }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global beforeEach guard to check for routes requiring authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  console.log('Token:', token); // Log the token

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      console.log('No token found, redirecting to login'); // Log the redirection
      next({ name: 'UserLogin' });
    } else {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded); // Log the decoded token

        const currentTime = Date.now() / 1000; // Convert current time to seconds

        if (decoded.exp < currentTime) {
          console.log('Token has expired, redirecting to login'); // Log the expiration
          localStorage.removeItem('token');
          next({ name: 'UserLogin' });
        } else if (to.matched.some(record => record.meta.requiresAdmin) && decoded.role !== 'admin') {
          console.log('Non-admin user, redirecting to home'); // Log the role mismatch
          next({ name: 'Home' }); // Redirect non-admin users to home
        } else {
          console.log('Token valid, proceeding to route'); // Log the successful authorization
          next(); // Proceed if role matches
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem('token');
        next({ name: 'UserLogin' });
      }
    }
  } else {
    console.log('No authentication required, proceeding to route'); // Log the route without authentication
    next(); // Proceed if no auth required
  }
});

export default router;