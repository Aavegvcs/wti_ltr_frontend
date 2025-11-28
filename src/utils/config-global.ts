// import axios from "axios";
// import packageJson from '../package.json';
// import { decryptData, encryptData } from "./utils/crypto.utils";

// export const CONFIG_ENCRYPT = {
//   port: import.meta.env.VITE_PORT || '3000',
//   appSecret: import.meta.env.VITE_APP_SECRET || '',
//   encKey: import.meta.env.VITE_ENC_KEY || '',
// };


// // ----------------------------------------------------------------------

// export type ConfigValue = {
//   appName: string;
//   appVersion: string;
// };

// // ----------------------------------------------------------------------

// export const CONFIG: ConfigValue = {
//   appName: 'Minimal UI',
//   appVersion: packageJson.version,
// };


// const axiosInstance = axios.create({
//   baseURL: "http://localhost:3002/backend", // Change to your API URL
//   headers: {
//     'Content-Type': 'application/json', // Explicitly set Content-Type
//   },
// });

// // ------------------------------- requst encryption ---------------------------------------

// axiosInstance.interceptors.request.use(
//   async (config) => {
//     if (config.data) {
//       const encryptedData = await encryptData(config.data, CONFIG_ENCRYPT.encKey);
//       const newObject = { "string": encryptedData };
//       const newObjectStringify = JSON.stringify(newObject);
//       config.data =newObjectStringify;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ------------------- decrypt response code --------------------------
// axiosInstance.interceptors.response.use(
//   async (response) => {
   
//     const responseData = response.data.string;
//     // console.log('decryptedData in interceptor1', responseData);
//     if (response.data && typeof response.data === "object" && responseData) {
   
//       try {
//         const decryptedData = await decryptData(responseData, CONFIG_ENCRYPT.encKey);
//         // console.log('decryptedData in interceptor3i', decryptedData);

//         return { ...response, data: decryptedData };
//       } catch (error) {
//         console.error("Decryption Error:", error);
//         return Promise.reject(new Error("Failed to decrypt response data."));
//       }
//     }

//     return response;
//   },
//   (error) => Promise.reject(error) 
// );

// export default axiosInstance;


import axios from "axios";
import packageJson from '../../package.json';
import { decryptData, encryptData } from "./crpto.utils";
// import { useRecoilState, atom, useRecoilValue } from 'recoil';


export const CONFIG_ENCRYPT = {
  port: process.env.NEXT_PUBLIC_PORT || '3000',
  appSecret: process.env.NEXT_PUBLIC_APP_SECRET || '',
  encKey: process.env.NEXT_PUBLIC_ENC_KEY || '',
};


export type ConfigValue = {
  appName: string;
  appVersion: string;
};

export const CONFIG: ConfigValue = {
  appName: 'WTi',
  appVersion: packageJson.version,
};

// config.js
export const AwsBucketUrl = process.env.NEXT_PUBLIC_AWS_BUCKET_URL;

const axiosInstance = axios.create({
  // local
  // baseURL: "http://localhost:3012/backend",
  // production
  
   baseURL: process.env.NEXT_PUBLIC_WTI_BACKEND_URL,

   
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
    }
    if (config.data) {
      const encryptedData = await encryptData(config.data);
      const newObject = { "string": encryptedData };
      config.data = JSON.stringify(newObject);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  async (response) => {
    const responseData = response.data.string;
    if (response.data && typeof response.data === "object" && responseData) {
      try {
        const decryptedData = await decryptData(responseData);
        return { ...response, data: decryptedData };
      } catch (error) {
        console.error("Decryption Error:", error);
        return Promise.reject(new Error("Failed to decrypt response data."));
      }
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;