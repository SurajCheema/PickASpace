// Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};


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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create car park. Please try again later.');
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
export const bookBay = async (bookingData) => {
  const url = `${API_BASE_URL}/book-bay`;
  const token = localStorage.getItem('token');

  console.log("Booking data being sent:", bookingData);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bay_id: bookingData.bayId,
        carpark_id: bookingData.carparkId,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        cost: bookingData.cost,
        stripeToken: bookingData.stripeToken  // Include the Stripe token in the request body
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to book the bay');
    }

    return await response.json();
  } catch (error) {
    console.error('Error booking the bay:', error);
    throw error;
  }
};

export const fetchBayAvailability = async (bayId, startTime, endTime) => {
  const url = `${API_BASE_URL}/bays/${bayId}/availability?startTime=${startTime}&endTime=${endTime}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch bay availability: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch Bay Availability Error:', error);
    throw error;  // Re-throw to be handled or alerted in the calling method
  }
};

// Fetch booking logs for a user
export const fetchUserBookings = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/user/bookings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  const data = await response.json();
  console.log(data);
  return data;
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/cancel-booking/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();  // Parse the response as JSON if it's successful
    } else {
      const errorText = await response.text();  // Get the error message as plain text
      throw new Error(errorText || 'Failed to cancel booking');
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;  // Rethrowing the error to be handled by the caller
  }
};

// Fetch a single booking log by ID
export const fetchBookingById = async (log_id) => {
  console.log('Fetching booking with ID:', log_id);
  console.log('Type of log_id:', typeof log_id);
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/user/bookings/${log_id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch booking details');
  }
  const data = await response.json();
  console.log('Fetched booking:', data);
  return data;
};

// Update a carpark with new details and bays
export const updateCarPark = async (carparkId, carParkData) => {
  const url = `${API_BASE_URL}/carparks/${carparkId}`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(carParkData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update car park. Please try again later.');
    }
    const updatedData = await response.json();
    console.log('Car park updated successfully:', updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error updating car park:', error);
    throw error;
  }
};