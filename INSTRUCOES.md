# Instruções do Projeto - Sidy (Calculadora & Notas)

Este documento contém o passo a passo para você configurar, instalar, rodar em ambiente de desenvolvimento (testes) e finalmente como gerar o executável final da aplicação Electron + React.

---

## 1. Instalando Dependências

Sempre que baixar o projeto pela primeira vez ou adicionar uma nova biblioteca, você precisa instalar as dependências. Abra o terminal na pasta raiz do projeto (`c:\Users\sidne\Documentos\2025\calcnotes`) e rode:

```bash
npm install
```

---

## 2. Rodando o Projeto (Modo Desenvolvimento)

Para desenvolver e testar com *Hot Reload* (atualização automática ao salvar o código), precisamos de dois terminais rodando em paralelo.

**Terminal 1 (Inicia o servidor React/Vite):**
```bash
npm run dev
```

**Terminal 2 (Inicia a janela do Electron conectada ao Vite):**
```bash
npm start
```
*(O comando `npm start` já está configurado no seu arquivo `package.json` para rodar o Electron apontando para o servidor local).*

---

## 3. Gerando o Build (Produção)

Sempre que terminar as alterações e quiser testar a versão "final" empacotada localmente (sem o servidor do Vite rodando), gere a build do React:

```bash
npm run build
```
Isso vai criar uma pasta chamada `dist` com os arquivos finais otimizados de interface. Depois do build, você pode testar se a versão compilada funciona executando:
```bash
npx electron .
```

---

## 4. Como Criar o Executável Final (.exe)

Atualmente, o projeto não possui uma ferramenta instalada para agrupar e compilar o código em um arquivo executável, como um `.exe` para o Windows. Como sua intenção seja gerar esse executável, recomendo o uso do **Electron Builder**.

Aqui está como prepará-lo:

### Passo A: Instalação
No terminal, execute:
```bash
npm install electron-builder --save-dev
```

### Passo B: Configuração no `package.json`
Abra o seu arquivo `package.json`. Você precisará de duas pequenas alterações.

1.  **Adicionar scripts de empacotamento** dentro de `"scripts"`:
    ```json
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      "preview": "vite preview",
      "start": "cross-env NODE_ENV=development electron .",
      "pack": "electron-builder --dir",
      "dist-win": "npm run build && electron-builder --win",
      "dist-mac": "npm run build && electron-builder --mac"
    }
    ```

2.  **Adicionar configuração do builder** no final do `package.json` (após as `devDependencies`):
    ```json
    "build": {
      "appId": "com.seu-nome.sidy",
      "productName": "Sidy",
      "directories": {
        "output": "release"
      },
      "files": [
        "dist/**/*",
        "electron.cjs",
        "preload.cjs"
      ],
      "win": {
        "target": "nsis",
        "icon": "public/tray-iconTemplate.png"
      }
    }
    ```

### Passo C: Gerando o .EXE (Windows)
Após configurar, toda vez que precisar gerar um instalador e executável novo do seu aplicativo para o Windows, apenas digite:
```bash
npm run dist-win
```

Isso fará primeiramente o build do seu React (`npm run build`) de forma automática, e em seguida empacotará o Electron. O arquivo `.exe` (instalador) e o executável solto ficarão disponíveis dentro de uma nova pasta chamada **`release`**, prontos para distribuir!
