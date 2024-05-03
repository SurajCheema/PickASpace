// src/store/index.js
import { createStore } from 'vuex';
import auth from './auth';

export default createStore({
  modules: {
    auth,
    // other modules...
  },
  // other store options...
});