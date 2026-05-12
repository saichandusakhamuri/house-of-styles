/**
 * Real-time Notification System using Socket.IO
 * Handles order status updates and other real-time events
 */

class NotificationManager {
  constructor(serverURL) {
    if (!serverURL) {
      if (window.HOS_CONFIG?.socketUrl) {
        this.serverURL = window.HOS_CONFIG.socketUrl;
      } else {
      if (window.location.protocol === 'file:') {
        this.serverURL = 'http://10.0.2.2:5001';
      } else {
        const hostname = window.location.hostname || 'localhost';
        this.serverURL = `http://${hostname}:5001`;
      }
      }
    } else {
      this.serverURL = serverURL;
    }
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
  }

  connect() {
    if (typeof io === 'undefined') {
      console.error('Socket.IO library not loaded');
      return false;
    }

    this.socket = io(this.serverURL, {
      auth: {
        token: localStorage.getItem('houseOfTailor-token'),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
    return true;
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to real-time server');
      this.isConnected = true;
      this.emit('connected', {});
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time server');
      this.isConnected = false;
      this.emit('disconnected', {});
    });

    // Order status update
    this.socket.on('orderStatusUpdated', (data) => {
      console.log('Order status updated:', data);
      this.emit('orderStatusUpdated', data);
      this.showNotification(`Order ${data.orderId} status: ${data.status}`);
    });

    // Custom order quoted
    this.socket.on('customOrderQuoted', (data) => {
      console.log('Custom order quoted:', data);
      this.emit('customOrderQuoted', data);
      this.showNotification(`Quote received for custom order: Rs ${data.quotedPrice}`);
    });

    // Order confirmed (after payment)
    this.socket.on('orderConfirmed', (data) => {
      console.log('Order confirmed:', data);
      this.emit('orderConfirmed', data);
      this.showNotification(`Payment successful! Order ${data.orderNumber} is confirmed.`);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
      this.emit('error', error);
    });
  }

  // Event subscription
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  // Show browser notification
  showNotification(message, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('House of Styles', {
        body: message,
        icon: '/favicon.ico',
        ...options,
      });
    }
  }

  // Request notification permission
  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }
}

// Initialize global notification manager
const notificationManager = new NotificationManager();
