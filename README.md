# 🎵 Music Player

Aplicativo de música para Android desenvolvido com **React Native CLI** e backend nativo em **Kotlin**, projetado para quem quer ouvir suas **músicas baixadas diretamente no dispositivo**.

---

<img width="3500" height="1969" alt="Image" src="https://github.com/user-attachments/assets/b3b5d885-bfd8-4ae3-b8e8-d7d51a5ebdb4" /> <br>

---

O app está disponível na Google Play Store: [**Music Player**](https://play.google.com/store/apps/details?id=com.musicplayerapp&pcampaignid=web_share)

---

## 📱 Sobre o App

O **Music Player** escaneia automaticamente o armazenamento do dispositivo e carrega todas as músicas locais com metadados reais, incluindo:

- 🎵 Título da música  
- 🎤 Artista  
- 🕒 Duração  
- 🖼️ Capa do álbum (embutida nos arquivos)

Com uma interface moderna e fluida, o usuário pode navegar pelas músicas e ouvir qualquer faixa diretamente, sem precisar de conexão com a internet.

---

## ⚙️ Tecnologias Utilizadas

### 🎯 Frontend
- [React Native CLI](https://reactnative.dev/)
- [Zustand](https://github.com/pmndrs/zustand) – gerenciamento de estado global
- [react-native-track-player](https://github.com/doublesymmetry/react-native-track-player) – player de áudio nativo
- [FlashList](https://shopify.github.io/flash-list/) – renderização performática de listas
- TypeScript para tipagem estática

### 🔧 Backend (Android)
- **Kotlin** com `MediaStore` e `MediaMetadataRetriever`
- Módulo nativo `MusicScannerModule.kt` para:
  - Paginação de músicas reais
  - Extração de metadados
  - Recuperação de capas embutidas (base64)
- Salvamento de capas com `react-native-fs` como arquivos `file://` 

---

## Funcionalidades Técnicas

- **Paginação nativa**: Carrega 10 músicas por vez, com suporte a carregamento incremental, melhorando a performance.
- **Hook centralizado (`useSongs`)**: Gerencia a lista de músicas, offset, loading state e integração com TrackPlayer.
- **Conversão de capa embutida**: Imagens em base64 extraídas de arquivos MP3 são salvas em disco (`CachesDirectoryPath`) com nomes únicos por ID.
- **Player funcional**:
  - Play/Pause
  - Skip (próxima e anterior)
  - Shuffle e Repeat com estado visual
  - Mini player persistente
- 🛠️ **Fallback inteligente**: Se a música não possui capa, é usada uma imagem padrão local.

---

## 📄 Observações

Este repositório é disponibilizado **apenas para fins de leitura, análise de código e portfólio**.  
Não contém arquivos sensíveis, nem outros arquivos privados necessários para compilar e assinar o aplicativo.  
Por esse motivo, **o projeto não pode ser compilado** a partir deste código.

O app oficial está disponível na Google Play Store: [**Music Player**](https://play.google.com/store/apps/details?id=com.musicplayerapp&pcampaignid=web_share)

---
