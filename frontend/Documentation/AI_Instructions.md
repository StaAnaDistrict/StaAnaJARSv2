# AI Agent Instructions for Sta. Ana JARS Project

This document provides guidelines for AI agents working on the Sta. Ana JARS codebase. The goal is to ensure maintainable, readable, and consistent code that aligns with the project's current structure and future evolution.

## 1. Understand the Current Architecture

*   **Static Site:** The project is primarily a static HTML website. Content, structure, styling (CSS), and client-side interactivity (JavaScript) are largely contained within individual HTML files.
*   **Data Source:** Dynamic content (lists of research papers, researcher details) is fetched from public Google Sheets via JavaScript using the Google Visualization API. There is no traditional backend database or dedicated API layer currently active.
*   **Styling:** CSS is embedded within `<style>` tags in each HTML file.
*   **Interactivity:** JavaScript is embedded within `<script>` tags, primarily for DOM manipulation, navigation (hamburger menu, dropdowns), search functionality, and fetching data from Google Sheets.
*   **Hosting:** The site is hosted on Netlify. Configuration is in `netlify.toml` and `headers`.

**Priority:** Maintain this static site structure unless specifically instructed to implement a more complex backend or API layer. Changes should be incremental and well-justified.

## 2. General Coding Principles

*   **Readability:** Write clear, understandable code. Use comments to explain complex logic or non-obvious decisions.
*   **Simplicity:** Prefer simple solutions over complex ones, especially given the current static nature of the site.
*   **Consistency:** Adhere to the existing coding style found in the files. If making significant changes or adding new files, aim for consistency with the guidelines below.
*   **HTML:**
    *   Use semantic HTML5 tags (`<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`, etc.) where appropriate.
    *   Ensure proper heading hierarchy (`<h1>` to `<h6>`).
    *   Use `alt` attributes for all images for accessibility.
    *   Validate HTML to catch errors.
*   **CSS:**
    *   When modifying existing CSS, try to match the current style and selector patterns.
    *   If adding significant new CSS, consider whether it should be a candidate for future extraction into a separate `.css` file (discuss this if it seems appropriate).
    *   Use clear and descriptive class names.
    *   Avoid overly broad selectors that might have unintended side effects.
    *   Ensure styles are responsive and work well on different screen sizes.
*   **JavaScript:**
    *   Write vanilla JavaScript. Avoid introducing new libraries or frameworks unless explicitly requested and justified.
    *   Make functions small and focused on a single task.
    *   Use meaningful variable and function names.
    *   Comment complex sections of code.
    *   Minimize direct DOM manipulation where possible; if manipulating multiple elements, consider efficiency.
    *   When fetching data (e.g., from Google Sheets):
        *   Implement robust error handling (see section below).
        *   Clearly indicate loading states to the user.
        *   Handle cases where data might be missing or malformed.

## 3. Good Design Patterns (for this context)

*   **Modular HTML Sections:** Structure pages with clear sections. If similar sections are repeated (e.g., research paper listings), ensure the HTML structure is consistent to allow for easier templating or dynamic generation. The current site uses JavaScript to populate these sections from Google Sheet data.
*   **CSS Naming Conventions:** While not strictly enforced project-wide due to embedded styles, aim for BEM-like naming (`block__element--modifier`) if adding new, complex components, or at least maintain consistency with the existing naming (e.g., `.navbar-link`, `.latest-box-title`).
*   **JavaScript Event Handling:** Use `addEventListener` for attaching events. Ensure event listeners are managed appropriately (e.g., removed if the element is removed, though this is less critical in a static site context without heavy SPA-like behavior).
*   **Configuration:** For values like the Google Sheet ID or base URLs that might change, consider defining them as constants at the top of relevant script blocks rather than hardcoding them in multiple places within a single script. (Currently, the Sheet ID is often repeated in scripts across different HTML files; a future improvement could be a single JS config file, but stick to current patterns for minor changes).

## 4. Error Handling

*   **JavaScript Fetch Operations:**
    *   Always use `.catch()` for `fetch` promises to handle network errors or issues with the request itself.
    *   Check `response.ok` before attempting to parse the response (e.g., `response.json()` or `response.text()`).
    *   Wrap JSON parsing in `try...catch` if the response might not always be valid JSON.
    *   Display user-friendly error messages or states if data cannot be loaded (e.g., "Failed to load research entries. Please try again later."). The current site does this in places.
    ```javascript
    // Example for fetching and processing data
    fetch('some_url')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // or .text()
      })
      .then(data => {
        // process data
        // Check for expected data structure, e.g., data.table.rows
        if (!data || !data.table || !data.table.rows) {
            console.warn('Data format from Google Sheet is unexpected:', data);
            // Display a gentle error or empty state to the user
            return;
        }
        // ...
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        // Display an error message to the user in the UI
        document.getElementById('some-element-id').textContent = 'Error loading data.';
      });
    ```
*   **DOM Manipulation:**
    *   Always check if an element exists before trying to access its properties or call its methods (e.g., `document.getElementById('myElement')`).
    ```javascript
    const myElement = document.getElementById('myElement');
    if (myElement) {
      myElement.textContent = 'New Content';
    } else {
      console.warn('Element with ID "myElement" not found.');
    }
    ```
*   **User Input:** While most input is via Google Forms, if any direct user input is handled by client-side JS, sanitize or validate it appropriately (though this is less of a concern for the current read-only nature of most of the site).

## 5. Avoiding Beginner Code Pitfalls

*   **Global Variables:** Minimize the use of global JavaScript variables. Encapsulate logic within functions or use IIFEs (Immediately Invoked Function Expressions) if appropriate for older patterns.
*   **Hardcoding URLs:** For internal links, use relative paths (e.g., `../about.html`, `./images/logo.png`). For external data sources like the Google Sheet, the URL is somewhat fixed, but be mindful if variations are needed.
*   **Large, Monolithic Functions:** Break down complex JavaScript logic into smaller, reusable functions.
*   **Ignoring Accessibility (a11y):** Ensure interactive elements are keyboard accessible, images have `alt` text, and ARIA attributes are used where necessary.
*   **Directly Modifying Live HTML Collections:** When iterating over HTMLCollections (e.g., from `getElementsByClassName` or `children`), be aware that they can be "live." If you modify the collection while iterating, it can lead to unexpected behavior. It's often safer to convert to an array first (e.g., `Array.from(collection)`).
*   **Over-reliance on `innerHTML` for Complex Structures:** While `innerHTML` is used in the project to inject dynamically loaded content, be cautious when constructing large or complex HTML strings this way. It can be error-prone and less secure if user-generated content were involved (not the case here). For very complex structures, consider `document.createElement` and `appendChild`, though this might be overkill for the current project's needs. Stick to the existing pattern of `innerHTML` for consistency unless a significant refactor is requested.

## 6. Making Changes

*   **Understand the Impact:** Before making changes, understand which pages or components might be affected.
*   **Test Thoroughly:** Manually test your changes on different browsers and screen sizes.
*   **Follow the Plan:** Adhere to the steps outlined in the current plan provided by the user or lead agent.
*   **Communicate:** If you encounter issues, ambiguities, or need to deviate from the plan, communicate clearly.

By following these guidelines, AI agents can contribute effectively to the Sta. Ana JARS project, ensuring that the codebase remains functional, understandable, and easy to maintain.
---
