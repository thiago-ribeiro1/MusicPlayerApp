import RNFS from 'react-native-fs';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9_\-]/g, '_'); // mantém apenas letras, números, _ e -
}

export async function saveBase64ToFile(
  base64String: string,
  fileName: string,
): Promise<string> {
  const safeName = sanitizeFileName(fileName);
  const path = `${RNFS.CachesDirectoryPath}/${safeName}.png`;

  try {
    await RNFS.writeFile(path, base64String, 'base64'); // Salva o arquivo da capa base64 no diretório de cache
    return `file://${path}`;
  } catch (error) {
    console.warn('Erro ao salvar imagem base64 como arquivo:', error);
    return '';
  }
}
