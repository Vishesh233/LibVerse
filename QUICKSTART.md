# Quick Start Guide

Get the Smart Library Management System running in 10 minutes!

## Prerequisites Check

```bash
# Node.js version
node --version  # Should be v16+

# npm version
npm --version  # Should be v8+

# Python version
python --version  # Should be 3.8+

# MongoDB
# Download from: https://www.mongodb.com/try/download/community
# Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas
```

## 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# The .env file is already configured
# For cloud MongoDB, update MONGODB_URI in .env

# Start backend server
npm run dev

# Expected: Backend running on http://localhost:5001
```

## 2. Frontend Setup (3 minutes)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Expected: Frontend on http://localhost:3000
```

## 3. AI Service Setup (2 minutes)

```bash
# In another terminal, navigate to ai-service
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py

# Expected: AI Service on http://localhost:5000
```

## 4. Verify Everything is Running

Open your browser and check:
- ✅ Frontend: http://localhost:3000
- ✅ Backend: http://localhost:5001/api/health
- ✅ AI Service: http://localhost:5000/health

## 5. Login to Application

Open http://localhost:3000 and login with demo credentials:

**Student:**
- Email: student@example.com
- Password: password123

**Admin:**
- Email: admin@example.com
- Password: admin123

## Troubleshooting

### Port Already in Use

If port 3000, 5001, or 5000 are in use:

```bash
# Windows - Find process using port 5001
netstat -ano | findstr :5001

# Windows - Kill process (replace PID)
taskkill /PID <PID> /F

# macOS/Linux - Find process
lsof -i :5001

# macOS/Linux - Kill process
kill -9 <PID>
```

Or change ports in:
- Frontend: `vite.config.js` - change `port: 3000`
- Backend: `.env` - change `PORT=5001`
- AI Service: `.env` - change `PORT=5000`

### MongoDB Connection Error

```bash
# Check if MongoDB is running
# Windows: Services app → MongoDB Server
# macOS: brew services list
# Linux: sudo systemctl status mongod

# Start MongoDB
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Or use MongoDB Atlas (cloud)
# 1. Create account at mongodb.com/cloud/atlas
# 2. Get connection string
# 3. Update MONGODB_URI in backend/.env
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# For Python
pip install -r requirements.txt --force-reinstall
```

### Dependencies Missing

```bash
# Backend - reinstall exactly what the lockfile pins
cd backend && npm ci

# Python - create fresh virtual environment
python -m venv venv
# Activate as above
pip install -r requirements.txt
```

## Project Features to Try

### 1. Browse Books
- Go to `/books`
- Search by title, author, or genre
- View book details

### 2. Issue a Book (Student)
- Click "Issue Book" on any available book
- Admin must approve the request
- Book appears in "My Books" after approval

### 3. Return a Book (Student)
- Go to "My Books"
- Click "Return" button
- Fine calculated if overdue

### 4. Admin Dashboard
- View analytics (total users, books, issued books)
- See most issued books
- Manage pending requests

### 5. Approve Requests (Admin)
- Go to "Pending Requests"
- Click "Approve" to issue book to student

## Next Steps

1. ✅ Create sample data using MongoDB / APIs
2. ✅ Test all features
3. ✅ Deploy to production
4. ✅ Configure with custom domain
5. ✅ Add real payment integration

## Performance Tips

- MongoDB Indexing: Already configured
- React: Use lazy loading for large lists
- Backend: Enable response compression
- Frontend: Build for production: `npm run build`

## Development Tips

### Add New Feature

1. **Backend:**
   - Create model if needed
   - Add controller logic
   - Create/update routes
   - Test with Postman

2. **Frontend:**
   - Create component/page
   - Add API service calls
   - Update routing
   - Test in browser

3. **AI Service:**
   - Update model logic
   - Add new routes
   - Test endpoints

### Code Structure

- Keep components small and focused
- Use custom hooks for logic reuse
- Separate concerns (API, UI, Logic)
- Add comments for complex logic
- Use consistent naming conventions

### Testing

```bash
# Backend - Install testing framework
npm install --save-dev jest

# Frontend - Testing library included with Vite
npm install --save-dev vitest

# Run tests
npm test
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/smart-library
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=5001
AI_SERVICE_URL=http://localhost:5000
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001/api
```

### AI Service (.env)
```
PORT=5000
DEBUG=True
FLASK_ENV=development
```

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy 'dist' folder
```

### Backend (Heroku/Railway/Render)
```bash
# Prepare for production
npm run build  # if using TypeScript
# Deploy using platform CLI
```

### Database (MongoDB Atlas)
```bash
# Create cluster
# Get URI
# Update MONGODB_URI in backend/.env
```

## Support Resources

- React: https://react.dev
- Express: https://expressjs.com
- MongoDB: https://mongodb.com
- Flask: https://flask.palletsprojects.com
- Tailwind: https://tailwindcss.com

---

**Happy Coding!** 🚀📚

For detailed docs, see:
- [README.md](../README.md)
- [API.md](./API.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
