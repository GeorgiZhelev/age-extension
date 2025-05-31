import React, { useState, useEffect } from 'react';
import { Site } from './types';

interface EditSiteModalProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (site: Site) => void;
  onRemove?: () => void;
}

const EditSiteModal: React.FC<EditSiteModalProps> = ({ 
  site, 
  isOpen, 
  onClose, 
  onSave,
  onRemove 
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  
  useEffect(() => {
    if (site) {
      setTitle(site.title || '');
      setUrl(site.url || '');
    } else {
      setTitle('');
      setUrl('');
    }
  }, [site]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      let finalUrl = url.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      onSave({
        ...site,
        title: title.trim() || new URL(finalUrl).hostname,
        url: finalUrl,
      });
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 className="text-xl font-semibold text-neutral-200 mb-4">
          {site ? 'Edit Site' : 'Add Site'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Site name"
              className="w-full px-3 py-2 bg-neutral-700 text-neutral-200 rounded-md border border-neutral-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-neutral-300 mb-1">
              URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full px-3 py-2 bg-neutral-700 text-neutral-200 rounded-md border border-neutral-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="flex justify-between pt-2">
            <div>
              {site && onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSiteModal;