/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api.tsx

export const BASE_URL = import.meta.env.PROD 
  ? '/api'  // This will use Netlify's proxy
  : 'https://api.dgin.in/api';
console.log('🔍 API BASE_URL:', BASE_URL, '| Production mode:', import.meta.env.PROD);
interface ApiResponse<T> {
  data: { id: number; creative_url: string; post_id: number; createdAt: string; updatedAt: string; };
  success: boolean;
  result: T;
  message: string;
  remaining?: number;
  users: any[];
  scripts?: any;
}

// === Token Expiry Checker ===
const isTokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return true;
  }
};

// === Refresh Token API ===
const getRefreshToken = () => localStorage.getItem('refreshToken');

export const refreshToken = async (): Promise<string | null> => {
  const token = getRefreshToken();
  if (!token) {
    console.warn('🔁 No refresh token found');
    return null;
  }
  try {
    const response = await fetch(`${BASE_URL}/auth/refreshtoken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      console.log('✅ Token refreshed');
      return data.accessToken;
    } else {
      console.error('❌ Refresh failed:', data.message);
      localStorage.clear();
      window.location.href = '/login';
      return null;
    }
  } catch (error) {
    console.error('❌ Refresh error:', error);
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }
};

// === Smart Access Token Getter ===
const getAccessToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('accessToken');
  if (token && !isTokenExpired(token)) {
    return token;
  }
  console.warn('⚠️ Access token expired. Attempting refresh...');
  return await refreshToken();
};

// === Authenticated Fetch with Proactive Token Refresh ===
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _retry = true
): Promise<any> => {
  const accessToken = await getAccessToken();
  // console.log('🔑 Using access token:', accessToken);
  if (!accessToken) {
    console.warn('⚠️ No valid access token. Redirecting.');
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Access token missing');
  }
  const headers: HeadersInit = {
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
  };
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error:', error);
      throw new Error(error.message || 'API Error');
    }
    return response.json();
  } catch (error) {
    console.error('❌ fetchWithAuth error:', error);
    throw error;
  }
};

// === UPLOAD POST WITH CREATIVES API ===
export const uploadPostWithCreatives = async (
  postName: string,
  date: string,
  captions: string[],
  state: string,
  files: File[]
): Promise<any> => {
  const formData = new FormData();
  formData.append('post_name', postName);
  formData.append('date', date);
  captions.forEach((caption, i) => {
    formData.append(`captions[${i}]`, caption);
  });
  formData.append('state', state);
  files.forEach((file) => {
    formData.append('files', file);
  });

  const accessToken = await getAccessToken();
  if (!accessToken) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Access token missing');
  }

  const response = await fetch(`${BASE_URL}/smw/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Upload API Error:', error);
    throw new Error(error.message || 'Upload API Error');
  }

  return response.json();
};

// === UPLOAD INSIGHT/LIBRARY CREATIVES API ===
export const uploadInsightCreatives = async (
  libraryName: string,
  date: string,
  captions: string[],
  state: string,
  language: string, 
  type: string,
  files: File[],
  party: string,
  category: string // Added category parameter
): Promise<any> => {
  const formData = new FormData();
  formData.append('library_name', libraryName);
  formData.append('date', date); 
  captions.forEach((caption, i) => {
    formData.append(`captions[${i}]`, caption);
  });
  formData.append('state', state);
  formData.append('language', language); 
  formData.append('type', type);
  formData.append('party', party);
  formData.append('category', category); // Append category to form data

  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    // Using fetchWithAuth handles the token and headers automatically
    // Note: fetchWithAuth automatically removes Content-Type for FormData
    const response = await fetchWithAuth(`${BASE_URL}/smw/upload-library`, {
      method: 'POST',
      body: formData,
    });
    return response;
  } catch (error) {
    console.error('Error uploading insight creatives:', error);
    throw error;
  }
};

/* --- Other existing API functions --- */

export const getAllTaskCategories = async () =>
  fetchWithAuth(`${BASE_URL}/smw/get-all-task-categories`);

export const getAllTasksByCategory = async (categoryId: string, constituencyId: number) =>
  fetchWithAuth(`${BASE_URL}/smw/get-all-task-by-category/${categoryId}`, {
    method: 'POST',
    body: JSON.stringify({ constituency_id: constituencyId }),
  });

