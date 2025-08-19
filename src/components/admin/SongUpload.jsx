import React, { useState } from 'react';
import { songsAPI } from '../../services/api';
import { uploadAudioToCloudinary, uploadImageToCloudinary } from '../../services/cloudinary';
import { validateSongData, validateAudioFile, validateImageFile } from '../../utils/validation';
import { GENRES } from '../../utils/constants';
import {
  Upload,
  Music,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
  Play,
  Pause
} from 'lucide-react';

const SongUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    genre: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationErrors = validateAudioFile(file);
    if (validationErrors.length > 0) {
      setErrors({ audio: validationErrors });
      return;
    }

    setAudioFile(file);
    setErrors(prev => ({ ...prev, audio: null }));

    // Create audio preview
    const audioUrl = URL.createObjectURL(file);
    setAudioPreview(new Audio(audioUrl));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validationErrors = validateImageFile(file);
    if (validationErrors.length > 0) {
      setErrors({ image: validationErrors });
      return;
    }

    setImageFile(file);
    setErrors(prev => ({ ...prev, image: null }));
  };

  const togglePreview = () => {
    if (!audioPreview) return;

    if (isPreviewPlaying) {
      audioPreview.pause();
      setIsPreviewPlaying(false);
    } else {
      audioPreview.play();
      setIsPreviewPlaying(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    // Validate form data
    const formErrors = validateSongData(formData);
    const audioErrors = validateAudioFile(audioFile);

    if (formErrors.length > 0 || audioErrors.length > 0) {
      setErrors({
        form: formErrors,
        audio: audioErrors
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload audio file
      setUploadProgress(20);
      const audioResult = await uploadAudioToCloudinary(audioFile, (progress) => {
        setUploadProgress(20 + (progress * 0.6)); // 20-80%
      });

      // Upload image file if provided
      let imageUrl = null;
      if (imageFile) {
        setUploadProgress(80);
        const imageResult = await uploadImageToCloudinary(imageFile);
        imageUrl = imageResult.url;
        setUploadProgress(90);
      }

      // Save to Firestore
      setUploadProgress(95);
      await songsAPI.create({
        ...formData,
        audioUrl: audioResult.url,
        imageUrl,
        duration: audioResult.duration,
      });

      setUploadProgress(100);
      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setFormData({ title: '', artist: '', album: '', genre: '' });
        setAudioFile(null);
        setImageFile(null);
        setAudioPreview(null);
        setUploadProgress(0);
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ general: ['Upload failed. Please try again.'] });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload New Song</h1>
          <p className="text-gray-400">Add music to your streaming platform</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8 text-center">
            <Check size={48} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-400 mb-2">Upload Successful!</h3>
            <p className="text-green-300">Your song has been added to the platform.</p>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-dark-100 rounded-xl border border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* General Errors */}
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                {errors.general.map((error, index) => (
                  <div key={index} className="flex items-center text-red-400">
                    <AlertCircle size={16} className="mr-2" />
                    {error}
                  </div>
                ))}
              </div>
            )}

            {/* Audio File Upload */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-4">
                Audio File *
              </label>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Zone */}
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    audioFile
                      ? 'border-green-500 bg-green-500/5'
                      : errors.audio
                        ? 'border-red-500 bg-red-500/5'
                        : 'border-gray-600 hover:border-primary-500'
                  }`}>
                    {audioFile ? (
                      <div>
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Music className="text-white" size={32} />
                        </div>
                        <p className="text-green-400 font-medium mb-2">{audioFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-white font-medium mb-2">Choose Audio File</p>
                        <p className="text-gray-400 text-sm">
                          Drag and drop or click to browse<br />
                          Supports MP3, WAV, OGG, AAC, FLAC
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audio Preview */}
                {audioFile && (
                  <div className="bg-dark-200 rounded-xl p-6">
                    <h4 className="text-white font-medium mb-4">Audio Preview</h4>
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={togglePreview}
                        className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 transition-colors"
                      >
                        {isPreviewPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm text-center mt-4">
                      Click to {isPreviewPlaying ? 'pause' : 'play'} preview
                    </p>
                  </div>
                )}
              </div>

              {errors.audio && (
                <div className="mt-2">
                  {errors.audio.map((error, index) => (
                    <p key={index} className="text-red-400 text-sm flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-4">
                Cover Image (Optional)
              </label>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
                  imageFile
                    ? 'border-green-500 bg-green-500/5'
                    : errors.image
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-gray-600 hover:border-primary-500'
                }`}>
                  <div className="flex items-center space-x-4">
                    {imageFile ? (
                      <>
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="Cover preview"
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-green-400 font-medium">{imageFile.name}</p>
                          <p className="text-gray-400 text-sm">
                            {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                          <ImageIcon className="text-gray-400" size={24} />
                        </div>
                        <div>
                          <p className="text-white font-medium">Add Cover Image</p>
                          <p className="text-gray-400 text-sm">JPG, PNG, WebP up to 5MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {errors.image && (
                <div className="mt-2">
                  {errors.image.map((error, index) => (
                    <p key={index} className="text-red-400 text-sm flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Song Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Song Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 bg-dark-200 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter song title"
                  maxLength={100}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Artist *
                </label>
                <input
                  type="text"
                  value={formData.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                  className={`w-full px-4 py-3 bg-dark-200 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.artist ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter artist name"
                  maxLength={100}
                />
                {errors.artist && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.artist}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Album
                </label>
                <input
                  type="text"
                  value={formData.album}
                  onChange={(e) => handleInputChange('album', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-200 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter album name"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Genre
                </label>
                <select
                  value={formData.genre}
                  onChange={(e) => handleInputChange('genre', e.target.value)}
                  className="w-full px-4 py-3 bg-dark-200 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Errors */}
            {errors.form && errors.form.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                {errors.form.map((error, index) => (
                  <p key={index} className="text-red-400 text-sm flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Upload Progress</span>
                  <span className="text-primary-400">{uploadProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setFormData({ title: '', artist: '', album: '', genre: '' });
                  setAudioFile(null);
                  setImageFile(null);
                  setErrors({});
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
                disabled={uploading}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={uploading || !audioFile || !formData.title || !formData.artist}
                className="px-8 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Upload Song</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SongUpload;
