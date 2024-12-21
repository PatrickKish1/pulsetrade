import {
  collection, 
  doc,
  addDoc, 
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { Chat, ChatMessage, User } from '@/lib/utils';
import { db } from '../../firebase.config';


// Chat Functions
export const createChat = async (
  participants: User[], 
  type: 'individual' | 'group', 
  name?: string
): Promise<string> => {
  try {
    const initialUnreadCount: Record<string, number> = {};
    participants.forEach(participant => {
      initialUnreadCount[participant.address] = 0;
    });
    
    const chatData: Omit<Chat, 'id'> = {
      participants,
      type,
      name,
      unreadCount: initialUnreadCount,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const docRef = await addDoc(collection(db, 'chats'), chatData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const sendMessage = async (messageData: Omit<ChatMessage, 'id'>) => {
  try {
    const messagesRef = collection(db, 'messages');
    const chatRef = doc(db, 'chats', messageData.chatId);

    // Add message
    const messageRef = await addDoc(messagesRef, {
      ...messageData,
      timestamp: serverTimestamp()
    });

    // Update chat's last message
    await updateDoc(chatRef, {
      lastMessage: {
        id: messageRef.id,
        content: messageData.content,
        timestamp: Date.now(),
        senderId: messageData.senderId,
        recipientId: messageData.recipientId,
      },
      updatedAt: serverTimestamp()
    });

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const listenToChat = (
  chatId: string, 
  callback: (chat: Chat | null) => void
) => {
  const chatRef = doc(db, 'chats', chatId);
  
  return onSnapshot(chatRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data() as Omit<Chat, 'id'>
      });
    } else {
      callback(null);
    }
  });
};

export const listenToChatMessages = (
  chatId: string, 
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  });
};

export const getUserChats = async (userAddress: string): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userAddress),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Chat[];
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

export const markChatAsRead = async (chatId: string, userId: string) => {
  try {
    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0
    });
  } catch (error) {
    console.error('Error marking chat as read:', error);
    throw error;
  }
};