import fs from 'node:fs';

// Block Registry for managing Block Types
// Blocks are components that can be added to nodes through fields

import { Model } from "sequelize";
import type { FieldDefinition } from "./NodeRegistry.ts";

export default abstract class BlockRegistry {
  private static _blocks: { [key: string]: BlockTypeDefinition } = {};

  public static getRegisteredBlocks() {
    return this._blocks;
  }

  public static register(type: string, definition: BlockDefinition) {
    console.log(`Registering block type: ${type}`);
    BlockRegistry._blocks[type] = {
      type,
      ...definition
    };
  }

  public static getBlockDefinition(type: string): BlockTypeDefinition | undefined {
    return this._blocks[type];
  }

  public static getAllBlockDefinitions(): BlockTypeDefinition[] {
    return Object.values(this._blocks);
  }

  public static isBlockRegistered(type: string): boolean {
    return type in this._blocks;
  }

  public static getBlockFields(type: string): FieldDefinition<Model>[] {
    return this._blocks[type]?.fields || [];
  }

  static {
    // Auto-load all block definitions from the "blocks" directory
    const blocksDir = new URL('../blocks', import.meta.url);
    fs.readdirSync(blocksDir).forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        import(new URL(`../blocks/${file}`, import.meta.url).href)
        .then(() => {
          console.log(`Loaded block from file: ${file}`);
        })
        .catch(err => {
          console.error(`Failed to load block from file ${file}:`, err);
        });
      }
    });
  }
}

export interface BlockDefinition {
  displayName: string;
  description?: string;
  icon?: string;
  category?: string;
  fields: FieldDefinition<Model>[];
  settings?: BlockSettings;
}

export interface BlockTypeDefinition extends BlockDefinition {
  type: string;
}

export interface BlockSettings {
  allowMultiple?: boolean; // Can this block be used multiple times in a single field?
  maxInstances?: number; // Maximum instances allowed
  deprecated?: boolean; // Is this block deprecated?
}

// Block instance data structure (what gets stored in the database)
export interface BlockInstance {
  id: string; // Unique identifier for this block instance
  type: string; // Block type identifier
  data: { [key: string]: unknown }; // Field data for this block instance
  settings?: { [key: string]: unknown }; // Optional instance-specific settings
}