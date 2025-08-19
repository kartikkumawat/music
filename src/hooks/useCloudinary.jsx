import { useState, useCallback } from 'react';
import { uploadAudioToCloudinary, uploadImageToCloudinary } from '../services/cloudinary';

export const useCloudinary = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadAudio = useCallback(async (file, onProgress) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const result = await uploadAudioToCloudinary(file, (progressValue) => {
        setProgress(progressValue);
        onProgress?.(progressValue);
      });

      setProgress(100);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const uploadImage = useCallback(async (file) => {
    setUploading(true);
    setError(null);

    try {
      const result = await uploadImageToCloudinary(file);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (files, onProgress) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const results = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileProgress = (i / totalFiles) * 100;
        setProgress(fileProgress);
        onProgress?.(fileProgress);

        if (file.type.startsWith('audio/')) {
          const result = await uploadAudioToCloudinary(file);
          results.push(result);
        } else if (file.type.startsWith('image/')) {
          const result = await uploadImageToCloudinary(file);
          results.push(result);
        }
      }

      setProgress(100);
      return results;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    uploadAudio,
    uploadImage,
    uploadMultipleFiles,
    reset
  };
};

export default useCloudinary;
