"use client"
import './globals.css'
import { Inter } from 'next/font/google'
import { useState } from "react";
import React, { useEffect, useMemo } from 'react';
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider, WalletActionButton } from '@tronweb3/tronwallet-adapter-react-ui';
import '@tronweb3/tronwallet-adapter-react-ui/style.css';
import { WalletDisconnectedError, WalletError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
import toast, { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [showImport, setShowImport] = useState<boolean>(false);

  function onError(e: WalletError) {
    if (e instanceof WalletNotFoundError) {
      toast.error(e.message);
    } else if (e instanceof WalletDisconnectedError) {
      toast.error(e.message);
    } else toast.error(e.message);
  }

  return (
    <html lang="en">
      <body >
      <WalletProvider onError={onError}>
      <WalletModalProvider>
          {children}
          </WalletModalProvider>
    </WalletProvider>
      </body>
    </html>
  )
}