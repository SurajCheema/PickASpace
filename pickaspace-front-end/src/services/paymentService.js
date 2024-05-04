const API_BASE_URL = 'http://localhost:3000/api';

// Fetch payments from backend
export const fetchPayments = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/user/payments?include=refund`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }
    const payments = await response.json();
    console.log('Fetched payments:', payments);
    return payments;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Fetch payment by specific ID
export const fetchPaymentById = async (paymentId) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}?include=refund`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }
    const payment = await response.json();
    console.log('Fetched payment:', payment);
    return payment;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

// Request refund for specific payment
export const requestRefund = async (paymentId, reason, receiptUrl) => {
  const token = localStorage.getItem('token');
  try {
    const body = JSON.stringify({
      paymentId,
      reason,
      receiptUrl
    });

    const response = await fetch(`${API_BASE_URL}/request-refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to request refund');
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting refund:', error);
    throw error;
  }
};

// Fetch refunds from backend
export const fetchRefunds = async (filters) => {
  try {
    const url = new URL(`${API_BASE_URL}/refunds`);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching refunds:', error);
    throw new Error('Could not fetch refunds');
  }
};

// Update refund status
export const updateRefund = async (refundId, decision, status) => {
  try {
    const body = JSON.stringify({ decision });
    const url = `${API_BASE_URL}/refunds/${refundId}/${status}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error from server while updating refund: ${errorText}`);
      throw new Error('Response status: ' + response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating refund:', error);
    throw new Error('Could not update refund');
  }
};

// Resubmit refund
export const resubmitRefund = async (refundId, reason) => {
  try {
    const body = JSON.stringify({ reason });
    const response = await fetch(`${API_BASE_URL}/refunds/${refundId}/resubmit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Error from server while resubmitting refund: ${errorText}`);
      throw new Error('Response status: ' + response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error('Error resubmitting refund:', error);
    throw new Error('Could not resubmit refund');
  }
};

// Fetch refund by payment ID
export const fetchRefundByPaymentId = async (paymentId) => {
  console.log('Fetching refund for payment ID:', paymentId);
  const response = await fetch(`${API_BASE_URL}/refunds/payment/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    console.error('Error fetching refund for payment ID:', paymentId, response.statusText);
    throw new Error('Failed to fetch refund details');
  }

  const refund = await response.json();
  console.log('Refund fetched successfully for payment ID:', paymentId, refund);
  return refund;
};


// Fetch refund by ID
export const fetchRefundById = async (refundId) => {
  console.log('Fetching refund by ID:', refundId);
  const response = await fetch(`${API_BASE_URL}/refunds/${refundId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  if (!response.ok) {
    console.error('Error fetching refund:', response.statusText);
    throw new Error('Failed to fetch refund details');
  }
  return await response.json();
};