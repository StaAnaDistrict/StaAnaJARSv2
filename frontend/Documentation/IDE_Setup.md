# IDE Setup Guide for Sta. Ana JARS Project

This guide provides basic setup instructions for working on the Sta. Ana JARS project using Visual Studio Code (VS Code), a popular and free Integrated Development Environment (IDE). These instructions can be adapted for other IDEs like WebStorm or Sublime Text, though specific extension names or settings might differ.

## 1. Prerequisites

*   **Git:** Ensure Git is installed on your system for version control. ([Download Git](https://git-scm.com/downloads))
*   **VS Code:** Download and install VS Code if you don't have it already. ([Download VS Code](https://code.visualstudio.com/download))

## 2. Opening the Project

1.  **Clone the Repository (if you haven't already):**
    ```bash
    git clone <repository_url>
    cd <repository_directory_name>
    ```
2.  **Open with VS Code:**
    *   **Option A (From Terminal):** Navigate to the project's root directory in your terminal and type:
        ```bash
        code .
        ```
    *   **Option B (From VS Code UI):** Open VS Code, then go to `File > Open Folder...` and select the root directory of the cloned project.

## 3. Recommended VS Code Extensions

These extensions can improve your development experience for this HTML, CSS, and JavaScript project. To install them, go to the Extensions view in VS Code (click the square icon on the left sidebar or press `Ctrl+Shift+X`).

*   **Live Server (by Ritwick Dey):**
    *   Allows you to launch a local development server with live reload feature for static and dynamic pages. This is very useful for seeing changes in your HTML/CSS/JS files reflected in the browser instantly without manual refreshing.
    *   *Usage:* After installation, right-click on an HTML file in the Explorer panel and select "Open with Live Server".

*   **Prettier - Code formatter (by Prettier):**
    *   An opinionated code formatter that helps maintain consistent code style across the project for HTML, CSS, and JavaScript.
    *   It's recommended to configure it to format on save (see `.vscode/settings.json` below).

*   **ESLint (by Microsoft):**
    *   While the current project uses simple embedded JavaScript, if JavaScript complexity grows or is moved to separate files, ESLint helps to find and fix problems in your JavaScript code.
    *   *Note:* Requires configuration if not already set up in the project (e.g., an `.eslintrc.js` file). For the current project structure, its immediate utility might be limited but good for future-proofing.

*   **Path Intellisense (by Christian Kohler):**
    *   Autocompletes filenames and paths, which is helpful when linking CSS, JS, or images in HTML.

## 4. VS Code Configuration (`.vscode/settings.json`)

You can create a `.vscode` folder in the root of your project and add a `settings.json` file to it. This allows for project-specific settings.

**File:** `.vscode/settings.json`
```json
{
  // Editor settings
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",

  // Prettier configuration (requires Prettier extension)
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // Files settings
  "files.eol": "\\n", // Ensure consistent line endings (Linux/macOS style)
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,

  // Live Server extension settings (optional)
  "liveServer.settings.donotShowInfoMsg": true,
  "liveServer.settings.port": 5501 // Optional: change default port if 5500 is in use
}
```

**To create this file:**
1.  In VS Code, ensure you are in the project's root directory.
2.  Create a new folder named `.vscode`.
3.  Inside the `.vscode` folder, create a new file named `settings.json`.
4.  Copy and paste the content above into `settings.json`.

These settings will:
*   Set tab size to 2 spaces.
*   Enable word wrap.
*   Configure Prettier as the default formatter for HTML, CSS, and JavaScript, and enable format on save.
*   Ensure consistent line endings and trim trailing whitespace.

## 5. Working with the Code

*   **File Structure:** The project consists mainly of HTML files, with CSS and JavaScript embedded within them. Images are in the `/images` directory. Research paper templates are in subdirectories under `/action-research/`.
*   **Making Changes:**
    *   Edit HTML files directly for content and structure.
    *   Modify `<style>` tags within HTML files for CSS changes.
    *   Modify `<script>` tags within HTML files for JavaScript changes.
*   **Previewing Changes:** Use the "Live Server" extension to preview your changes in a web browser.

This basic setup should provide a comfortable environment for working with the Sta. Ana JARS codebase.
---
