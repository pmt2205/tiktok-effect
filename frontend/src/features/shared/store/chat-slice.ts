import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  username: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

interface ChatState {
  messages: ChatMessage[];
  conversations: ChatConversation[];
  activeChatUser: string | null;
}

const initialState: ChatState = {
  messages: [],
  conversations: [],
  activeChatUser: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = Array.isArray(action.payload) ? action.payload : [];
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      if (!state.messages.some((m) => m._id === action.payload._id)) {
        state.messages.push(action.payload);
      }
      
      const { sender, receiver, message, createdAt } = action.payload;
      const isSenderAdmin = sender === 'admin';
      const isReceiverAdmin = receiver === 'admin';
      
      // Determine peer user
      const peer = isSenderAdmin ? receiver : sender;
      
      const existingConv = state.conversations.find((c) => c.username === peer);
      if (existingConv) {
        existingConv.lastMessage = message;
        existingConv.lastTimestamp = createdAt;
        if (isReceiverAdmin && state.activeChatUser !== peer) {
          existingConv.unreadCount += 1;
        }
      } else {
        state.conversations.unshift({
          username: peer,
          lastMessage: message,
          lastTimestamp: createdAt,
          unreadCount: isReceiverAdmin && state.activeChatUser !== peer ? 1 : 0,
        });
      }
      
      // Sort conversations so the latest message is at the top
      state.conversations.sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
    },
    setConversations(state, action: PayloadAction<ChatConversation[]>) {
      state.conversations = Array.isArray(action.payload) ? action.payload : [];
    },
    setActiveChatUser(state, action: PayloadAction<string | null>) {
      state.activeChatUser = action.payload;
      if (action.payload) {
        const conv = state.conversations.find((c) => c.username === action.payload);
        if (conv) {
          conv.unreadCount = 0;
        }
      }
    },
    resetChat(state) {
      state.messages = [];
      state.conversations = [];
      state.activeChatUser = null;
    }
  }
});

export const { setMessages, addMessage, setConversations, setActiveChatUser, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
