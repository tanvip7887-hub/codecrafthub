// =============================================================================
// CodeCraftHub - Backend REST API
// Part 1: Course Learning Tracker API
// =============================================================================

const express = require('express');
const fs = require('fs');
const path = require('path');

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Path to the JSON data file where course records are stored
const DATA_FILE = path.join(__dirname, 'courses.json');

// Allowed status values for any course
const ALLOWED_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Middleware to automatically parse incoming JSON request bodies
app.use(express.json());

// Enable CORS for frontend clients (e.g. file:// or different local origins)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static frontend files (e.g. index.html) from project root
app.use(express.static(path.join(__dirname)));

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Ensures that the courses.json file exists on disk.
 * If it doesn't exist, an empty JSON array [] is written.
 */
function initDataFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing data file:', err.message);
  }
}

/**
 * Reads all courses from the JSON data file.
 * Returns an array of course objects.
 * Throws an error if reading or parsing fails (caught by route handlers for 500 responses).
 */
function readCourses() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('File Read Error:', err.message);
    throw new Error('Failed to read data from courses.json');
  }
}

/**
 * Writes the given array of courses to the JSON data file with pretty indentation.
 * Throws an error if writing fails (caught by route handlers for 500 responses).
 */
function writeCourses(courses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(courses, null, 2), 'utf-8');
  } catch (err) {
    console.error('File Write Error:', err.message);
    throw new Error('Failed to save data to courses.json');
  }
}

/**
 * Validates date string format (YYYY-MM-DD) and ensures it is a real calendar date.
 */
function isValidDate(dateString) {
  if (typeof dateString !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return (
    dateObj.getUTCFullYear() === year &&
    dateObj.getUTCMonth() === month - 1 &&
    dateObj.getUTCDate() === day
  );
}

/**
 * Validates course input data for creation or updates.
 * Returns an error message string if validation fails, or null if validation passes.
 */
function validateCourse(data, isUpdate = false) {
  if (!data || typeof data !== 'object') {
    return 'Request body must be a valid JSON object.';
  }

  const { name, description, target_date, status } = data;

  if (!isUpdate) {
    // Creation requires all fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return 'Field "name" is required and must be a non-empty string.';
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return 'Field "description" is required and must be a non-empty string.';
    }
    if (!target_date || !isValidDate(target_date)) {
      return 'Field "target_date" is required and must be a valid date in YYYY-MM-DD format.';
    }
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return `Field "status" is required and must be one of: ${ALLOWED_STATUSES.map(s => `"${s}"`).join(', ')}.`;
    }
  } else {
    // Updates allow partial modifications, but at least one known field must be provided
    const hasAnyField =
      name !== undefined ||
      description !== undefined ||
      target_date !== undefined ||
      status !== undefined;

    if (!hasAnyField) {
      return 'At least one field ("name", "description", "target_date", or "status") must be provided for update.';
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return 'Field "name" must be a non-empty string.';
    }
    if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
      return 'Field "description" must be a non-empty string.';
    }
    if (target_date !== undefined && !isValidDate(target_date)) {
      return 'Field "target_date" must be a valid date in YYYY-MM-DD format.';
    }
    if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
      return `Field "status" must be one of: ${ALLOWED_STATUSES.map(s => `"${s}"`).join(', ')}.`;
    }
  }

  return null;
}

/**
 * Calculates the next ID: highest existing ID + 1, or 1 if the list is empty.
 */
function getNextId(courses) {
  if (!courses || courses.length === 0) {
    return 1;
  }
  const maxId = courses.reduce((max, course) => (course.id > max ? course.id : max), 0);
  return maxId + 1;
}

// Initialize data file on startup
initDataFile();

// =============================================================================
// API ROUTES
// =============================================================================

/**
 * POST /api/courses
 * Create a new course record.
 * Returns 201 with the created course object.
 */
app.post('/api/courses', (req, res) => {
  try {
    const validationError = validateCourse(req.body, false);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const courses = readCourses();
    const newCourse = {
      id: getNextId(courses),
      name: req.body.name.trim(),
      description: req.body.description.trim(),
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);
    writeCourses(courses);

    return res.status(201).json(newCourse);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/courses
 * Retrieve all courses.
 * Returns 200 with an array of course objects.
 */
app.get('/api/courses', (req, res) => {
  try {
    const courses = readCourses();
    return res.status(200).json(courses);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/courses/stats
 * BONUS: Return the total number of courses and the count per status.
 * NOTE: Defined BEFORE /api/courses/:id so Express does not match "stats" as an ID parameter.
 */
app.get('/api/courses/stats', (req, res) => {
  try {
    const courses = readCourses();
    const stats = {
      total: courses.length,
      by_status: {
        'Not Started': courses.filter(c => c.status === 'Not Started').length,
        'In Progress': courses.filter(c => c.status === 'In Progress').length,
        'Completed': courses.filter(c => c.status === 'Completed').length
      }
    };
    return res.status(200).json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/courses/:id
 * Retrieve a single course by its ID.
 * Returns 200 with the course object, or 404 if not found.
 */
app.get('/api/courses/:id', (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Course ID must be a valid integer.' });
    }

    const courses = readCourses();
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.status(200).json(course);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * PUT /api/courses/:id
 * Update an existing course (allows partial updates).
 * Returns 200 with the updated course object, or 404 if not found.
 */
app.put('/api/courses/:id', (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Course ID must be a valid integer.' });
    }

    const validationError = validateCourse(req.body, true);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const courses = readCourses();
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Apply partial updates while preserving immutable fields (id, created_at)
    const existing = courses[courseIndex];
    if (req.body.name !== undefined) {
      existing.name = req.body.name.trim();
    }
    if (req.body.description !== undefined) {
      existing.description = req.body.description.trim();
    }
    if (req.body.target_date !== undefined) {
      existing.target_date = req.body.target_date;
    }
    if (req.body.status !== undefined) {
      existing.status = req.body.status;
    }

    writeCourses(courses);

    return res.status(200).json(existing);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * DELETE /api/courses/:id
 * Delete a course by its ID.
 * Returns 200 with a success message and deleted course details, or 404 if not found.
 */
app.delete('/api/courses/:id', (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Course ID must be a valid integer.' });
    }

    const courses = readCourses();
    const courseIndex = courses.findIndex(c => c.id === courseId);

    if (courseIndex === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const [deletedCourse] = courses.splice(courseIndex, 1);
    writeCourses(courses);

    return res.status(200).json({
      message: 'Course deleted successfully',
      deleted: deletedCourse
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Catch-all 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler (handles malformed JSON body errors and other unhandled exceptions)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload. Please verify request body syntax.' });
  }
  return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================
app.listen(PORT, () => {
  console.log('CodeCraftHub API is starting...');
  console.log(`Data will be stored in: ${DATA_FILE}`);
  console.log(`API is available at: http://localhost:${PORT}`);
});
