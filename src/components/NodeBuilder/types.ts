export interface FieldDefinition {
  type: string;
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  validation?: FieldValidation;
  ui?: FieldUIOptions;
  defaultValue?: any;
  // Field-specific properties
  rows?: number; // textarea
  step?: number; // number
  options?: Array<{value: string | number, label: string}>; // select
  accept?: string; // file
  multiple?: boolean; // file, select
  includeTime?: boolean; // date
  nodeTypes?: string[]; // node
  minItems?: number; // array
  maxItems?: number; // array
  itemType?: string; // array

  allowedBlocks?: string[]; // blocks
  maxBlocks?: number; // blocks
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}

export interface FieldUIOptions {
  width?: 'full' | 'half' | 'third' | 'quarter';
  order?: number;
  hidden?: boolean;
  disabled?: boolean;
  className?: string;
  group?: string;
}

export interface NodeTypeInfo {
  type: string;
  settings?: {
    displayName?: string;
    icon?: string;
    description?: string;
  };
  fields: FieldDefinition[];
}

export interface FieldRendererProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}