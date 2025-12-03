import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

export function useTransactions() {
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const executeTransaction = async (tx: Transaction) => {
    return await signAndExecute({
      transaction: tx,
    });
  };

  return {
    executeTransaction,
    isPending,
  };
}

