// Central API client for Medora Frontend

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export async function request(path, options = {}) {
  const { method = 'GET', body, headers = {}, ...customConfig } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const config = {
    method,
    headers: isFormData ? { ...headers } : { 'Content-Type': 'application/json', ...headers },
    credentials: 'include', // sends cookies
    ...customConfig,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, config);
  } catch (netErr) {
    throw new Error('Network error. Please check server connectivity.');
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth & Profile (Collaborator 1)
  login: (creds) => request('/auth/login', { method: 'POST', body: creds }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  googleLogin: (googleData) => request('/auth/google', { method: 'POST', body: googleData }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PATCH', body: profileData }),
  uploadAvatar: (formData) => request('/auth/avatar', { method: 'POST', body: formData }),
  changePassword: (passwords) => request('/auth/change-password', { method: 'PATCH', body: passwords }),

  // Medora Hospital Doctors & Services (Collaborator 2)
  getSpecializations: () => request('/specializations'),
  getServices: () => request('/services'),
  getServiceById: (id) => request(`/services/${id}`),
  getServiceDoctors: (id) => request(`/services/${id}/doctors`),
  getDoctors: (params = {}) => {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.specialization && params.specialization !== 'All') query.set('specialization', params.specialization);
    if (params.department && params.department !== 'All') query.set('department', params.department);
    if (params.consultationType && params.consultationType !== 'ALL') query.set('consultationType', params.consultationType);
    if (params.page) query.set('page', params.page);
    return request(`/doctors?${query.toString()}`);
  },
  getFeaturedDoctors: () => request('/doctors/featured'),
  getDoctorById: (id) => request(`/doctors/${id}`),
  getDoctorAvailability: (id, date) => request(`/doctors/${id}/availability?date=${date}`),
  getDoctorFeePreview: (id) => request(`/doctors/${id}/fee-preview`),

  // Appointments & Booking (Collaborator 2)
  getAppointments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.year && params.year !== 'ALL') query.set('year', params.year);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    return request(`/appointments?${query.toString()}`);
  },
  uploadMedicalReport: (formData) => request('/appointments/upload-report', { method: 'POST', body: formData }),
  bookAppointment: (payload, idempotencyKey) =>
    request('/appointments', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey || (typeof crypto !== 'undefined' ? crypto.randomUUID() : String(Date.now())),
      },
      body: payload,
    }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PATCH' }),
  rescheduleAppointment: (id, newSlotId) =>
    request(`/appointments/${id}/reschedule`, { method: 'PATCH', body: { newSlotId } }),

  // Dashboard Stats
  getDashboardStats: () => request('/dashboard/stats'),

  // Medical Records
  getMedicalRecords: () => request('/medical-records'),
  addMedicalRecord: (record) => request('/medical-records', { method: 'POST', body: record }),
  deleteMedicalRecord: (id) => request(`/medical-records/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),
};

export default api;

