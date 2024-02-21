// Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Create new car park
export const createCarPark = async (carParkData) => {
  // Complete endpoint URL
  const url = `${API_BASE_URL}/create-carpark`;
  try {
    // Retrieve the stored token
    const token = localStorage.getItem('token'); 
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include the token in the Authorization header
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(carParkData),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating car park:', error);
    throw error;
  }
};

// Fetch car parks from backend
export const fetchCarParks = async (searchParams = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/carparks?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch car parks');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching car parks:', error);
    throw error;
  }
};

export const fetchCarParkBays = async (carparkId) => {
  const url = `${API_BASE_URL}/carparks/${carparkId}/bays`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, 
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch bays');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching bays:', error);
    throw error;
  }
};

// Fetch details of a specific carpark by its ID
export const fetchCarParkDetails = async (carparkId) => {
  const url = `${API_BASE_URL}/carparks/${carparkId}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch carpark details');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching carpark details:', error);
    throw error;
  }
};

// Book a bay from a carpark
export const bookBay = async (bayId, carparkId, startTime, endTime, calculatedCost) => {
  const url = `${API_BASE_URL}/book-bay`;
  const token = localStorage.getItem('token');
  const bookingData = {
      bay_id: bayId,
      carpark_id: carparkId,
      startTime,
      endTime,
      cost: calculatedCost
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
          throw new Error('Failed to book the bay');
      }

      return await response.json();
  } catch (error) {
      console.error('Error booking the bay:', error);
      throw error;
  }
};
