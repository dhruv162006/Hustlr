import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

export const uploadToCloudinary = (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );

    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);
    stream.pipe(uploadStream);
  });
};

export default uploadToCloudinary;
