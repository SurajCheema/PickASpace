import { eventBus } from '../eventBus'; 
import store from '../store';

const API_URL = 'http://localhost:3000';

// Register
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Server error');
  }
  return response.json();
};

// Login
export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  saveAuthToken(data.token);
  store.dispatch('loginUser', data.token); 
  eventBus.emit('login');
  return data;
};
  
// Save token to localStorage
export const saveAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const updateUser = async (userData) => {
  const response = await fetch(`${API_URL}/api/update-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Server error during profile update');
  }
  return response.json();
};

// Get user details
export const getUserDetails = async () => {
  const response = await fetch(`${API_URL}/user-details`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }
  return response.json();
};

export const updateUserDetails = async (userData) => {
  console.log("Updating user with data:", userData);
  const response = await fetch(`${API_URL}/api/update-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Failed to update user details');
  }
  return response.json();
};
