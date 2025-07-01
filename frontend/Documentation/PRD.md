# Product Requirements Document: Sta. Ana JARS (Journal of Action Research Studies)

## 1. Introduction & Purpose

Sta. Ana Journal of Action Research Studies (JARS) is a web-based platform designed to showcase action research conducted primarily by educators within the Sta. Ana District, Davao City, Philippines. Its purpose is to:

*   Provide a centralized, accessible repository for action research studies.
*   Promote a culture of research and reflective practice among educators.
*   Share findings and innovations that can improve teaching, learning, and school governance.
*   Offer a platform for educators to gain recognition for their scholarly work.

The project was initiated and developed by Mr. Wedzmer B. Munjilul of Sta. Ana Central Elementary School.

## 2. Target Audience

*   **Primary:** Educators (teachers, school heads, supervisors) within Sta. Ana District and the wider Davao City Division.
*   **Secondary:** Researchers, education policymakers, students, and anyone interested in educational action research in the Philippines.

## 3. Goals

*   To successfully publish and disseminate action research from various educational levels (school-based, district-based, division-based, BERF grantees).
*   To provide an intuitive browsing and searching experience for users to find relevant research.
*   To clearly outline the submission process for aspiring authors.
*   To recognize and feature contributing researchers.
*   To maintain a professional and credible platform for academic work.

## 4. Functional Requirements

The platform enables users to:

*   **FR1: View Homepage:**
    *   FR1.1: See a banner highlighting the journal's mission.
    *   FR1.2: Access a search bar for finding research.
    *   FR1.3: View a section showcasing the "Latest from Sta. Ana JARS" (dynamically loaded).
    *   FR1.4: View a section featuring "Featured Researchers" (dynamically loaded).
    *   FR1.5: See a summary of how to submit a study.
    *   FR1.6: Access main navigation links (Home, About, Journal Issues, Submit a Study, Editorial Board).
*   **FR2: Browse Journal Issues:**
    *   FR2.1: Navigate to a general "Journal Issues" page that lists categories of research.
    *   FR2.2: Access specific category pages (School-Based, District-Based, Division-Based, BERF Grantee).
    *   FR2.3: View a list of research papers within each category (dynamically loaded from Google Sheets, paginated).
    *   FR2.4: Click on a research paper to view its dedicated page.
*   **FR3: View Individual Research Papers:**
    *   FR3.1: Read the title, author(s), abstract, keywords, category, publication details, and DOI (if available) of a research paper.
    *   FR3.2: Access a link to download the full PDF of the research paper (external link).
*   **FR4: Search Research:**
    *   FR4.1: Use a search bar (on homepage or dedicated search page) to find research papers by keywords matching title, author, or description.
    *   FR4.2: View search results displayed in a list format, with links to individual paper pages.
*   **FR5: Learn About the Journal:**
    *   FR5.1: Access an "About" page detailing the journal's background, mission, and key personnel involved in its establishment.
*   **FR6: View Submission Guidelines:**
    *   FR6.1: Access a "Submit a Study" page outlining the manuscript preparation, submission guidelines (including similarity index, AI content limits), and review process.
    *   FR6.2: Access an external link to a Google Form for actual manuscript submission.
*   **FR7: View Editorial Board:**
    *   FR7.1: Access an "Editorial Board" page listing members, their positions, and focus areas.
*   **FR8: View Researcher Profiles:**
    *   FR8.1: Access a "Directory of Researchers" page listing recognized researchers (dynamically loaded, paginated).
    *   FR8.2: Click on a researcher to view their individual profile page (dynamically generated based on URL parameter).
    *   FR8.3: View researcher's details (name, position, school, contact, degrees, experience), profile picture, list of published research, and recognitions on their profile page.
*   **FR9: Access Utility Pages:**
    *   FR9.1: View Privacy Policy.
    *   FR9.2: View Terms of Use.
    *   FR9.3: View Site Map.
*   **FR10: Responsive Design:**
    *   FR10.1: The website should be viewable and usable across different device sizes (desktop, tablet, mobile). Navigation and layout should adapt accordingly.

