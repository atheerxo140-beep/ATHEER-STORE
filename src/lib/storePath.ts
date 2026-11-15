import fs from 'fs';
import path from 'path';

/**
 * Returns a reliable file path for JSON data stores.
 * On local machines, uses src/data/{fileName}.
 * In Vercel / Serverless production, uses /tmp/atheer_store/{fileName}
 * seeded from the bundled file, ensuring writes never fail with EROFS.
 */
export function getStoreFilePath(fileName: string): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDir = path.join('/tmp', 'atheer_store');
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch (e) {}
    }
    const tmpFile = path.join(tmpDir, fileName);
    if (!fs.existsSync(tmpFile)) {
      const bundledPath = path.join(process.cwd(), 'src', 'data', fileName);
      if (fs.existsSync(bundledPath)) {
        try {
          fs.copyFileSync(bundledPath, tmpFile);
        } catch (e) {}
      }
    }
    return tmpFile;
  }

  return path.join(process.cwd(), 'src', 'data', fileName);
}
