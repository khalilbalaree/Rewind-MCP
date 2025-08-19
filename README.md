# 🔄 Rewind MCP

Smart and lightweight checkpointing mcp server for Claude Code CLI.

## Features

- 🎯 **Smart Checkpointing**: Automatically checkpoint project states before agent wants to make any changes
- 🔄 **Complete Undo Support**: Restore modified files, recover deleted files, or remove unwanted files
- ⚡ **Fast Multi-File Restore**: Rewind changes across multiple files instantly

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
    "Rewind-MCP": {
      "command": "node",
      "args": ["/absolute/path/to/Rewind-MCP/dist/index.js"],
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
    "Rewind-MCP": {
      "command": "node",
      "args": ["/absolute/path/to/Rewind-MCP/dist/index.js"],
      "env": {}
    }
  }
}
EOF
```


## Use Cases

```
👤 User: "Add error handling to my API"

🤖 Agent: I'll add comprehensive error handling to your API files.

[Agent modifies src/api/routes.js]
✅ Checkpoint created and pushed to stack: "Modified src/api/routes.js"

[Agent creates src/middleware/errorHandler.js]
✅ Checkpoint created and pushed to stack: "Created src/middleware/errorHandler.js"

🤖 Agent: I've added try-catch blocks and centralized error handling to your API routes and created a new error middleware.

👤 User: "Actually, I want to try a different approach. Can you show me what checkpoints are available?"

🤖 Agent: I'll show you the available checkpoints.
📋 Available checkpoints:
  1. "Created src/middleware/errorHandler.js" - [Most Recent]
  2. "Modified src/api/routes.js"
  3. "Database schema update"
  4. "Initial project setup"

👤 User: "Rewind the most recent changes"

🤖 Agent: I'll restore the files from the most recent checkpoints.
✅ Undone: "Created src/middleware/errorHandler.js"
✅ Undone: "Modified src/api/routes.js"
Restored files:
  - src/api/routes.js (restored)
  - src/middleware/errorHandler.js (deleted)

👤 User: "Perfect! Now implement error handling using a custom Error class instead"

🤖 Agent: I'll implement error handling using a custom Error class approach.

[Agent modifies src/api/routes.js]
✅ Checkpoint created and pushed to stack: "Modified src/api/routes.js"

[Agent creates src/utils/CustomError.js]
✅ Checkpoint created and pushed to stack: "Created src/utils/CustomError.js"

🤖 Agent: I've implemented error handling using a custom Error class that provides better error categorization and response formatting.
```


## Available Functional Calls for Claude
Just ask, and it will do the rest.

- `checkpoint(files, description)` - Create checkpoint before changes
- `undo(file)` - Restore to previous checkpoint  
- `list_undos()` - Show available checkpoints
- `cleanup` - clean up all the checkpoints
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

- 📖 [Documentation](https://github.com/khalilbalaree/Rewind-MCP/wiki)
- 🐛 [Issue Tracker](https://github.com/khalilbalaree/Rewind-MCP/issues)
- 💬 [Discussions](https://github.com/khalilbalaree/Rewind-MCP/discussions)

---

**Built with ❤️ for the Claude Code ecosystem**
