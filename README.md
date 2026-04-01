# Student Dataset Analyzer

A full-stack web application for analyzing and managing student datasets. Built with Node.js, TypeScript, Prisma, React, and Vite.

## Features

- Student data management with Prisma ORM
- RESTful API for student operations
- Modern React frontend with TypeScript
- Data visualization and analysis tools
- Responsive UI with Tailwind CSS

## Tech Stack

### Backend
- Node.js
- TypeScript
- Express.js
- Prisma ORM
- SQLite (configurable)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios for API calls

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Di-Ws/Student_Dataset_Analyzer.git
   cd student-dataset-analyzer
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Setup

### Backend Setup

1. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## API Endpoints

- `GET /api/students` - Retrieve all students
- `POST /api/students` - Create a new student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

## Usage

1. Start both backend and frontend servers as described above
2. Open your browser to `http://localhost:5173`
3. Use the interface to manage and analyze student data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.