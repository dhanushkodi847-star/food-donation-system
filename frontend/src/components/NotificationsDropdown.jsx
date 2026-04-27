import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiCheck, FiInfo, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import notificationService from '../services/notificationService';
import './NotificationsDropdown.css';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // Poll for new notifications every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const data = await notificationService.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
      const countData = await notificationService.getUnreadCount();
      setUnreadCount(countData.count || 0);
    } catch (error) {
      console.error('Error fetching notifications', error);
      setNotifications([]);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation(); // prevent clicking from triggering the main div click
    try {
      await notificationService.markAsRead(id);
      fetchData();
    } catch (error) {
      console.error('Error marking read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchData();
    } catch (error) {
      console.error('Error marking all as read', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id, { stopPropagation: () => {} });
    }
    setIsOpen(false);
    
    // If it has a related donation, could navigate to a details page if one existed
    // navigate(`/donations/${notification.relatedDonation._id}`);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FiCheckCircle className="noti-icon success" />;
      case 'warning': return <FiAlertCircle className="noti-icon warning" />;
      case 'error': return <FiAlertCircle className="noti-icon error" />;
      default: return <FiInfo className="noti-icon info" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
  };

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <button className="notifications-trigger" onClick={() => setIsOpen(!isOpen)}>
        <FiBell className="bell-icon" />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                <FiCheck /> Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {!Array.isArray(notifications) || notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map((noti) => (
                <div 
                  key={noti._id} 
                  className={`notification-item ${!noti.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(noti)}
                >
                  <div className="notification-icon-wrapper">
                    {getIcon(noti.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{noti.title}</h4>
                    <p>{noti.message}</p>
                    <span className="notification-time">{formatTime(noti.createdAt)}</span>
                  </div>
                  {!noti.isRead && (
                    <button 
                      className="mark-read-btn" 
                      onClick={(e) => handleMarkAsRead(noti._id, e)}
                      title="Mark as read"
                    >
                      <span className="unread-dot"></span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
