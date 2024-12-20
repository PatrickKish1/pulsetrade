import React, { useState, useEffect } from 'react';
import { useParticleAuth } from '@/lib/hooks/useParticleAuth';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { User, Chat, isAddress } from '@/lib/utils';
import { db } from '../../../firebase.config';
import { useChat } from '@/lib/hooks/useChat';

interface CreateChatProps {
  onSuccess: (chatId: string) => void;
  onCancel?: () => void;
  initialGroupChat?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

export const CreateChat: React.FC<CreateChatProps> = ({
  onSuccess,
  onCancel,
  initialGroupChat = false
}) => {
  const { address, isConnected } = useParticleAuth();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isGroup, setIsGroup] = useState(initialGroupChat);
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [existingChatId, setExistingChatId] = useState<string | null>(null);

  const { chat: existingChat } = useChat(existingChatId || '');

  const checkExistingIndividualChat = async (recipientAddr: string): Promise<string | null> => {
    try {
      if (!address) return null;

      const chatsRef = collection(db, 'chats');
      const participantAddresses = [address.toLowerCase(), recipientAddr.toLowerCase()].sort();

      const q = query(
        chatsRef,
        where('type', '==', 'individual'),
        where('participantAddresses', '==', participantAddresses)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.empty ? null : querySnapshot.docs[0].id;
    } catch (error) {
      console.error('Error checking existing chat:', error);
      return null;
    }
  };

  const validateFields = async (): Promise<boolean> => {
    const newErrors: ValidationError[] = [];

    if (!address) {
      newErrors.push({
        field: 'general',
        message: 'Please connect your wallet first'
      });
      return false;
    }

    if (isGroup) {
      if (!groupName?.trim()) {
        newErrors.push({
          field: 'groupName',
          message: 'Group name is required'
        });
      }

      const validParticipants = participants
        .map(p => p.trim())
        .filter(p => p && isAddress(p));

      if (validParticipants.length < 2) {
        newErrors.push({
          field: 'participants',
          message: 'At least 2 valid participant addresses are required'
        });
      }

      const uniqueAddresses = new Set(validParticipants.map(p => p.toLowerCase()));
      if (uniqueAddresses.size !== validParticipants.length) {
        newErrors.push({
          field: 'participants',
          message: 'Duplicate addresses are not allowed'
        });
      }

      if (validParticipants.some(p => p.toLowerCase() === address.toLowerCase())) {
        newErrors.push({
          field: 'participants',
          message: 'You cannot add yourself as a participant'
        });
      }
    } else {
      if (!recipientAddress.trim()) {
        newErrors.push({
          field: 'recipientAddress',
          message: 'Recipient address is required'
        });
      } else if (!isAddress(recipientAddress)) {
        newErrors.push({
          field: 'recipientAddress',
          message: 'Invalid Ethereum address format'
        });
      } else if (recipientAddress.toLowerCase() === address.toLowerCase()) {
        newErrors.push({
          field: 'recipientAddress',
          message: 'Cannot create chat with yourself'
        });
      } else {
        const existingId = await checkExistingIndividualChat(recipientAddress);
        if (existingId) {
          setExistingChatId(existingId);
          return false;
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) return;

    setLoading(true);
    try {
      if (existingChatId) {
        onSuccess(existingChatId);
        return;
      }

      const isValid = await validateFields();
      if (!isValid) {
        setLoading(false);
        return;
      }

      const currentUser: User = {
        address,
        isWeb3MailEnabled: false,
        createdAt: Date.now(),
        lastSeen: Date.now()
      };

      let chatId: string;

      if (isGroup) {
        const validParticipants = participants
          .map(p => p.trim())
          .filter(p => p && isAddress(p));

        const uniqueParticipants = Array.from(new Set(
          validParticipants.map(p => p.toLowerCase())
        )).filter(p => p !== address.toLowerCase());

        const participantUsers: User[] = [
          currentUser,
          ...uniqueParticipants.map(addr => ({
            address: addr,
            isWeb3MailEnabled: false,
            createdAt: Date.now(),
            lastSeen: Date.now()
          }))
        ];

        const chatData = {
          type: 'group' as const,
          name: groupName.trim(),
          participants: participantUsers,
          participantAddresses: participantUsers.map(u => u.address.toLowerCase()).sort(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessage: null,
          unreadCount: Object.fromEntries(
            participantUsers.map(u => [u.address.toLowerCase(), 0])
          ),
          metadata: {
            createdBy: address.toLowerCase(),
            maxParticipants: 50,
            isArchived: false
          }
        };

        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        chatId = chatRef.id;
      } else {
        const recipientDoc = await getDoc(doc(db, 'users', recipientAddress));
        const recipientUser: User = recipientDoc.exists()
          ? recipientDoc.data() as User
          : {
              address: recipientAddress,
              isWeb3MailEnabled: false,
              createdAt: Date.now(),
              lastSeen: Date.now()
            };

        const chatData = {
          type: 'individual' as const,
          participants: [currentUser, recipientUser],
          participantAddresses: [address, recipientAddress].map(a => a.toLowerCase()).sort(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          lastMessage: null,
          unreadCount: {
            [address.toLowerCase()]: 0,
            [recipientAddress.toLowerCase()]: 0
          },
          metadata: {
            isArchived: false
          }
        };

        const chatRef = await addDoc(collection(db, 'chats'), chatData);
        chatId = chatRef.id;
      }

      onSuccess(chatId);
    } catch (error) {
      console.error('Error creating chat:', error);
      setErrors([{
        field: 'general',
        message: error instanceof Error ? error.message : 'Failed to create chat'
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (existingChat) {
      setErrors([{
        field: 'general',
        message: 'A chat with this user already exists. Redirecting...'
      }]);
      const timer = setTimeout(() => {
        onSuccess(existingChatId!);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [existingChat, existingChatId, onSuccess]);

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {isGroup ? 'Create Group Chat' : 'Start New Chat'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!initialGroupChat && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <input
              type="checkbox"
              id="groupChat"
              checked={isGroup}
              onChange={(e) => {
                setIsGroup(e.target.checked);
                setErrors([]);
                if (e.target.checked) {
                  setRecipientAddress('');
                } else {
                  setGroupName('');
                  setParticipants([]);
                }
              }}
              className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
            />
            <label htmlFor="groupChat" className="text-sm font-medium text-gray-700">
              Create Group Chat
            </label>
          </div>
        )}

        {isGroup ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  setErrors(errors.filter(error => error.field !== 'groupName'));
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                  getFieldError('groupName') 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter group name"
                maxLength={50}
              />
              {getFieldError('groupName') && (
                <p className="mt-1 text-sm text-red-500">{getFieldError('groupName')}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participant Addresses
                <span className="text-gray-500 ml-1">(one per line)</span>
              </label>
              <textarea
                value={participants.join('\n')}
                onChange={(e) => {
                  setParticipants(e.target.value.split('\n').filter(Boolean));
                  setErrors(errors.filter(error => error.field !== 'participants'));
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                  getFieldError('participants') 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter participant addresses"
                rows={4}
              />
              {getFieldError('participants') && (
                <p className="mt-1 text-sm text-red-500">{getFieldError('participants')}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 2 participants required
              </p>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => {
                setRecipientAddress(e.target.value);
                setErrors(errors.filter(error => error.field !== 'recipientAddress'));
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out ${
                getFieldError('recipientAddress') 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
              placeholder="Enter wallet address"
            />
            {getFieldError('recipientAddress') && (
              <p className="mt-1 text-sm text-red-500">{getFieldError('recipientAddress')}</p>
            )}
          </div>
        )}

        {getFieldError('general') && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{getFieldError('general')}</p>
          </div>
        )}

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </div>
            ) : (
              'Create Chat'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};