<<<<<<< Updated upstream
const API_BASE_URL = 'https://api.bandu.uz/api';
=======
// Always use full URL to send requests directly to API server
// This ensures authentication tokens are sent correctly and avoids proxy issues
export const API_BASE_URL = 'https://app.bandu.uz/api';
>>>>>>> Stashed changes

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Always include Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('No authentication token found in localStorage');
  }
  
  return headers;
};

// Helper function to get auth headers for FormData (without Content-Type)
export const getAuthHeadersForFormData = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Note: OTP-based Authentication APIs are removed as this is a Super Admin only panel
export const loginWithPhoneAndPassword = async (phoneNumber, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/otp-based-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    // Handle response structure similar to loginAPI
    if (data.data && data.data.tokens && data.data.data) {
      return {
        token: data.data.tokens.access_token,
        refreshToken: data.data.tokens.refresh_token,
        user: data.data.data,
      };
    }

    if (data.token || data.access_token) {
      return {
        token: data.token || data.access_token,
        refreshToken: data.refresh_token || data.refreshToken,
        user: data.user || data.data || { phoneNumber },
      };
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const sendOTPForRegister = async (phoneNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/otp-based-auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const completeOTPRegistration = async (phoneNumber, otp, userData = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/otp-based-auth/complete-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, otp, ...userData }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    // Handle response structure similar to loginAPI
    if (data.data && data.data.tokens && data.data.data) {
      return {
        token: data.data.tokens.access_token,
        refreshToken: data.data.tokens.refresh_token,
        user: data.data.data,
      };
    }

    if (data.token || data.access_token) {
      return {
        token: data.token || data.access_token,
        refreshToken: data.refresh_token || data.refreshToken,
        user: data.user || data.data || { phoneNumber },
      };
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Update current user profile
export const updateCurrentUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update user profile');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Delete current user (deletes the signed user indefinitely)
export const deleteCurrentUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete user');
    }

    // DELETE might not return data
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Update FCM token for current user
export const updateFCMToken = async (fcmToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/me/fcm-token`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fcmToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update FCM token');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Company API functions
export const getCompanies = async (params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    
    if (params.latitude !== undefined) queryParams.append('latitude', params.latitude);
    if (params.longitude !== undefined) queryParams.append('longitude', params.longitude);
    if (params.radiusKm !== undefined) queryParams.append('radiusKm', params.radiusKm);
    if (params.searchFields) {
      // Handle multiple searchFields
      if (Array.isArray(params.searchFields)) {
        params.searchFields.forEach(field => queryParams.append('searchFields', field));
      } else {
        queryParams.append('searchFields', params.searchFields);
      }
    }
    if (params.categoryId !== undefined) queryParams.append('categoryId', params.categoryId);
    if (params.categoryName) queryParams.append('categoryName', params.categoryName);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/company${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch companies');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getCompanyById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch company');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createCompany = async (companyData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create company');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateCompany = async (id, companyData) => {
  try {
    // Get token and verify it exists
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    
    const url = `${API_BASE_URL}/company/${id}`;
    
    // Log request details for debugging
    console.log('Updating company:', { 
      url, 
      method: 'PATCH', 
      hasToken: !!token,
      tokenPreview: token.substring(0, 20) + '...',
      companyData: JSON.stringify(companyData, null, 2)
    });
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(companyData),
    });

    // Log response details
    console.log('Update company response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const text = await response.text().catch(() => '');
        errorData = { message: text || response.statusText };
      }
      
      const errorMessage = errorData?.message || errorData?.error || errorData?.data?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      console.error('Update company error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url
      });
      
      if (response.status === 403) {
        throw new Error(`Access forbidden: ${errorMessage}. Please check your authentication token and permissions.`);
      }
      
      if (response.status === 400) {
        throw new Error(`Bad request: ${errorMessage}. Please check the data format.`);
      }
      
      if (response.status === 401) {
        throw new Error(`Unauthorized: ${errorMessage}. Please log in again.`);
      }
      
      throw new Error(errorMessage || 'Failed to update company');
    }

    const data = await response.json();
    console.log('Company updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Update company exception:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

<<<<<<< Updated upstream
=======
export const updateCompanyWithFiles = async (id, formData) => {
  try {
    const headers = getAuthHeadersForFormData();

    const response = await fetch(`${API_BASE_URL}/company/${id}`, {
      method: 'PATCH',
      headers: headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update company');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createCompanyWithFiles = async (formData) => {
  try {
    const headers = getAuthHeadersForFormData();

    const response = await fetch(`${API_BASE_URL}/company`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create company');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// File Upload API function
export const uploadImageToFileUpload = async (imageFile) => {
  try {
    // Validate file
    if (!imageFile) {
      throw new Error('No file provided');
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(imageFile.type)) {
      throw new Error(`Invalid file type: ${imageFile.type}. Allowed types: jpeg, jpg, png, webp, svg`);
    }

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      throw new Error(`File size too large: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 10MB`);
    }

    const headers = getAuthHeadersForFormData();
    const formData = new FormData();
    formData.append('file', imageFile);

    // Log for debugging (remove in production)
    console.log('Uploading file:', {
      name: imageFile.name,
      type: imageFile.type,
      size: imageFile.size,
      hasToken: !!headers.Authorization,
    });

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    console.log('Upload response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `Failed to upload image: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorData?.error || errorData?.data?.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        const text = await response.text().catch(() => '');
        if (text) {
          errorMessage = text;
        }
      }

      // Check for CORS error
      if (response.status === 0 || response.type === 'opaque') {
        throw new Error('CORS error: The API server does not allow requests from this origin. Please contact the API administrator.');
      }

      throw new Error(errorMessage);
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Invalid response from server. Expected JSON format.');
    }

    // Return the URL from the response
    // Based on API response structure: data.data.data.url
    const url = data?.data?.data?.url || data?.data?.url || data?.url;
    
    if (!url) {
      console.warn('No URL in response:', data);
      throw new Error('Server response does not contain image URL');
    }

    return url;
  } catch (error) {
    // Re-throw error if it's already an Error object with message
    if (error instanceof Error) {
      // Check for CORS errors
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') ||
          error.message?.includes('CORS') ||
          error.name === 'TypeError' && error.message?.includes('fetch')) {
        throw new Error('CORS Error: The API server does not allow requests from this origin (http://localhost:5173). This is a server-side configuration issue. Please contact the API administrator to add CORS headers for localhost:5173, or use a proxy.');
      }
      throw error;
    }
    // Handle fetch errors (network errors, CORS, etc.)
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

// Delete file by filename or URL
export const deleteFile = async (filename) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/file/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete file');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Company Image API functions
export const addCompanyImages = async (companyId, images) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company/${companyId}/images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ images }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to add images');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const addCompanyImage = async (companyId, imageFile) => {
  try {
    const headers = getAuthHeadersForFormData();
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/company/${companyId}/images`, {
      method: 'POST',
      headers: headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to add image');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateCompanyImage = async (companyId, imageId, imageFile, isMain = false) => {
  try {
    const headers = getAuthHeadersForFormData();
    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (isMain) {
      formData.append('isMain', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/company/${companyId}/images/${imageId}`, {
      method: 'PATCH',
      headers: headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update image');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deleteCompanyImage = async (companyId, imageId) => {
  try {
    const headers = getAuthHeadersForFormData();
    const response = await fetch(`${API_BASE_URL}/company/${companyId}/images/${imageId}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete image');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

>>>>>>> Stashed changes
export const deleteCompany = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/company/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete company');
    }

    // DELETE might not return data
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Admin Authentication APIs (Super Admin Panel)
export const adminLogin = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    // Handle response structure
    if (data.data && data.data.tokens && data.data.data) {
      return {
        token: data.data.tokens.access_token,
        refreshToken: data.data.tokens.refresh_token,
        user: data.data.data,
      };
    }

    if (data.token || data.access_token) {
      return {
        token: data.token || data.access_token,
        refreshToken: data.refreshToken || data.refresh_token,
        user: data.user || data.data || { username },
      };
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const adminRegister = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// User Management APIs (Super Admin Panel)
export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/user${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch users');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getUserById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch user');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create user');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update user');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete user');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const activateUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${id}/activate`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to activate user');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deactivateUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${id}/deactivate`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to deactivate user');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

<<<<<<< Updated upstream
=======
export const blockUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${id}/block`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to block user');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const unblockUser = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${id}/unblock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to unblock user');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Booking Management APIs (Super Admin Panel - get all bookings)
export const getAllBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.companyId !== undefined) queryParams.append('companyId', params.companyId);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/booking${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch bookings');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Company Categories API functions
export const getCompanyCategories = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/categories${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch company categories');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getCompanyCategoryById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch company category');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createCompanyCategory = async (categoryData) => {
  try {
    // API only requires 'name' field
    const payload = {
      name: categoryData.name
    };

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create company category');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateCompanyCategory = async (id, categoryData) => {
  try {
    // API accepts name and optionally description
    const payload = {
      name: categoryData.name
    };
    if (categoryData.description) {
      payload.description = categoryData.description;
    }

    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update company category');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deleteCompanyCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete company category');
    }

    // DELETE might not return data
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Resource API functions
export const getResources = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.companyId !== undefined) queryParams.append('companyId', params.companyId);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/resource${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch resources');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getResourcesByCompany = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource/company/${companyId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch resources');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getResourceById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch resource');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createResource = async (resourceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create resource');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateResource = async (id, resourceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update resource');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deleteResource = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete resource');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const addResourceImages = async (resourceId, images) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource/${resourceId}/images`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ images }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to add images');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateResourceImage = async (resourceId, imageId, imageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource/${resourceId}/images/${imageId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(imageData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update image');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Resource Category API functions
export const getResourceCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-category`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch resource categories');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getResourceCategoryById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-category/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch resource category');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createResourceCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-category`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create resource category');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateResourceCategory = async (id, categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-category/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update resource category');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deleteResourceCategory = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resource-category/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete resource category');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Floor API functions
export const getFloors = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.companyId !== undefined) queryParams.append('companyId', params.companyId);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/floor${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch floors');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getFloorsByCompany = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/floor/company/${companyId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch floors');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getFloorById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/floor/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch floor');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createFloor = async (floorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/floor`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(floorData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create floor');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateFloor = async (id, floorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/floor/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(floorData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update floor');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deleteFloor = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/floor/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete floor');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Place API functions
export const getPlaces = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.floorId !== undefined) queryParams.append('floorId', params.floorId);
    if (params.companyId !== undefined) queryParams.append('companyId', params.companyId);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/place${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch places');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getPlacesByCompany = async (companyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/place/company/${companyId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch places');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getPlacesByFloor = async (floorId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/place/floor/${floorId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch places');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getPlacesByCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/place/category/${categoryId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch places');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getAvailablePlaces = async (date, time, companyId = null) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('date', date);
    queryParams.append('time', time);
    if (companyId !== null) queryParams.append('companyId', companyId);
    
    const url = `${API_BASE_URL}/place/available?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch available places');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getPlaceById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/place/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch place');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createPlace = async (placeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/place`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(placeData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create place');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updatePlace = async (id, placeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/place/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(placeData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update place');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deletePlace = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/place/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete place');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Booking API functions (Super Admin Panel)
// Note: createBooking and getMyBookings are removed as they are for USER role only
export const getOwnerBookings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.companyId !== undefined) queryParams.append('companyId', params.companyId);
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/booking/owner-bookings${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch bookings');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// getAllBookings is now available above for ADMIN/SUPER_ADMIN roles
export const getBookingById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch booking');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateBookingEndTime = async (id, endBookingTime) => {
  try {
    const response = await fetch(`${API_BASE_URL}/booking/${id}/end-booking-time`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ endBookingTime }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update booking end time');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateBookingStatus = async (id, status, note = null) => {
  try {
    const payload = { status };
    if (note) payload.note = note;

    const response = await fetch(`${API_BASE_URL}/booking/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update booking status');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateBookingItemStatus = async (id, status, note = null) => {
  try {
    const payload = { status };
    if (note) payload.note = note;

    const response = await fetch(`${API_BASE_URL}/booking/booking-item/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update booking item status');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Note: Place Category endpoints can be added if needed for Super Admin

// Coupon API functions
export const getCoupons = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupon`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch coupons');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getCouponById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupon/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch coupon');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const createCoupon = async (couponData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupon`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(couponData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create coupon');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateCoupon = async (id, couponData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupon/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(couponData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to update coupon');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deleteCoupon = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coupon/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || data.error || 'Failed to delete coupon');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { success: true };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

// Note: Review endpoints can be added if needed for Super Admin

>>>>>>> Stashed changes
// Health API function
export const getHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to fetch health status');
    }

    return data;
  } catch (error) {
    if (error.message) {
      throw error;
    }
    throw new Error('Network error. Please try again.');
  }
};

