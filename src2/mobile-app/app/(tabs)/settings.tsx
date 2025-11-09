import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useOverlay } from "../../components/overlay";
import { useOverlayLifecycle } from "../../hooks/useOverlayLifecycle";

const OverlaySettingsScreen = () => {
  const { state, show, hide, expand, collapse } = useOverlay();
  const [enabled, setEnabled] = useState(false);

  useOverlayLifecycle();

  useEffect(() => {
    setEnabled(!state.collapsed);
  }, [state.collapsed]);

  const handleToggle = useCallback(
    async (value: boolean) => {
      setEnabled(value);
      if (value) {
        await show();
        await expand();
      } else {
        await collapse();
        await hide();
      }
    },
    [collapse, expand, hide, show],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Floating console</Text>
      <Text style={styles.subtitle}>
        Control the persistent overlay used for quick FSM command entry. Grant draw-over permissions in Android settings if prompted.
      </Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Enable overlay</Text>
        <Switch value={enabled} onValueChange={handleToggle} />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Collapse when idle</Text>
        <Switch value={state.collapsed} onValueChange={(value) => (value ? collapse() : expand())} />
      </View>
    </ScrollView>
  );
};

export default OverlaySettingsScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
  },
  rowLabel: {
    fontSize: 16,
  },
});
