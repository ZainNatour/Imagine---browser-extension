import React from "react";
import ReactDOM from "react-dom/client";
import { Home, Store, Camera } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { ThemeToggle } from "../ui/theme-toggle";
import { Toaster } from "sonner";
import { StoresTab } from "./StoresTab";
import { DressingRoomTab } from "./DressingRoomTab";
import { MarketplaceTab } from "./MarketplaceTab";
import "../styles/global.css";

export function Popup() {
  return (
    <>
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="sticky top-0 z-10 bg-white w-full justify-start">
          <TabsTrigger value="home" icon={<Home className="h-4 w-4" />} />
          <TabsTrigger value="market" icon={<Store className="h-4 w-4" />}>Marketplace</TabsTrigger>
          <TabsTrigger value="stores" icon={<Store className="h-4 w-4" />} />
          <TabsTrigger value="dressing" icon={<Camera className="h-4 w-4" />} />
          <ThemeToggle className="ml-auto" />
        </TabsList>
        <TabsContent value="home">
          <div className="p-4">Home</div>
        </TabsContent>
        <TabsContent value="market">
          <MarketplaceTab />
        </TabsContent>
        <TabsContent value="stores">
          <StoresTab />
        </TabsContent>
        <TabsContent value="dressing">
          <DressingRoomTab />
        </TabsContent>
      </Tabs>
      <Toaster />
    </>
  );
}

if (process.env.NODE_ENV !== "test") {
  const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
  root.render(<Popup />);
}
