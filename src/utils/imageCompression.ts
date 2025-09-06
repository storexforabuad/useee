import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,          // (default: Number.POSITIVE_INFINITY)
  maxWidthOrHeight: 1920, // (default: undefined)
  useWebWorker: true,    // (default: true)
  maxIteration: 10,      // (default: 10)
};

export async function compressImage(imageFile: File): Promise<File> {
  try {
    console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);
    const compressedFile = await imageCompression(imageFile, options);
    console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`);
    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    // Fallback to original file if compression fails
    return imageFile;
  }
}
