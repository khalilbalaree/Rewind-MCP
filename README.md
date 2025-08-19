# 🔄 Rewind MCP

Smart checkpoint-based undo mcp server for Claude Code CLI.

## Features

- 🎯 **Smart Checkpointing**: Automatically saves file states before any changes
- 🔄 **Complete Undo Support**: Restore modified files, recover deleted files, or remove unwanted files  
- ⚡ **Fast Multi-File Restore**: Undo changes across multiple files instantly
- 🧹 **Clean History**: Automatically removes duplicate checkpoints

## Example Agent Interaction

```
👤 User: "Add error handling..."

🤖 Agent: Creating checkpoint before modifications...
✅ Checkpoint: "Before adding error handling"

🤖 Agent: "I have added error handling to the code"

👤 User: "This breaks the flow, please rewind"

🤖 Agent: Restoring files from checkpoint...
✅ Files restored to state before error handling
```

## 🚀 Quick Start

### Installation
```bash
git clone https://github.com/khalilbalaree/Rewind-MCP.git
cd Rewind-MCP
```
then,
```bash
npm install
npm run build
```

### Claude Code Configuration

Add this server to your Claude Code MCP configuration:

#### User-Based Configuration (Global)
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

#### Project-Specific Configuration (Alternative)

For easier project sharing and version control, create a `.mcp.json` file in your project directory:

```bash
# In your project directory
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "undo-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/undo-mcp/dist/index.js"],
      "env": {}
    }
  }
}
EOF
```


## Use Cases

### Example 1: Undoing File Modifications
```
👤 User: "Add authentication to the login function"

🤖 Agent: I'll add authentication to your login function.
⏺ undo-mcp - checkpoint (description: "Add authentication to login", files: ["src/auth.js"])
✅ Checkpoint created: "Add authentication to login"
Files captured: 1
  - src/auth.js

🤖 Agent: "I have added authentication to the login function"

👤 User: "This breaks the existing flow, please rewind the change"

🤖 Agent: I'll undo the authentication changes.
⏺ undo-mcp - undo
✅ Undone: "Add authentication to login" 
Restored files:
  - src/auth.js
```

### Example 2: Undoing File Creation
```
👤 User: "Create a new config file for the database"

🤖 Agent: I'll create a database configuration file.
⏺ undo-mcp - checkpoint (description: "Create database config", files: ["config/database.js"])
✅ Checkpoint created: "Create database config"
Files captured: 1
  - config/database.js (created)

🤖 Agent: "I have created the database configuration file"

👤 User: "Actually, I want to use environment variables instead. Please rewind this"

🤖 Agent: I'll remove the database config file.
⏺ undo-mcp - undo
✅ Undone: "Create database config"
Restored files:
  - config/database.js (deleted)
```

### Example 3: Undoing File Deletion
```
👤 User: "Delete the old utility functions file"

🤖 Agent: I'll remove the old utility functions file.
⏺ undo-mcp - checkpoint (description: "Delete old utils", files: ["src/utils.js"])
✅ Checkpoint created: "Delete old utils"
Files captured: 1
  - src/utils.js

🤖 Agent: "I have deleted the old utility functions file"

👤 User: "Wait, I still need some functions from that file. Please rewind the deletion"

🤖 Agent: I'll restore the deleted utility functions file.
⏺ undo-mcp - undo
✅ Undone: "Delete old utils"
Restored files:
  - src/utils.js (restored from deletion)
```

### Example 4: Multiple File Operations
```
👤 User: "Refactor the entire authentication system"

🤖 Agent: I'll refactor the authentication system across multiple files.
⏺ undo-mcp - checkpoint (description: "Refactor auth system", files: ["src/auth.js", "src/middleware.js", "src/routes.js"])
✅ Checkpoint created: "Refactor auth system"
Files captured: 3
  - src/auth.js (modified)
  - src/middleware.js (modified)  
  - src/routes.js (modified)

🤖 Agent: "I have refactored the authentication system across multiple files"

👤 User: "The refactoring introduced bugs. Please rewind all these changes"

🤖 Agent: I'll restore all files from the checkpoint.
⏺ undo-mcp - undo
✅ Undone: "Refactor auth system"
Restored files:
  - src/auth.js
  - src/middleware.js
  - src/routes.js
```


## Available Tools

- `checkpoint(files, description)` - Create checkpoint before changes
- `undo(file)` - Restore to previous checkpoint  
- `list_undos()` - Show available checkpoints
- `status()` - Show current checkpoint status


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
