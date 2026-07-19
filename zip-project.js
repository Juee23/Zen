import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const output = fs.createWriteStream(path.join(__dirname, 'zen-workspace-local.zip'));
const archive = new ZipArchive({
  zlib: { level: 9 }
});

output.on('close', function() {
  console.log('ZIP file successfully created! Total size: ' + (archive.pointer() / 1024 / 1024).toFixed(2) + ' MB');
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

archive.glob('**/*', {
  cwd: __dirname,
  ignore: [
    'node_modules/**',
    'dist/**',
    '.git/**',
    'zen-workspace-local.zip',
    'zip-project.js'
  ],
  dot: true // Include dotfiles like .env.example, .gitignore
});

archive.finalize();
