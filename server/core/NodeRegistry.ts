// import fs from 'node:fs';
import { Model, ModelStatic } from "sequelize";

export default abstract class NodeRegistry {
  private static _types: { [key: string]: NodeTypeBase } = {};

  public static getRegisteredTypes() {
    return this._types;
  }

  public static register<M extends Model>(type: string, settings?: NodeSettings, fields?: FieldDefinition<M>[]) {
    return function (constructor: ModelStatic<M>) {
      console.log(`Registering node type: ${type}`);
      NodeRegistry._types[type] = { type, Model: constructor, settings, fields };
    };
  }

  public static getModelByType<TModel extends ModelStatic<Model>>(type: string): TModel | undefined {
    return this._types[type]?.Model as TModel;
  }

  public static getFieldsByType(type: string): FieldDefinition<Model>[] | undefined {
    return this._types[type]?.fields;
  }

  public static getTypeInfo(type: string): NodeTypeBase | undefined {
    return this._types[type];
  }

  public static getAllTypeInfos(): NodeTypeBase[] {
    return Object.values(this._types);
  }

  public static isTypeRegistered(type: string): boolean {
    return type in this._types;
  }

  public static getSlugField(type: string): FieldDefinition<Model> | undefined {
    const fields = this.getFieldsByType(type);
    return fields?.find(field => field.type === 'slug');
  }

  public static generateNodeUrl(nodeType: string, nodeInstance: Model): string | undefined {
    const typeInfo = this.getTypeInfo(nodeType);
    if (!typeInfo) return undefined;
    
    const slugField = this.getSlugField(nodeType);
    if (!slugField) return undefined;

    const slugValue = (nodeInstance as unknown as Record<string, string>)[slugField.name];
    if (!slugValue) return undefined;
    
    if (!typeInfo.settings?.subpath) return `/${slugValue}`;
    return `/${typeInfo.settings.subpath}/${slugValue}`;
  }
}

export interface NodeTypeBase {
  type: string;
  Model: ModelStatic<Model>;
  settings?: NodeSettings;
  // deno-lint-ignore no-explicit-any
  fields?: FieldDefinition<any>[];
}

export interface NodeSettings {
  displayName?: string;
  icon?: string;
  description?: string;
  subpath?: string; // URL subpath for this node type (e.g., 'blog', 'news')
}

export type FieldDefinition<U extends Model> =
  | FieldText<U>
  | FieldTextarea<U>
  | FieldNumber<U>
  | FieldBoolean<U>
  | FieldSelect<U>
  | FieldDate<U>
  | FieldEmail<U>
  | FieldUrl<U>
  | FieldFile<U>
  | FieldNode<U>
  | FieldArray<U>
  | FieldSlug<U>
  | FieldBlocks<U>;

interface FieldBase<Type extends string, RefModel extends Model> {
  type: Type;
  name: string;
  label?: string; // Display label for the field
  description?: string; // Help text for the field
  placeholder?: string; // Placeholder text for input fields
  validation?: FieldValidation; // Validation rules
  ui?: FieldUIOptions; // UI rendering options
  // deno-lint-ignore no-explicit-any
  save?: (instance: RefModel, value: any) => Promise<any | void> | any | void;
  // deno-lint-ignore no-explicit-any
  load?: (instance: RefModel) => Promise<any> | any;
}

interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern
  // deno-lint-ignore no-explicit-any
  custom?: (value: any) => boolean | string; // Custom validation function
}

interface FieldUIOptions {
  width?: 'full' | 'half' | 'third' | 'quarter';
  order?: number; // Display order
  hidden?: boolean; // Hidden field
  disabled?: boolean; // Disabled field
  className?: string; // Additional CSS classes
  group?: string; // Group fields together
}

interface FieldText<R extends Model> extends FieldBase<"text", R> {
  defaultValue?: string;
  validation?: FieldValidation & {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface FieldTextarea<R extends Model> extends FieldBase<"textarea", R> {
  defaultValue?: string;
  rows?: number;
  validation?: FieldValidation & {
    minLength?: number;
    maxLength?: number;
  };
}

interface FieldNumber<R extends Model> extends FieldBase<"number", R> {
  defaultValue?: number;
  step?: number;
  validation?: FieldValidation & {
    min?: number;
    max?: number;
  };
}

interface FieldBoolean<R extends Model> extends FieldBase<"boolean", R> {
  defaultValue?: boolean;
}

interface FieldSelect<R extends Model> extends FieldBase<"select", R> {
  options: Array<{value: string | number, label: string}> | (() => Promise<Array<{value: string | number, label: string}>>);
  defaultValue?: string | number;
  multiple?: boolean;
}

interface FieldDate<R extends Model> extends FieldBase<"date", R> {
  defaultValue?: Date | string;
  includeTime?: boolean;
  validation?: FieldValidation & {
    min?: Date | string;
    max?: Date | string;
  };
}

interface FieldEmail<R extends Model> extends FieldBase<"email", R> {
  defaultValue?: string;
  validation?: FieldValidation & {
    pattern?: string;
  };
}

interface FieldUrl<R extends Model> extends FieldBase<"url", R> {
  defaultValue?: string;
}

interface FieldFile<R extends Model> extends FieldBase<"file", R> {
  accept?: string; // File type restrictions
  multiple?: boolean;
  maxSize?: number; // Max file size in bytes
}

interface FieldNode<R extends Model> extends FieldBase<"node", R> {
  nodeTypes?: string[]; // Allowed node types
  multiple?: boolean;
}

interface FieldArray<R extends Model> extends FieldBase<"array", R> {
  minItems?: number;
  maxItems?: number;
  itemType: Exclude<FieldDefinition<R>, FieldArray<R>>["type"]; // Prevent nested arrays
}

interface FieldSlug<R extends Model> extends FieldBase<"slug", R> {
  defaultValue?: string;
  validation?: FieldValidation & {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface FieldBlocks<R extends Model> extends FieldBase<"blocks", R> {
  allowedBlocks?: string[]; // Allowed block types (empty = all blocks allowed)
  minBlocks?: number; // Minimum number of blocks required
  maxBlocks?: number; // Maximum number of blocks allowed
  defaultBlocks?: string[]; // Default block types to show in the UI
}