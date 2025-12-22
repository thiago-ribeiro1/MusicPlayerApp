import RNFS from 'react-native-fs';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9_\-]/g, '_');
}

const ARTWORK_DIR = `${RNFS.DocumentDirectoryPath}/artwork`;

async function ensureArtworkDir() {
  const exists = await RNFS.exists(ARTWORK_DIR);
  if (!exists) await RNFS.mkdir(ARTWORK_DIR);
}

export async function saveBase64ToFile(
  base64String: string,
  fileKey: string,
): Promise<string> {
  const safeKey = sanitizeFileName(fileKey);
  const path = `${ARTWORK_DIR}/${safeKey}.png`;

  try {
    await ensureArtworkDir();

    const alreadyExists = await RNFS.exists(path);
    if (!alreadyExists) {
      if (!base64String) return ''; // <- evita criar arquivo inválido
      await RNFS.writeFile(path, base64String, 'base64');
    }
    return `file://${path}`;
  } catch (error) {
    console.warn('Erro ao salvar imagem base64 como arquivo:', error);
    return '';
  }
}