export const getAdminDashboardCount = async () =>
  fetchWithAuth(`${BASE_URL}/smw/get-admin-dashboard-count`);

export const getRecentSubmission = async (constituency_id: number) =>
  fetchWithAuth(`${BASE_URL}/smw/get-recent-submission`, {
    method: 'POST',
    body: JSON.stringify({ constituency_id }),
  });

export const createTask = async (taskData: any) =>
  fetchWithAuth(`${BASE_URL}/smw/createtask`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });

export const uploadTaskImage = async (taskId: number, formData: FormData) =>
  fetchWithAuth(`${BASE_URL}/smw/upload-task-image/${taskId}`, {
    method: 'POST',
    body: formData,
    headers: {}, 
  });

export const uploadTaskVideo = async (taskId: number, formData: FormData) =>
  fetchWithAuth(`${BASE_URL}/smw/upload-task-videos/${taskId}`, {
    method: 'POST',
    body: formData,
    headers: {},
  });

export const deleteSubmission = async (submissionId: number) =>
  fetchWithAuth(`${BASE_URL}/smw/delete-submission/${submissionId}`, {
    method: 'DELETE',
  });

export const reviewSubmission = async (submissionId: number, newStatus: string) =>
  fetchWithAuth(`${BASE_URL}/smw/review-submission/${submissionId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus }),
  });

export const deleteTask = async (taskId: number) =>
  fetchWithAuth(`${BASE_URL}/smw/delete-task/${taskId}`, {
    method: 'DELETE',
  });

export const getAllSmwAccounts = async (
  page: number,
  pageSize: number,
  constituency_id: number
): Promise<{ success: boolean;  }> =>
  fetchWithAuth(`${BASE_URL}/smw/get-all-smw-accounts`, {
    method: 'POST',
    body: JSON.stringify({ page, pageSize, constituency_id }),
  });

export const getSmwPerformance = async (smwId: number) =>
  fetchWithAuth(`${BASE_URL}/smw/get-smw-performance/${smwId}`);

export const getAllConstituencies = async (): Promise<{
    message(arg0: string, message: any): unknown; success: boolean; constituency: any[] 
}> =>
  fetchWithAuth(`${BASE_URL}/auth/get-all-constituencies`);

export const getUserById = async (userId: number): Promise<any> =>
  fetchWithAuth(`${BASE_URL}/auth/getuserbyId/${userId}`);

export const getAllUsersByStatus = async (
  page: number,
  pageSize: number,
  status: boolean,
  constituency_id: number
): Promise<ApiResponse<any>> => {
  return fetchWithAuth(`${BASE_URL}/auth/get-all-users-by-status`, {
    method: 'POST',
    body: JSON.stringify({ page, pageSize, status, constituency_id }),
  });
};

export const verifyUser = async (userId: number): Promise<any> => {
  return fetchWithAuth(`${BASE_URL}/auth/verify-user-profile/${userId}`, {
    method: 'PUT',
  });
};

export const createScript = async (scriptData: any): Promise<ApiResponse<any>> => {
  return fetchWithAuth(`${BASE_URL}/smw/create-script`, {
    method: 'POST',
    body: JSON.stringify(scriptData),
  });
};

export const getPostsByDateRange = async (
  startDay: number,
  startMonth: number,
  startYear: number,
  endDay: number,
  endMonth: number,
  endYear: number
): Promise<ApiResponse<any>> => {
  return fetchWithAuth(`${BASE_URL}/smw/posts/date-range`, {
    method: 'POST',
    body: JSON.stringify({
      startDay,
      startMonth,
      startYear,
      endDay,
      endMonth,
      endYear,
    }),
  });
};

export const updatePost = async (postId: number, postData: any): Promise<ApiResponse<any>> => {
  return fetchWithAuth(`${BASE_URL}/smw/post/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
};

// NEW: Delete Post API
export const deletePost = async (postId: number): Promise<ApiResponse<any>> => {
  return fetchWithAuth(`${BASE_URL}/smw/post/${postId}`, {
    method: 'DELETE',
  });
};

// NEW: Update Single Creative Image API
export const updateCreativeImage = async (creativeId: number, file: File): Promise<ApiResponse<any>> => {
  const formData = new FormData();
  formData.append('creative', file);

  return fetchWithAuth(`${BASE_URL}/smw/creative/${creativeId}`, {
    method: 'PUT',
    body: formData,
  });
};