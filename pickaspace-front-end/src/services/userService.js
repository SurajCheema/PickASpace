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
  const data = await response.json();
  console.log("Fetched user details:", data); // Add this line to log fetched details
  return data;
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

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${API_URL}/request-password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error sending reset link');
  }

  return response.json();
};

export const updatePassword = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/update-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log(errorText);
    throw new Error(JSON.parse(errorText).error || 'Failed to update password');
  }

  return response.json();
};

export const checkNewPassword = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/api/check-new-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error === 'Password matches current password') {
      throw new Error('New password cannot be the same as the current password');
    } else {
      throw new Error(errorData.error || 'Failed to validate new password');
    }
  }

  return response.json();
};
