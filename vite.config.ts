import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import process from 'node:process'
import fs from 'node:fs';

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "NODETYPE_MAP": (() => {
      const map: { [key: string]: string } = {};
      const dirPath = 'src/nodeTypes';
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        if (file.endsWith('.tsx')) {
          const typeName = file.replace('.tsx', '');
          map[toSnakeCase(typeName)] = typeName;
        }
      });
      console.log(map);
      return map;
    })()
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'socket.io-client']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          socket: ['socket.io-client']
        }
      }
    }
  },
  server: {
    host: true,
    proxy: {
      // Specific proxy for file uploads to handle FormData properly
      '/api/servers/.*/mods': {
        target: `http://localhost:${process.env.INTERNAL_PORT || 3174}`,
        changeOrigin: true,
        secure: false,
        timeout: 60000, // 60 seconds for file uploads
        proxyTimeout: 60000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('File upload proxy error:', err);
          });
        },
      },
      // General API proxy
      // '/api': {
      //   target: `http://localhost:${process.env.INTERNAL_PORT || 3174}`,
      //   changeOrigin: true,
      //   secure: false,
      //   rewrite: (path) => path,
      // },
      '/phpmyadmin': {
        target: "http://phpmyadmin:80",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/phpmyadmin/, '/'),
      }
    },
  },
})
