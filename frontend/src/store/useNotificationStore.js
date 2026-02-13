import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  messageNotifications: [],
  unreadCounts: {},
  totalUnread: 0,
  
  addMessageNotification: (notification) => {
    const newNotification = { 
      ...notification, 
      id: Date.now() + Math.random(), 
      timestamp: new Date() 
    };
    set((state) => ({
      messageNotifications: [newNotification, ...state.messageNotifications].slice(0, 50)
    }));
  },
  
  clearMessageNotifications: () => {
    set({ messageNotifications: [] });
  },
  
  removeNotification: (id) => {
    set((state) => ({
      messageNotifications: state.messageNotifications.filter(n => n.id !== id)
    }));
  },
  
  incrementUnread: (channelId, count = 1) => {
    set((state) => {
      const currentCount = state.unreadCounts[channelId] || 0;
      const newCounts = { ...state.unreadCounts, [channelId]: currentCount + count };
      return { 
        unreadCounts: newCounts, 
        totalUnread: Object.values(newCounts).reduce((a, b) => a + b, 0) 
      };
    });
  },
  
  setUnreadCount: (channelId, count) => {
    set((state) => {
      const newCounts = { ...state.unreadCounts, [channelId]: count };
      return { 
        unreadCounts: newCounts, 
        totalUnread: Object.values(newCounts).reduce((a, b) => a + b, 0) 
      };
    });
  },
  
  clearUnread: (channelId) => {
    set((state) => {
      const newCounts = { ...state.unreadCounts };
      delete newCounts[channelId];
      return { 
        unreadCounts: newCounts, 
        totalUnread: Object.values(newCounts).reduce((a, b) => a + b, 0) 
      };
    });
  },
  
  clearAllUnread: () => {
    set({ unreadCounts: {}, totalUnread: 0 });
  }
}));

export default useNotificationStore;