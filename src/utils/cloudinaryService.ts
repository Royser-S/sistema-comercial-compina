export const uploadToCloudinary = async (file: File): Promise<string> => {
  // Leemos las variables del entorno
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  // Validación por si se te olvida ponerlas
  if (!cloudName || !uploadPreset) {
    throw new Error('Faltan las variables de entorno de Cloudinary');
  }

  const formData = new FormData();
  formData.append('file', file);
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