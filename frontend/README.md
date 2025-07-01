# Sta. Ana Journal of Action Research Studies (JARS) 🏺

A comprehensive web application for managing and publishing action research studies with a secure custom CMS for administrators.

## Features

- **Dynamic Research Pages**: Single template that displays research content based on query parameters
- **Secure Administrator Dashboard**: Complete CMS with database-driven authentication
- **MySQL Database**: Robust relational database hosted on Filess.io
- **Node.js/Express Backend**: RESTful API with JWT authentication
- **File Upload Support**: Profile picture uploads for researchers
- **Search Functionality**: Search through research and researcher data
- **Responsive Design**: Mobile-friendly interface
- **Secure Authentication**: JWT-based user management with role-based access

## Database Structure

The application uses a normalized MySQL database with 7 tables:

1. **researchers_profile** - Researcher information
2. **researches** - Research study details
3. **research_authors** - Many-to-many relationship between researchers and studies
4. **recognitions** - Awards and recognitions for researchers
5. **action_research_types** - Research type categories
6. **research_focus_categories** - Subject matter categories
7. **users** - User authentication and authorization (automatically created)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL database (hosted on Filess.io)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StaAnaJARS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `config.env` file in the root directory:
   ```env
   DB_HOST=your-filess-io-host
   DB_USER=your-database-username
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   DB_PORT=3306
   JWT_SECRET=your-super-secret-jwt-key-here
   UPLOAD_PATH=./researchers/profilepictures/
   MAX_FILE_SIZE=5242880
   ```

4. **Create upload directory**
   ```bash
   mkdir -p researchers/profilepictures
   ```

5. **Start the server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Security Implementation

### Authentication System
- **Database-driven users table**: Automatically created on first run
- **Password hashing**: Using bcryptjs with salt rounds
- **JWT tokens**: Secure session management
- **Role-based access**: Admin, editor, and viewer roles
- **Token verification**: Server-side validation on every request

### Default Admin Account
The system automatically creates a default admin account on first run:
- **Username**: `JARS_Admin`
- **Password**: `StaAnaJars2025`
- **Role**: `admin`

**Important**: Change the default password after first login!

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/register` - Register new user (admin only)

### Researchers
- `GET /api/researchers` - Get all researchers
- `GET /api/researchers/:id` - Get researcher by ID
- `POST /api/researchers` - Add new researcher
- `PUT /api/researchers/:id` - Update researcher
- `DELETE /api/researchers/:id` - Delete researcher
- `GET /api/researchers/:id/publications` - Get researcher's publications
- `GET /api/researchers/:id/recognitions` - Get researcher's recognitions

### Research Studies
- `GET /api/researches` - Get all research studies (with pagination, search, filtering)
- `GET /api/researches/:id` - Get research by ID
- `POST /api/researches` - Add new research
- `PUT /api/researches/:id` - Update research
- `DELETE /api/researches/:id` - Delete research
- `GET /api/researches/categories/types` - Get research type categories
- `GET /api/researches/categories/focus` - Get focus categories

### Admin (Authenticated)
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user status
- `DELETE /api/admin/users/:id` - Delete user

## Frontend API Usage

### Basic Data Fetching
```javascript
// Fetch all researchers
fetch('/api/researchers')
  .then(response => response.json())
  .then(data => {
    console.log('Researchers:', data);
    displayResearchers(data);
  });

// Fetch research studies with pagination
fetch('/api/researches?page=1&limit=10')
  .then(response => response.json())
  .then(data => {
    console.log('Research studies:', data.researches);
    displayResearchStudies(data.researches);
  });

// Search research studies
fetch(`/api/researches?search=${encodeURIComponent('action research')}`)
  .then(response => response.json())
  .then(data => {
    console.log('Search results:', data.researches);
    displaySearchResults(data.researches);
  });
```

### Authentication
```javascript
// Login
const loginData = {
  username: 'JARS_Admin',
  password: 'StaAnaJars2025'
};

fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  sessionStorage.setItem('adminToken', data.token);
  sessionStorage.setItem('adminUser', JSON.stringify(data.user));
});

// Authenticated request
const token = sessionStorage.getItem('adminToken');
fetch('/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(response => response.json())
.then(data => {
  console.log('Dashboard data:', data);
});
```

## File Structure

```
StaAnaJARS/
├── server.js                 # Main server file
├── package.json             # Dependencies and scripts
├── config.env              # Environment variables
├── routes/                 # API route handlers
│   ├── admin.js           # Admin-specific routes
│   ├── auth.js            # Authentication routes
│   ├── researchers.js     # Researcher management
│   └── researches.js      # Research management
├── action-research/        # Research category pages
│   └── dynamic-template.html  # Dynamic research template
├── researchers/           # Researcher-related files
│   └── profilepictures/   # Uploaded profile pictures
├── admin-*.html          # Administrator interface pages
├── api-examples.html     # API usage examples
└── *.html               # Public-facing pages
```

## Usage

### For Administrators

1. **Login**: Access admin panel through site map
2. **Manage Users**: Create, edit, and delete user accounts
3. **Add Research**: Use "Add New Research" form
4. **Add Researchers**: Use "Add New Researcher Profile" form
5. **Edit Content**: Use edit forms to modify existing data

### For Visitors

1. **Browse Research**: Navigate through different research categories
2. **View Studies**: Click on research titles to view full details
3. **Search**: Use search functionality to find specific content

## Development

### Adding New Features

1. Create new API endpoints in the appropriate route file
2. Update frontend forms and JavaScript as needed
3. Test thoroughly before deployment

### Database Changes

1. Update the database schema
2. Modify API routes to handle new fields
3. Update frontend forms to include new fields

### Security Best Practices

- All passwords are hashed using bcryptjs
- JWT tokens have expiration times
- Database credentials are never exposed to frontend
- Input validation on both frontend and backend
- File upload restrictions and validation
- SQL injection prevention through parameterized queries

## Testing the API

Visit `http://localhost:3000/api-examples.html` to test all API endpoints with interactive examples.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2025 Sta. Ana JARS. All rights reserved. Developed by Mr. Wedzmer Munjilul

## Support

For technical support or questions, please contact the development team. 