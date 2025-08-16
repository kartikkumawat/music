import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { uploadAudioToCloudinary } from '../../services/cloudinary';
import { Upload, Music, Image as ImageIcon } from 'lucide-react';

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
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile || !formData.title || !formData.artist) {
      alert('Please fill required fields and select audio file');
      return;
    }

    setUploading(true);
    try {
      // Upload audio to Cloudinary
      const audioResult = await uploadAudioToCloudinary(audioFile, (progress) => {
        setProgress(progress);
      });

      let imageUrl = null;
      if (imageFile) {
        const imageResult = await uploadAudioToCloudinary(imageFile);
        imageUrl = imageResult.url;
      }

      // Save to Firestore
      await addDoc(collection(db, 'songs'), {
        ...formData,
        audioUrl: audioResult.url,
        imageUrl,
        duration: audioResult.duration,
        createdAt: new Date(),
        playCount: 0
      });

      alert('Song uploaded successfully!');
      setFormData({ title: '', artist: '', album: '', genre: '' });
      setAudioFile(null);
      setImageFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-dark-100 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Upload New Song</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 bg-dark-200 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Artist *
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({...formData, artist: e.target.value})}
              className="w-full px-3 py-2 bg-dark-200 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Album
            </label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData({...formData, album: e.target.value})}
              className="w-full px-3 py-2 bg-dark-200 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Genre
            </label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              className="w-full px-3 py-2 bg-dark-200 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Genre</option>
              <option value="Pop">Pop</option>
              <option value="Rock">Rock</option>
              <option value="Hip Hop">Hip Hop</option>
              <option value="Electronic">Electronic</option>
              <option value="Classical">Classical</option>
              <option value="Jazz">Jazz</option>
              <option value="Country">Country</option>
              <option value="R&B">R&B</option>
            </select>
          </div>
        </div>

        {/* Audio File Upload */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Audio File *
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            {audioFile ? (
              <div>
                <Music className="mx-auto mb-2 text-green-400" size={24} />
                <p className="text-green-400">{audioFile.name}</p>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-gray-400">Click to upload audio file</p>
              </div>
            )}
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Image File Upload */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Cover Image
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            {imageFile ? (
              <div>
                <ImageIcon className="mx-auto mb-2 text-green-400" size={24} />
                <p className="text-green-400">{imageFile.name}</p>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                <p className="text-gray-400">Click to upload cover image</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {uploading && (
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>
    </div>
  );
};

export default SongUpload;