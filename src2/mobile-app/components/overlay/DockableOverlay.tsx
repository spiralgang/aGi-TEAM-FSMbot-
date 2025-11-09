import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useOverlay } from "./OverlayContext";

const MIN_MARGIN = 16;
const COLLAPSED_SIZE = 72;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type Props = {
  children: React.ReactNode;
  collapsed: boolean;
  style?: ViewStyle;
};

export const DockableOverlay: React.FC<Props> = ({ children, collapsed, style }) => {
  const {
    state: { x, y },
    setPosition,
  } = useOverlay();
  const [layout, setLayout] = useState({ width: COLLAPSED_SIZE, height: COLLAPSED_SIZE });
  const animated = useRef(new Animated.ValueXY({ x, y })).current;
  const panOffset = useRef({ x, y });

  useEffect(() => {
    panOffset.current = { x, y };
    Animated.spring(animated, {
      toValue: { x, y },
      useNativeDriver: false,
      bounciness: 0,
      speed: 12,
    }).start();
  }, [animated, x, y]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4,
        onPanResponderGrant: () => {
          animated.stopAnimation();
          panOffset.current = { x, y };
        },
        onPanResponderMove: (_, gestureState) => {
          const window = Dimensions.get("window");
          const nextX = clamp(
            panOffset.current.x + gestureState.dx,
            MIN_MARGIN - layout.width,
            window.width - MIN_MARGIN,
          );
          const nextY = clamp(
            panOffset.current.y + gestureState.dy,
            MIN_MARGIN,
            window.height - layout.height - MIN_MARGIN,
          );
          animated.setValue({ x: nextX, y: nextY });
        },
        onPanResponderRelease: async (_, gestureState) => {
          const window = Dimensions.get("window");
          const rawX = panOffset.current.x + gestureState.dx;
          const rawY = panOffset.current.y + gestureState.dy;
          const dockX = rawX + layout.width / 2 > window.width / 2
            ? window.width - layout.width - MIN_MARGIN
            : MIN_MARGIN;
          const dockY = clamp(rawY, MIN_MARGIN, window.height - layout.height - MIN_MARGIN);

          Animated.spring(animated, {
            toValue: { x: dockX, y: dockY },
            useNativeDriver: false,
            bounciness: 8,
          }).start();

          await setPosition(dockX, dockY);
        },
      }),
    [animated, layout.height, layout.width, setPosition, x, y],
  );

  return (
    <Animated.View
      onLayout={handleLayout}
      {...panResponder.panHandlers}
      style={[
        styles.container,
        style,
        {
          transform: animated.getTranslateTransform(),
          width: collapsed ? COLLAPSED_SIZE : undefined,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
});
