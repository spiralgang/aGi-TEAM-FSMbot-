import { useEffect } from "react";
import { AppState } from "react-native";
import { useOverlay } from "../components/overlay";

/**
 * Starts the overlay when the user is authenticated and stops it after sign-out.
 *
 * @param isAuthenticated Optional toggle that represents the signed-in state. Defaults to `true` for apps
 * that call this hook only after login.
 */
export function useOverlayLifecycle(isAuthenticated: boolean = true) {
  const { show, hide, collapse } = useOverlay();

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = async () => {
      if (!isMounted) {
        return;
      }

      if (isAuthenticated) {
        await show();
      } else {
        await collapse();
        await hide();
      }
    };

    handleAuthChange();

    return () => {
      isMounted = false;
      collapse();
      hide();
    };
  }, [collapse, hide, isAuthenticated, show]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") {
        collapse();
      }
    });

    return () => subscription.remove();
  }, [collapse]);
}
