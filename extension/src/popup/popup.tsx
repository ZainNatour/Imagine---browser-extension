/* istanbul ignore file */
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Home as HomeIcon,
  Package,
  Camera,
  Heart,
  Settings as SettingsIcon,
  Sparkles,
  Store,
} from 'lucide-react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Toaster } from 'sonner';
import { StoresTab } from './StoresTab';
import { ProductTab } from './ProductTab';
import { TryOnTab } from './TryOnTab';
import { WishlistTab } from './WishlistTab';
import { SettingsTab } from './SettingsTab';
import { AIStylistTab } from './AIStylistTab';
import { HomeTab } from './HomeTab';
import '../styles/global.css';
import './modules/priceAlerts';
import './modules/sizeAlerts';

export function Popup() {
  const [tab, setTab] = React.useState('home');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    chrome.storage.sync.get('authToken', ({ authToken }) => {
      setIsAuthenticated(Boolean(authToken));
    });
    const listener = (changes: any, area: string) => {
      if (area === 'sync' && changes.authToken) {
        setIsAuthenticated(Boolean(changes.authToken.newValue));
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleLogin = () => chrome.storage.sync.set({ authToken: 'demo' });
  const handleLogout = () => chrome.storage.sync.remove('authToken');

  const sampleProduct = {
    id: '1',
    name: 'Sample Product',
    image: 'https://via.placeholder.com/400',
    price: 99.99,
    currency: '$',
    colors: ['#000000', '#ffffff'],
    sizes: ['S', 'M', 'L'],
    similar: [] as any[],
  };

  return (
    <>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="sticky top-0 z-10 bg-white w-full justify-start">
          <TabsTrigger value="home" icon={<HomeIcon className="h-4 w-4" />} />
          <TabsTrigger value="product" icon={<Package className="h-4 w-4" />} />
          <TabsTrigger value="try" icon={<Camera className="h-4 w-4" />} />
          <TabsTrigger value="wishlist" icon={<Heart className="h-4 w-4" />} />
          <TabsTrigger value="stylist" icon={<Sparkles className="h-4 w-4" />} />
          <TabsTrigger value="stores" icon={<Store className="h-4 w-4" />} />
          <TabsTrigger value="settings" icon={<SettingsIcon className="h-4 w-4" />} />
        </TabsList>
        <TabsContent value="home">
          <HomeTab
            isAuthenticated={isAuthenticated}
            onNavigate={setTab}
            onLogin={handleLogin}
          />
        </TabsContent>
        <TabsContent value="product">
          <ProductTab product={sampleProduct} onTryOn={() => setTab('try')} />
        </TabsContent>
        <TabsContent value="try">
          <TryOnTab />
        </TabsContent>
        <TabsContent value="wishlist">
          <WishlistTab />
        </TabsContent>
        <TabsContent value="stylist">
          <AIStylistTab />
        </TabsContent>
        <TabsContent value="stores">
          <StoresTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        </TabsContent>
      </Tabs>
      <Toaster />
    </>
  );
}

if (process.env.NODE_ENV !== 'test') {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  root.render(<Popup />);
}
