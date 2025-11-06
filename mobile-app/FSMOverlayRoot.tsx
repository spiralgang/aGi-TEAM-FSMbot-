import React from "react";
import { AppRegistry } from "react-native";
import { FloatingConsole, OverlayProvider } from "./components/overlay";

const OverlayApp = () => (
  <OverlayProvider>
    <FloatingConsole />
  </OverlayProvider>
);

AppRegistry.registerComponent("FSMOverlayRoot", () => OverlayApp);

export default OverlayApp;
