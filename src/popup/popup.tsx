import React from "react";
import ReactDOM from "react-dom/client";
import { Home, Store, Camera } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { StoresTab } from "./StoresTab";
import { DressingRoomTab } from "./DressingRoomTab";
import "../styles/global.css";

function Popup() {
  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="sticky top-0 z-10 bg-white">
        <TabsTrigger value="home" icon={<Home className="h-4 w-4" />} />
        <TabsTrigger value="stores" icon={<Store className="h-4 w-4" />} />
        <TabsTrigger value="dressing" icon={<Camera className="h-4 w-4" />} />
      </TabsList>
      <TabsContent value="home">
        <div className="p-4">Home</div>
      </TabsContent>
      <TabsContent value="stores">
        <StoresTab />
      </TabsContent>
      <TabsContent value="dressing">
        <DressingRoomTab />
      </TabsContent>
    </Tabs>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<Popup />);
