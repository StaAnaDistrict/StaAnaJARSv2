# Testing Strategy: Sta. Ana JARS

This document outlines the testing strategy for the Sta. Ana JARS website. Given its current nature as a static HTML site with client-side JavaScript for dynamic content rendering from Google Sheets, the strategy focuses on manual testing, validation tools, and considerations for future automated testing.

## 1. Current State of Testing

*   **No Automated Tests:** The repository currently does not contain any automated unit, integration, or end-to-end (E2E) tests.
*   **Manual Testing:** It is assumed that testing is primarily done manually by loading pages in a browser and visually inspecting content and functionality.
*   **Input Validation:** Basic HTML5 form validation might be present on any forms (though the main submission is via an external Google Form). Client-side JavaScript does not appear to perform extensive custom input validation.
*   **Data Integrity:** Relies on the accuracy of data entered into the Google Sheets.

## 2. Recommended Testing Approaches for the Current Site

### 2.1. Manual Testing Checklist

A structured manual testing approach is crucial. This should cover:

*   **Content Verification:**
    *   [ ] All static text content is accurate, free of typos, and grammatically correct.
    *   [ ] All images load correctly and have appropriate `alt` text.
    *   [ ] Dynamic content loaded from Google Sheets (research titles, authors, descriptions, researcher profiles) displays correctly and matches the source sheet.
    *   [ ] Dates, names, and other specific data points are accurate.
*   **Functionality Testing:**
    *   [ ] **Navigation:**
        *   [ ] All navbar links work and navigate to the correct pages.
        *   [ ] Dropdown menus in the navbar function correctly on hover/click (desktop) and tap (mobile).
        *   [ ] Hamburger menu on mobile expands and collapses correctly, and its links are functional.
        *   [ ] Footer links (Privacy, Terms, Site Map) navigate correctly.
        *   [ ] "Read More" links on research listings navigate to the correct individual paper/template page.
        *   [ ] Links to external PDF documents for research papers open correctly.
        *   [ ] Link to the external Google Form for submissions works.
    *   [ ] **Search Functionality:**
        *   [ ] Search from homepage banner redirects to `search.html` with the query.
        *   [ ] Search on `search.html` page filters results from Google Sheets correctly (test with various keywords matching titles, authors, descriptions).
        *   [ ] "No results found" message displays appropriately.
        *   [ ] Loading indicator displays while search results are being fetched.
    *   [ ] **Dynamic Content Loading:**
        *   [ ] "Latest from Sta. Ana JARS" on homepage loads and displays correctly.
        *   [ ] "Featured Researchers" on homepage loads and displays correctly.
        *   [ ] Research listings on category pages (`action-research/*`) load and display correctly.
        *   [ ] Pagination on category pages (if implemented, e.g., on `researchers-profiles.html` and category pages) works correctly (next/prev).
        *   [ ] Researcher profiles on `researcherprofile.html` load the correct researcher's data based on the URL parameter.
    *   [ ] **Responsive Design:**
        *   [ ] Test on various screen sizes (desktop, tablet, mobile - using browser developer tools and real devices if possible).
        *   [ ] Ensure layout adjusts correctly, content is readable, and no elements overlap or break.
        *   [ ] Mobile navigation (hamburger menu) is fully functional.
        *   [ ] Mobile search input (expanding from icon) works as expected.
*   **Cross-Browser Compatibility:**
    *   [ ] Test on latest versions of major browsers (e.g., Chrome, Firefox, Safari, Edge).
*   **Accessibility (Basic Checks):**
    *   [ ] Images have `alt` text.
    *   [ ] Keyboard navigation is possible for interactive elements (links, buttons, form fields).
    *   [ ] Color contrast is sufficient for readability (can use browser developer tools or extensions to check).
    *   [ ] Semantic HTML is used appropriately.

### 2.2. Validation Tools

*   **HTML Validation:** Use the W3C HTML Validator ([https://validator.w3.org/](https://validator.w3.org/)) to check for syntax errors in HTML files.
*   **CSS Validation:** Use the W3C CSS Validator ([https://jigsaw.w3.org/css-validator/](https://jigsaw.w3.org/css-validator/)) to check for syntax errors in CSS (especially if CSS is externalized).
*   **Link Checking:** Use a tool or browser extension to check for broken links throughout the site.

### 2.3. JavaScript Console Monitoring
*   During manual testing, always keep the browser's developer console open to check for JavaScript errors or warnings.

## 3. Future Considerations for Automated Testing

If the project grows in complexity, especially if a dedicated backend or more sophisticated client-side JavaScript is introduced, automated testing will become essential.

### 3.1. Unit Tests (JavaScript)

*   **Purpose:** To test individual JavaScript functions or small modules in isolation.
*   **Scenario:** If common utility functions are extracted (e.g., for parsing data from Google Sheets, formatting dates), these could be unit tested.
*   **Tools:** Jest, Mocha, Jasmine.
*   **Conceptual Example (if `formatDate` function existed):**
    ```javascript
    // formatDate.test.js (using Jest syntax)
    const formatDate = require('./formatDate'); // Assuming formatDate.js exists

    describe('formatDate', () => {
      it('should format a valid date string', () => {
        expect(formatDate('2023-10-26')).toBe('October 26, 2023');
      });
      it('should return original string for invalid date', () => {
        expect(formatDate('invalid-date')).toBe('invalid-date');
      });
    });
    ```

### 3.2. Integration Tests

*   **Purpose:** To test the interaction between different parts of the system (e.g., frontend JavaScript making calls to a Netlify Function API).
*   **Scenario:** If Netlify Functions are implemented as an API layer, tests could be written to verify that these functions return the expected data when called.
*   **Tools:** Supertest (for testing HTTP APIs), Jest, Mocha.

### 3.3. End-to-End (E2E) Tests

*   **Purpose:** To test user flows through the application from the user's perspective, interacting with the UI in a browser.
*   **Scenario:** Testing the flow of searching for a paper, navigating to its page, and clicking the PDF download link.
*   **Tools:** Cypress, Playwright, Selenium.
*   **Benefit:** Provides the highest confidence that the application is working correctly from a user standpoint.
*   **Cost:** E2E tests are typically slower and more brittle (prone to breaking with UI changes) than unit or integration tests.

## 4. Data Validation

*   **Client-Side:** For any future forms directly handled by the site (not Google Forms), implement client-side JavaScript validation for immediate user feedback (e.g., required fields, email format). This complements browser-based HTML5 validation.
*   **Server-Side (if an API is introduced):** If an API layer is added (e.g., with Netlify Functions) that accepts data, robust server-side validation is critical to ensure data integrity before it's processed or stored.
*   **Google Sheets Data:** Periodically review the Google Sheets for consistency and accuracy, as this is the primary data source. Consider adding data validation rules within Google Sheets itself for key columns.

## 5. Conclusion

For the current Sta. Ana JARS website, a thorough manual testing checklist combined with HTML/CSS validation is the most practical approach. As the project evolves, introducing automated unit tests for any extracted JavaScript logic would be the first step towards a more robust automated testing suite. E2E tests could be considered for critical user flows if the application's complexity significantly increases.
---
