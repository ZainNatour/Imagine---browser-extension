import React from 'react';

interface Props {
  isAuthenticated: boolean;
  onNavigate: (tab: string) => void;
  onLogin: () => void;
}

export const HomeTab: React.FC<Props> = ({ isAuthenticated, onNavigate, onLogin }) => {
  if (!isAuthenticated) {
    return (
      <div className="p-4 space-y-2">
        <p className="mb-2">Please sign up or log in to continue.</p>
        <button
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={onLogin}
        >
          Sign Up / Login
        </button>
      </div>
    );
  }

  const links = [
    { tab: 'product', label: 'Product' },
    { tab: 'try', label: 'Try-On' },
    { tab: 'wishlist', label: 'Wishlist' },
    { tab: 'stylist', label: 'AI Stylist' },
    { tab: 'stores', label: 'Stores' },
    { tab: 'settings', label: 'Settings' },
  ];

  return (
    <div className="p-4 space-y-2">
      <p>Quick links:</p>
      <div className="flex flex-col space-y-2">
        {links.map((link) => (
          <button
            key={link.tab}
            className="px-4 py-2 rounded border"
            onClick={() => onNavigate(link.tab)}
          >
            {link.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeTab;
