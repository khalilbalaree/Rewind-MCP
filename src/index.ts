#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ChangeTracker } from "./changeTracker.js";

const changeTracker = new ChangeTracker();

const server = new Server(
  {
    name: "undo-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const TOOLS = [
  {
    name: "checkpoint",
    description: "MANDATORY: ALWAYS call this function FIRST before making ANY file modifications, deletions, or creations. This creates a checkpoint to enable undo functionality. This must be called before every single file operation - no exceptions. Never modify files without calling checkpoint first.",
    inputSchema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string" },
          description: "Array of file paths that will be modified, created, or deleted",
        },
        description: {
          type: "string",
          description: "Concise, action-focused description of the next specific change to be made",
          default: "Manual checkpoint",
        },
      },
      required: ["files"],
    },
  },
  {
    name: "undo",
    description: "Undo the last checkpoint (pops from stack and restores files). Each call removes the latest checkpoint from the stack. To undo multiple changes, call this function repeatedly until the desired state is reached.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "list_undos",
    description: "List all undo checkpoints in the stack",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "cleanup",
    description: "Clear all undo checkpoints from the stack",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "status",
    description: "Get current status of the undo system (checkpoint count, number of checkpoints in the stack, and whether undo is possible)",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "checkpoint": {
        const files = args?.files as string[];
        const description = (args?.description as string) || "Manual checkpoint";
        if (!files || files.length === 0) {
          throw new Error("Files array is required");
        }
        await changeTracker.createCheckpoint(files, description);
        return {
          content: [
            {
              type: "text",
              text: `✅ Checkpoint created: "${description}"\nFiles captured: ${files.length}\n${files.map(f => `  - ${f}`).join('\n')}`,
            },
          ],
        };
      }

      case "undo": {
        const result = await changeTracker.undo();
        return {
          content: [
            {
              type: "text",
              text: result.success
                ? `✅ Undone: "${result.description}"\nRestored files:\n${result.restoredFiles?.map(f => `  - ${f}`).join('\n')}`
                : result.message || "Failed to undo",
            },
          ],
        };
      }

      case "list_undos": {
        const undoList = changeTracker.listUndoStack();
        return {
          content: [
            {
              type: "text",
              text: `Undo Stack:\n${undoList.join('\n\n')}`,
            },
          ],
        };
      }

      case "cleanup": {
        changeTracker.cleanup();
        return {
          content: [
            {
              type: "text",
              text: "✅ All undo checkpoints cleared",
            },
          ],
        };
      }

      case "status": {
        const status = changeTracker.getStatus();
        return {
          content: [
            {
              type: "text",
              text: `📊 Undo System Status:\nCheckpoints: ${status.checkpointCount}\nCan Undo: ${status.canUndo}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Undo MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});