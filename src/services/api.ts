const isProd = import.meta.env.PROD;
const envApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const HOST_URL = isProd
  ? "https://aviation.braventra.in"
  : envApiUrl.replace(/\/api\/?$/, '');

// Export API_BASE_URL as HOST_URL so that existing code using `${API_BASE_URL}/api/...` works correctly
export const API_BASE_URL = HOST_URL;

export const API = {
  hero: `${API_BASE_URL}/api/hero`,
  services: `${API_BASE_URL}/api/services`,
  faqs: `${API_BASE_URL}/api/faqs`,
  about: `${API_BASE_URL}/api/about`,
  blogs: `${API_BASE_URL}/api/blogs`,
  testimonials: `${API_BASE_URL}/api/testimonials`,
  enquiries: `${API_BASE_URL}/api/enquiries`,
  helicopterEnquiries: `${API_BASE_URL}/api/helicopter-enquiries`,
  templates: `${API_BASE_URL}/api/templates`,
  news: `${API_BASE_URL}/api/news`,
  serviceFaqs: `${API_BASE_URL}/api/service-faqs`,
  history: `${API_BASE_URL}/api/history`,
  aviapages: `${API_BASE_URL}/api/aviapages`,
  chatbotPublicTopics: `${API_BASE_URL}/api/chatbot/topics`,
  chatbotSubmitLead: `${API_BASE_URL}/api/chatbot/leads`,
};