import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';

export const uploadImage = async (file, folder = 'avatars') => {
  if (!storage) throw new Error('Firebase Storage is not initialized');
  if (!file) throw new Error('No file provided');

  try {
    // Compress image heavily before uploading to save bandwidth
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp'
    };
    
    const compressedFile = await imageCompression(file, options);
    const fileName = `${uuidv4()}.webp`;
    const storageRef = ref(storage, `${folder}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload image to storage');
  }
};
