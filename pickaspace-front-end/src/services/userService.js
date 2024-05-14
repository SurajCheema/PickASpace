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
    const errorData = await response.json(); // Safely assuming the response is in JSON format
    throw new Error(errorData.message || 'Registration failed.');
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

// Fetch user details
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
  console.log("Fetched user details:", data); 
  return data;
};

export const getUserDetailsByAdmin = async (userId) => {
  const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch user details: ${response.statusText}`);
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

// Fetch all users (admin)
export const fetchAllUsers = async () => {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};

// Update user (admin)
export const updateUserByAdmin = async (userId, userData) => {
  const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  return response.json();
};

// Soft delete user (admin)
export const softDeleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to soft delete user');
  }
  return response.json();
};

// Force delete user (admin)
export const forceDeleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/api/admin/users/${userId}/force`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to force delete user');
  }
  return response.json();
};