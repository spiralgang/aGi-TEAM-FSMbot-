#!/data/data/com.termux/files/usr/bin/sh
set -e
[ -z "$1" ] && { echo "Usage: axium-wrap.sh <tool> [real_path]"; exit 1; }
tool="$1"
real="${2:-$(command -v "$tool" || true)}"
[ -z "$real" ] && { echo "Tool not found: $tool"; exit 1; }

AX="$HOME/.axium"
cat > "$AX/bin/$tool" << EOF
#!/data/data/com.termux/files/usr/bin/sh
. "$AX/lib/env.sh"
in="\$(mktemp)"; out="\$(mktemp)"; err="\$(mktemp)"
cat - > "\$in"
axium_log "exec $tool args=\$*"
env -i PATH="\$PATH" HOME="\$HOME" AXIUM_ENFORCE="\$AXIUM_ENFORCE" AXIUM_PROFILE="\$AXIUM_PROFILE" \\
  "$real" "\$@" < "\$in" > "\$out" 2> "\$err"
rc=\$?
axium_log "$tool rc=\$rc"
cat "\$out"
cat "\$err" >&2
rm -f "\$in" "\$out" "\$err"
exit \$rc
EOF
chmod +x "$AX/bin/$tool"
echo "Wrapped: $tool -> $AX/bin/$tool (real: $real)"
