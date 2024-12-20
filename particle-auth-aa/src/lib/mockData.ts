import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase.config';


export async function seedMockData(currentUserAddress: string) {
  // Mock participants
  const mockParticipants = [
    {
      address: currentUserAddress,
      isWeb3MailEnabled: false,
      createdAt: Date.now(),
      lastSeen: Date.now()
    },
    {
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      isWeb3MailEnabled: true,
      createdAt: Date.now(),
      lastSeen: Date.now()
    },
    {
      address: '0x123d35Cc6634C0532925a3b844Bc454e4438f789',
      isWeb3MailEnabled: false,
      createdAt: Date.now(),
      lastSeen: Date.now()
    }
  ];

  try {
    // Create an individual chat
    const individualChat = await addDoc(collection(db, 'chats'), {
      participants: [mockParticipants[0], mockParticipants[1]],
      type: 'individual',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unreadCount: {
        [mockParticipants[0].address]: 0,
        [mockParticipants[1].address]: 0
      }
    });

    // Create a group chat
    const groupChat = await addDoc(collection(db, 'chats'), {
      participants: mockParticipants,
      type: 'group',
      name: 'Test Group Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      unreadCount: {
        [mockParticipants[0].address]: 0,
        [mockParticipants[1].address]: 0,
        [mockParticipants[2].address]: 0
      }
    });

    // Add mock messages to individual chat
    const mockMessages = [
      {
        chatId: individualChat.id,
        content: 'Hey, how are you?',
        senderId: currentUserAddress,
        timestamp: Date.now() - 100000,
        isWeb3Mail: false
      },
      {
        chatId: individualChat.id,
        content: `I'm doing great, thanks for asking!`,
        senderId: mockParticipants[1].address,
        timestamp: Date.now() - 50000,
        isWeb3Mail: true
      },
      {
        chatId: individualChat.id,
        content: 'Would you like to discuss the new project?',
        senderId: currentUserAddress,
        timestamp: Date.now(),
        isWeb3Mail: false
      }
    ];

    // Add messages to database
    for (const message of mockMessages) {
      await addDoc(collection(db, 'messages'), message);
    }

    return {
      individualChatId: individualChat.id,
      groupChatId: groupChat.id
    };
  } catch (error) {
    console.error('Error seeding mock data:', error);
    throw error;
  }
}