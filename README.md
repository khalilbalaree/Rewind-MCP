# 🔄 Undo MCP Server

Smart checkpoint-based undo system for Claude Code.

## Features

- 🎯 **Smart Checkpointing**: Auto-checkpoint before file modifications  
- 🧹 **Auto-Deduplication**: Removes duplicate/rejected change checkpoints
- ⚡ **Fast Restoration**: Instantly restore files to previous states
- 🔍 **Clean History**: Only keeps meaningful checkpoints

## Example Agent Interaction

```
👤 User: "Add error handling but I might want to undo it"

🤖 Agent: Creating checkpoint before modifications...
✅ Checkpoint: "Before adding error handling"

[Agent adds error handling code]

👤 User: "This breaks the flow, please undo"

🤖 Agent: Restoring files from checkpoint...
✅ Files restored to state before error handling
```

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/khalilbalaree/undo-mcp.git
cd undo-mcp
npm install
npm run build
```

### Claude Code Configuration

Add this server to your Claude Code MCP configuration:

#### macOS/Linux
Edit `~/Library/Application Support/Claude/claude_code_config.json`:

```json
{
  "mcpServers": {
    "undo-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/undo-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

#### Windows
Edit `%APPDATA%\Claude\claude_code_config.json`:

```json
{
  "mcpServers": {
    "undo-mcp": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\undo-mcp\\dist\\index.js"],
      "env": {}
    }
  }
}
```

## How It Works

1. **Checkpoint**: Agent calls `checkpoint` before file modifications
2. **Modify**: Agent makes changes (user may accept/reject)  
3. **Auto-Clean**: System removes duplicate checkpoints when accessing undo history

### Undo Examples

**Scenario 1: Rejected code changes**
```bash
# Agent creates checkpoint before refactoring
checkpoint(["auth.js"], "Before refactor")

# Agent refactors code, user rejects changes  
# File reverts to original state

# When listing undos, duplicate checkpoint is auto-removed
list_undos() # ✅ Clean history, no redundant checkpoints
```

**Scenario 2: Multiple undo steps**
```bash
# Multiple development iterations
checkpoint(["api.js"], "Add user validation")     # State A
# ... changes accepted ...

checkpoint(["api.js"], "Add error handling")      # State B  
# ... changes accepted ...

checkpoint(["api.js"], "Add rate limiting")       # State C
# ... changes rejected, want to undo ...

undo("api.js") # → Restores State B (before rate limiting)
undo("api.js") # → Restores State A (before error handling)
```

**Scenario 3: Multi-file checkpoint restore**
```bash
# Working on authentication feature across multiple files
checkpoint(["auth.js", "user.js", "middleware.js"], "Before auth refactor")

# Changes made to all files, but introduced bugs
# Need to restore all files to checkpoint

undo("auth.js")       # Restore auth.js
undo("user.js")       # Restore user.js  
undo("middleware.js") # Restore middleware.js
```

## Available Commands

- `checkpoint(files, description)` - Create checkpoint before changes
- `undo(file)` - Restore file to previous checkpoint  
- `list_undos()` - Show available checkpoints (auto-deduplicates)
- `status()` - Show current checkpoint status

## Technical Details

**Auto-Deduplication**: Removes checkpoints that match current file state or have duplicate content, keeping only meaningful restore points.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📖 [Documentation](https://github.com/khalilbalaree/undo-mcp/wiki)
- 🐛 [Issue Tracker](https://github.com/khalilbalaree/undo-mcp/issues)
- 💬 [Discussions](https://github.com/khalilbalaree/undo-mcp/discussions)

---

**Built with ❤️ for the Claude Code ecosystem**