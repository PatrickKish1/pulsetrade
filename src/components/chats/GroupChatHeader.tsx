import { Chat, User } from '@/lib/utils';
import React from 'react';

interface GroupChatHeaderProps {
  chat: Chat;
  currentUser: User;
}

export const GroupChatHeader: React.FC<GroupChatHeaderProps> = ({
  chat,
  currentUser,
}) => {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{chat.name}</h1>
          <p className="text-sm text-gray-500">
            {chat.participants.length} participants
          </p>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        <p>Participants:</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {chat.participants.map((participant) => (
            <span
              key={participant.address}
              className={`px-2 py-1 rounded ${
                participant.address === currentUser.address
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100'
              }`}
            >
              {participant.address.slice(0, 6)}...{participant.address.slice(-4)}
              {participant.isWeb3MailEnabled && ' (Web3Mail)'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};