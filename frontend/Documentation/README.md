# Sta. Ana Journal of Action Research Studies (JARS) 🏺

Welcome to the official repository for the Sta. Ana Journal of Action Research Studies (JARS). This platform showcases innovative action research conducted by educators, primarily from the Sta. Ana District in Davao City, Philippines.

## 1. About Sta. Ana JARS

Sta. Ana JARS is a digital publication platform designed to:

*   Provide a centralized, accessible repository for action research studies.
*   Promote a culture of research and reflective practice among educators.
*   Share findings and innovations that can improve teaching, learning, and school governance.
*   Offer a platform for educators to gain recognition for their scholarly work.

The project was conceptualized, designed, and developed by Mr. Wedzmer B. Munjilul, Head Teacher of Sta. Ana Central Elementary School.

## 2. Tech Stack

*   **Frontend:**
    *   HTML5
    *   CSS3 (Currently embedded in HTML files)
    *   Vanilla JavaScript (Currently embedded in HTML files)
*   **Data Source for Dynamic Content:**
    *   Google Sheets (accessed via public Google Visualization API URLs)
*   **Hosting:**
    *   Netlify
*   **Version Control:**
    *   Git

## 3. Project Structure Overview

*   **Root Directory:**
    *   `*.html`: Main pages of the website (e.g., `index.html`, `about.html`, `journal-issues.html`, etc.).
    *   `action-research/`: Contains subdirectories for different research categories.
        *   `[category-name]/[category-name].html`: Landing page for displaying research within a specific category (e.g., `school-based.html`).
        *   `[category-name]/[publication-template].html`: HTML template for displaying individual research paper details (e.g., `schb-published-template.html`).
    *   `images/`: Contains all static image assets used across the site.
    *   `researchers/`:
        *   `researcherprofile.html`: Template for individual researcher profile pages.
        *   `profilepictures/`: Stores profile pictures of researchers.
    *   `netlify.toml`: Configuration file for Netlify deployment and settings.
    *   `headers`: Custom HTTP headers for Netlify (e.g., for security, caching).
    *   `LICENSE`: License information for the project.
    *   `google*.html`: Google site verification file.
*   **Documentation (Newly Added):**
    *   `PRD.md`: Product Requirements Document.
    *   `API_DOCUMENTATION.md`: Explains current data fetching and potential API structure.
    *   `IDE_SETUP.md`: Guide for setting up a development environment (VS Code).
    *   `.vscode/settings.json`: Recommended VS Code settings for the project.
    *   `AI_INSTRUCTIONS.md`: Guidelines for AI agents working on this codebase.
    *   `DATABASE_MIGRATIONS.md`: Discusses database migrations in the context of the current Google Sheets setup and future potential.
    *   `CODE_QUALITY.md`: Report on code quality and recommendations for improvement.
    *   `TESTING_STRATEGY.md`: Outlines a testing strategy for the current site and future considerations.
    *   `README.md`: This file.

## 4. Setup and Local Development

### Prerequisites
*   A modern web browser (e.g., Chrome, Firefox, Edge).
*   Git (for cloning the repository).
*   A code editor (VS Code is recommended, see `IDE_SETUP.md`).

### Steps
1.  **Clone the Repository:**
    ```bash
    git clone <https_or_ssh_repository_url>
    cd sta-ana-jars-website # Or your chosen directory name
    ```

2.  **View the Website Locally:**
    *   **Option 1: Directly open HTML files:**
        Navigate to the project directory in your file explorer and open `index.html` (or any other HTML file) in your web browser.
    *   **Option 2: Using a local server (Recommended for full functionality, especially if future JS modules are used):**
        If you have VS Code with the "Live Server" extension (see `IDE_SETUP.md`):
        1.  Open the project folder in VS Code.
        2.  Right-click on `index.html` in the VS Code Explorer.
        3.  Select "Open with Live Server". This will open the site in your default browser, and changes will auto-reload.

## 5. How to Update Content

The website's dynamic content (research paper listings, researcher profiles, etc.) is primarily managed through a central Google Sheet. Static page content (like "About Us", "Submission Guidelines") is within the HTML files themselves.

For a visual representation of these content update processes, please see the [Content Update Flow Diagram](CONTENT_UPDATE_FLOW.mermaid).

### 5.1. Editing Static Page Content
*   Identify the HTML file corresponding to the page you want to edit (e.g., `about.html`, `submit-a-study.html`).
*   Open the file in a code editor.
*   Locate the text or content you wish to change and modify it directly within the HTML structure.
*   Save the file and preview your changes locally.

### 5.2. Adding/Updating Research Papers

1.  **Prepare the Research Paper PDF:** Ensure the final PDF of the research paper is ready and hosted somewhere accessible via a public URL (e.g., Google Drive, institutional repository).

2.  **Update the Google Sheet:**
    *   Open the master Google Sheet for Sta. Ana JARS (ID: `1DaIXfAf7JIG4KFEYqEWdu9qeEFQ6LDyHutZS5GlmaKU`).
    *   Navigate to the appropriate sheet for the research category (e.g., `school-based`, `district-based`, `division-based`, `berf-grantee`).
    *   Add a new row with the following information for the paper:
        *   **Column A (Title):** Full title of the research paper.
        *   **Column B (Author(s)):** Name(s) of the author(s).
        *   **Column C (Description/Abstract):** A brief description or the abstract of the paper.
        *   **Column D (Category):** The specific research category (e.g., "Teaching and Learning", "Child Protection"). This is used for display on the paper's page. *The sheet name itself determines the main category grouping.*
        *   **Column E (URL to Published HTML Page):** The relative URL to the HTML page that will display this research paper's details (see step 3). Example: `action-research/school-based/my-new-research.html`.
    *   **Homepage Feature (Optional):** If you want this paper to appear in the "Latest from Sta. Ana JARS" section on the homepage, you may also need to add/update it in the `index` sheet (consult its specific structure).

