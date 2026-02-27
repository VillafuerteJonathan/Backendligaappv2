// utils/paths.js
import path from 'path';

export function rutaRelativaUploads(rutaCompleta) {
  const uploadsDir = path.join(process.cwd(), 'uploads');

  const relativePath = path.relative(uploadsDir, rutaCompleta);

  return `/uploads/${relativePath.split(path.sep).join('/')}`;
}
