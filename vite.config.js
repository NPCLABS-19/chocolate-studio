import {defineConfig} from 'vite';
import {fileURLToPath,URL} from 'node:url';
export default defineConfig({base:'./',server:{host:'127.0.0.1',port:5179,fs:{strict:true,allow:[fileURLToPath(new URL('.',import.meta.url))]}},build:{rollupOptions:{input:{main:fileURLToPath(new URL('./index.html',import.meta.url)),library:fileURLToPath(new URL('./library.html',import.meta.url))},output:{manualChunks:{three:['three']}}}}});
