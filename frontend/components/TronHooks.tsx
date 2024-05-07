import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    tronWeb: any;
    tronLink: any;
  }
}

interface TronWeb {
  ready: boolean;
  defaultAddress: {
    base58: string;
    hex: string;
  };
  contract: (abi: any[], contractAddress: string) => any;
}

const curveFactoryAbi = [
]

// Hook to initialize and use TronWeb instance
const useTronWeb = () => {
  const [tronWeb, setTronWeb] = useState<TronWeb | null>(null);

  useEffect(() => {
    const checkTronWeb = () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setTronWeb(window.tronWeb as TronWeb);
      }
    };

    checkTronWeb();

    const interval = setInterval(checkTronWeb, 1000);
    return () => clearInterval(interval);
  }, []);

  return tronWeb;
};

// Hook to access TronLink wallet details
const useTronLink = () => {
  const tronWeb = useTronWeb();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (tronWeb) {
      setAddress(tronWeb.defaultAddress.base58);
    }
  }, [tronWeb]);

  return { tronWeb, address };
};

// Hook to interact with a contract
const useContract = (contractAddress: string, contractAbi: any[]) => {
  const { tronWeb } = useTronLink();
  const [contract, setContract] = useState<any | null>(null);

  useEffect(() => {
    if (tronWeb && contractAddress && contractAbi) {
      const newContract = tronWeb.contract(contractAbi, contractAddress);
      setContract(newContract);
    }
  }, [tronWeb, contractAddress, contractAbi]);

  return contract;
};

// Hook to create a new curve
const useCreateCurve = (contractAddress: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [curveAddress, setCurveAddress] = useState<string | null>(null);
  // const { tronWeb } = useTronLink();
  const contract = useContract(contractAddress, curveFactoryAbi);

  const createCurve = useCallback(async (name: string, symbol: string) => {
    if (!contract) {
      console.error("Contract not loaded or TronWeb not ready.");
      return;
    }
    
    setIsCreating(true);
    setError(null);
    setTxHash(null);
    setCurveAddress(null);

    try {
      const result = await contract.createCurve(name, symbol).send({
        from: contract.tronWeb.defaultAddress.base58,
        feeLimit: 1_000_000_000,
        shouldPollResponse: false
      });

      console.log('Transaction Hash:', result);
      if (result) {
        setTxHash(result);
        await checkTransactionFinalization(result);
      } else {
        throw new Error('No transaction hash found');
      }
      // setIsCreating(false);
    } catch (err) {
      console.error('CreateCurve Error:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred during curve creation'));
      setIsCreating(false);
    }
  }, [contract]);

  const checkTransactionFinalization = useCallback(async (hash: any) => {
    const tronWeb = window.tronWeb;
    let isTransactionConfirmed = false;
    while (!isTransactionConfirmed) {
      try {
        const receipt = await tronWeb.trx.getTransactionInfo(hash);
        if (receipt && receipt.receipt && receipt.receipt.result === 'SUCCESS') {
          console.log('Transaction confirmed:', receipt);
          const receiptCurveAddress = receipt.internal_transactions[0].transferTo_address;
          const base58CurveAddress = tronWeb.address.fromHex(receiptCurveAddress);
          console.log('Curve Address:', base58CurveAddress);
          setCurveAddress(base58CurveAddress);
          isTransactionConfirmed = true; // Break out of the loop when transaction is confirmed
        } else {
          console.log('Waiting for transaction to be confirmed.....');
        }
      } catch (err) {
        console.error('Error fetching transaction receipt:', err);
      }
      if (!isTransactionConfirmed) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second if transaction is not confirmed
      }
    }
    setIsCreating(false); // Only set loading to false once the transaction is confirmed
  }, []);

  return { createCurve, isCreating, error, curveAddress };
};

export { useTronWeb, useTronLink, useContract, useCreateCurve };
