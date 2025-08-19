import React, { useState, useEffect } from 'react';
import { usePlaylist } from '../../contexts/PlaylistContext';
import { X, Upload, Music, Image as ImageIcon, Save } from 'lucide-react';

const PlaylistCreator = ({ isOpen, onClose, editPlaylist = null }) => {
  const { createPlaylist, updatePlaylist } = usePlaylist();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when editing
  useEffect(() => {
    if (editPlaylist) {
      setFormData({
        name: editPlaylist.name || '',
        description: editPlaylist.description || '',
        isPublic: editPlaylist.isPublic ?? true
      });
      setPreviewUrl(editPlaylist.imageUrl || null);
    }
  }, [editPlaylist]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        isPublic: true
      });
      setImageFile(null);
      setPreviewUrl(null);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image file
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: ['Image size must be less than 5MB'] }));
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: ['Please upload a valid image file (JPEG, PNG, or WebP)'] }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: null }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validatePlaylistData = (data) => {
    const errors = [];
    if (!data.name.trim()) {
      errors.push('Playlist name is required');
    }
    if (data.name.length > 100) {
      errors.push('Playlist name must be less than 100 characters');
    }
    if (data.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validatePlaylistData(formData);
    if (validationErrors.length > 0) {
      setErrors({ general: validationErrors });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let imageUrl = editPlaylist?.imageUrl || null;

      // Upload new image if selected
      if (imageFile) {
        // Here you would typically upload to your cloud storage
        // For now, we'll use the preview URL or implement your upload logic
        imageUrl = previewUrl;
      }

      const playlistData = {
        ...formData,
        imageUrl,
        ...(editPlaylist ? {} : { songs: [] })
      };

      if (editPlaylist) {
        await updatePlaylist(editPlaylist.id, playlistData);
      } else {
        await createPlaylist(playlistData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving playlist:', error);
      setErrors({ general: ['Failed to save playlist. Please try again.'] });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg w-full max-w-md my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900">
          <h2 className="text-xl font-semibold text-white">
            {editPlaylist ? 'Edit Playlist' : 'Create Playlist'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* General Errors */}
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              {errors.general.map((error, index) => (
                <p key={index} className="text-red-400 text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Playlist Cover
            </label>

            <div className="flex items-center space-x-4">
              {/* Image Preview */}
              <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1 min-w-0">
                <label className="flex items-center justify-center px-3 py-2 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-400 truncate">
                    {imageFile ? imageFile.name : 'Choose image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {errors.image && (
              <div className="text-red-400 text-sm">
                {errors.image.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Playlist Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Playlist Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter playlist name"
              maxLength={100}
              required
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name[0]}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your playlist (optional)"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-400">
              {formData.description.length}/500
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Privacy
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privacy"
                  checked={formData.isPublic}
                  onChange={() => handleInputChange('isPublic', true)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-white">Public</span>
                <span className="ml-2 text-xs text-gray-400">Anyone can see this playlist</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="privacy"
                  checked={!formData.isPublic}
                  onChange={() => handleInputChange('isPublic', false)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-white">Private</span>
                <span className="ml-2 text-xs text-gray-400">Only you can see this playlist</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 sticky bottom-0 bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editPlaylist ? 'Update' : 'Create'} Playlist</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaylistCreator;
