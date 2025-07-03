# 🎵 Music Player

Aplicativo de música para Android desenvolvido com **React Native CLI** e backend nativo em **Kotlin**, projetado para quem quer ouvir suas **músicas baixadas diretamente no dispositivo**, sem depender de serviços de streaming pagos.

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

## 🧠 Funcionalidades Técnicas

- 🔄 **Paginação nativa**: Carrega 10 músicas por vez, com suporte a carregamento incremental, melhorando a performance.
- 🧠 **Hook centralizado (`useSongs`)**: Gerencia a lista de músicas, offset, loading state e integração com TrackPlayer.
- 🖼️ **Conversão de capa embutida**: Imagens em base64 extraídas de arquivos MP3 são salvas em disco (`CachesDirectoryPath`) com nomes únicos por ID.
- 🎛️ **Player funcional**:
  - Play/Pause
  - Skip (próxima e anterior)
  - Shuffle e Repeat com estado visual
  - Mini player persistente
- 🛠️ **Fallback inteligente**: Se a música não possui capa, é usada uma imagem padrão local.

---

## 🚀 Como Executar no Android

### Pré-requisitos:

1. Tenha o ambiente do **React Native CLI** já configurado ([Guia oficial](https://reactnative.dev/docs/environment-setup))  
2. Use um **dispositivo Android com modo desenvolvedor ativado**  
3. Habilite a **depuração USB** no celular  
4. Conecte o aparelho via **cabo USB** ao computador  
5. Permita a autorização do PC no celular

### Passos para executar:

#### 1 - Instale as dependências
```bash
npm install
```
#### 2 - Build (APK)
```bash
cd android
./gradlew assembleDebug
```
#### 3 - Executar
```bash
cd ..
npx react-native run-android
```
#### Aguarde o carregamento do app
