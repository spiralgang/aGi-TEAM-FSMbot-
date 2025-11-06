import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { DockableOverlay } from "./DockableOverlay";
import { useOverlay } from "./OverlayContext";

type Command = {
  id: string;
  text: string;
  timestamp: number;
};

const MAX_HISTORY = 50;

const historyItemKeyExtractor = (item: Command) => item.id;

const EmptyHistory = () => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>No commands yet</Text>
    <Text style={styles.emptySubtitle}>Enter a command to instruct the floating console.</Text>
  </View>
);

export const FloatingConsole: React.FC = () => {
  const { state, collapse, expand, hide } = useOverlay();
  const [history, setHistory] = useState<Command[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setHistory((current) => [
      { id: `${Date.now()}`, text: trimmed, timestamp: Date.now() },
      ...current.slice(0, MAX_HISTORY - 1),
    ]);
    setInput("");
  }, [input]);

  const renderHistoryItem = useCallback(({ item }: { item: Command }) => {
    const date = new Date(item.timestamp);
    return (
      <View style={styles.historyItem}>
        <Text style={styles.historyTimestamp}>{date.toLocaleTimeString()}</Text>
        <Text style={styles.historyText}>{item.text}</Text>
      </View>
    );
  }, []);

  const commandPlaceholder = useMemo(
    () => (state.collapsed ? "Expand to enter commands" : "Type a command"),
    [state.collapsed],
  );

  const handleToggleCollapsed = useCallback(() => {
    if (state.collapsed) {
      expand();
    } else {
      collapse();
    }
  }, [collapse, expand, state.collapsed]);

  return (
    <DockableOverlay collapsed={state.collapsed}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={[styles.wrapper, state.collapsed && styles.wrapperCollapsed]}
      >
        {state.collapsed ? (
          <Pressable style={styles.collapsedBubble} onPress={expand}>
            <Text style={styles.collapsedLabel}>FSM</Text>
          </Pressable>
        ) : (
          <View style={styles.panel}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Floating console</Text>
                <Text style={styles.subtitle}>Send FSM commands without leaving the app.</Text>
              </View>
              <View style={styles.headerButtons}>
                <Pressable style={styles.iconButton} onPress={handleToggleCollapsed}>
                  <Text style={styles.iconButtonLabel}>▾</Text>
                </Pressable>
                <Pressable style={styles.iconButton} onPress={hide}>
                  <Text style={styles.iconButtonLabel}>✕</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.history}>
              <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={historyItemKeyExtractor}
                ListEmptyComponent={EmptyHistory}
                keyboardShouldPersistTaps="always"
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                placeholder={commandPlaceholder}
                value={input}
                style={styles.input}
                onChangeText={setInput}
                onSubmitEditing={handleSubmit}
                editable={!state.collapsed}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              <Pressable
                style={[styles.primaryButton, input.trim().length === 0 && styles.primaryButtonDisabled]}
                disabled={input.trim().length === 0}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryButtonLabel}>Send</Text>
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </DockableOverlay>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  wrapperCollapsed: {
    backgroundColor: "#222",
  },
  collapsedBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  collapsedLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  panel: {
    width: 320,
    maxWidth: 360,
    backgroundColor: "#101217",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  history: {
    maxHeight: 240,
  },
  historyItem: {
    paddingVertical: 8,
    gap: 4,
  },
  historyTimestamp: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
  },
  historyText: {
    color: "#fff",
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 4,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#fff",
  },
  primaryButton: {
    backgroundColor: "#4E8DFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  primaryButtonLabel: {
    color: "#fff",
    fontWeight: "600",
  },
});
