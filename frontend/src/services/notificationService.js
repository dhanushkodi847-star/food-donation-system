import API from '../api/axios';

const API_URL = '/notifications';

// Get user notifications
const getNotifications = async () => {
  const response = await API.get(API_URL);
  return response.data;
};

// Get unread count
const getUnreadCount = async () => {
  const response = await API.get(`${API_URL}/unread-count`);
  return response.data;
};

// Mark as read
const markAsRead = async (id) => {
  const response = await API.put(`${API_URL}/${id}/read`, {});
  return response.data;
};

// Mark all as read
const markAllAsRead = async () => {
  const response = await API.put(`${API_URL}/read-all`, {});
  return response.data;
};

const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
