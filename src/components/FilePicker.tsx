import React, { useState, useEffect } from 'react';
import { fileApi, type FileInfo } from '../services/fileApi.ts';
import FilePickerModal from './FilePickerModal.tsx';
import './FilePicker.scss';

interface FilePickerProps {
  accept?: string;
  onFileSelect: (file: FileInfo) => void;
  selectedFileId?: number;
  className?: string;
}

function FilePicker({ accept = "image/*", onFileSelect, selectedFileId, className = '' }: FilePickerProps) {
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load selected file info when component mounts or selectedFileId changes
  useEffect(() => {
    if (selectedFileId) {
      fileApi.getFileInfo(selectedFileId)
        .then(response => {
          if (response.data.success) {
            setSelectedFile(response.data.data);
          }
        })
        .catch(error => {
          console.error('Error loading selected file:', error);
        });
    } else {
      setSelectedFile(null);
    }
  }, [selectedFileId]);

  const handleFileSelect = (file: FileInfo) => {
    setSelectedFile(file);
    onFileSelect(file);
    setIsModalOpen(false);
    setError('');
  };

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    // Call onFileSelect with a "removed" file to clear the selection
    onFileSelect({ id: 0, filename: '', size: 0, mimeType: '', url: '', createdAt: '' });
  };

  // Convert accept prop to allowedTypes array
  const getAllowedTypes = (): string[] => {
    if (!accept) return [];
    return accept.split(',').map(type => type.trim());
  };

  return (
    <div className={`file-picker ${className}`}>
      {selectedFile && selectedFile.id > 0 ? (
        <div className="file-picker__selected">
          {fileApi.isImageFile(selectedFile.mimeType) && (
            <img 
              src={fileApi.getFileUrl(selectedFile.id)} 
              alt={selectedFile.filename}
              className="file-picker__preview"
            />
          )}
          <div className="file-picker__info">
            <span className="file-picker__filename">{selectedFile.filename}</span>
            <span className="file-picker__size">{fileApi.formatFileSize(selectedFile.size)}</span>
          </div>
          <div className="file-picker__actions">
            <button 
              type="button"
              onClick={handleButtonClick}
              className="file-picker__change-btn"
            >
              Change
            </button>
            <button 
              type="button"
              onClick={handleRemove}
              className="file-picker__remove-btn"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="file-picker__empty">
          <button 
            type="button"
            onClick={handleButtonClick}
            className="file-picker__select-btn"
          >
            Select File
          </button>
        </div>
      )}

      {error && (
        <div className="file-picker__error">
          {error}
        </div>
      )}

      <FilePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleFileSelect}
        allowedTypes={getAllowedTypes()}
        title="Select a File"
      />
    </div>
  );
}

export default FilePicker;