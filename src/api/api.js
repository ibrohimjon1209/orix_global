import { apiClient } from './base';

const unwrap = (response) => response.data;

export const homeApi = {
  getBanners: (config) => apiClient.get('/banners/', config).then(unwrap),
  getServices: (config) => apiClient.get('/services/', config).then(unwrap),
  getAbout: (config) => apiClient.get('/about/', config).then(unwrap),
  getCountries: (config) => apiClient.get('/countries/', config).then(unwrap),
  getOffices: (config) => apiClient.get('/offices/', config).then(unwrap),
  getCities: (config) => apiClient.get('/cities/', config).then(unwrap),
  getUniversities: (config) => apiClient.get('/universities/', config).then(unwrap),
  getStaffMembers: (config) => apiClient.get('/staff-members/', config).then(unwrap),
  getGallery: (config) => apiClient.get('/gallary/', config).then(unwrap),
  getPartners: (config) => apiClient.get('/partners/', config).then(unwrap),
  getFooter: (config) => apiClient.get('/footer/', config).then(unwrap),
  getContactInfo: (config) => apiClient.get('/contact-info/', config).then(unwrap),
  getEvents: (config) => apiClient.get('/events/', config).then(unwrap),
  getNews: (config) => apiClient.get('/news/', config).then(unwrap),
  getNewsDetail: (slug, config) => apiClient.get(`/news/${slug}/`, config).then(unwrap),
  sendContact: (payload) => apiClient.post('/contact/', payload).then(unwrap),
  registerEvent: (payload) => apiClient.post('/event-registrations/', payload).then(unwrap),
  createBooking: (payload) => apiClient.post('/bookings/', payload).then(unwrap),
};
