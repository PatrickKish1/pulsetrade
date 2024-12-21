import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase.config';


interface ChatData {
  userId: string;
  threadId?: string;
  title: string;
  lastMessage?: {
    content: string;
    timestamp: number;
  };
}

export const createNewChat = async (data: ChatData) => {
  try {
    const chatData = {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const chatRef = await addDoc(collection(db, 'ai_chats'), chatData);
    return chatRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const updateChatThread = async (chatId: string, threadId: string) => {
  try {
    const chatRef = doc(db, 'ai_chats', chatId);
    await updateDoc(chatRef, {
      threadId,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating chat thread:', error);
    throw error;
  }
};

export const addMessage = async (chatId: string, content: string, isAi: boolean) => {
  try {
    const messageData = {
      chatId,
      content,
      isAi,
      timestamp: Date.now()
    };

    await addDoc(collection(db, 'ai_chat_messages'), messageData);
    
    // Update last message in chat
    const chatRef = doc(db, 'ai_chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: {
        content,
        timestamp: Date.now()
      },
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};