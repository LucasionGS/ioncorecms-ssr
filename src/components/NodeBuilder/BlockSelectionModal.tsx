import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../Modal.tsx';
import adminApi from '../../services/adminApi.ts';
import './BlockSelectionModal.scss';

interface BlockDefinition {
  type: string;
  name: string;
  description: string;
  category?: string;
  fields: any[];
}

interface BlockSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (blockType: string) => void;
}

// Icon mapping for different block categories/types
const getBlockIcon = (type: string, category?: string): string => {
  // Map specific block types to icons
  const typeIconMap: Record<string, string> = {
    'text_block': '📝',
    'image_block': '🖼️',
    'gallery_block': '🖼️',
    'video_block': '🎥',
    'quote_block': '💬',
    'code_block': '💻',
    'button_block': '🔘',
    'hero_block': '🌟',
    'card_block': '🃏',
    'list_block': '📋',
    'table_block': '📊',
    'divider_block': '➖',
    'spacer_block': '⭰',
    'embed_block': '🔗',
    'form_block': '📝',
    'accordion_block': '📁',
    'tabs_block': '📑',
    'carousel_block': '🎠',
    'testimonial_block': '💭',
    'pricing_block': '💰',
    'faq_block': '❓',
    'newsletter_block': '📧',
    'social_block': '📱',
    'map_block': '🗺️',
    'calendar_block': '📅'
  };

  // Category-based fallbacks
  const categoryIconMap: Record<string, string> = {
    'content': '📄',
    'media': '🎬',
    'layout': '📐',
    'forms': '📝',
    'interactive': '⚡',
    'social': '👥',
    'commerce': '🛒',
    'navigation': '🧭'
  };

  return typeIconMap[type] || categoryIconMap[category || ''] || '🧩';
};

export function BlockSelectionModal({ isOpen, onClose, onSelectBlock }: BlockSelectionModalProps) {
  const [blockDefinitions, setBlockDefinitions] = useState<BlockDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load block definitions when modal opens
  useEffect(() => {
    if (isOpen && blockDefinitions.length === 0) {
      loadBlockDefinitions();
    }
  }, [isOpen]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const loadBlockDefinitions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.get('/blocks/types');
      
      if (response.data.success) {
        setBlockDefinitions(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load block types');
      }
    } catch (err) {
      console.error('Error loading block definitions:', err);
      setError('Failed to load block types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter blocks based on search term
  const filteredBlocks = useMemo(() => {
    if (!searchTerm.trim()) {
      return blockDefinitions;
    }

    const term = searchTerm.toLowerCase();
    return blockDefinitions.filter(block => 
      block.name.toLowerCase().includes(term) ||
      block.description.toLowerCase().includes(term) ||
      block.type.toLowerCase().includes(term) ||
      block.category?.toLowerCase().includes(term)
    );
  }, [blockDefinitions, searchTerm]);

  const handleBlockSelect = (blockType: string) => {
    onSelectBlock(blockType);
    onClose();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Block"
      size="medium"
    >
      <div className="block-selection-modal">
        {/* Search Input */}
        <div className="block-selection-modal__search">
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block-selection-modal__search-input"
            autoFocus
          />
          <span className="block-selection-modal__search-icon">🔍</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="block-selection-modal__empty">
            <div className="block-selection-modal__empty-icon">⏳</div>
            <div className="block-selection-modal__empty-title">Loading blocks...</div>
            <div className="block-selection-modal__empty-description">
              Fetching available block types from the server.
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="block-selection-modal__empty">
            <div className="block-selection-modal__empty-icon">❌</div>
            <div className="block-selection-modal__empty-title">Error Loading Blocks</div>
            <div className="block-selection-modal__empty-description">
              {error}
            </div>
          </div>
        )}

        {/* Empty Search Results */}
        {!loading && !error && filteredBlocks.length === 0 && searchTerm && (
          <div className="block-selection-modal__empty">
            <div className="block-selection-modal__empty-icon">🔍</div>
            <div className="block-selection-modal__empty-title">No blocks found</div>
            <div className="block-selection-modal__empty-description">
              No blocks match your search for "{searchTerm}". Try a different search term.
            </div>
          </div>
        )}

        {/* No Blocks Available */}
        {!loading && !error && blockDefinitions.length === 0 && !searchTerm && (
          <div className="block-selection-modal__empty">
            <div className="block-selection-modal__empty-icon">📦</div>
            <div className="block-selection-modal__empty-title">No blocks available</div>
            <div className="block-selection-modal__empty-description">
              No block types are currently registered in the system.
            </div>
          </div>
        )}

        {/* Block List */}
        {!loading && !error && filteredBlocks.length > 0 && (
          <div className="block-selection-modal__list">
            {filteredBlocks.map((block) => (
              <button
                key={block.type}
                className="block-selection-modal__item"
                onClick={() => handleBlockSelect(block.type)}
                title={`Add ${block.name} block`}
              >
                <div className="block-selection-modal__item-icon">
                  {getBlockIcon(block.type, block.category)}
                </div>
                <div className="block-selection-modal__item-content">
                  <div className="block-selection-modal__item-title">
                    {block.name}
                  </div>
                  <div className="block-selection-modal__item-description">
                    {block.description}
                  </div>
                </div>
                <div className="block-selection-modal__item-arrow">➤</div>
              </button>
            ))}
          </div>
        )}

        {/* Footer with helpful info */}
        {!loading && !error && filteredBlocks.length > 0 && (
          <div className="block-selection-modal__footer">
            {filteredBlocks.length} block{filteredBlocks.length !== 1 ? 's' : ''} available
            {searchTerm && ` (filtered from ${blockDefinitions.length} total)`}
          </div>
        )}
      </div>
    </Modal>
  );
}