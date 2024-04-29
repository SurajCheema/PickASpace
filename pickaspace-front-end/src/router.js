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
  { path: '/user/dashboard', name: 'UserDashboard', component: UserDashboard, meta: { requiresAuth: true } }

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
  // Check if the route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Assuming 'token' is stored in localStorage when the user is logged in
    if (!localStorage.getItem('token')) {
      // User is not authenticated, redirect to login
      next({ name: 'UserLogin' });
    } else {
      if (to.matched.some(record => record.meta.requiresAdmin) && localStorage.getItem('role') !== 'admin') {
        // Redirect non-admin users trying to access admin pages
        next({ name: 'UserDashboard' });    }
  } else {
    // Route does not require authentication, proceed as normal
    next();
  }
});

export default router;
