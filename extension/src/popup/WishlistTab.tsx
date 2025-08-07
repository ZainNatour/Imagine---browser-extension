import React, { useEffect, useState } from 'react';
import { getWishlist } from './modules/wishlist.js';

interface WishlistItem {
  name: string;
  imageSrc: string;
}

export const WishlistTab: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    getWishlist().then((res: any) => setItems(res));
    const listener = (changes: any, area: string) => {
      if (area === 'sync' && changes.wishlist) {
        setItems(changes.wishlist.newValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const openFullWishlist = () => {
    const url = chrome.runtime.getURL('centralized-wishlist.html');
    if (chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-4 space-y-4">
      {items.length ? (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div key={i} className="text-center">
              <img
                src={item.imageSrc}
                alt={item.name}
                loading="lazy"
                className="w-full rounded mb-1"
              />
              <p className="text-sm">{item.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Your wishlist is empty.</p>
      )}
      <button
        className="px-4 py-2 bg-primary text-white rounded"
        onClick={openFullWishlist}
      >
        Open Full Wishlist
      </button>
    </div>
  );
};

export default WishlistTab;
