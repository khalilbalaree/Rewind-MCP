import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from "fs";
import { dirname } from "path";

interface UndoCheckpoint {
  files: Map<string, string>; // filepath -> content
  createdFiles: Set<string>; // files that were created (didn't exist before)
  timestamp: Date;
  description: string;
}

export class ChangeTracker {
  private undoStack: UndoCheckpoint[] = [];

  async createCheckpoint(files: string[], description: string = "Manual checkpoint"): Promise<void> {
    const fileContents = new Map<string, string>();
    const createdFiles = new Set<string>();

    console.error(`[DEBUG] Creating checkpoint: ${description}`);
    console.error(`[DEBUG] Files to checkpoint: ${files.join(', ')}`);

    for (const filepath of files) {
      if (!existsSync(filepath)) {
        console.error(`[DEBUG] File will be created: ${filepath}`);
        createdFiles.add(filepath);
      } else {
        const content = readFileSync(filepath, "utf-8");
        fileContents.set(filepath, content);
        console.error(`[DEBUG] Captured content for ${filepath}: ${content.length} characters`);
      }
    }

    const checkpoint: UndoCheckpoint = {
      files: fileContents,
      createdFiles,
      timestamp: new Date(),
      description,
    };

    this.undoStack.push(checkpoint);
    console.error(`[DEBUG] Checkpoint created. Stack size: ${this.undoStack.length}`);
    console.error(`[DEBUG] Files to be created: ${Array.from(createdFiles).join(', ') || 'none'}`);
    console.error(`[DEBUG] Existing files captured: ${fileContents.size}`);
  }

  async undo(): Promise<{
    success: boolean;
    message?: string;
    restoredFiles?: string[];
    description?: string;
  }> {
    // Deduplicate checkpoints before proceeding
    this.deduplicateCheckpoints();
    
    if (this.undoStack.length === 0) {
      return { success: false, message: "No checkpoints to undo" };
    }

    const checkpoint = this.undoStack.pop()!;
    const restoredFiles: string[] = [];
    const errors: string[] = [];

    console.error(`[DEBUG] Starting undo for checkpoint: ${checkpoint.description}`);
    console.error(`[DEBUG] Files to restore: ${Array.from(checkpoint.files.keys()).join(', ')}`);
    console.error(`[DEBUG] Files to remove: ${Array.from(checkpoint.createdFiles).join(', ') || 'none'}`);

    try {
      // First, restore existing files
      for (const [filepath, content] of checkpoint.files.entries()) {
        try {
          console.error(`[DEBUG] Restoring file: ${filepath}`);
          console.error(`[DEBUG] Content length: ${content.length}`);
          
          // If file doesn't exist, it was deleted - restore it
          const wasDeleted = !existsSync(filepath);
          if (wasDeleted) {
            console.error(`[DEBUG] File was deleted, restoring: ${filepath}`);
            // Ensure directory exists before creating file
            const dir = dirname(filepath);
            if (!existsSync(dir)) {
              mkdirSync(dir, { recursive: true });
            }
          }
          
          writeFileSync(filepath, content, "utf-8");
          restoredFiles.push(wasDeleted ? `${filepath} (restored from deletion)` : filepath);
          console.error(`[DEBUG] Successfully restored: ${filepath}`);
        } catch (fileError) {
          const errorMsg = `Failed to restore ${filepath}: ${fileError}`;
          errors.push(errorMsg);
          console.error(`[DEBUG] Error restoring ${filepath}:`, fileError);
          console.error(`[DEBUG] Full error details:`, {
            filepath,
            contentLength: content.length,
            fileExists: existsSync(filepath),
            dirExists: existsSync(dirname(filepath)),
            error: fileError
          });
        }
      }

      // Then, remove files that were created (undo file creation)
      for (const filepath of checkpoint.createdFiles) {
        try {
          console.error(`[DEBUG] Removing created file: ${filepath}`);
          
          if (existsSync(filepath)) {
            unlinkSync(filepath);
            restoredFiles.push(`${filepath} (deleted)`);
            console.error(`[DEBUG] Successfully removed: ${filepath}`);
          } else {
            console.error(`[DEBUG] Created file ${filepath} already doesn't exist`);
          }
        } catch (fileError) {
          errors.push(`Failed to remove created file ${filepath}: ${fileError}`);
          console.error(`[DEBUG] Error removing ${filepath}:`, fileError);
        }
      }

      if (errors.length > 0) {
        // Put checkpoint back if any files failed
        this.undoStack.push(checkpoint);
        return {
          success: false,
          message: `Some files failed to restore: ${errors.join('; ')}`,
        };
      }

      console.error(`[DEBUG] Undo completed successfully. Restored ${restoredFiles.length} files`);
      return {
        success: true,
        restoredFiles,
        description: checkpoint.description,
      };
    } catch (error) {
      // Put checkpoint back if restore failed
      this.undoStack.push(checkpoint);
      console.error(`[DEBUG] Undo failed with error:`, error);
      return {
        success: false,
        message: `Failed to restore checkpoint: ${error}`,
      };
    }
  }

