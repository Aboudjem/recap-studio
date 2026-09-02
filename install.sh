#!/usr/bin/env bash
#
# Recap Studio multi-CLI installer.
#
# Installs Recap Studio's four skills (/recap-topic, /recap-session,
# /recap-setup, /recap-validate) into a target AI coding CLI.
#
# By default this delegates to the Vercel skills CLI:
#
#   npx --yes skills@1.5.23 add Aboudjem/recap-studio -a <agent> -g -y
#
# That CLI tracks each agent's current skills directory, so the install path
# stays right as agents move theirs. --legacy keeps the original behaviour:
# symlink this checkout's skills/ into a hardcoded per-platform directory, no
# network and no npx.
#
# The optional local MCP server (node packages/mcp-server/dist/index.js) is the
# universal fallback for any MCP-capable client; build it once with
# `pnpm install && pnpm -w build`. See docs/editors.md.
#
# Usage:
#   ./install.sh <platform> [--legacy] [--project] [--update | --uninstall] [--no-mcp]
#   curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s <platform>
#
# Platforms: gemini codex opencode pi vibe vscode copilot trae
#            openclaw antigravity hermes cline kimi   (or: all)
#
set -euo pipefail

REPO_URL="https://github.com/Aboudjem/recap-studio.git"
REPO_SLUG="Aboudjem/recap-studio"
SKILLS_PKG="skills@1.5.23"
CLONE_DIR="${RECAP_STUDIO_HOME:-$HOME/.recap-studio}"
SKILLS=(recap-topic recap-session recap-setup recap-validate)
ALL_IDS=(gemini codex opencode pi vibe vscode copilot trae openclaw antigravity hermes cline kimi)

c_red=""; c_grn=""; c_dim=""; c_rst=""
if [ -t 1 ]; then
  c_red="$(printf '\033[31m')"; c_grn="$(printf '\033[32m')"
  c_dim="$(printf '\033[2m')"; c_rst="$(printf '\033[0m')"
fi
info() { printf '%s\n' "$*"; }
ok()   { printf '%s%s%s\n' "$c_grn" "$*" "$c_rst"; }
warn() { printf '%s%s%s\n' "$c_red" "$*" "$c_rst" >&2; }

usage() {
  cat <<EOF
Recap Studio installer

Usage:
  install.sh <platform> [options]
  curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s <platform>

Platforms:
  ${ALL_IDS[*]}
  all   apply to every platform above

Options:
  --legacy     symlink skills/ directly instead of calling the skills CLI
               (no npx, no network; uses this script's own platform table)
  --project    install into the current directory instead of your user directory
  --update     refresh an existing install
  --uninstall  remove the skills for <platform>
  --no-mcp     skip the MCP-server hint
  -h, --help   show this help

Default path (needs npx):
  npx --yes $SKILLS_PKG add $REPO_SLUG -a <agent> -g -y

The local MCP server works in every MCP-capable client (build it first with
pnpm install && pnpm -w build):
  claude mcp add recap-studio-tools -- node packages/mcp-server/dist/index.js
  # generic: node packages/mcp-server/dist/index.js
EOF
}

# agent_code <platform-id> -> skills-CLI --agent code on stdout (empty if none).
# Every code below appears in https://github.com/vercel-labs/skills#supported-agents
agent_code() {
  case "$1" in
    gemini)         printf '%s\n' "gemini-cli" ;;
    codex)          printf '%s\n' "codex" ;;
    opencode)       printf '%s\n' "opencode" ;;
    pi)             printf '%s\n' "pi" ;;
    vibe)           printf '%s\n' "mistral-vibe" ;;
    vscode|copilot) printf '%s\n' "github-copilot" ;;
    trae)           printf '%s\n' "trae" ;;
    openclaw)       printf '%s\n' "openclaw" ;;
    antigravity)    printf '%s\n' "antigravity" ;;
    hermes)         printf '%s\n' "hermes-agent" ;;
    cline)          printf '%s\n' "cline" ;;
    kimi)           printf '%s\n' "kimi-code-cli" ;;
    *)              printf '%s\n' "" ;;
  esac
}

# platform_target <id> -> "dir|style" on stdout (empty if unknown). Legacy only.
platform_target() {
  case "$1" in
    gemini|codex|opencode|pi) printf '%s\n' "$HOME/.agents/skills|per-skill" ;;
    vibe)           printf '%s\n' "$HOME/.vibe/skills|per-skill" ;;
    vscode|copilot) printf '%s\n' "$HOME/.copilot/skills|per-skill" ;;
    trae)           printf '%s\n' "$HOME/.trae/skills|per-skill" ;;
    openclaw)       printf '%s\n' "$HOME/.openclaw/skills|folder" ;;
    antigravity)    printf '%s\n' "$HOME/.gemini/antigravity/skills|folder" ;;
    hermes)         printf '%s\n' "$HOME/.hermes/skills|folder" ;;
    cline)          printf '%s\n' "$HOME/.cline/skills|folder" ;;
    kimi)           printf '%s\n' "$HOME/.kimi/skills|folder" ;;
    *)              printf '%s\n' "" ;;
  esac
}

