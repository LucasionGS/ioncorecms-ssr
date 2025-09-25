import React, { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { fileApi, type FileInfo } from '../services/fileApi.ts';
import './FilePickerModal.scss';

interface FilePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: FileInfo) => void;
  allowedTypes?: string[];
  title?: string;
}

function FilePickerModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  allowedTypes,
  title = 'Select a File'
}: FilePickerModalProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);

  // Load files when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fileApi.listFiles();
      
      if (response.data.success) {
        let fileList = response.data.data?.files || [];
        
        // Filter by allowed types if specified
        if (allowedTypes && allowedTypes.length > 0) {
          fileList = fileList.filter((file: FileInfo) => 
            allowedTypes.some(type => 
              file.mimeType.startsWith(type.replace('*', ''))
            )
          );
        }
        
        setFiles(fileList);
      } else {
        setError('Failed to load files');
      }
    } catch (err) {
      setError('Failed to load files');
      console.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file type is allowed
    if (allowedTypes && allowedTypes.length > 0) {
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''));
        }
        return file.type === type;
      });
      
      if (!isAllowed) {
        setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        return;
      }
    }

    try {
      setUploading(true);
      setError('');
      const response = await fileApi.uploadFile(file);
      
      if (response.data.success) {
        // Add new file to the list
        const newFile = response.data.data;
        setFiles(prev => [newFile, ...prev]);
        
        // Auto-select the newly uploaded file
        setSelectedFile(newFile);
      } else {
        setError(response.data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent file selection
    
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fileApi.deleteFile(fileId);
      if (response.data.success) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
        }
      } else {
        setError(response.data.message || 'Failed to delete file');
      }
    } catch (err) {
      setError('Failed to delete file');
      console.error('Delete error:', err);
    }
  };

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.mimeType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectFile = () => {
    if (selectedFile) {
      onSelect(selectedFile);
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('text')) return '📝';
    return '📎';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="large"
    >
      <div className="file-picker-modal">
        {/* Upload and Search Section */}
        <div className="file-picker-modal__controls">
          <div className="file-picker-modal__upload">
            <label htmlFor="file-upload" className={`btn btn--primary ${uploading ? 'btn--loading' : ''}`}>
              {uploading ? 'Uploading...' : 'Upload New File'}
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
              accept={allowedTypes?.join(',')}
            />
          </div>
          
          <div className="file-picker-modal__search">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="file-picker-modal__error">
            {error}
          </div>
        )}

        {/* File Grid */}
        <div className="file-picker-modal__content">
          {loading ? (
            <div className="file-picker-modal__loading">
              Loading files...
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="file-picker-modal__empty">
              {searchTerm ? 'No files match your search.' : 'No files uploaded yet.'}
            </div>
          ) : (
            <div className="file-picker-modal__grid">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  className={`file-picker-modal__item ${selectedFile?.id === file.id ? 'file-picker-modal__item--selected' : ''}`}
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="file-picker-modal__item-preview">
                    {file.mimeType.startsWith('image/') ? (
                      <img
                        src={`/api/files/${file.id}`}
                        alt={file.filename}
                        loading="lazy"
                      />
                    ) : (
                      <div className="file-picker-modal__item-icon">
                        {getFileIcon(file.mimeType)}
                      </div>
                    )}
                  </div>
                  
                  <div className="file-picker-modal__item-info">
                    <div className="file-picker-modal__item-name" title={file.filename}>
                      {file.filename}
                    </div>
                    <div className="file-picker-modal__item-meta">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.mimeType}</span>
                    </div>
                  </div>
                  
                  <button
                    className="file-picker-modal__item-delete"
                    onClick={(e) => handleDeleteFile(file.id, e)}
                    title="Delete file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="file-picker-modal__actions">
          <button 
            className="btn btn--secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn--primary" 
            onClick={handleSelectFile}
            disabled={!selectedFile}
          >
            Select File
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default FilePickerModal;