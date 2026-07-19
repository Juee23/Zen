import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'serve-zip-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/zen-workspace-local.zip' || req.url?.startsWith('/zen-workspace-local.zip')) {
              const filePath = path.resolve(__dirname, 'zen-workspace-local.zip');
              if (fs.existsSync(filePath)) {
                res.writeHead(200, {
                  'Content-Type': 'application/zip',
                  'Content-Disposition': 'attachment; filename="zen-workspace-local.zip"',
                });
                fs.createReadStream(filePath).pipe(res);
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
