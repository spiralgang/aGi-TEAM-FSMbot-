import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NativeEventEmitter, NativeModules } from "react-native";

type OverlayState = {
  collapsed: boolean;
  x: number;
  y: number;
};

type OverlayContextValue = {
  state: OverlayState;
  show: () => Promise<void>;
  hide: () => Promise<void>;
  expand: () => Promise<void>;
  collapse: () => Promise<void>;
  toggle: () => Promise<void>;
  shutdown: () => Promise<void>;
  setPosition: (x: number, y: number) => Promise<void>;
};

const DEFAULT_STATE: OverlayState = {
  collapsed: true,
  x: 0,
  y: 0,
};

const OverlayContext = createContext<OverlayContextValue | undefined>(undefined);

const overlayModule = NativeModules.FSMOverlay as
  | {
      showOverlay?: () => Promise<void>;
      hideOverlay?: () => Promise<void>;
      expand?: () => Promise<void>;
      collapse?: () => Promise<void>;
      shutdown?: () => Promise<void>;
      setGeometry?: (x: number, y: number, collapsed: boolean) => Promise<void>;
    }
  | undefined;

export const OverlayProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<OverlayState>(DEFAULT_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!overlayModule) {
      return;
    }

    const emitter = new NativeEventEmitter(overlayModule);
    const subscription = emitter.addListener("fsmOverlayState", (event: Partial<OverlayState>) => {
      setState((current) => ({
        ...current,
        ...event,
      }));
    });

    return () => subscription.remove();
  }, []);

  const callModule = useCallback(
    async (method: keyof NonNullable<typeof overlayModule>) => {
      if (overlayModule?.[method]) {
        await overlayModule[method]!();
      }
    },
    [],
  );

  const value = useMemo<OverlayContextValue>(() => ({
    state,
    show: () => callModule("showOverlay"),
    hide: () => callModule("hideOverlay"),
    expand: () => callModule("expand"),
    collapse: () => callModule("collapse"),
    toggle: async () => {
      if (stateRef.current.collapsed) {
        await callModule("expand");
      } else {
        await callModule("collapse");
      }
    },
    shutdown: () => callModule("shutdown"),
    setPosition: async (x: number, y: number) => {
      if (overlayModule?.setGeometry) {
        await overlayModule.setGeometry(Math.round(x), Math.round(y), stateRef.current.collapsed);
      }
    },
  }), [callModule, state]);

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
};

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
}
