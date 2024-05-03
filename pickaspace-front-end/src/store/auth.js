// src/store/auth.js
import { jwtDecode } from 'jwt-decode';

export default {
  state: {
    user: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
  },
  actions: {
    loginUser({ commit }, token) {
      const decodedToken = jwtDecode(token);
      const user = {
        userId: decodedToken.userId,
        role: decodedToken.role,
      };
      commit('setUser', user);
    },
  },
};