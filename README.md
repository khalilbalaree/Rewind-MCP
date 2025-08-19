# 🔄 Undo MCP Server

> **Smart checkpoint-based version control for Claude Code with automatic deduplication**

An intelligent MCP (Model Context Protocol) server that provides robust checkpoint functionality for Claude Code agents. It automatically creates checkpoints before file modifications and intelligently removes duplicate checkpoints when changes are rejected, keeping your undo history clean and meaningful.

## ✨ Features

- 🎯 **Smart Checkpointing**: Mandatory checkpoint creation before any file modifications
- 🧹 **Auto-Deduplication**: Automatically removes duplicate checkpoints from rejected changes
- 📚 **Clean Undo Stack**: Keeps only meaningful checkpoints with unique file states
- ⚡ **Fast Restoration**: Instantly restore files to any previous checkpoint
- 🔍 **Comprehensive Tracking**: View detailed history with timestamps and descriptions
- 🛡️ **Agent-Friendly**: Designed specifically for Claude Code integration

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

## 🛠️ Available Tools

### 📍 `checkpoint` (MANDATORY)
**Must be called BEFORE any file modifications!**

Creates a checkpoint of specified files before making changes.

```json
{
  "files": [
    "/path/to/file1.js",
    "/path/to/file2.ts"
  ],
  "description": "Before refactoring authentication system"
}
```

**Example Response:**
```
✅ Checkpoint created: "Before refactoring authentication system"
Files captured: 2
  - /path/to/file1.js
  - /path/to/file2.ts
```

### ↩️ `undo`
Restores files from the last checkpoint and removes it from the stack.

```json
{}
```

**Example Response:**
```
✅ Undone: "Before refactoring authentication system"
Restored files:
  - /path/to/file1.js
  - /path/to/file2.ts
```

### 📋 `list_undos`
Shows all available checkpoints with automatic deduplication.

```json
{}
```

**Example Response:**
```
Undo Stack:
[1] Before refactoring authentication system
    Created: 5m ago | Files: 2
    - /path/to/file1.js
    - /path/to/file2.ts

[2] Before adding new feature
    Created: 15m ago | Files: 1
    - /path/to/app.js
```

### 🧹 `cleanup`
Removes all checkpoints from the stack.

```json
{}
```

### 📊 `status`
Shows current system status with automatic deduplication.

```json
{}
```

**Example Response:**
```
📊 Undo System Status:
Checkpoints: 3
Can Undo: true
```

## 🎯 How It Works

### The Smart Checkpoint System

1. **🔒 Mandatory Checkpointing**: Agents MUST call `checkpoint` before any file modifications
2. **🤖 Agent Makes Changes**: Files are modified (or change attempts are made)
3. **🧠 Smart Deduplication**: When `undo`, `list_undos`, or `status` are called:
   - Compares checkpoints with current file state
   - Removes checkpoints that match current files (from rejected changes)
   - Eliminates duplicate checkpoints with identical content
   - Keeps only unique, meaningful checkpoints

### Example Workflow

```
1. Agent: checkpoint(["app.js"], "Before adding feature")
   → ✅ Checkpoint created

2. Agent: modifies app.js
   → User rejects the change

3. Agent: calls list_undos()
   → 🧹 Auto-deduplication removes the unnecessary checkpoint
   → Shows clean checkpoint list
```

## 🎪 Usage Examples

### Perfect Agent Behavior

```typescript
// ✅ CORRECT: Always checkpoint first
await mcp.checkpoint({
  files: ["/project/src/auth.js", "/project/src/config.js"],
  description: "Before implementing OAuth integration"
});

// Now make changes...
// If user rejects changes, checkpoint will be auto-removed on next undo operation
```

### Restoration Example

```typescript
// List available checkpoints
await mcp.list_undos();
// → Shows clean, deduplicated list

// Restore to previous state
await mcp.undo();
// → Restores files and removes checkpoint from stack
```

## 🤖 Agent Instructions

For optimal Claude Code integration, agents should:

### ✅ DO:
- **Always call `checkpoint` first** before any file modifications
- **Use descriptive checkpoint descriptions** that explain what changes will be made
- **Include all files** that will be modified in the checkpoint
- **Trust the auto-deduplication** - don't manually manage duplicates

### ❌ DON'T:
- Never modify files without creating a checkpoint first
- Don't worry about duplicate checkpoints - they're handled automatically
- Don't call cleanup unless explicitly requested by user

### Example Agent Interaction

```
👤 User: "Please add error handling to the authentication function"

🤖 Agent: "I'll create a checkpoint before modifying the authentication files."

[Calls checkpoint tool]

🤖 Agent: "✅ Checkpoint created: 'Before adding error handling to auth'
Now I'll add the error handling..."

[Modifies files - user may accept or reject]

🤖 Agent: "Changes complete! The checkpoint system will automatically 
clean up any unnecessary snapshots if changes were rejected."
```

## 🏗️ Development

```bash
# Development mode with auto-reload
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Run tests (if available)
npm test
```

## 📁 Project Structure

```
undo-mcp/
├── src/
│   ├── index.ts          # MCP server implementation
│   └── changeTracker.ts  # Core checkpoint logic with deduplication
├── dist/                 # Compiled JavaScript output
├── package.json
└── README.md
```

## 🔧 Technical Details

### Automatic Deduplication Algorithm

The system automatically removes:

1. **Rejected Change Checkpoints**: Checkpoints where files match current disk state
2. **Duplicate Content**: Multiple checkpoints with identical file contents
3. **Redundant States**: Keeps only unique file states in chronological order

### Error Handling

- **Missing Files**: Gracefully handles deleted or moved files
- **Permission Issues**: Reports file access problems clearly
- **Invalid Paths**: Validates file paths before checkpoint creation
- **Stack Integrity**: Maintains checkpoint stack consistency

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