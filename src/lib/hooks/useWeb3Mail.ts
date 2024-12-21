import { useState } from 'react';
import { IExecWeb3mail } from '@iexec/web3mail';
import { IExecDataProtector } from '@iexec/dataprotector';

export const useWeb3Mail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const protectEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const dataProtector = new IExecDataProtector(window.ethereum);
      const protectedData = await dataProtector.core.protectData({
        data: { email },
        name: `Protected email for Web3Mail`,
      });
      return protectedData.address;
    } catch (err: unknown) {
      // Type guard to check if err is an Error object
      if (err instanceof Error) {
        setError(err.message);
      } else {
        // Fallback for cases where err might not be an Error object
        setError('An unknown error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendWeb3Mail = async (
    recipientAddress: string,
    subject: string,
    content: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const web3mail = new IExecWeb3mail(window.ethereum);
      const { taskId } = await web3mail.sendEmail({
        emailSubject: subject,
        emailContent: content,
        protectedData: recipientAddress,
        contentType: 'text/plain',
        senderName: 'Web3 Chat',
        workerpoolAddressOrEns: 'prod-v8-learn.main.pools.iexec.eth',
      });
      return taskId;
    } catch (err: unknown) {
      // Type guard to check if err is an Error object
      if (err instanceof Error) {
        setError(err.message);
      } else {
        // Fallback for cases where err might not be an Error object
        setError('An unknown error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    protectEmail,
    sendWeb3Mail,
    loading,
    error,
  };
};