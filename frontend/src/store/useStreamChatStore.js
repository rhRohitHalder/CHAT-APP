import { create } from 'zustand';

const useStreamChatStore = create((set, get) => ({
  client: null,
  token: null,
  isConnected: false,
  
  setClient: (client, token) => set({ client, token, isConnected: true }),
  
  getClient: () => get().client,
  getToken: () => get().token,
  isClientConnected: () => get().isConnected
}));

export default useStreamChatStore;