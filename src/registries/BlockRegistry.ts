import React from "react";

type ReactComponent = React.FC | React.ComponentClass;

/**
 * BlockRegistry manages the mapping between block types and their corresponding React components.
 * It supports dynamic importing of components based on block type names.
 * 
 * All files in the blocks directory should export a default React component and will be made available here.
 */
export default class BlockRegistry {
  private static _components: { [key: string]: ReactComponent } = {};
  
  // Dynamic import with eager loading to ensure all block modules are bundled
  private static _blockModules = import.meta.glob('../blocks/*.tsx', { eager: true });

  /**
   * Get component from dynamically loaded modules
   */
  private static getBlockComponent(blockType: string): ReactComponent | undefined {
    // Convert block type to component name (e.g., 'text_block' -> 'TextBlock')
    const componentName = blockType
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    const modulePath = `../blocks/${componentName}.tsx`;
    const module = this._blockModules[modulePath] as any;
    return module?.default;
  }

  /**
   * Get all available block type names from loaded modules
   */
  private static getAvailableBlockTypes(): string[] {
    return Object.keys(this._blockModules).map(path => {
      const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
      // Convert component name to block type (e.g., 'TextBlock' -> 'text_block')
      return fileName
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '')
        .replace('_block', '_block');
    });
  }

  /**
   * Get the React component for a given block type.
   * Returns undefined if the block type is not found.
   * 
   * @param blockType The block type identifier (e.g., 'text_block', 'quote_block')
   * @returns The React component or undefined
   */
  public static getComponent(blockType: string): ReactComponent | undefined {
    // Check cache first
    if (this._components[blockType]) {
      return this._components[blockType];
    }

    // Try to load component
    const component = this.getBlockComponent(blockType);
    if (component) {
      this._components[blockType] = component;
      return component;
    }

    console.warn(`Block type '${blockType}' not found in block registry`);
    return undefined;
  }

  /**
   * Check if a block type is available
   * 
   * @param blockType The block type to check
   * @returns True if the block type is available
   */
  public static hasComponent(blockType: string): boolean {
    return this.getComponent(blockType) !== undefined;
  }

  /**
   * Get all registered block types
   * 
   * @returns Array of all available block type names
   */
  public static getRegisteredTypes(): string[] {
    return this.getAvailableBlockTypes();
  }

  /**
   * Register a block component manually (for dynamic registration)
   * 
   * @param blockType The block type identifier
   * @param component The React component
   */
  public static register(blockType: string, component: ReactComponent): void {
    this._components[blockType] = component;
  }
}