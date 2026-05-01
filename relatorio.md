# Relatório de Diagnóstico — Play Console Release Rejection

**Data:** 2026-04-30  
**App:** Music Player App (`com.musicplayerapp`)  
**Versão analisada:** 2.8.0 (versionCode 10)

---

## Erros reportados pelo Play Console

1. O app está com `targetSdkVersion 34`, mas o Play Console exige `targetSdkVersion 35` para novos releases.
2. O novo release deixou de suportar **1.190 dispositivos** que eram suportados na versão anterior.

---

## Arquivos analisados

- `android/build.gradle`
- `android/app/build.gradle`
- `android/gradle.properties`
- `android/app/src/main/AndroidManifest.xml`

---

## Achados

### Erro 1 — targetSdkVersion incorreto

**Arquivo:** `android/build.gradle`, linha 6

```groovy
buildToolsVersion = "35.0.0"
minSdkVersion     = 24
compileSdkVersion = 35   // ← correto
targetSdkVersion  = 34   // ← incorreto
```

O `compileSdkVersion` foi atualizado para 35, mas o `targetSdkVersion` ficou em 34.  
O `android/app/build.gradle` lê o valor via `rootProject.ext.targetSdkVersion` (linha 96), herdando o 34 do build.gradle raiz. Por isso o AAB é gerado com targetSdk 34.

---

### Erro 2 — Dispositivos removidos (~1.190)

#### armeabi-v7a: NÃO foi removido

`android/gradle.properties`, linha 28:

```
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
```

Todas as 4 arquiteturas estão presentes. Não há bloco `splits { abi }` nem `ndk { abiFilters }` no `android/app/build.gradle`.

#### Causa provável: minSdkVersion aumentou

**Arquivo:** `android/build.gradle`, linha 4  
**Valor atual:** `minSdkVersion = 24` (exige Android 7.0+)

O arquivo `android/build.gradle` aparece como **modificado** no git, o que indica que o `minSdkVersion` foi alterado neste branch. Dependendo do valor anterior:

| minSdkVersion anterior | minSdkVersion atual | Dispositivos excluídos |
|---|---|---|
| 21 | 24 | Android 5.0, 5.1, 6.0 (APIs 21–23) |
| 23 | 24 | Android 6.0 (API 23) |

#### uses-feature: descartado como causa

O `AndroidManifest.xml` não contém nenhuma tag `<uses-feature required="true">`, portanto não é vetor de exclusão de dispositivos.

---

## Tabela resumo

| # | Problema | Arquivo | Linha | Valor atual | Valor necessário |
|---|---|---|---|---|---|
| 1 | targetSdkVersion incorreto | `android/build.gradle` | 6 | `34` | `35` |
| 2 | minSdkVersion muito alto | `android/build.gradle` | 4 | `24` | provavelmente `21` ou `23` |

---

## Correção mínima

### Para o erro 1

Alterar uma linha em `android/build.gradle`:

```groovy
// antes
targetSdkVersion = 34

// depois
targetSdkVersion = 35
```

### Para o erro 2

Verificar no git qual era o `minSdkVersion` anterior e restaurá-lo:

```bash
git diff HEAD -- android/build.gradle
# ou
git log --oneline -- android/build.gradle
```

Se o histórico mostrar que era `21`, restaurar para `21`. Se era `23`, restaurar para `23`.  
O React Native 0.73+ usa 23 como padrão; versões mais antigas usavam 21.

---

## Itens sem alteração necessária

- `android/app/build.gradle` — nenhuma mudança necessária; já lê os valores via `rootProject.ext`
- `android/gradle.properties` — arquiteturas corretas, nenhuma alteração necessária
- `AndroidManifest.xml` — permissões e serviços corretos, nenhuma alteração necessária
- TrackPlayer, patches e dependências — fora do escopo, não alterados