3.  **Create the HTML Page for the Research Paper:**
    *   Navigate to the appropriate category subfolder within `action-research/` (e.g., `action-research/school-based/`).
    *   **Duplicate an existing template:** The easiest way is to copy one of the `*-published-template.html` files (e.g., `schb-published-template.html`) and rename it to match the URL you specified in the Google Sheet (e.g., `my-new-research.html`).
    *   **Edit the new HTML file:**
        *   Update the `<title>` tag.
        *   Modify the placeholder content within the `published-section`:
            *   Research Title (within `<h2 class="published-title">`)
            *   Researcher(s) Names (within `<div class="published-meta">`)
            *   Abstract (within `<div class="published-abstract">`)
            *   Keywords (within `<div class="published-keywords-list">`)
            *   Research Category (within `<div class="published-category">`) - this should match what's in the Google Sheet.
            *   Published In details (e.g., "School-Based Action Research. Completed in MONTH of YEAR.")
            *   Published On details (e.g., "Sta. Ana JARS Journal Issue X, Month Day, Year")
            *   DOI (if available)
            *   Update the link for "View/Download PDF File":
                ```html
                <a href="YOUR_PUBLIC_PDF_LINK_HERE" class="published-btn" target="_blank">View/Download PDF File</a>
                ```
        *   Ensure all relative links for navigation, CSS (if externalized later), and images are correct based on the new file's location. For example, image paths might change from `../../images/` to `../images/` if you are one level deeper. *Currently, image paths in templates are like `../../images/StaAnaJARSLogo.png` assuming they are in `action-research/[category]/[file].html`.*

4.  **Link from Category Page:** The category pages (e.g., `action-research/school-based.html`) dynamically load their lists from the Google Sheet. Once the Google Sheet is updated (Step 2), the new paper should automatically appear in the list on the corresponding category page after a short delay (Google Sheets data propagation). No direct HTML edit is usually needed on the category page itself for the listing.

### 5.3. Adding/Updating Researcher Profiles

1.  **Prepare Profile Picture:** Ensure the researcher's profile picture is available (e.g., `.png` or `.jpg`) and place it in the `researchers/profilepictures/` directory. Use a descriptive filename (e.g., `juan-dela-cruz.png`). If no picture is available, the system can use `NoProfilePicture.png`.

2.  **Update the `researchers-profile` Google Sheet:**
    *   Open the master Google Sheet (ID: `1DaIXfAf7JIG4KFEYqEWdu9qeEFQ6LDyHutZS5GlmaKU`).
    *   Navigate to the `researchers-profile` sheet.
    *   Add or update a row for the researcher with details in the respective columns (e.g., Picture Filename (relative to site root like `researchers/profilepictures/juan-dela-cruz.png`), Name, Position, School, Address, Email, Degree, Years in Service, Published Works (comma-separated titles of their papers), Recognitions).
    *   **Important:** The `Published Works` column should contain the exact titles of their research papers as they appear in the "Title" column of the respective research category sheets. This is used to potentially link them later (though current profile page script might not auto-link these).

3.  **Update the `active-teachers` Google Sheet (for the main directory):**
    *   Navigate to the `active-teachers` sheet in the master Google Sheet.
    *   Add or update a row for the researcher. This sheet is used to populate the main `researchers-profiles.html` directory.
        *   **Column B (Author Name):** Full name of the researcher.
        *   **Column C (Description):** A short bio or description for the directory listing.
        *   **Column D (URL to Profile Page):** This is crucial. Construct the URL like this: `researchers/researcherprofile.html?row=X` where `X` is the **1-based row number** of that researcher in the `researchers-profile` sheet. For example, if the researcher is on row 5 of the `researchers-profile` sheet, the URL is `researchers/researcherprofile.html?row=5`.

4.  **Profile Page Generation:** The `researchers/researcherprofile.html` page is a template. It dynamically fetches data from the `researchers-profile` Google Sheet based on the `row` query parameter in its URL. No new HTML file needs to be created per researcher, just ensure the Google Sheets are accurate.

## 6. Deployment

The website is configured for deployment on Netlify. Any pushes to the connected Git repository's main branch will typically trigger an automatic build and deployment on Netlify.

## 7. Further Documentation

For more detailed information on specific aspects, please refer to:

*   `PRD.md`: Product Requirements Document.
*   `API_DOCUMENTATION.md`: Information on how data is fetched and potential API structures.
*   `IDE_SETUP.md`: Guide for setting up your development environment.
*   `AI_INSTRUCTIONS.md`: Guidelines for AI agents contributing to this codebase.
*   `DATABASE_MIGRATIONS.md`: Discussion on database concepts relevant to this project.
*   `CODE_QUALITY.md`: Analysis of current code and recommendations.
*   `TESTING_STRATEGY.md`: Approach to testing and validation.

---
