const API_BASE_URL = "http://localhost:5000/api";

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: "Invalid server response.",
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong with the API request."
    );
  }

  return data;
};

export const apiGet = async (endpoint) => {
  return request(endpoint, {
    method: "GET",
  });
};

export const apiPost = async (
  endpoint,
  body = {}
) => {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const apiPut = async (
  endpoint,
  body = {}
) => {
  return request(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

export const apiDelete = async (endpoint) => {
  return request(endpoint, {
    method: "DELETE",
  });
};

/*
|--------------------------------------------------------------------------
| FILE UPLOAD
|--------------------------------------------------------------------------
*/

export const apiUpload = async (
  endpoint,
  formData
) => {
  const token = localStorage.getItem("token");

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: "Invalid server response.",
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong with the file upload."
    );
  }

  return data;
};

export { API_BASE_URL };