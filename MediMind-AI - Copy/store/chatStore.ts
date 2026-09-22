/**
 * Zustand Store for Chat
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PersonalityMode = "doctor" | "therapist" | "fitnessCoach" | "nutritionExpert" | "general";

export interface MessageAttachment {
  name: string;
  type: string; // "image" | "pdf"
  url: string; // base64 or blob URL
  mimeType: string;
  base64?: string; // base64 string
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isEmergency?: boolean;
  attachment?: MessageAttachment;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  personality: PersonalityMode;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  conversations: Conversation[];
  currentConversationId: string | null;
  personality: PersonalityMode;
  isHindi: boolean;
  isTyping: boolean;
  isListening: boolean;

  setPersonality: (personality: PersonalityMode) => void;
  setHindi: (isHindi: boolean) => void;
  setTyping: (isTyping: boolean) => void;
  setListening: (isListening: boolean) => void;
  createConversation: () => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "timestamp">) => void;
  getCurrentConversation: () => Conversation | null;
  clearAll: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      personality: "doctor",
      isHindi: false,
      isTyping: false,
      isListening: false,

      setPersonality: (personality) => set({ personality }),
      setHindi: (isHindi) => set({ isHindi }),
      setTyping: (isTyping) => set({ isTyping }),
      setListening: (isListening) => set({ isListening }),

      createConversation: () => {
        const id = `conv-${Date.now()}`;
        const conversation: Conversation = {
          id,
          title: "New Conversation",
          messages: [],
          personality: get().personality,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },

      selectConversation: (id) => set({ currentConversationId: id }),

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id
              ? state.conversations[0]?.id || null
              : state.currentConversationId,
        }));
      },

      addMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: `msg-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
        };
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  title:
                    c.messages.length === 0 && message.role === "user"
                      ? message.content.slice(0, 40) + (message.content.length > 40 ? "..." : "")
                      : c.title,
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get();
        return conversations.find((c) => c.id === currentConversationId) || null;
      },

      clearAll: () => set({ conversations: [], currentConversationId: null }),
    }),
    {
      name: "medimind-chat",
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        personality: state.personality,
        isHindi: state.isHindi,
      }),
    }
  )
);
