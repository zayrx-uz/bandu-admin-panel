export const API_BASE_URL = 'https://api.bandu.uz/api';

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Login API
export const loginAPI = async (username, password) => {
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
      throw new Error(data.message || data.error || data.data?.message || 'Login failed');
    }

    // Handle nested response structure: data.data.data and data.data.tokens
    if (data.data && data.data.tokens && data.data.data) {
      return {
        token: data.data.tokens.access_token,
        refreshToken: data.data.tokens.refresh_token,
        user: data.data.data,
      };
    }

    // Fallback for other response formats
    if (data.token || data.access_token) {
      return {
        token: data.token || data.access_token,
        refreshToken: data.refresh_token || data.refreshToken,
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
    const response = await fetch(`${API_BASE_URL}/company/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(companyData),
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

export const updateCompanyWithFiles = async (id, formData) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

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
    const token = localStorage.getItem('token');
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

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

// Company Image API functions
export const addCompanyImage = async (companyId, imageFile) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/company/${companyId}/images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (isMain) {
      formData.append('isMain', 'true');
    }

    const response = await fetch(`${API_BASE_URL}/company/${companyId}/images/${imageId}`, {
      method: 'PATCH',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/company/${companyId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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

// User API functions
export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

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

