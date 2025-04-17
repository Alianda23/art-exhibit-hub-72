
import React, { useState } from 'react';
import { Upload, Button, Alert } from '@/components/ui';
import { CloudUpload } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  accept = "image/*",
  maxSize = 5, // Default 5MB
  className = "",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setError(null);

    if (!file) {
      setPreviewUrl(null);
      onFileChange(null);
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      setPreviewUrl(null);
      onFileChange(null);
      return;
    }

    // Create preview URL
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    onFileChange(file);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col items-center p-5 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
        <label className="w-full flex flex-col items-center cursor-pointer">
          <CloudUpload className="h-12 w-12 text-gray-500 mb-2" />
          <span className="text-sm text-gray-500 mb-3">
            Click to upload an image (max {maxSize}MB)
          </span>
          
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={accept}
          />
          
          <Button type="button" variant="outline" className="mb-2">
            Select Image
          </Button>
        </label>

        {previewUrl && (
          <div className="mt-4 w-full">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-48 max-w-full mx-auto rounded-md object-contain" 
            />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            {error}
          </Alert>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
