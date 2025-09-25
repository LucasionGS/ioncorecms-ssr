import React, { useState, useEffect } from 'react';
import { fileApi } from '../services/fileApi.ts';
import FilePicker from '../components/FilePicker.tsx';
import './ImageBlock.scss';

interface ImageBlockProps {
  data?: {
    fileId?: number;
    image?: Record<string, any>;
    alt?: string;
    caption?: string;
    alignment?: 'left' | 'center' | 'right' | 'full';
  };
  isEditing?: boolean;
  onChange?: (data: any) => void;
}

function ImageBlock({ data, isEditing = false, onChange }: ImageBlockProps) {
  const { 
    fileId, 
    image, 
    alt = '', 
    caption = '', 
    alignment = 'center' 
  } = data || {};

  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load image URL from fileId or use external src
  useEffect(() => {
    if (fileId) {
      setLoading(true);
      fileApi.getFileInfo(fileId)
        .then(response => {
          if (response.data.success) {
            setImageUrl(fileApi.getFileUrl(response.data.data.id));
          }
        })
        .catch(error => {
          console.error('Error loading image:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (image) {
      setImageUrl(image.url);
    } else {
      setImageUrl('');
    }
  }, [fileId, image?.url]);

  const handleFileSelect = (file: any) => {
    if (onChange) {
      onChange({
        ...data,
        fileId: file.id,
        src: undefined // Clear external URL when file is selected
      });
    }
  };

  const handleDataChange = (field: string, value: any) => {
    if (onChange) {
      onChange({
        ...data,
        [field]: value
      });
    }
  };

  if (isEditing) {
    return (
      <div className="image-block image-block--editing">
        <div className="image-block__editor">
          <div className="image-block__field">
            <label className="image-block__label">Image</label>
            <FilePicker
              accept="image/*"
              onFileSelect={handleFileSelect}
              selectedFileId={fileId}
              className="image-block__file-picker"
            />
          </div>

          <div className="image-block__field">
            <label className="image-block__label">Alt Text</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => handleDataChange('alt', e.target.value)}
              placeholder="Describe the image..."
              className="image-block__input"
            />
          </div>

          <div className="image-block__field">
            <label className="image-block__label">Caption</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => handleDataChange('caption', e.target.value)}
              placeholder="Enter image caption..."
              className="image-block__input"
            />
          </div>

          <div className="image-block__field">
            <label className="image-block__label">Alignment</label>
            <select
              value={alignment}
              onChange={(e) => handleDataChange('alignment', e.target.value)}
              className="image-block__select"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="full">Full Width</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        {imageUrl && (
          <div className="image-block__preview">
            <div className={`image-block image-block--${alignment}`}>
              <img src={imageUrl} alt={alt} className="image-block__image" />
              {caption && (
                <div className="image-block__caption">{caption}</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Display mode
  if (loading) {
    return (
      <div className="image-block image-block--loading">
        <div className="image-block__loading">
          Loading image...
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="image-block image-block--placeholder">
        <div className="image-block__placeholder">
          No image selected
        </div>
      </div>
    );
  }

  return (
    <div className={`image-block image-block--${alignment}`}>
      <img src={imageUrl} alt={alt} className="image-block__image" />
      {caption && (
        <div className="image-block__caption">{caption}</div>
      )}
    </div>
  );
}

export default ImageBlock;