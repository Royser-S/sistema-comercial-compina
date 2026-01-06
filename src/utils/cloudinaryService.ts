import imageCompression from 'browser-image-compression'; 
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Faltan las variables de entorno de Cloudinary');
  }


  const options = {
    maxSizeMB: 1,          
    maxWidthOrHeight: 1920, 
    useWebWorker: true,    
  };

  let fileToUpload = file;

  try {
    if (file.type.startsWith('image/')) {
        console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
        fileToUpload = await imageCompression(file, options);
        console.log(`Comprimida: ${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`);
    }
  } catch (err) {
    console.warn('No se pudo comprimir la imagen, se subirá la original:', err);
  }

  const formData = new FormData();
  formData.append('file', fileToUpload); 
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error subiendo imagen a Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error en Cloudinary:', error);
    throw error;
  }
};