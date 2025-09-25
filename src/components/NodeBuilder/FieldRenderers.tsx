import React from 'react';
import type { FieldRendererProps, FieldDefinition } from './types.ts';
import adminApi from '../../services/adminApi.ts';
import { BlockSelectionModal } from './BlockSelectionModal.tsx';
import FilePicker from '../FilePicker.tsx';
import type { FileInfo } from '../../services/fileApi.ts';
import './FieldRenderers.scss';

export const TextFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  return (
    <div className={`field-renderer field-renderer--text ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      <input
        type="text"
        className="field-renderer__input"
        value={value || ''}
        placeholder={field.placeholder}
        disabled={field.ui?.disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const TextareaFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  return (
    <div className={`field-renderer field-renderer--textarea ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      <textarea
        className="field-renderer__textarea"
        value={value || ''}
        placeholder={field.placeholder}
        rows={field.rows || 4}
        disabled={field.ui?.disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const NumberFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  return (
    <div className={`field-renderer field-renderer--number ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      <input
        type="number"
        className="field-renderer__input"
        value={value || ''}
        placeholder={field.placeholder}
        step={field.step}
        min={field.validation?.min}
        max={field.validation?.max}
        disabled={field.ui?.disabled}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      />
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const BooleanFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  return (
    <div className={`field-renderer field-renderer--boolean ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__checkbox-label">
        <input
          type="checkbox"
          className="field-renderer__checkbox"
          checked={!!value}
          disabled={field.ui?.disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="field-renderer__checkbox-text">
          {field.label || field.name}
          {field.validation?.required && <span className="field-renderer__required">*</span>}
        </span>
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const SelectFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (field.multiple) {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      onChange(selectedOptions);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`field-renderer field-renderer--select ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      <select
        className="field-renderer__select"
        value={field.multiple ? undefined : value || ''}
        multiple={field.multiple}
        disabled={field.ui?.disabled}
        onChange={handleSelectChange}
      >
        {!field.multiple && !field.validation?.required && (
          <option value="">Select an option...</option>
        )}
        {field.options?.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            selected={field.multiple && Array.isArray(value) && value.includes(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const DateFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const inputType = field.includeTime ? 'datetime-local' : 'date';
  
  const formatValue = (val: any) => {
    if (!val) return '';
    const date = new Date(val);
    if (field.includeTime) {
      return date.toISOString().slice(0, 16);
    } else {
      return date.toISOString().slice(0, 10);
    }
  };

  return (
    <div className={`field-renderer field-renderer--date ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      <input
        type={inputType}
        className="field-renderer__input"
        value={formatValue(value)}
        disabled={field.ui?.disabled}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
      />
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const EmailFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  return (
    <div className={`field-renderer field-renderer--email ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      <input
        type="email"
        className="field-renderer__input"
        value={value || ''}
        placeholder={field.placeholder}
        disabled={field.ui?.disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const UrlFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  return (
    <div className={`field-renderer field-renderer--url ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      <input
        type="url"
        className="field-renderer__input"
        value={value || ''}
        placeholder={field.placeholder}
        disabled={field.ui?.disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const FileFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  // Convert File objects or FileInfo objects to the expected format
  const handleFileSelect = (file: FileInfo) => {
    if (field.multiple) {
      const currentFiles = Array.isArray(value) ? value : [];
      // Add the new file to the array (avoid duplicates)
      const fileExists = currentFiles.some((f: any) => 
        (f.id && f.id === file.id) || (f.name && f.name === file.filename)
      );
      if (!fileExists) {
        onChange([...currentFiles, file]);
      }
    } else {
      onChange(file);
    }
  };

  const handleRemoveFile = (fileToRemove: any) => {
    if (field.multiple && Array.isArray(value)) {
      const updatedFiles = value.filter((f: any) => {
        if (f.id && fileToRemove.id) {
          return f.id !== fileToRemove.id;
        }
        return f !== fileToRemove;
      });
      onChange(updatedFiles);
    } else {
      onChange(null);
    }
  };

  const getFileName = (file: any): string => {
    if (file?.filename) return file.filename;
    if (file?.name) return file.name;
    if (file?.originalName) return file.originalName;
    return 'Unknown file';
  };

  const getFileId = (file: any): number | undefined => {
    return file?.id;
  };

  // Get the selected file ID for single file selection
  const selectedFileId = !field.multiple && value ? getFileId(value) : undefined;

  return (
    <div className={`field-renderer field-renderer--file ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      
      {/* Multiple files display */}
      {field.multiple && Array.isArray(value) && value.length > 0 && (
        <div className="field-renderer__selected-files">
          {value.map((file: any, index: number) => (
            <div key={index} className="field-renderer__selected-file">
              <span className="field-renderer__file-name">{getFileName(file)}</span>
              <button
                type="button"
                className="field-renderer__remove-file"
                onClick={() => handleRemoveFile(file)}
                disabled={field.ui?.disabled}
                aria-label={`Remove ${getFileName(file)}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File picker component */}
      <FilePicker
        accept={field.accept || "*/*"}
        onFileSelect={handleFileSelect}
        selectedFileId={selectedFileId}
        className="field-renderer__file-picker"
      />

      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const ArrayFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const items = Array.isArray(value) ? value : [];

  const addItem = () => {
    const newItems = [...items, ''];
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const updateItem = (index: number, newValue: any) => {
    const newItems = [...items];
    newItems[index] = newValue;
    onChange(newItems);
  };

  const canAddMore = !field.maxItems || items.length < field.maxItems;
  const canRemove = !field.minItems || items.length > field.minItems;

  return (
    <div className={`field-renderer field-renderer--array ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      
      <div className="field-renderer__array-items">
        {items.map((item, index) => (
          <div key={index} className="field-renderer__array-item">
            <input
              type={field.itemType === 'number' ? 'number' : 'text'}
              className="field-renderer__input"
              value={item || ''}
              onChange={(e) => updateItem(index, e.target.value)}
            />
            {canRemove && (
              <button
                type="button"
                className="field-renderer__array-remove"
                onClick={() => removeItem(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {canAddMore && (
        <button
          type="button"
          className="field-renderer__array-add"
          onClick={addItem}
        >
          Add Item
        </button>
      )}
      
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const SlugFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const handleSlugChange = (inputValue: string) => {
    // Convert to URL-friendly slug format
    const slugValue = inputValue
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    onChange(slugValue);
  };

  return (
    <div className={`field-renderer field-renderer--slug ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}
      <div className="field-renderer__slug-container">
        <span className="field-renderer__slug-prefix">/</span>
        <input
          type="text"
          className="field-renderer__input field-renderer__slug-input"
          value={value || ''}
          placeholder={field.placeholder}
          disabled={field.ui?.disabled}
          onChange={(e) => handleSlugChange(e.target.value)}
        />
      </div>
      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

export const NodeFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const [availableNodes, setAvailableNodes] = React.useState<Array<{id: number, title: string, nodeType: string}>>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const isMultiple = field.multiple === true;
  const selectedNodes = isMultiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  React.useEffect(() => {
    loadAvailableNodes();
  }, [field.nodeTypes]);

  const loadAvailableNodes = async () => {
    try {
      setLoading(true);
      const allowedTypes = field.nodeTypes || []; // If no nodeTypes specified, we'll load all
      const nodesList: Array<{id: number, title: string, nodeType: string}> = [];

      if (allowedTypes.length === 0) {
        // Load all node types if none specified
        const typesResponse = await adminApi.get('/nodes');
        if (typesResponse.data.success) {
          const registeredTypes = Object.keys(typesResponse.data.data);
          for (const nodeType of registeredTypes) {
            await loadNodesForType(nodeType, nodesList);
          }
        }
      } else {
        // Load only specified node types
        for (const nodeType of allowedTypes) {
          await loadNodesForType(nodeType, nodesList);
        }
      }

      setAvailableNodes(nodesList);
    } catch (error) {
      console.error('Error loading available nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNodesForType = async (nodeType: string, nodesList: Array<{id: number, title: string, nodeType: string}>) => {
    try {
      const response = await adminApi.get(`/nodes/${nodeType}`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const nodes = response.data.data.map((node: any) => ({
          id: node.id,
          title: node.title || node.name || `${nodeType} #${node.id}`,
          nodeType
        }));
        nodesList.push(...nodes);
      }
    } catch (error) {
      console.error(`Error loading nodes for type ${nodeType}:`, error);
    }
  };

  const filteredNodes = availableNodes.filter(node => 
    node.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNodeSelect = (node: {id: number, title: string, nodeType: string}) => {
    if (isMultiple) {
      const isAlreadySelected = selectedNodes.some((selected: any) => 
        selected.id === node.id && selected.nodeType === node.nodeType
      );
      if (isAlreadySelected) {
        // Remove from selection
        const newSelection = selectedNodes.filter((selected: any) => 
          !(selected.id === node.id && selected.nodeType === node.nodeType)
        );
        onChange(newSelection);
      } else {
        // Add to selection
        onChange([...selectedNodes, node]);
      }
    } else {
      // Single selection
      onChange(node);
    }
  };

  const handleRemoveNode = (nodeId: number, nodeType: string) => {
    if (isMultiple) {
      const newSelection = selectedNodes.filter((selected: any) => 
        !(selected.id === nodeId && selected.nodeType === nodeType)
      );
      onChange(newSelection);
    } else {
      onChange(null);
    }
  };

  return (
    <div className={`field-renderer field-renderer--node ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}

      {/* Selected nodes display */}
      {selectedNodes.length > 0 && (
        <div className="field-renderer__selected-nodes">
          {selectedNodes.map((node: any) => (
            <div key={`${node.nodeType}-${node.id}`} className="field-renderer__selected-node">
              <span className="field-renderer__node-info">
                <span className="field-renderer__node-type">{node.nodeType}</span>
                <span className="field-renderer__node-title">{node.title}</span>
              </span>
              <button
                type="button"
                className="field-renderer__remove-node"
                onClick={() => handleRemoveNode(node.id, node.nodeType)}
                aria-label={`Remove ${node.title}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Node selection interface */}
      <div className="field-renderer__node-selector">
        <input
          type="text"
          className="field-renderer__search"
          placeholder="Search for nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={field.ui?.disabled || loading}
        />

        {loading ? (
          <div className="field-renderer__loading">Loading nodes...</div>
        ) : (
          <div className="field-renderer__node-list">
            {filteredNodes.length === 0 ? (
              <div className="field-renderer__no-results">
                {searchTerm ? 'No nodes found matching your search' : 'No nodes available'}
              </div>
            ) : (
              filteredNodes.map((node) => {
                const isSelected = selectedNodes.some((selected: any) => 
                  selected.id === node.id && selected.nodeType === node.nodeType
                );
                return (
                  <button
                    key={`${node.nodeType}-${node.id}`}
                    type="button"
                    className={`field-renderer__node-option ${isSelected ? 'field-renderer__node-option--selected' : ''}`}
                    onClick={() => handleNodeSelect(node)}
                    disabled={field.ui?.disabled}
                  >
                    <span className="field-renderer__node-type">{node.nodeType}</span>
                    <span className="field-renderer__node-title">{node.title}</span>
                    {isSelected && <span className="field-renderer__selected-indicator">✓</span>}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};

// Helper function to render fields dynamically (same logic as NodeBuilder)
const renderField = (field: FieldDefinition, value: any, onChange: (value: any) => void, error?: string): React.ReactElement => {
  const commonProps = {
    field,
    value,
    onChange,
    error
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

export const BlocksFieldRenderer: React.FC<FieldRendererProps> = ({ field, value, onChange, error }) => {
  const [availableBlocks, setAvailableBlocks] = React.useState<Array<{type: string, name: string, displayName: string, description?: string, fields: FieldDefinition[]}>>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const blockInstances = Array.isArray(value) ? value : [];

  React.useEffect(() => {
    loadAvailableBlocks();
  }, []);

  const loadAvailableBlocks = async () => {
    try {
      const response = await adminApi.get('/blocks/types');
      if (response.data.success) {
        const blocks = response.data.data.filter((block: any) => {
          // Filter by allowed blocks if specified
          if (field.allowedBlocks && field.allowedBlocks.length > 0) {
            return field.allowedBlocks.includes(block.type);
          }
          return true;
        }).map((block: any) => ({
          type: block.type,
          name: block.name,
          displayName: block.displayName,
          description: block.description,
          fields: block.fields || [] // Include field definitions
        }));
        setAvailableBlocks(blocks);
      }
    } catch (error) {
      console.error('Error loading available blocks:', error);
    }
  };

  const addBlock = (blockType: string) => {
    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      data: {}
    };
    
    const newInstances = [...blockInstances, newBlock];
    onChange(newInstances);
  };

  const removeBlock = (blockId: string) => {
    const newInstances = blockInstances.filter((block: any) => block.id !== blockId);
    onChange(newInstances);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blockInstances.findIndex((block: any) => block.id === blockId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blockInstances.length) return;
    
    const newInstances = [...blockInstances];
    const [movedBlock] = newInstances.splice(currentIndex, 1);
    newInstances.splice(newIndex, 0, movedBlock);
    onChange(newInstances);
  };

  const updateBlockField = (blockId: string, fieldName: string, fieldValue: any) => {
    const newInstances = blockInstances.map((block: any) => {
      if (block.id === blockId) {
        return {
          ...block,
          data: {
            ...block.data,
            [fieldName]: fieldValue
          }
        };
      }
      return block;
    });
    onChange(newInstances);
  };

  const canAddMore = !field.maxBlocks || blockInstances.length < field.maxBlocks;

  return (
    <div className={`field-renderer field-renderer--blocks ${error ? 'field-renderer--error' : ''}`}>
      <label className="field-renderer__label">
        {field.label || field.name}
        {field.validation?.required && <span className="field-renderer__required">*</span>}
      </label>
      {field.description && (
        <div className="field-renderer__description">{field.description}</div>
      )}

      {/* Block instances */}
      <div className="field-renderer__blocks-list">
        {blockInstances.length === 0 ? (
          <div className="field-renderer__empty-blocks">
            <div className="field-renderer__empty-icon">📦</div>
            <div className="field-renderer__empty-text">
              No blocks added yet. Click "Add Block" below to get started.
            </div>
          </div>
        ) : blockInstances.map((block: any, index: number) => {
          const blockDef = availableBlocks.find(b => b.type === block.type);
          return (
            <div key={block.id} className="field-renderer__block-instance">
              <div className="field-renderer__block-header">
                <span className="field-renderer__block-title">
                  {blockDef?.displayName || blockDef?.name || block.type}
                </span>
                <div className="field-renderer__block-actions">
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                    className="field-renderer__block-move"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blockInstances.length - 1}
                    className="field-renderer__block-move"
                    title="Move down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="field-renderer__block-remove"
                    title="Remove block"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="field-renderer__block-content">
                {blockDef && blockDef.fields && blockDef.fields.length > 0 ? (
                  <div className="field-renderer__block-fields">
                    {blockDef.fields.map((blockField) => {
                      const fieldValue = block.data[blockField.name];
                      return renderField(
                        blockField,
                        fieldValue,
                        (newValue) => updateBlockField(block.id, blockField.name, newValue)
                      );
                    })}
                  </div>
                ) : (
                  <div className="field-renderer__block-placeholder">
                    <div className="field-renderer__block-empty">
                      📝 No fields configured for this block type
                    </div>
                    <div className="field-renderer__block-empty-detail">
                      This block type ({block.type}) doesn't have any configurable fields defined.
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add new block button */}
      {canAddMore && (
        <div className="field-renderer__add-block">
          <button
            type="button"
            className="field-renderer__add-block-btn"
            onClick={() => setIsModalOpen(true)}
          >
            ➕ Add Block
          </button>
          {field.maxBlocks && blockInstances.length > 0 && (
            <div className="field-renderer__block-count">
              {blockInstances.length} of {field.maxBlocks} blocks used
            </div>
          )}
        </div>
      )}

      {/* Block Selection Modal */}
      <BlockSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectBlock={addBlock}
      />

      {error && <div className="field-renderer__error">{error}</div>}
    </div>
  );
};