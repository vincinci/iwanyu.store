import Flutterwave from 'flutterwave-node-v3';
import dotenv from 'dotenv';

dotenv.config();

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  process.env.FLUTTERWAVE_SECRET_KEY || ''
);

interface PaymentPayload {
  amount: number;
  currency: string;
  payment_options?: string;
  customer: {
    email: string;
    name?: string;
    phone_number?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  tx_ref: string;
  redirect_url: string;
  meta?: {
    [key: string]: any;
  };
}

/**
 * Generate a payment link for Flutterwave checkout
 * @param payload Payment details
 * @returns Payment link response
 */
export const generatePaymentLink = async (payload: PaymentPayload) => {
  try {
    const response = await flw.Charge.card(payload);
    return response;
  } catch (error) {
    console.error('Error generating payment link:', error);
    throw error;
  }
};

/**
 * Verify a payment transaction
 * @param transactionId Transaction ID to verify
 * @returns Verification response
 */
export const verifyTransaction = async (transactionId: string) => {
  try {
    const response = await flw.Transaction.verify({ id: transactionId });
    return response;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
};

/**
 * Generate a unique transaction reference
 * @returns Unique transaction reference string
 */
export const generateTransactionReference = (): string => {
  return `IWANYU-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

export default {
  generatePaymentLink,
  verifyTransaction,
  generateTransactionReference
};
