// src/utils/uploadToS3.ts
import axios, { AxiosRequestConfig } from "axios";
import { decryptData } from "./crpto.utils"; // your existing decrypt util

// helper to call upload endpoint and decrypt response to get filename
const imageUploadApi = async (config: AxiosRequestConfig): Promise<string> => {
  const responseData = await axios.request(config);
  console.log("Upload response data:", responseData.data);
  // backend returns encrypted payload in response.data.string
  const decryptedData = await decryptData(responseData.data?.string || "{}");
  console.log("Decrypted upload response data:", decryptedData);
  // decryptedData.data.name should be the stored filename
  return decryptedData.data.name;
};

// Upload a File object (signature)
export const UploadFiletos3Bucket = async (
  file: File,
  container: string
): Promise<string> => {
  const form = new FormData();
  form.append("file", file);

  const config: AxiosRequestConfig = {
    method: "post",
    url: `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/s3/upload/${container}`,
    data: form,
    maxBodyLength: Infinity,
    headers: {
      // Intentionally no Authorization header (driver upload without auth)
      "Content-Type": "multipart/form-data",
    },
  };

  const fileName = await imageUploadApi(config);
  // Build the public URL with the pattern you provided
    // console.log("Uploaded file URL:", `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/s3/getDocument/${container}/${fileName}`);
  return `${process.env.NEXT_PUBLIC_AWS_BUCKET_URL}/s3/getDocument/${container}/${fileName}`;

};
