# Database Migrations Documentation: Sta. Ana JARS

## 1. Current Data Storage: Google Sheets

The Sta. Ana JARS website currently **does not use a traditional relational (SQL) or NoSQL database system** for its primary dynamic content. Instead, data such as research paper listings, author details, and homepage featured content is stored and managed in **Google Sheets**.

*   **Data Access:** The frontend JavaScript directly queries these Google Sheets using public URLs and the Google Visualization API (`gviz/tq`).
*   **Schema Management:** The "schema" (i.e., the structure of columns and data types) is managed manually within Google Sheets itself.
    *   Column names are defined in the first row of each sheet.
    *   Data types are implicit (string, number, boolean, date as interpreted by Google Sheets).
*   **Data Integrity:** Relies on careful manual data entry into the Google Sheets.

**In this context, traditional database migration systems are not applicable.** Changes to the "schema" (e.g., adding a new column, renaming a column, changing data interpretation) are done directly in the Google Sheet. The JavaScript code that consumes this data must then be updated accordingly to reflect these changes.

## 2. Importance of Database Migrations (for Traditional Databases)

If the Sta. Ana JARS project were to evolve to use a traditional database (e.g., PostgreSQL, MySQL, MongoDB), a database migration system would become crucial.

**What are Database Migrations?**

Database migrations are a way to manage and version control your database schema in a programmatic and consistent manner. Each migration typically represents a small, atomic change to the database structure (e.g., creating a table, adding a column, creating an index).

**Why are they important?**

*   **Version Control for Your Schema:** Just like you version control your application code with Git, migrations allow you to version control your database schema. You can see the history of changes, revert to previous versions, and understand how the schema evolved.
*   **Collaboration:** In a team environment, migrations ensure that all developers have a consistent database schema. When a developer pulls the latest code, they can run migrations to update their local database.
*   **Repeatable Deployments:** Migrations make deployments more reliable. When deploying a new version of the application, running migrations ensures the database schema in the production environment is updated to the required state.
*   **Automated Schema Changes:** Migrations are typically scripts that can be run automatically, reducing the risk of manual errors when updating schemas.
*   **Development to Production Parity:** Helps keep development, staging, and production database schemas in sync.
*   **Data Transformation:** Some migration tools also allow for data migrations, where existing data is transformed to fit a new schema.

## 3. Conceptual Example of a Migration (if using a SQL database)

Most backend frameworks and ORMs (Object-Relational Mappers) come with their own migration tools (e.g., Alembic for SQLAlchemy in Python, Knex.js or TypeORM migrations in Node.js, Active Record Migrations in Ruby on Rails).

Let's imagine we were using a SQL database and wanted to add an `is_featured` column to a `papers` table.

A migration tool might generate a file like `migrations/002_add_is_featured_to_papers.sql` (or a JavaScript/Python file depending on the tool).

**Example SQL Migration (Conceptual):**

```sql
-- Up Migration: Applies the change
ALTER TABLE papers
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- Down Migration: Reverts the change (optional but good practice)
-- ALTER TABLE papers
-- DROP COLUMN is_featured;
```

**Example using a Node.js migration tool like Knex.js (Conceptual):**

File: `migrations/YYYYMMDDHHMMSS_add_is_featured_to_papers.js`
```javascript
// YYYYMMDDHHMMSS_add_is_featured_to_papers.js
exports.up = function(knex) {
  return knex.schema.table('papers', function(table) {
    table.boolean('is_featured').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('papers', function(table) {
    table.dropColumn('is_featured');
  });
};
```

**Running Migrations:**
You would typically use a command-line interface provided by the migration tool to apply new migrations (e.g., `knex migrate:latest`) or roll back changes (`knex migrate:rollback`).

## 4. Schema Considerations for Sta. Ana JARS (if transitioning from Google Sheets)

If migrating from Google Sheets to a traditional database:

*   **Field Types:**
    *   `publication_date` or `completion_date` for research papers should use a `DATE` or `DATETIME` type, not just a year stored as a number or string, to allow for more precise querying and sorting.
    *   Boolean flags (e.g., `is_featured`) should use `BOOLEAN` types.
*   **Relationships:** Define clear foreign key relationships between tables (e.g., between a `papers` table and an `authors` table).
*   **Normalization:** Consider database normalization principles to reduce data redundancy and improve data integrity.

## 5. Conclusion for Current Project

For the Sta. Ana JARS project in its current state (using Google Sheets), formal database migration tools are not directly applicable. Schema changes are managed manually within Google Sheets, and corresponding JavaScript code consuming the data needs to be updated.

This document serves to explain the concept and importance of database migrations should the project evolve to incorporate a traditional backend database system.
---
