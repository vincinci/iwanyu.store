'use client';

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  
  // Helper function to get the full URL for an endpoint
  getUrl: (endpoint: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    // Ensure endpoint starts with /api/ if not already
    if (!endpoint.startsWith('/')) {
      endpoint = `/${endpoint}`;
    }
    if (!endpoint.startsWith('/api/') && !baseUrl.endsWith('/api')) {
      endpoint = `/api${endpoint}`;
    }
    return `${baseUrl}${endpoint.startsWith('/api') && baseUrl.endsWith('/api') ? endpoint.substring(4) : endpoint}`;
  },
  
  // Helper function to make API requests with proper headers
  request: async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    const url = API_CONFIG.getUrl(endpoint);
    
    // Get token from localStorage if available
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || '';
    }
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    
    console.log(`API Request to: ${url}`, { method: options.method || 'GET' });
    
    try {
      // Make the request
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      // Check if response is OK
      if (!response.ok) {
        // Try to get error message from JSON response
        let errorData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json().catch(() => null);
        } else {
          // If not JSON, get text content for debugging
          const textContent = await response.text().catch(() => 'Non-JSON response received');
          console.error('Non-JSON response:', textContent.substring(0, 100) + '...');
          throw new Error(`Server returned ${response.status}: Non-JSON response`);
        }
        
        throw new Error(errorData?.message || `Server returned ${response.status}`);
      }
      
      // Check content type to ensure we're getting JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textContent = await response.text().catch(() => 'Non-JSON response received');
        console.error('Expected JSON but got:', textContent.substring(0, 100) + '...');
        throw new Error('Server returned non-JSON response');
      }
      
      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
  
  // Common API methods
  get: <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    return API_CONFIG.request<T>(endpoint, { ...options, method: 'GET' });
  },
  
  post: <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
    return API_CONFIG.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  put: <T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> => {
    return API_CONFIG.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  delete: <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    return API_CONFIG.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
};

export default API_CONFIG;