  listUndoStack(): string[] {
    // Deduplicate checkpoints before listing
    this.deduplicateCheckpoints();
    
    if (this.undoStack.length === 0) {
      return ["No undo checkpoints available"];
    }

    const list: string[] = [];
    this.undoStack.forEach((checkpoint, index) => {
      const fileCount = checkpoint.files.size;
      const createdFileCount = checkpoint.createdFiles.size;
      const totalFiles = fileCount + createdFileCount;
      const timeAgo = this.getTimeAgo(checkpoint.timestamp);
      
      const filesList = Array.from(checkpoint.files.keys()).map(f => `    - ${f} (modified)`).join('\n');
      const createdFilesList = Array.from(checkpoint.createdFiles).map(f => `    - ${f} (created)`).join('\n');
      
      const allFilesList = [filesList, createdFilesList].filter(Boolean).join('\n');
      
      list.push(
        `[${index + 1}] ${checkpoint.description}\n` +
        `    Created: ${timeAgo} | Files: ${totalFiles} (${fileCount} modified, ${createdFileCount} created)\n${allFilesList}`
      );
    });

    return list;
  }

  getStatus(): {
    checkpointCount: number;
    canUndo: boolean;
  } {
    // Deduplicate checkpoints before returning status
    this.deduplicateCheckpoints();
    
    return {
      checkpointCount: this.undoStack.length,
      canUndo: this.undoStack.length > 0,
    };
  }

  cleanup(): void {
    this.undoStack = [];
    console.error("[DEBUG] All checkpoints cleared");
  }

  /**
   * Helper function to merge repetitive checkpoints that have identical file contents
   * This removes checkpoints created when changes were rejected, keeping only unique states
   */
  private deduplicateCheckpoints(): void {
    if (this.undoStack.length === 0) {
      return;
    }

    console.error(`[DEBUG] Starting deduplication of ${this.undoStack.length} checkpoints`);
    
    const deduplicatedStack: UndoCheckpoint[] = [];
    
    // Process checkpoints from oldest to newest
    for (let i = 0; i < this.undoStack.length; i++) {
      const currentCheckpoint = this.undoStack[i];
      let shouldKeep = true;

      // Check if this checkpoint represents the same state as current files
      if (this.checkpointMatchesCurrentFiles(currentCheckpoint)) {
        console.error(`[DEBUG] Checkpoint "${currentCheckpoint.description}" matches current file state - removing`);
        shouldKeep = false;
      } else {
        // Check if this checkpoint is identical to any already kept checkpoint
        for (const existingCheckpoint of deduplicatedStack) {
          if (this.checkpointsHaveIdenticalContent(currentCheckpoint, existingCheckpoint)) {
            console.error(`[DEBUG] Checkpoint "${currentCheckpoint.description}" is duplicate - removing`);
            shouldKeep = false;
            break;
          }
        }
      }

      if (shouldKeep) {
        deduplicatedStack.push(currentCheckpoint);
      }
    }

    const removedCount = this.undoStack.length - deduplicatedStack.length;
    this.undoStack = deduplicatedStack;
    
    if (removedCount > 0) {
      console.error(`[DEBUG] Deduplicated ${removedCount} repetitive checkpoints. Stack size: ${this.undoStack.length}`);
    }
  }

  /**
   * Check if a checkpoint matches the current state of files on disk
   */
  private checkpointMatchesCurrentFiles(checkpoint: UndoCheckpoint): boolean {
    // Check existing files in checkpoint
    for (const [filepath, checkpointContent] of checkpoint.files.entries()) {
      if (!existsSync(filepath)) {
        // File was deleted since checkpoint, so current state doesn't match checkpoint
        return false;
      }

      const currentContent = readFileSync(filepath, "utf-8");
      if (currentContent !== checkpointContent) {
        // File was modified since checkpoint, so current state doesn't match checkpoint
        return false;
      }
    }

    // Check created files - they should not exist for the checkpoint to match current state
    for (const filepath of checkpoint.createdFiles) {
      if (existsSync(filepath)) {
        // File was created since checkpoint, so current state doesn't match the pre-creation state
        return false;
      }
    }
    
    return true;
  }

  /**
   * Compare two checkpoints to see if they have identical file contents
   */
  private checkpointsHaveIdenticalContent(checkpoint1: UndoCheckpoint, checkpoint2: UndoCheckpoint): boolean {
    // Must have same number of files and created files
    if (checkpoint1.files.size !== checkpoint2.files.size || 
        checkpoint1.createdFiles.size !== checkpoint2.createdFiles.size) {
      return false;
    }

    // Check if all existing files exist in both and have identical content
    for (const [filepath, content1] of checkpoint1.files.entries()) {
      const content2 = checkpoint2.files.get(filepath);
      if (content2 === undefined || content1 !== content2) {
        return false;
      }
    }

    // Check if both checkpoints have the same created files
    for (const filepath of checkpoint1.createdFiles) {
      if (!checkpoint2.createdFiles.has(filepath)) {
        return false;
      }
    }

    return true;
  }


  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}