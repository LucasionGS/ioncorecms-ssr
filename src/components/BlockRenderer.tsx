import React from 'react';
import BlockRegistry from '../registries/BlockRegistry.ts';
import './BlockRenderer.scss';

interface BlockInstance {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface BlockRendererProps {
  block: BlockInstance;
  className?: string;
  style?: React.CSSProperties;
}

interface BlockListRendererProps {
  blocks: BlockInstance[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a single block instance using its registered component
 */
export function BlockRenderer({ block, className, style }: BlockRendererProps) {
  const BlockComponent = BlockRegistry.getComponent(block.type);

  if (!BlockComponent) {
    return (
      <div 
        className={`block-renderer block-renderer--error ${className || ''}`}
        style={style}
        data-block-type={block.type}
        data-block-id={block.id}
      >
        <div className="block-renderer__error">
          <div className="block-renderer__error-icon">⚠️</div>
          <div className="block-renderer__error-message">
            <strong>Block type '{block.type}' not found</strong>
            <br />
            <small>The component for this block type is not registered or available.</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`block-renderer block-renderer--${block.type.replace(/_/g, '-')} ${className || ''}`}
      style={style}
      data-block-type={block.type}
      data-block-id={block.id}
    >
      {React.createElement(BlockComponent as any, { data: block.data })}
    </div>
  );
}

/**
 * Renders a list of blocks in sequence
 */
export function BlockListRenderer({ blocks, className, style }: BlockListRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className={`block-list-renderer block-list-renderer--empty ${className || ''}`} style={style}>
        <div className="block-list-renderer__empty">
          <div className="block-list-renderer__empty-icon">📝</div>
          <div className="block-list-renderer__empty-message">No content blocks available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`block-list-renderer ${className || ''}`} style={style}>
      {blocks.map((block, index) => (
        <BlockRenderer 
          key={block.id || `block-${index}`} 
          block={block}
          className="block-list-renderer__item"
        />
      ))}
    </div>
  );
}

export default BlockRenderer;