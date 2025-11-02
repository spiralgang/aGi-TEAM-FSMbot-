#!/data/data/com.termux/files/usr/bin/sh
set -e

AX="$HOME/.axium"
mkdir -p "$AX/bin" "$AX/lib" "$AX/logs" "$AX/profiles"

cat > "$AX/lib/env.sh" << 'EOF'

# Axium Env Reinjection (userspace)
export AXIUM_HOME="$HOME/.axium"
export AXIUM_PROFILE="${AXIUM_PROFILE:-default}"
export AXIUM_LOG_RING="${AXIUM_LOG_RING:-$AXIUM_HOME/logs/ring.log}"
export AXIUM_ENFORCE="${AXIUM_ENFORCE:-on}"

# History control
export HISTSIZE=1000
export HISTCONTROL=ignorespace:erasedups
export HISTFILE="$HOME/.axium/.histfile"

# Prepend shim path if missing
case ":$PATH:" in
  ":$HOME/.axium/bin:") ;;
  *) export PATH="$HOME/.axium/bin:$PATH" ;;
esac

axium_log() {
  ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  printf "%s [%s] %s\n" "$ts" "$AXIUM_PROFILE" "$*" >> "$AXIUM_LOG_RING"
  sz=$(wc -c < "$AXIUM_LOG_RING" 2>/dev/null || echo 0)
  [ "$sz" -gt 262144 ] && tail -c 131072 "$AXIUM_LOG_RING" > "$AXIUM_LOG_RING.tmp" && mv "$AXIUM_LOG_RING.tmp" "$AXIUM_LOG_RING"
}

export PROMPT_COMMAND="axium_log shellprompt && . $AXIUM_HOME/lib/env.sh"
EOF

for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
  [ -f "$rc" ] || touch "$rc"
  grep -q "Axium Env Reinjection" "$rc" || printf "\n. \"$AX/lib/env.sh\"\n" >> "$rc"
done

echo "Axium userspace PATH shim installed."
