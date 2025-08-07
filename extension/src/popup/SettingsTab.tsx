import React from 'react';
import { ThemeToggle } from '../ui/theme-toggle';
import { PreferencesDialog } from '../preferences/PreferencesDialog';

interface Props {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const SettingsTab: React.FC<Props> = ({ isAuthenticated, onLogin, onLogout }) => (
  <div className="p-4 space-y-4">
    <ThemeToggle />
    <PreferencesDialog />
    {isAuthenticated ? (
      <button className="px-4 py-2 bg-primary text-white rounded" onClick={onLogout}>
        Logout
      </button>
    ) : (
      <button className="px-4 py-2 bg-primary text-white rounded" onClick={onLogin}>
        Login
      </button>
    )}
  </div>
);

export default SettingsTab;
