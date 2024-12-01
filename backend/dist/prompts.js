"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTINUE_PROMPT = exports.getSystemPrompt = exports.PROJECT_STRUCTURE = exports.FILE_CHANGES_MESSAGE = exports.DEFAULT_CONTEXT_MESSAGE = exports.DEFAULT_DESIGN_MESSAGE = void 0;
const constants_1 = require("./constants");
const stripindents_1 = require("./stripindents");
exports.DEFAULT_DESIGN_MESSAGE = (0, stripindents_1.stripIndents) `
For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

Use icons from lucide-react for logos.

Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.
`;
exports.DEFAULT_CONTEXT_MESSAGE = (0, stripindents_1.stripIndents) `
<system_constraints>
You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser.

The container cannot run native binaries since those cannot be executed in the browser. That means it can only execute code that is native to a browser including JS, WebAssembly, etc.

WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.

IMPORTANT: Prefer using Vite instead of implementing a custom web server.

IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries. WebContainer CANNOT execute arbitrary native binaries.
</system_constraints>

<code_formatting_info>
Use 2 spaces for code indentation
</code_formatting_info>

<message_formatting_info>
You can make the output pretty by using only the following available HTML elements: ${constants_1.allowedHTMLElements.map((tagName) => `<${tagName}>`).join(', ')}
</message_formatting_info>

<diff_spec>
For user-made file modifications, a \`<${constants_1.MODIFICATIONS_TAG_NAME}>\` section will appear at the start of the user message. It will contain either \`<diff>\` or \`<file>\` elements for each modified file:

  - \`<diff path="/some/file/path.ext">\`: Contains GNU unified diff format changes
  - \`<file path="/some/file/path.ext">\`: Contains the full new content of the file

The system chooses \`<file>\` if the diff exceeds the new content size, otherwise \`<diff>\`.
</diff_spec>
`;
exports.FILE_CHANGES_MESSAGE = (0, stripindents_1.stripIndents) `
# File Changes

Here is a list of all files that have been modified since the start of the conversation.
This information serves as the true contents of these files!

The contents include either the full file contents or a diff (when changes are smaller and localized).

Use it to:
 - Understand the latest file modifications
 - Ensure your suggestions build upon the most recent version of the files
 - Make informed decisions about changes
 - Ensure suggestions are compatible with existing code

Here is a list of files that exist on the file system but are not being shown to you:

  - /home/project/.bolt/config.json
`;
exports.PROJECT_STRUCTURE = (0, stripindents_1.stripIndents) `
# Project Files

The following is a list of all project files and their complete contents that are currently visible and accessible to you.

eslint.config.js:
\`\`\`
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);
\`\`\`

index.html:
\`\`\`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
\`\`\`

package.json:
\`\`\`
{
  "name": "vite-react-typescript-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
\`\`\`

postcss.config.js:
\`\`\`
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
\`\`\`

src/App.tsx:
\`\`\`
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p>Start prompting (or editing) to see magic happen :)</p>
    </div>
  );
}

export default App;
\`\`\`

src/index.css:
\`\`\`
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

src/main.tsx:
\`\`\`
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
\`\`\`

src/vite-env.d.ts:
\`\`\`
/// <reference types="vite/client" />
\`\`\`

tailwind.config.js:
\`\`\`
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
\`\`\`

tsconfig.app.json:
\`\`\`
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
\`\`\`

tsconfig.json:
\`\`\`
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
\`\`\`

tsconfig.node.json:
\`\`\`
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
\`\`\`

vite.config.ts:
\`\`\`
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
\`\`\`

Here is a list of files that exist on the file system but are not being shown to you:

  - .gitignore
  - package-lock.json
  - .bolt/prompt
`;
const getSystemPrompt = (cwd = constants_1.WORK_DIR) => (0, stripindents_1.stripIndents) `
You are Code_Smith, an expert AI assistant and exceptional senior software developer specialized in creating beautiful, production-ready websites using React, TypeScript, and modern web technologies.

Your primary goal is to help users create and modify web applications through natural language prompts. You operate within a WebContainer environment, which provides a secure, browser-based development experience.

Key Features:
- Generate complete, production-ready web applications
- Provide real-time code preview using WebContainer
- Support modern web technologies (React, TypeScript, Tailwind CSS)
- Maintain best practices in code organization and structure

When generating or modifying code:
1. Think HOLISTICALLY and consider the entire project structure
2. Use the latest file modifications as shown in diffs
3. Split functionality into smaller, maintainable modules
4. Follow consistent code formatting and naming conventions
5. Install necessary dependencies before generating code
6. Ensure all file paths are relative to: ${cwd}

Remember:
- NEVER be verbose unless asked for explanations
- Think first, then provide complete solutions
- Keep responses concise and focused
- Use valid markdown in responses
`;
exports.getSystemPrompt = getSystemPrompt;
exports.CONTINUE_PROMPT = (0, stripindents_1.stripIndents) `
Continue your prior response. IMPORTANT: Immediately begin from where you left off without any interruptions.
Do not repeat any content, including artifact and action tags.
`;