## 5. Technical Stack

*   **Frontend:**
    *   HTML5
    *   CSS3 (Embedded within HTML `<style>` tags)
    *   JavaScript (Vanilla JS, embedded within HTML `<script>` tags)
*   **Data Source for Dynamic Content:**
    *   Google Sheets (accessed via public gviz URLs)
*   **Hosting:**
    *   Netlify
*   **Version Control:**
    *   Git (assumed, as it's in a repository)
*   **Potential Future Enhancements (Not Currently Implemented):**
    *   Serverless Functions (Netlify Functions - `netlify.toml` has a `functions` line, but no active functions directory is present) for backend logic if needed.

## 6. Database Schema

Currently, the primary dynamic data (latest research, featured researchers, lists of papers per category, researcher profiles) is sourced from **Google Sheets**. There is no traditional relational or NoSQL database in use.

If a traditional database were to be implemented, potential schemas might include:

*   **Papers Table:**
    *   `paper_id` (Primary Key)
    *   `title` (TEXT)
    *   `authors` (TEXT)
    *   `abstract` (TEXT)
    *   `keywords` (TEXT)
    *   `category_id` (Foreign Key to Categories Table)
    *   `pdf_url` (TEXT)
    *   `publication_date` (DATE)
    *   `doi` (TEXT, optional)
    *   `submission_date` (DATE)
*   **Researchers Table:**
    *   `researcher_id` (Primary Key)
    *   `name` (TEXT)
    *   `position` (TEXT)
    *   `school_affiliation` (TEXT)
    *   `email` (TEXT)
    *   `profile_picture_url` (TEXT)
    *   `bio` (TEXT, optional)
*   **Categories Table:**
    *   `category_id` (Primary Key)
    *   `category_name` (TEXT) (e.g., "School-Based", "BERF Grantee")
*   **Paper_Authors Junction Table (Many-to-Many for papers and researchers):**
    *   `paper_id` (Foreign Key)
    *   `researcher_id` (Foreign Key)

**Google Sheet Structure (Inferred):**

The system appears to use different sheets within a main Google Spreadsheet (ID: `1DaIXfAf7JIG4KFEYqEWdu9qeEFQ6LDyHutZS5GlmaKU`) for various data types:
*   `index` sheet: For homepage content (latest research, featured researchers).
*   `school-based`, `district-based`, `division-based`, `berf-grantee` sheets: For lists of papers in each category. Columns likely include Title, Author, Description, Category, URL to published HTML page.
*   `researchers-profile` sheet: For individual researcher details. Columns likely include Picture URL, Name, Position, School, Address, Email, Degree, Years in Service, Published Works (comma-separated titles), Recognitions.
*   `active-teachers` sheet: Used for the "Directory of Researchers" page. Columns likely include Author Name, Description (short bio/summary), URL to their profile page.

## 7. Non-Functional Requirements

*   **NFR1: Performance:** Pages should load reasonably quickly. Dynamic content from Google Sheets should not excessively delay page rendering.
*   **NFR2: Usability:** The website should be easy to navigate for non-technical users. Information should be clearly presented.
*   **NFR3: Maintainability:** Code (HTML, CSS, JS) should be understandable for future updates. (Currently, embedded styles/scripts might pose a challenge).
*   **NFR4: Scalability:** The Google Sheets approach might face limitations with very large datasets. The design should consider potential future migration to a more robust backend if usage grows significantly.
*   **NFR5: Security:** As a static site with data primarily from public Google Sheets and submissions via Google Forms, the main security considerations are related to Netlify hosting configurations (e.g., HTTPS, headers set in `headers` file) and the security of the linked Google accounts. No sensitive user data is stored directly on the platform.

## 8. Future Considerations / Potential Enhancements

*   Dedicated backend API for data management instead of direct Google Sheets linking.
*   User authentication for authors/editors.
*   More robust search functionality (e.g., full-text search within PDFs).
*   Automated DOI registration integration.
*   Separation of CSS and JavaScript into external files for better maintainability.
*   Implementation of a Content Management System (CMS) for easier content updates.
---
