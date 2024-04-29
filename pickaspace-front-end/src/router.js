// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
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
import AdminRefundRequests from './views/AdminRefundRequests.vue';
import jwt_decode from 'jwt-decode';

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

  // Admin routes
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/refunds',
    name: 'AdminRefundRequests',
    component: AdminRefundRequests,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global beforeEach guard to check for routes requiring authentication
router.beforeEach((to, from, next) => {
  // Retrieve the JWT from local storage
  const token = localStorage.getItem('token');

  // Check if the current route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    // If the route requires authentication and no token is present,
    // redirect the user to the login page
    next({ name: 'UserLogin' });
  } else if (token) {
    // If a token is found, decode it to get user details such as the role
    const decoded = jwt_decode(token);

    // Check if the current route requires admin access and if the user is not an admin
    if (to.matched.some(record => record.meta.requiresAdmin) && decoded.role !== 'admin') {
      // Redirect non-admin users trying to access admin-only pages to the user dashboard
      next({ name: 'UserDashboard' });
    } else {
      // Proceed to the next middleware or route if role matches or no specific role is required
      next();
    }
  } else {
    // If the route does not require authentication, proceed as normal
    next();
  }
});

export default router;
