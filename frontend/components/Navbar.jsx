"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletActionButton } from '@tronweb3/tronwallet-adapter-react-ui';

const Navbar = () => {
  const router = useRouter();

  const [avatarUrl, setAvatarUrl] = useState("");

  const { connected, address, signMessage, signTransaction } = useWallet();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getRandomNumber = () => Math.floor(Math.random() * 1000);
        const apiUrl = `https://api.multiavatar.com/${getRandomNumber()}`;

        const response = await axios.get(apiUrl);
        const svgDataUri = `data:image/svg+xml,${encodeURIComponent(
          response.data
        )}`;
        setAvatarUrl(svgDataUri);
      } catch (error) {
        console.error("Error fetching avatar:", error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <div className="flex gap-0">
        {/* <Link href="/profile"> */}
          {avatarUrl && (
            <img src={avatarUrl} alt="Avatar" style={{ width: 45 }} />
          )}
        {/* </Link> */}

<WalletActionButton>
          {!connected ? "Connect Tron" : null}
        </WalletActionButton>
        
      </div>
    </div>
  );
};

export default Navbar;
