# Notes Application

A simple notes application built with Express.js for the backend and vanilla JavaScript for the frontend. This application allows users to create, read, update, and delete notes organized into tabs. It also supports image pasting and resizing.

## Features

- Create, read, update, and delete tabs.
- Create, read, update, and delete notes within each tab.
- Support for pasting images into notes.
- Responsive design with a user-friendly interface.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Styling**: Custom CSS

## Installation

### Prerequisites

- Node.js (v12 or higher)
- MySQL

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/niteshmandall/notes-app.git
   cd notes-app
   ```

2. **Install dependencies**:
   Navigate to the `server` directory and install the backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. **Set up the database**:
   - Create a MySQL database named `notes_app`.
   - Update the database connection details in `server/index.js` if necessary.

4. **Run the server**:
   ```bash
   node index.js
   ```
   The server will run on `http://localhost:3000`.

5. **Set up the frontend**:
   Navigate to the `src` directory and open `index.html` in your browser.

## Usage

- **Creating Tabs**: Click on the "+ New Tab" button to create a new tab.
- **Adding Notes**: Select a tab and click on the "+ Add Note" button to create a new note.
- **Editing Notes**: Click on the note title or content area to edit.
- **Deleting Notes**: Click the "Delete" button on a note to remove it.
- **Pasting Images**: You can paste images directly into the note content area.

## API Endpoints

### Tabs

- **GET /api/tabs**: Retrieve all tabs.
- **POST /api/tabs**: Create a new tab.
- **PUT /api/tabs/:id**: Update a tab's name.
- **DELETE /api/tabs/:id**: Delete a tab.

### Notes

- **GET /api/tabs/:tabId/notes**: Retrieve all notes for a specific tab.
- **POST /api/notes**: Create a new note.
- **PUT /api/notes/:id**: Update a note.
- **DELETE /api/notes/:id**: Delete a note.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## Acknowledgments

- Thanks to the contributors and the open-source community for their support.
