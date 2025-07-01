# API Documentation: Sta. Ana JARS

## 1. Current Data Fetching Mechanism

The Sta. Ana JARS website, in its current iteration, does **not** utilize a traditional backend API layer for its primary dynamic content. Instead, it directly fetches data from publicly accessible Google Sheets.

*   **Method:** Frontend JavaScript makes HTTP GET requests to specific Google Sheets URLs using the Google Visualization API (`gviz/tq`) endpoint.
*   **Data Format:** The data is returned by Google in a JSON-P like format, which is then processed by the JavaScript on the client-side to populate various sections of the website (e.g., lists of research papers, researcher profiles, homepage content).
*   **Key Google Sheet ID:** `1DaIXfAf7JIG4KFEYqEWdu9qeEFQ6LDyHutZS5GlmaKU`
*   **Examples of Data Fetched:**
    *   Latest research for the homepage (`index.html` from sheet `index`).
    *   Featured researchers for the homepage (`index.html` from sheet `index`).
    *   Lists of research papers for category pages (e.g., `action-research/school-based.html` from sheet `school-based`).
    *   Researcher directory and individual profiles (`researchers-profiles.html` and `researchers/researcherprofile.html` from sheets `active-teachers` and `researchers-profile`).
    *   Search results on `search.html` are compiled by fetching from all category sheets.

**Advantages of this approach:**
*   Simplicity for small to medium datasets.
*   Easy content updates for non-developers by editing the Google Sheet.
*   Leverages Google's infrastructure for data hosting.

**Limitations:**
*   **Scalability:** Performance may degrade with very large numbers of rows in Google Sheets.
*   **Data Integrity & Validation:** Relies on manual data entry in Google Sheets; no programmatic validation layer.
*   **Security (if data were sensitive):** While current data is public, this approach is unsuitable for sensitive data as sheet URLs could be discovered. (Not an issue here as the data is intended for public consumption).
*   **No Business Logic Layer:** All data manipulation and presentation logic resides in the frontend JavaScript.
*   **Rate Limiting:** Google Sheets API has usage limits that might be hit with very high traffic.

## 2. Importance of a Dedicated API Layer

For future growth, enhanced security (if private data were involved), improved performance, and better separation of concerns, a dedicated API layer would be beneficial. An API (Application Programming Interface) layer would act as an intermediary between the frontend (website) and the data source.

**Benefits of an API Layer:**

*   **Decoupling:** The frontend doesn't need to know the specifics of the database or data source. It just makes requests to defined API endpoints.
*   **Business Logic:** Complex data processing, validation, or aggregation can be handled in the API layer before sending data to the frontend.
*   **Security:**
    *   Database credentials and direct access to the data source are not exposed to the frontend.
    *   Authentication and authorization can be implemented to control access to data.
*   **Scalability:** The API can be scaled independently of the frontend. Different data sources can be swapped out without affecting the frontend as long as the API contract remains the same.
*   **Multiple Clients:** The same API can serve data to multiple clients (e.g., web app, mobile app).

## 3. Potential Future API Implementation with Netlify Functions

Given the site is hosted on Netlify, Netlify Functions (serverless functions) would be a natural way to introduce a simple API layer without managing a dedicated server.

The `netlify.toml` file includes `functions = "functions"`, indicating an intention or capability to use Netlify Functions. If a `functions/` directory were created at the root of the project, JavaScript or TypeScript files placed there could act as API endpoints.

**Conceptual Example: A Netlify Function to Fetch Research Papers**

Let's imagine we want an API endpoint `/api/getResearch?category=school-based`.

**File:** `functions/getResearch.js`

```javascript
// functions/getResearch.js
// Note: This is a conceptual example. Actual implementation would require
// secure access to Google Sheets (e.g., using the Google Sheets API with OAuth2)
// if the sheet were private, or continuing to use gviz for public sheets but proxied.

// For simplicity, this example still uses the public gviz endpoint,
// but a real backend function would typically interact with a database or a more robust service.

const fetch = require('node-fetch'); // Needs to be installed: npm install node-fetch

exports.handler = async function(event, context) {
  const category = event.queryStringParameters.category || 'school-based'; // Default category
  const sheetId = '1DaIXfAf7JIG4KFEYqEWdu9qeEFQ6LDyHutZS5GlmaKU';
  // Construct the Google Sheet URL (ensure proper encoding for sheet names if they have spaces/special chars)
  const sheetName = encodeURIComponent(category);
  const googleSheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=SELECT%20A,B,C,D,E`; // Assuming columns A-E are Title, Author, Desc, Category, URL

  try {
    const response = await fetch(googleSheetUrl);
    if (!response.ok) {
      return { statusCode: response.status, body: response.statusText };
    }
    const sheetDataText = await response.text();

    // The gviz API returns JSONP-like text, e.g., "google.visualization.Query.setResponse({...});"
    // We need to extract the JSON part.
    const jsonString = sheetDataText.match(/google\.visualization\.Query\.setResponse\((.*)\)/s);
    if (!jsonString || !jsonString[1]) {
      console.error('Error parsing Google Sheet response:', sheetDataText);
      return { statusCode: 500, body: "Error parsing Google Sheet data" };
    }

    const data = JSON.parse(jsonString[1]);

    // Transform data if needed (example: make it more API-friendly)
    const papers = data.table.rows.map(row => ({
      title: row.c[0]?.v,
      author: row.c[1]?.v,
      description: row.c[2]?.v,
      category: row.c[3]?.v, // This might be redundant if fetching by category
      url: row.c[4]?.v
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Adjust for production
      },
      body: JSON.stringify(papers),
    };
  } catch (error) {
    console.error('Error fetching from Google Sheet:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch research data', details: error.message }),
    };
  }
};
```

**To use this Netlify Function:**

1.  Create the `functions/` directory in the project root.
2.  Save the code above as `functions/getResearch.js`.
3.  Install `node-fetch`: `npm init -y && npm install node-fetch` (or `yarn add node-fetch`) in the project root. Ensure `package.json` and `package-lock.json` are committed.
4.  Netlify will automatically deploy this function. It would be accessible at `/.netlify/functions/getResearch?category=school-based`.
5.  The frontend JavaScript would then fetch from this endpoint instead of directly from Google Sheets:
    ```javascript
    // Frontend JS example
    fetch('/.netlify/functions/getResearch?category=school-based')
      .then(response => response.json())
      .then(data => {
        // process and display data
      })
      .catch(error => console.error('Error fetching research via API:', error));
    ```

This approach centralizes data fetching logic, allows for transformations or caching at the function level, and provides a cleaner separation from the frontend. For more sensitive data or operations, the Netlify Function could securely interact with a traditional database or other backend services.

## 4. Database Credentials

**Currently, this is not applicable.** The Google Sheet used is public, so no credentials are required for read-only access via the `gviz/tq` API.

**If a traditional database were used with a backend API (like Netlify Functions):**

*   Database credentials (username, password, host, database name) would **NEVER** be stored in frontend code.
*   They would be stored as environment variables in the Netlify build/function settings.
*   The Netlify Function code would access these credentials from `process.env.DATABASE_USER`, `process.env.DATABASE_PASSWORD`, etc.
*   This ensures that credentials are not exposed to users viewing the website's source code.

## 5. Conclusion

While the current direct Google Sheets integration is functional for Sta. Ana JARS, adopting a dedicated API layer using Netlify Functions would be a recommended evolution for scalability, maintainability, and to implement more complex features or security measures in the future.
---
