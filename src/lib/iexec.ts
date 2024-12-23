// lib/iexec.ts
import { IExec } from 'iexec';

export const iexec = new IExec({ ethProvider: window.ethereum });

export const registerOnIExec = async (emailOrWallet: string) => {
  try {
    // Mock registration (replace with actual Data Protector implementation)
    console.log('Registering on iExec:', emailOrWallet);
    // Example: await iexec.dataProtector.register(emailOrWallet);
    return true;
  } catch (error) {
    console.error('iExec registration failed:', error);
    throw error;
  }
};
