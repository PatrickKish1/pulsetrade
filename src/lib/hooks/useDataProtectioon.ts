import { useState } from 'react';
import { IExecDataProtector } from '@iexec/dataprotector';
import { checkIsConnected, checkCurrentChain } from '@/lib/utils';

interface DataProtectionError {
  message: string;
  code?: string | number;
}

export const useDataProtection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protectedData, setProtectedData] = useState<string>('');

  const handleError = (err: unknown): string => {
    if (err instanceof Error) {
      return err.message;
    }
    if (typeof err === 'object' && err !== null && 'message' in err) {
      return (err as DataProtectionError).message;
    }
    return 'An unknown error occurred';
  };

  const protectUserData = async (userEmail: string) => {
    setError(null);
    setLoading(true);

    try {
      // Check connection and chain as shown in the example
      checkIsConnected();
      await checkCurrentChain();

      const iExecDataProtector = new IExecDataProtector(window.ethereum);
      
      // Following the provided example's data protection format
      const data = { email: userEmail };
      const protectedDataResponse = await iExecDataProtector.core.protectData({
        data,
        name: `Protected email for ${userEmail}`,
      });

      setProtectedData(protectedDataResponse.address);
      return protectedDataResponse.address;

    } catch (err: unknown) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const grantAccess = async (protectedDataAddress: string, recipientAddress: string) => {
    setError(null);
    setLoading(true);

    try {
      checkIsConnected();
      await checkCurrentChain();

      const iExecDataProtector = new IExecDataProtector(window.ethereum);
      
      await iExecDataProtector.core.grantAccess({
        protectedData: protectedDataAddress,
        authorizedUser: recipientAddress,
        authorizedApp: 'web3mail.apps.iexec.eth',
        numberOfAccess: 1,
      });

    } catch (err: unknown) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    protectUserData,
    grantAccess,
    protectedData,
    loading,
    error,
  };
};