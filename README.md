# CodeCraftHub - Backend API

CodeCraftHub is a personalized learning platform backend where developers track courses and skills they want to learn. This project represents **Part 1 (Backend Only)** of the application, built using Node.js and Express with lightweight JSON file persistence.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Course Data Model](#course-data-model)
- [API Endpoints & Curl Examples](#api-endpoints--curl-examples)
  - [1. Create a Course (`POST /api/courses`)](#1-create-a-course-post-apicourses)
  - [2. List All Courses (`GET /api/courses`)](#2-list-all-courses-get-apicourses)
  - [3. Get Course Statistics (`GET /api/courses/stats`)](#3-get-course-statistics-get-apicoursesstats)
  - [4. Get Course by ID (`GET /api/courses/:id`)](#4-get-course-by-id-get-apicoursesid)
  - [5. Update a Course (`PUT /api/courses/:id`)](#5-update-a-course-put-apicoursesid)
  - [6. Delete a Course (`DELETE /api/courses/:id`)](#6-delete-a-course-delete-apicoursesid)
- [Windows Quoting & Curl Guide](#windows-quoting--curl-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

CodeCraftHub provides a clean, beginner-friendly REST API for managing developer learning goals. It does not require any database setup: all records are persisted in a local `courses.json` file that is automatically initialized on the first run.

- **Platform:** Node.js (CommonJS `require` syntax)
- **Framework:** Express 4.x
- **Storage:** Local `courses.json` flat file
- **Port:** `5000` (configurable via `process.env.PORT`)
- **Authentication:** None required (open local development API)

---

## Features

- **Full CRUD Support**: Create, read, update (including partial updates), and delete course goals.
- **Auto-Provisioned Storage**: Automatically creates `courses.json` containing `[]` if the file does not already exist.
- **Smart ID Generation**: Assigns sequential integer IDs starting from `1` (next ID = highest existing ID + 1).
- **Strict Input Validation**:
  - `name`: Required non-empty string.
  - `description`: Required non-empty string.
  - `target_date`: Required date string in `YYYY-MM-DD` format with calendar validity checks.
  - `status`: Required enum, must be exactly `"Not Started"`, `"In Progress"`, or `"Completed"`.
- **Learning Statistics**: `/api/courses/stats` endpoint returning total courses and breakdown per status.
- **Consistent Error Responses**: All errors return structured JSON objects with HTTP 400, 404, or 500 status codes.

---

## Project Structure

```text
codecrafthub/
├── index.html      # Single-file LMS dashboard (Vanilla JS & CSS)
├── app.js          # Main Express server and route handlers
├── package.json    # Project metadata, dependencies, and start script
├── README.md       # API & Dashboard documentation
├── .gitignore      # Ignores node_modules
└── courses.json    # Auto-created data storage file
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or higher; tested on v22.x)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- `curl` or PowerShell / Git Bash for testing API endpoints

---

## Installation

1. Open your terminal in the `codecrafthub` project folder:
   ```bash
   cd codecrafthub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## Running the Application

To start the server, run:

```bash
npm start
```

Upon startup, the console prints:
```text
CodeCraftHub API is starting...
Data will be stored in: <full path to courses.json>
API is available at: http://localhost:5000
```

---

## Course Data Model

Each course object contains the following fields:

| Field | Type | Description | Required |
|---|---|---|---|
| `id` | Integer | Auto-generated starting from 1 (highest ID + 1) | Auto-generated |
| `name` | String | Title of the course | Yes |
| `description` | String | Summary of the course objectives | Yes |
| `target_date` | String | Target completion date in `YYYY-MM-DD` format | Yes |
| `status` | String | One of `"Not Started"`, `"In Progress"`, `"Completed"` | Yes |
| `created_at` | String | ISO 8601 timestamp (`new Date().toISOString()`) | Auto-generated |

---

## API Endpoints & Curl Examples

### Summary Table

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| `POST` | `/api/courses` | Create a new course | `201 Created` |
| `GET` | `/api/courses` | Retrieve all courses | `200 OK` |
| `GET` | `/api/courses/stats` | Retrieve total course count and status counts | `200 OK` |
| `GET` | `/api/courses/:id` | Retrieve a single course by ID | `200 OK` |
| `PUT` | `/api/courses/:id` | Update fields of an existing course | `200 OK` |
| `DELETE`| `/api/courses/:id` | Delete a course by ID | `200 OK` |

---

### 1. Create a Course (`POST /api/courses`)

#### Git Bash / Linux / macOS
```bash
curl -i -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Python Basics","description":"Learn Python fundamentals","target_date":"2025-12-31","status":"Not Started"}'
```

#### Windows PowerShell
```powershell
$body = '{"name":"Python Basics","description":"Learn Python fundamentals","target_date":"2025-12-31","status":"Not Started"}'
curl.exe -i -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d $body
```

#### Windows Command Prompt (cmd.exe)
```cmd
curl -i -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d "{\"name\":\"Python Basics\",\"description\":\"Learn Python fundamentals\",\"target_date\":\"2025-12-31\",\"status\":\"Not Started\"}"
```

#### Sample Response (`201 Created`)
```json
{
  "id": 1,
  "name": "Python Basics",
  "description": "Learn Python fundamentals",
  "target_date": "2025-12-31",
  "status": "Not Started",
  "created_at": "2026-10-25T15:42:06.458Z"
}
```

---

### 2. List All Courses (`GET /api/courses`)

#### All Terminals
```bash
curl -i http://localhost:5000/api/courses
```

#### Sample Response (`200 OK`)
```json
[
  {
    "id": 1,
    "name": "Python Basics",
    "description": "Learn Python fundamentals",
    "target_date": "2025-12-31",
    "status": "Not Started",
    "created_at": "2026-10-25T15:42:06.458Z"
  },
  {
    "id": 2,
    "name": "Node.js Masterclass",
    "description": "Build scalable backend APIs",
    "target_date": "2026-06-30",
    "status": "In Progress",
    "created_at": "2026-10-25T15:42:28.214Z"
  }
]
```

---

### 3. Get Course Statistics (`GET /api/courses/stats`)

*Note: Defined before `/api/courses/:id` so Express does not confuse `"stats"` with a numeric ID parameter.*

#### All Terminals
```bash
curl -i http://localhost:5000/api/courses/stats
```

#### Sample Response (`200 OK`)
```json
{
  "total": 2,
  "by_status": {
    "Not Started": 1,
    "In Progress": 1,
    "Completed": 0
  }
}
```

---

### 4. Get Course by ID (`GET /api/courses/:id`)

#### All Terminals
```bash
curl -i http://localhost:5000/api/courses/1
```

#### Sample Response (`200 OK`)
```json
{
  "id": 1,
  "name": "Python Basics",
  "description": "Learn Python fundamentals",
  "target_date": "2025-12-31",
  "status": "Not Started",
  "created_at": "2026-10-25T15:42:06.458Z"
}
```

#### When Not Found (`404 Not Found`)
```bash
curl -i http://localhost:5000/api/courses/999
```
Response:
```json
{
  "error": "Course not found"
}
```

---

### 5. Update a Course (`PUT /api/courses/:id`)

Partial updates are supported. You can pass any combination of `name`, `description`, `target_date`, or `status`.

#### Git Bash / Linux / macOS
```bash
curl -i -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

#### Windows PowerShell
```powershell
$update = '{"status":"In Progress"}'
curl.exe -i -X PUT http://localhost:5000/api/courses/1 -H "Content-Type: application/json" -d $update
```

#### Windows Command Prompt (cmd.exe)
```cmd
curl -i -X PUT http://localhost:5000/api/courses/1 -H "Content-Type: application/json" -d "{\"status\":\"In Progress\"}"
```

#### Sample Response (`200 OK`)
```json
{
  "id": 1,
  "name": "Python Basics",
  "description": "Learn Python fundamentals",
  "target_date": "2025-12-31",
  "status": "In Progress",
  "created_at": "2026-10-25T15:42:06.458Z"
}
```

---

### 6. Delete a Course (`DELETE /api/courses/:id`)

#### All Terminals
```bash
curl -i -X DELETE http://localhost:5000/api/courses/1
```

#### Sample Response (`200 OK`)
```json
{
  "message": "Course deleted successfully",
  "deleted": {
    "id": 1,
    "name": "Python Basics",
    "description": "Learn Python fundamentals",
    "target_date": "2025-12-31",
    "status": "In Progress",
    "created_at": "2026-10-25T15:42:06.458Z"
  }
}
```

#### When Not Found (`404 Not Found`)
```bash
curl -i -X DELETE http://localhost:5000/api/courses/999
```
Response:
```json
{
  "error": "Course not found"
}
```

---

## Windows Quoting & Curl Guide

Windows command shells handle quotation marks and command arguments differently from POSIX shells (Linux/macOS):

### 1. In Git Bash
Git Bash conforms to standard POSIX conventions. Enclose the JSON payload in single quotes `'...'` and use normal double quotes for JSON keys:
```bash
curl -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d '{"name":"Go","description":"Learn Go","target_date":"2026-05-01","status":"Not Started"}'
```

### 2. In Windows PowerShell
PowerShell inspects double quotes before sending arguments to external native tools like `curl.exe`. To avoid quote stripping, store the JSON string in a PowerShell variable with single quotes:
```powershell
$course = '{"name":"Go","description":"Learn Go","target_date":"2026-05-01","status":"Not Started"}'
curl.exe -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d $course
```

Alternatively, you can use PowerShell's built-in `Invoke-RestMethod`:
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/courses -ContentType "application/json" -Body '{"name":"Go","description":"Learn Go","target_date":"2026-05-01","status":"Not Started"}'
```

### 3. In Windows Command Prompt (`cmd.exe`)
Command Prompt does not recognize single quotes as string delimiters. Wrap the entire payload in outer double quotes and escape all inner double quotes with backslashes `\"`:
```cmd
curl -X POST http://localhost:5000/api/courses -H "Content-Type: application/json" -d "{\"name\":\"Go\",\"description\":\"Learn Go\",\"target_date\":\"2026-05-01\",\"status\":\"Not Started\"}"
```

---

## Troubleshooting

### 1. Port 5000 already in use (`EADDRINUSE`)
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::5000`
- **Cause**: Another process or background instance of the server is already listening on port 5000.
- **Solution (Windows PowerShell)**:
  1. Identify the process ID (PID) holding port 5000:
     ```powershell
     Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
     ```
  2. Terminate the process (replace `<PID>` with the actual process number):
     ```powershell
     Stop-Process -Id <PID> -Force
     ```
  3. Alternatively, specify a different port when launching the server:
     ```powershell
     $env:PORT=5001; npm start
     ```

### 2. Dependencies not installed (`Cannot find module 'express'`)
- **Symptom**: `Error: Cannot find module 'express'`
- **Cause**: `npm install` has not been run yet in the project folder.
- **Solution**:
  Run `npm install` inside the project root before starting the server:
  ```bash
  npm install
  ```

### 3. Invalid or Corrupted JSON in `courses.json`
- **Symptom**: The API returns HTTP 500 with `{ "error": "Failed to read data from courses.json" }`.
- **Cause**: Manual edits to `courses.json` introduced invalid syntax (such as trailing commas or missing brackets).
- **Solution**:
  1. Open `courses.json` in your editor and ensure it contains valid JSON.
  2. To completely reset the data store, replace the file contents with an empty JSON array:
     ```json
     []
     ```

### 4. curl Quoting Issues on Windows (`Malformed JSON payload`)
- **Symptom**: The API returns HTTP 400 with `{ "error": "Malformed JSON payload. Please verify request body syntax." }`.
- **Cause**: PowerShell or Command Prompt stripped or misparsed double quotes in the `-d` payload.
- **Solution**: Follow the instructions in the [Windows Quoting & Curl Guide](#windows-quoting--curl-guide) section above by using a PowerShell `$body` variable or escaped quotes `\"` in `cmd.exe`.
