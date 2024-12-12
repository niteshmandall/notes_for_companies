import './style.css'

// API functions
const API = {
  async getTabs() {
    const response = await fetch('http://localhost:3000/api/tabs');
    return response.json();
  },

  async createTab(name) {
    const response = await fetch('http://localhost:3000/api/tabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return response.json();
  },

  async updateTab(id, name) {
    const response = await fetch(`http://localhost:3000/api/tabs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return response.json();
  },

  async getNotes(tabId) {
    const response = await fetch(`http://localhost:3000/api/tabs/${tabId}/notes`);
    return response.json();
  },

  async createNote(tabId, title, content, images) {
    const response = await fetch('http://localhost:3000/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabId, title, content, images })
    });
    return response.json();
  },

  async updateNote(id, title, content, images) {
    const response = await fetch(`http://localhost:3000/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, images })
    });
    return response.json();
  },

  async deleteNote(id) {
    const response = await fetch(`http://localhost:3000/api/notes/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Load initial data
async function initializeApp() {
  try {
    const tabs = await API.getTabs();
    if (tabs.length === 0) {
      // Create default tabs if none exist
      await Promise.all([
        API.createTab('Tab 1'),
        API.createTab('Tab 2'),
        API.createTab('Tab 3')
      ]);
    }
    
    // Reload tabs after ensuring they exist
    const finalTabs = await API.getTabs();
    renderTabs(finalTabs);
    
    // Load notes for first tab
    if (finalTabs.length > 0) {
      const notes = await API.getNotes(finalTabs[0].id);
      renderNotes(finalTabs[0].id, notes);
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Render functions
function renderTabs(tabs) {
  const tabList = document.querySelector('.tab-list');
  tabList.innerHTML = ''; // Clear existing tabs
  
  tabs.forEach((tab, index) => {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.innerHTML = `
      <button class="tab-button ${index === 0 ? 'active' : ''}" data-tab-id="${tab.id}">
        ${tab.name}
      </button>
    `;
    tabList.appendChild(tabItem);
  });

  // Add click listeners to new tabs
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', async () => {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const tabId = button.getAttribute('data-tab-id');
      const notes = await API.getNotes(tabId);
      renderNotes(tabId, notes);
    });
  });
}

function renderNotes(tabId, notes) {
  const mainContent = document.querySelector('.main-content');
  mainContent.innerHTML = `
    <div class="note-container active">
      <div class="note-header">
        <div class="header-title">
          <h2>Notes</h2>
          <button class="edit-tab-btn">✎</button>
        </div>
        <button class="add-note-btn" data-tab-id="${tabId}">+ Add Note</button>
      </div>
      <div class="notes-list">
        ${notes.map(note => `
          <div class="note" data-note-id="${note.id}">
            <input type="text" class="note-title" value="${note.title || ''}" placeholder="Note title...">
            <div class="note-content">
              <textarea class="note-area" placeholder="Write your note here... You can also paste images!">${note.content || ''}</textarea>
              ${renderImages(note.images)}
            </div>
            <button class="delete-note-btn">Delete</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Add event listeners for note actions
  setupNoteEventListeners(tabId);
}

function renderImages(images) {
  try {
    // Handle cases where images is null, undefined, or empty string
    if (!images) return '';
    
    // If images is already an array, use it directly
    const imageArray = typeof images === 'string' ? JSON.parse(images) : images;
    
    // Ensure imageArray is actually an array
    if (!Array.isArray(imageArray)) return '';
    
    return imageArray.map(image => `
      <div class="image-container">
        <img src="${image}" class="pasted-image" />
        <button class="delete-image-btn">×</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error parsing images:', error);
    return ''; // Return empty string if there's an error
  }
}

function setupNoteEventListeners(tabId) {
  // Add note button
  document.querySelector('.add-note-btn').addEventListener('click', async () => {
    const newNote = await API.createNote(tabId, '', '', []);
    const notes = await API.getNotes(tabId);
    renderNotes(tabId, notes);
  });

  // Delete note buttons
  document.querySelectorAll('.delete-note-btn').forEach(button => {
    button.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this note?')) {
        const noteId = button.closest('.note').dataset.noteId;
        await API.deleteNote(noteId);
        const notes = await API.getNotes(tabId);
        renderNotes(tabId, notes);
      }
    });
  });

  // Auto-save on note changes
  document.querySelectorAll('.note').forEach(noteElement => {
    const noteId = noteElement.dataset.noteId;
    const titleInput = noteElement.querySelector('.note-title');
    const contentArea = noteElement.querySelector('.note-area');

    let saveTimeout;
    const saveNote = async () => {
      const images = Array.from(noteElement.querySelectorAll('.pasted-image'))
        .map(img => img.src);
      await API.updateNote(noteId, titleInput.value, contentArea.value, images);
    };

    const debouncedSave = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(saveNote, 1000); // Save after 1 second of no typing
    };

    titleInput.addEventListener('input', debouncedSave);
    contentArea.addEventListener('input', debouncedSave);
  });
}

// Initialize the app
document.querySelector('#app').innerHTML = `
  <div class="container">
    <div class="sidebar">
      <div class="tabs">
        <div class="tab-header">
          <h3>Tabs</h3>
          <button class="add-tab-btn">+ New Tab</button>
        </div>
        <div class="tab-list">
          <!-- Tabs will be rendered here -->
        </div>
      </div>
    </div>
    <div class="main-content">
      <!-- Notes will be rendered here -->
    </div>
  </div>
`;

// Add new tab button functionality
document.querySelector('.add-tab-btn').addEventListener('click', async () => {
  const newTabName = prompt('Enter tab name:');
  if (newTabName && newTabName.trim()) {
    await API.createTab(newTabName.trim());
    const tabs = await API.getTabs();
    renderTabs(tabs);
  }
});

// Initialize the app
initializeApp();
