# Sta. Ana JARS Setup Guide

## Database Configuration

To connect to your Filess.io MySQL database, you need to update the `config.env` file with your actual database credentials.

### Step 1: Get Your Filess.io Database Credentials

1. Log into your Filess.io account
2. Navigate to your MySQL database
3. Find the connection details which should include:
   - **Host/Server**: Your database host URL
   - **Username**: Your database username
   - **Password**: Your database password
   - **Database Name**: Your database name
   - **Port**: Usually 3306 for MySQL

### Step 2: Update config.env

Edit the `config.env` file and replace the placeholder values:

```env
# Database Configuration
DB_HOST=your-actual-filess-io-host.com
DB_USER=your-actual-username
DB_PASSWORD=your-actual-password
DB_NAME=your-actual-database-name
DB_PORT=3306
```

### Step 3: Install Dependencies

Run this command in your terminal:

```bash
npm install
```

### Step 4: Start the Server

Run this command to start the Node.js server:

```bash
npm start
```

The server will start on `http://localhost:3000`

## Testing the System

1. **Test the Admin Login**: 
   - Go to `http://localhost:3000/admin-login.html`
   - Use credentials: Username: `JARS_Admin`, Password: `StaAnaJars2025`

2. **Test the API Endpoints**:
   - View API examples at `http://localhost:3000/api-examples.html`

## Troubleshooting

### "Failed to fetch" Error
This means the Node.js server is not running. Make sure to:
1. Install dependencies with `npm install`
2. Start the server with `npm start`
3. Check that the server is running on port 3000

### Database Connection Error
If you get database connection errors:
1. Verify your Filess.io credentials are correct
2. Check that your database is accessible from your current IP
3. Ensure the database name exists and has the correct tables

### Missing CSS Styles
The admin pages now include all the responsive CSS styles from your original templates, including:
- Hamburger menu for mobile
- Dropdown navigation for Journal Issues
- Responsive design for all screen sizes

## File Structure

```
StaAnaJARS/
├── server.js              # Main Node.js server
├── config.env             # Database configuration
├── package.json           # Dependencies
├── routes/                # API routes
│   ├── auth.js           # Authentication routes
│   ├── admin.js          # Admin routes
│   ├── researchers.js    # Researcher CRUD
│   └── researches.js     # Research CRUD
├── admin-login.html      # Admin login page
├── admin-dashboard.html  # Admin dashboard
├── admin-add-research.html # Add research form
└── admin-add-researcher.html # Add researcher form
```

## Next Steps

Once the server is running and connected to your database:
1. Test the admin login functionality
2. Try adding new research studies
3. Try adding new researcher profiles
4. Test the dynamic research template pages 