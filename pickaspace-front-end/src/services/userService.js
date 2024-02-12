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
  return data;
};
  
// Save token to localStorage
export const saveAuthToken = (token) => {
  localStorage.setItem('token', token);
};
