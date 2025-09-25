import React from "react";

type ReactComponent = React.FC | React.ComponentClass;

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
}

/**
 * NodeTypeRegistry manages the mapping between node types and their corresponding React components.
 * It supports dynamic importing of components based on node type names.
 * 
 * All files in the nodeTypes directory should export a default React component and will be made available here.
 */
export default class NodeTypeRegistry {
  private static _types: { [key: string]: string } = NODETYPE_MAP;
  private static _components: { [key: string]: ReactComponent } = {};
  
  // Dynamic import with eager loading to ensure all nodeType modules are bundled
  private static _nodeTypeModules = import.meta.glob('../nodeTypes/*.tsx', { eager: true });

  public static getTypePath(type: string): string | undefined {
    return this._types[type];
  }

  public static getAllTypes(): { [key: string]: string } {
    return this._types;
  }

  /**
   * Get component from dynamically loaded modules
   */
  private static getNodeTypeComponent(typeName: string): ReactComponent | undefined {
    const modulePath = `../nodeTypes/${typeName}.tsx`;
    const module = this._nodeTypeModules[modulePath] as any;
    return module?.default;
  }

  /**
   * Get all available node type names from loaded modules
   */
  private static getAvailableNodeTypes(): string[] {
    return Object.keys(this._nodeTypeModules).map(path => {
      const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
      return fileName;
    });
  }

  /**
   * Get the React component for a given node type.
   * Returns undefined if the type is not registered or the component cannot be found.
   */
  public static getComponent(type: string): ReactComponent | undefined {
    // Check if component is already cached
    if (this._components[type]) {
      return this._components[type];
    }

    // Try to load the component dynamically
    const typeName = this._types[type];
    if (typeName) {
      const component = this.getNodeTypeComponent(typeName);
      if (component) {
        this._components[type] = component;
        return component;
      }
    }

    return undefined;
  }

  // Method to get component by direct type name (not snake_case)
  public static getComponentByTypeName(typeName: string): ReactComponent | undefined {
    const snakeType = toSnakeCase(typeName);
    return this.getComponent(snakeType);
  }

  // Method to preload all available components
  public static preloadAllComponents(): void {
    const availableTypes = this.getAvailableNodeTypes();
    availableTypes.forEach(typeName => {
      const snakeType = toSnakeCase(typeName);
      if (this._types[snakeType]) {
        this.getComponent(snakeType);
      }
    });
  }
}