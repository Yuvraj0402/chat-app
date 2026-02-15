import { api, socket } from './api';
import { User, getAllUsers, getCurrentUser } from './auth';

export type MessageType = 'text' | 'emoji' | 'file' | 'audio' | 'image';

export interface Message {
  _id: string; // Mongo ID
  id?: string;
  conversationId: string;
  sender: User; // Populated or ID?
  senderId?: string; // For compatibility
  content: string;
  type: MessageType;
  timestamp: string;
  fileData?: {
    name: string;
    size: number;
    mimeType: string;
    url: string;
  };
  replyTo?: string | Message;
  readBy?: {
    user: string;
    readAt: string;
  }[];
  status?: 'sent' | 'delivered' | 'read';
  viewOnce?: boolean;
  viewedBy?: {
    user: string;
    viewedAt: string;
  }[];
  isExpired?: boolean;
}

export interface Conversation {
  _id: string;
  id?: string;
  participants: User[];
  participantIds?: string[];
  lastMessage?: Message;
  createdAt: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

// Helper to adapt Mongo _id to id if frontend uses id strictly
const adaptConversation = (c: any): Conversation => ({
  ...c,
  id: c._id,
  participantIds: c.participants.map((p: any) => p._id || p),
  lastMessage: c.lastMessage ? adaptMessage(c.lastMessage) : undefined
});

const adaptMessage = (m: any): Message => ({
  ...m,
  id: m._id,
  senderId: m.sender?._id || m.sender?.id || m.sender,
});

export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string
): Promise<Conversation | null> {
  try {
    const { data } = await api.post('/conversations', {
      senderId: currentUserId,
      receiverId: otherUserId
    });
    return adaptConversation(data);
  } catch (error) {
    console.error("Error creating conversation", error);
    return null;
  }
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  type: MessageType = 'text',
  fileData?: { name: string; size: number; mimeType: string; url: string },
  viewOnce?: boolean
): Promise<Message | null> {
  try {
    const { data } = await api.post('/messages', {
      conversationId,
      sender: senderId,
      content,
      type,
      fileData,
      viewOnce: viewOnce || false
    });

    const message = adaptMessage(data.data); // data.data is the message object from backend

    // Socket emit - using rooms
    socket.emit("new-message", {
      ...message
    });

    return message;
  } catch (error) {
    console.error("Error sending message", error);
    return null;
  }
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data } = await api.get(`/messages/${conversationId}`);
    return data.map(adaptMessage);
  } catch (error) {
    console.error("Error fetching messages", error);
    return [];
  }
}

/** Media messages (image/file/audio) for a conversation, for Shared Media view */
export async function getConversationMedia(conversationId: string): Promise<Message[]> {
  try {
    const { data } = await api.get(`/messages/${conversationId}/media`);
    return (data || []).map(adaptMessage);
  } catch (error) {
    console.error("Error fetching conversation media", error);
    return [];
  }
}

/** Basic stats for a conversation (total messages, file count) */
export async function getConversationStats(conversationId: string): Promise<{ totalMessages: number; filesShared: number }> {
  try {
    const messages = await getConversationMessages(conversationId);
    const filesShared = messages.filter((m) => m.type === 'image' || m.type === 'file' || m.type === 'audio').length;
    return { totalMessages: messages.length, filesShared };
  } catch {
    return { totalMessages: 0, filesShared: 0 };
  }
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const { data } = await api.get(`/conversations/${userId}`);
    return data.map(adaptConversation);
  } catch (error) {
    console.error("Error fetching conversations", error);
    return [];
  }
}

export async function createGroupConversation(
  creatorId: string,
  participantIds: string[],
  groupName: string
): Promise<Conversation | null> {
  try {
    const { data } = await api.post('/conversations/group', {
      creatorId,
      participantIds,
      groupName
    });
    return adaptConversation(data);
  } catch (error) {
    console.error("Error creating group conversation", error);
    return null;
  }
}

export async function getGroupConversations(userId: string): Promise<Conversation[]> {
  // Backend support for group needed
  return [];
}
