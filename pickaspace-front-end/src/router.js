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
import StripeOnBoarding from './views/StripeOnBoarding.vue';
import UserManageCarParks from './views/UserManageCarParks.vue';
import UserEditCarPark from '@/views/UserEditCarPark.vue';
import AdminManageCarParks from './views/AdminManageCarParks.vue';
import AdminEditCarPark from './views/AdminEditCarPark.vue';
import { verifyStripeOnboarding } from '@/services/paymentService';
import UserManagePayouts from './views/UserManagePayouts.vue';
import AdminManageUsers from './views/AdminManageUsers.vue';

const routes = [
  { path: '/register', name: 'UserRegister', component: UserRegister },
  { path: '/login', name: 'UserLogin', component: UserLogin },
  {
    path: '/dashboard',
    name: 'CarParkDashboard',
    component: CarParkDashboard,
    meta: { requiresAuth: true } // Requires authentication
  },

  {
    path: '/create-carpark',
    name: 'UserCreateCarPark',
    component: UserCreateCarPark,
    meta: { requiresAuth: true, requiresOnboarding: true } // Requires authentication and Stripe onboarding
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
  {
    path: '/user/carparks',
    name: 'UserManageCarParks',
    component: UserManageCarParks,
    meta: { requiresAuth: true, requiresOnboarding: true } 
  },
  {
    path: '/edit-carpark/:carparkId',
    name: 'EditCarPark',
    component: UserEditCarPark,
    meta: { requiresAuth: true, requiresOnboarding: true } 
  },

  {
    path: '/user/earnings',
    name: 'ManagePayouts',
    component: UserManagePayouts,
    meta: { requiresAuth: true, requiresOnboarding: true }
  },

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
    path: '/admin/carparks',
    name: 'AdminManageCarParks',
    component: AdminManageCarParks,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  {
    path: '/admin/edit-carpark/:carparkId',
    name: 'AdminEditCarPark',
    component: AdminEditCarPark,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    props: true,
    meta: { requiresAuth: false }
  },

  {
    path: '/onboarding',
    name: 'StripeOnBoarding',
    component: StripeOnBoarding,
    meta: { requiresAuth: true }
  },

  {
    path: '/admin/users',
    name: 'AdminManageUsers',
    component: AdminManageUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Global beforeEach guard to check for routes requiring authentication
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // No token found and route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
      console.log('No token found, redirecting to login');
      return next({ name: 'UserLogin' });
    }
    // Proceed if no authentication is required
    return next();
  }

  try {
    const decoded = jwtDecode(token);
    console.log('Decoded token:', decoded);

    // Check if token has expired
    if (Date.now() / 1000 > decoded.exp) {
      console.log('Token has expired, redirecting to login');
      localStorage.removeItem('token');
      return next({ name: 'UserLogin' });
    }

    // Handle routes that require Stripe onboarding
    if (to.matched.some(record => record.meta.requiresOnboarding)) {
      const userStripeAccountId = decoded.stripeAccountId;
      if (!userStripeAccountId) {
        console.log('Stripe account ID not found in token, redirecting to onboarding');
        return next({ name: 'StripeOnBoarding' });
      }
      
      const isOnboarded = await verifyStripeOnboarding(userStripeAccountId);
      if (!isOnboarded) {
        console.log('Stripe onboarding incomplete, redirecting to onboarding page');
        return next({ name: 'StripeOnBoarding' });
      }
    }

    // Proceed to the route if all checks pass
    console.log('All checks passed, proceeding to route');
    next();
  } catch (error) {
    console.error("Error with token or during onboarding check:", error);
    localStorage.removeItem('token');
    next({ name: 'UserLogin' });
  }
});


export default router;