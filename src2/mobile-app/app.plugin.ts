import type { ConfigPlugin } from "@expo/config-plugins";
import withFSMOverlay from "./plugins/withFSMOverlay";

const plugin: ConfigPlugin = (config) => {
  config.name = config.name ?? "fsmbot";
  config.android = config.android ?? {};
  config.android.permissions = Array.from(
    new Set([...(config.android.permissions ?? []), "SYSTEM_ALERT_WINDOW"]),
  );

  return withFSMOverlay(config);
};

export default plugin;
