import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
} from "@expo/config-plugins";

const OVERLAY_PERMISSION = "android.permission.SYSTEM_ALERT_WINDOW";
const SERVICE_NAME = "com.fsmbot.overlay.FSMOverlayService";
const SHOW_ACTION = "com.fsmbot.overlay.SHOW";

type AndroidManifest = AndroidConfig.Manifest.AndroidManifest;
type ManifestApplication = AndroidConfig.Manifest.ManifestApplication;

type ManifestUsesPermission = AndroidConfig.Manifest.ManifestUsesPermission;
type ManifestService = AndroidConfig.Manifest.ManifestService;

type ManifestRoot = AndroidConfig.Manifest.ManifestRoot;

function getOrCreateApplication(manifest: AndroidManifest): ManifestApplication {
  const root: ManifestRoot = (manifest.manifest ??= {} as ManifestRoot);
  const application = (root.application ??= [{} as ManifestApplication]);
  if (application.length === 0) {
    application.push({} as ManifestApplication);
  }

  return application[0];
}

function ensureOverlayPermission(manifest: AndroidManifest) {
  const root: ManifestRoot = (manifest.manifest ??= {} as ManifestRoot);
  const permissions = (root["uses-permission"] ??= [] as ManifestUsesPermission[]);

  const hasPermission = permissions.some(
    (entry) => entry.$["android:name"] === OVERLAY_PERMISSION,
  );

  if (!hasPermission) {
    permissions.push({
      $: {
        "android:name": OVERLAY_PERMISSION,
      },
    });
  }
}

function ensureOverlayService(manifest: AndroidManifest) {
  const application = getOrCreateApplication(manifest);
  const services = (application.service ??= [] as ManifestService[]);

  const hasService = services.some((entry) => entry.$["android:name"] === SERVICE_NAME);

  if (!hasService) {
    services.push({
      $: {
        "android:name": SERVICE_NAME,
        "android:exported": "false",
        "android:foregroundServiceType": "mediaProjection",
      },
      "intent-filter": [
        {
          action: [
            {
              $: {
                "android:name": SHOW_ACTION,
              },
            },
          ],
        },
      ],
    });
  }
}

const withFSMOverlay: ConfigPlugin = (config) =>
  withAndroidManifest(config, (configProps) => {
    ensureOverlayPermission(configProps.modResults);
    ensureOverlayService(configProps.modResults);
    return configProps;
  });

export default withFSMOverlay;
