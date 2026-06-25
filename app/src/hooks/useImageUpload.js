/**
 * Wedring Matrimony — useImageUpload Hook
 * Coordinates image picking, camera shoots, compression, storage uploads, and database sync
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as profilesApi from '../api/profiles';
import * as imageService from '../services/imageProcessor';
import useAuthStore from '../store/useAuthStore';
import useProfileStore from '../store/useProfileStore';

export const useImageUpload = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const profilePhotos = useProfileStore((s) => s.photos);
  const addPhotoState = useProfileStore((s) => s.addPhoto);
  const removePhotoState = useProfileStore((s) => s.removePhoto);
  const setPrimaryPhotoState = useProfileStore((s) => s.setPrimaryPhoto);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (uri) => {
      setIsUploading(true);
      setError(null);
      
      const photoRecord = await profilesApi.uploadProfilePhoto(user.id, uri);
      return photoRecord;
    },
    onSuccess: (photoRecord) => {
      addPhotoState(photoRecord);
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (err) => {
      setError(err.message);
      setIsUploading(false);
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (photo) => {
      setError(null);
      await profilesApi.deleteProfilePhoto(photo.id, photo.storage_path || photo.photo_url);
      return photo.id;
    },
    onSuccess: (photoId) => {
      removePhotoState(photoId);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Set Primary Mutation
  const setPrimaryMutation = useMutation({
    mutationFn: async (photoId) => {
      setError(null);
      await profilesApi.setPrimaryProfilePhoto(user.id, photoId);
      return photoId;
    },
    onSuccess: (photoId) => {
      setPrimaryPhotoState(photoId);
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const pickAndUpload = async () => {
    try {
      const assets = await imageService.pickImages(1);
      if (assets && assets.length > 0) {
        await uploadMutation.mutateAsync(assets[0].uri);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const takeAndUpload = async () => {
    try {
      const asset = await imageService.takePhoto();
      if (asset) {
        await uploadMutation.mutateAsync(asset.uri);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    photos: profilePhotos,
    isUploading,
    error,
    pickAndUpload,
    takeAndUpload,
    deletePhoto: deleteMutation.mutateAsync,
    setPrimaryPhoto: setPrimaryMutation.mutateAsync,
  };
};

export default useImageUpload;
