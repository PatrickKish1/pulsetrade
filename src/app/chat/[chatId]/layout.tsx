import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Secure Web3 Chat',
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
