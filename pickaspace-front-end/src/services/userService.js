// userService.js
const API_URL = 'http://localhost:3000';

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
