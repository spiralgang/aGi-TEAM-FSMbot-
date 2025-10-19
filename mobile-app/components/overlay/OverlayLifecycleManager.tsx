import React from "react";
import { useOverlayLifecycle } from "../../hooks/useOverlayLifecycle";

type Props = {
  isAuthenticated?: boolean;
};

type AuthHook = () => { user?: unknown; currentUser?: unknown } | boolean | undefined;

function useFallbackAuth(): ReturnType<AuthHook> {
  return undefined;
}

let externalAuthHook: AuthHook | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const maybeAuth = require("../../state/auth/useAuth");
  if (typeof maybeAuth?.useAuth === "function") {
    externalAuthHook = maybeAuth.useAuth as AuthHook;
  }
} catch (error) {
  // Ignore missing auth hook; overlay lifecycle will fall back to the provided prop.
}

export const OverlayLifecycleManager: React.FC<Props> = ({ isAuthenticated }) => {
  const useAuth = externalAuthHook ?? useFallbackAuth;
  const authState = useAuth();
  const derivedAuth = (() => {
    if (typeof authState === "boolean") {
      return authState;
    }

    const shaped = authState as { user?: unknown; currentUser?: unknown } | undefined;
    if (shaped?.user !== undefined) {
      return Boolean(shaped.user);
    }
    if (shaped?.currentUser !== undefined) {
      return Boolean(shaped.currentUser);
    }

    return Boolean(authState);
  })();

  const resolvedAuthenticated = isAuthenticated ?? derivedAuth;

  useOverlayLifecycle(resolvedAuthenticated);
  return null;
};