# Use a local checkout (script next to skills/) or clone/refresh one.
resolve_root() {
  local src dir
  src="${BASH_SOURCE[0]:-}"
  if [ -n "$src" ] && [ -f "$src" ]; then
    dir="$(cd "$(dirname "$src")" && pwd)"
    if [ -d "$dir/skills" ]; then
      printf '%s\n' "$dir"
      return 0
    fi
  fi
  if [ -d "$CLONE_DIR/.git" ]; then
    git -C "$CLONE_DIR" pull --ff-only --quiet >/dev/null 2>&1 || true
  else
    command -v git >/dev/null 2>&1 || { warn "git is required to install from a pipe."; exit 1; }
    git clone --depth 1 "$REPO_URL" "$CLONE_DIR" >/dev/null 2>&1
  fi
  printf '%s\n' "$CLONE_DIR"
}

link_one() {
  local root="$1" target="$2" style="$3" s
  mkdir -p "$target"
  if [ "$style" = "folder" ]; then
    ln -sfn "$root/skills" "$target/recap-studio"
    ok "linked $target/recap-studio -> $root/skills"
  else
    for s in "${SKILLS[@]}"; do
      ln -sfn "$root/skills/$s" "$target/$s"
      ok "linked $target/$s -> $root/skills/$s"
    done
  fi
}

unlink_one() {
  local target="$1" style="$2" s
  if [ "$style" = "folder" ]; then
    rm -f "$target/recap-studio"
    info "removed $target/recap-studio"
  else
    for s in "${SKILLS[@]}"; do
      rm -f "$target/$s"
      info "removed $target/$s"
    done
  fi
}

# skills_add <agent-code> <scope-flag>
skills_add() {
  local code="$1" scope="$2" args
  args=(add "$REPO_SLUG" -a "$code")
  [ -n "$scope" ] && args+=("$scope")
  args+=(-y)
  info "${c_dim}npx --yes $SKILLS_PKG ${args[*]}${c_rst}"
  if npx --yes "$SKILLS_PKG" "${args[@]}"; then
    ok "installed $REPO_SLUG into $code"
    return 0
  fi
  warn "skills CLI failed for $code"
  return 1
}

# skills_remove <agent-code> <scope-flag>
skills_remove() {
  local code="$1" scope="$2" args joined
  joined="$(IFS=,; printf '%s' "${SKILLS[*]}")"
  args=(remove -a "$code" -s "$joined")
  [ -n "$scope" ] && args+=("$scope")
  args+=(-y)
  info "${c_dim}npx --yes $SKILLS_PKG ${args[*]}${c_rst}"
  if npx --yes "$SKILLS_PKG" "${args[@]}"; then
    ok "removed $REPO_SLUG from $code"
    return 0
  fi
  warn "skills CLI failed for $code"
  return 1
}

mcp_hint() {
  info ""
  info "${c_dim}Local MCP server (works in every MCP-capable client; run pnpm install && pnpm -w build first):${c_rst}"
  info "  claude mcp add recap-studio-tools -- node packages/mcp-server/dist/index.js"
  info "  ${c_dim}generic:${c_rst} node packages/mcp-server/dist/index.js"
  info "  ${c_dim}per-editor snippets:${c_rst} docs/editors.md"
}

main() {
  local platform="" action="install" show_mcp=1 legacy=0 scope="-g" arg
  for arg in "$@"; do
    case "$arg" in
      --legacy)    legacy=1 ;;
      --project)   scope="" ;;
      --update)    action="update" ;;
      --uninstall) action="uninstall" ;;
      --no-mcp)    show_mcp=0 ;;
      -h|--help)   usage; exit 0 ;;
      -*)          warn "unknown option: $arg"; usage; exit 1 ;;
      *)           platform="$arg" ;;
    esac
  done

  if [ -z "$platform" ]; then
    usage
    exit 1
  fi

  local ids=()
  if [ "$platform" = "all" ]; then
    ids=("${ALL_IDS[@]}")
  else
    ids=("$platform")
  fi

  if [ "$legacy" -eq 0 ] && ! command -v npx >/dev/null 2>&1; then
    warn "npx not found; falling back to --legacy (symlinks from this checkout)."
    legacy=1
  fi

  local root=""
  if [ "$legacy" -eq 1 ] && [ "$action" != "uninstall" ]; then
    root="$(resolve_root)"
    info "Recap Studio checkout: $root"
  fi

  local id code spec dir style any=0
  for id in "${ids[@]}"; do
    if [ "$legacy" -eq 0 ]; then
      code="$(agent_code "$id")"
      if [ -n "$code" ]; then
        any=1
        case "$action" in
          install|update) skills_add "$code" "$scope" || true ;;
          uninstall)      skills_remove "$code" "$scope" || true ;;
        esac
        continue
      fi
      warn "no skills-CLI agent code for '$id'; using the legacy path for it."
      [ -z "$root" ] && [ "$action" != "uninstall" ] && root="$(resolve_root)"
    fi

    spec="$(platform_target "$id")"
    if [ -z "$spec" ]; then
      warn "unknown platform: $id (run --help for the list). MCP fallback still works."
      continue
    fi
    dir="${spec%%|*}"; style="${spec##*|}"
    any=1
    case "$action" in
      install|update) link_one "$root" "$dir" "$style" ;;
      uninstall)      unlink_one "$dir" "$style" ;;
    esac
  done

  if [ "$any" -eq 1 ] && [ "$action" != "uninstall" ] && [ "$show_mcp" -eq 1 ]; then
    mcp_hint
  fi
}

main "$@"
