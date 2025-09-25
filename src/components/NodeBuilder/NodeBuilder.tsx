import React, { useState, useEffect, useMemo } from 'react';
import type { FieldDefinition, NodeTypeInfo } from './types.ts';
import adminApi from '../../services/adminApi.ts';
import {
  TextFieldRenderer,
  TextareaFieldRenderer,
  NumberFieldRenderer,
  BooleanFieldRenderer,
  SelectFieldRenderer,
  DateFieldRenderer,
  EmailFieldRenderer,
  UrlFieldRenderer,
  FileFieldRenderer,
  ArrayFieldRenderer,
  SlugFieldRenderer,
  NodeFieldRenderer,
  BlocksFieldRenderer
} from './FieldRenderers.tsx';
import './NodeBuilder.scss';

interface NodeBuilderProps {
  nodeType: string;
  nodeId?: number;
  onSave: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  nodeTypeInfo?: NodeTypeInfo;
}

const NodeBuilder: React.FC<NodeBuilderProps> = ({
  nodeType,
  nodeId,
  onSave,
  onCancel,
  nodeTypeInfo: externalNodeTypeInfo
}) => {
  const [nodeTypeInfo, setNodeTypeInfo] = useState<NodeTypeInfo | null>(externalNodeTypeInfo || null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load node type info if not provided
  useEffect(() => {
    if (!externalNodeTypeInfo && nodeType) {
      loadNodeTypeInfo();
    }
  }, [nodeType, externalNodeTypeInfo]);

  // Load existing node data if editing
  useEffect(() => {
    if (nodeId && nodeTypeInfo) {
      loadNodeData();
    }
  }, [nodeId, nodeTypeInfo]);

  // Initialize form data with default values
  useEffect(() => {
    if (nodeTypeInfo && !nodeId) {
      initializeFormData();
    }
  }, [nodeTypeInfo, nodeId]);

  const loadNodeTypeInfo = async () => {
    try {
      setLoading(true);
      const result = await adminApi.getNodeTypeFields(nodeType);
      
      if (result.success) {
        setNodeTypeInfo(result.data);
      } else {
        console.error('Failed to load node type info');
      }
    } catch (error) {
      console.error('Error loading node type info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNodeData = async () => {
    if (!nodeId) return;
    
    try {
      setLoading(true);
      const result = await adminApi.getNode(nodeType, nodeId);
      
      if (result.success) {
        setFormData(result.data);
      } else {
        console.error('Failed to load node data');
      }
    } catch (error) {
      console.error('Error loading node data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = () => {
    if (!nodeTypeInfo) return;

    const initialData: Record<string, any> = {};
    nodeTypeInfo.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });
    setFormData(initialData);
  };

  const validateForm = (): boolean => {
    if (!nodeTypeInfo) return false;

    const newErrors: Record<string, string> = {};

    nodeTypeInfo.fields.forEach(field => {
      const value = formData[field.name];

      // Required validation
      if (field.validation?.required && (value === undefined || value === null || value === '')) {
        newErrors[field.name] = `${field.label || field.name} is required`;
        return;
      }

      // Skip further validation if field is empty and not required
      if (!field.validation?.required && (value === undefined || value === null || value === '')) {
        return;
      }

      // Type-specific validations
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'url':
        case 'slug':
          if (typeof value === 'string') {
            if (field.validation?.minLength && value.length < field.validation.minLength) {
              newErrors[field.name] = `Minimum length is ${field.validation.minLength} characters`;
            }
            if (field.validation?.maxLength && value.length > field.validation.maxLength) {
              newErrors[field.name] = `Maximum length is ${field.validation.maxLength} characters`;
            }
            if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
              newErrors[field.name] = 'Invalid format';
            }
          }
          break;

        case 'number':
          if (typeof value === 'number') {
            if (field.validation?.min !== undefined && value < field.validation.min) {
              newErrors[field.name] = `Minimum value is ${field.validation.min}`;
            }
            if (field.validation?.max !== undefined && value > field.validation.max) {
              newErrors[field.name] = `Maximum value is ${field.validation.max}`;
            }
          }
          break;

        case 'array':
          if (Array.isArray(value)) {
            if (field.minItems && value.length < field.minItems) {
              newErrors[field.name] = `Minimum ${field.minItems} items required`;
            }
            if (field.maxItems && value.length > field.maxItems) {
              newErrors[field.name] = `Maximum ${field.maxItems} items allowed`;
            }
          }
          break;

        case 'node':
          // For single node selection, value should be an object with id
          // For multiple node selection, value should be an array of objects with id
          if (field.multiple) {
            if (!Array.isArray(value)) {
              if (value !== null && value !== undefined) {
                newErrors[field.name] = 'Invalid node selection format';
              }
            }
          } else {
            if (value !== null && value !== undefined && (typeof value !== 'object' || !value.id)) {
              newErrors[field.name] = 'Invalid node selection';
            }
          }
          break;
      }

      // Custom validation
      if (field.validation?.custom) {
        try {
          const customResult = field.validation.custom(value);
          if (customResult !== true) {
            newErrors[field.name] = typeof customResult === 'string' ? customResult : 'Invalid value';
          }
        } catch (error) {
          newErrors[field.name] = 'Validation error';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving node:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error for this field when user starts editing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const renderField = (field: FieldDefinition) => {
    const commonProps = {
      field,
      value: formData[field.name],
      onChange: (value: any) => handleFieldChange(field.name, value),
      error: errors[field.name]
    };

    switch (field.type) {
      case 'text':
        return <TextFieldRenderer key={field.name} {...commonProps} />;
      case 'textarea':
        return <TextareaFieldRenderer key={field.name} {...commonProps} />;
      case 'number':
        return <NumberFieldRenderer key={field.name} {...commonProps} />;
      case 'boolean':
        return <BooleanFieldRenderer key={field.name} {...commonProps} />;
      case 'select':
        return <SelectFieldRenderer key={field.name} {...commonProps} />;
      case 'date':
        return <DateFieldRenderer key={field.name} {...commonProps} />;
      case 'email':
        return <EmailFieldRenderer key={field.name} {...commonProps} />;
      case 'url':
        return <UrlFieldRenderer key={field.name} {...commonProps} />;
      case 'file':
        return <FileFieldRenderer key={field.name} {...commonProps} />;
      case 'array':
        return <ArrayFieldRenderer key={field.name} {...commonProps} />;
      case 'slug':
        return <SlugFieldRenderer key={field.name} {...commonProps} />;
      case 'node':
        return <NodeFieldRenderer key={field.name} {...commonProps} />;
      case 'blocks':
        return <BlocksFieldRenderer key={field.name} {...commonProps} />;
      default:
        return (
          <div key={field.name} className="field-renderer field-renderer--unsupported">
            <div className="field-renderer__error">
              Unsupported field type: {field.type}
            </div>
          </div>
        );
    }
  };

  // Sort fields by UI order
  const sortedFields = useMemo(() => {
    if (!nodeTypeInfo) return [];
    
    return [...nodeTypeInfo.fields].sort((a, b) => {
      const orderA = a.ui?.order ?? 999;
      const orderB = b.ui?.order ?? 999;
      return orderA - orderB;
    });
  }, [nodeTypeInfo]);

  // Group fields by UI group
  const groupedFields = useMemo(() => {
    const groups: Record<string, FieldDefinition[]> = {};
    
    sortedFields.forEach(field => {
      const group = field.ui?.group || 'default';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(field);
    });
    
    return groups;
  }, [sortedFields]);

  if (loading) {
    return (
      <div className="node-builder node-builder--loading">
        <div className="node-builder__loading">Loading...</div>
      </div>
    );
  }

  if (!nodeTypeInfo) {
    return (
      <div className="node-builder node-builder--error">
        <div className="node-builder__error">Failed to load node type information</div>
      </div>
    );
  }

  const displayName = nodeTypeInfo.settings?.displayName || nodeType;

  return (
    <div className="node-builder">
      <div className="node-builder__header">
        <h2 className="node-builder__title">
          {nodeId ? `Edit ${displayName}` : `Create ${displayName}`}
        </h2>
        {nodeTypeInfo.settings?.description && (
          <p className="node-builder__description">
            {nodeTypeInfo.settings.description}
          </p>
        )}
      </div>

      <form className="node-builder__form" onSubmit={handleSubmit}>
        {Object.entries(groupedFields).map(([groupName, fields]) => (
          <div key={groupName} className={`node-builder__group ${groupName !== 'default' ? `node-builder__group--${groupName}` : ''}`}>
            {groupName !== 'default' && (
              <h3 className="node-builder__group-title">{groupName}</h3>
            )}
            
            <div className="node-builder__fields">
              {fields
                .filter(field => !field.ui?.hidden)
                .map(field => (
                  <div 
                    key={field.name}
                    className={`node-builder__field ${field.ui?.width ? `node-builder__field--${field.ui.width}` : ''} ${field.ui?.className || ''}`}
                  >
                    {renderField(field)}
                  </div>
                ))
              }
            </div>
          </div>
        ))}

        <div className="node-builder__actions">
          <button
            type="button"
            className="node-builder__button node-builder__button--secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="node-builder__button node-builder__button--primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : (nodeId ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NodeBuilder;