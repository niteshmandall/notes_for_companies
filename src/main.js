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
  },

  async deleteTab(id) {
    const response = await fetch(`http://localhost:3000/api/tabs/${id}`, {
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
      <span class="delete-tab-icon" data-tab-id="${tab.id}">🗑️</span>
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

  // Add click listeners for delete icons
  document.querySelectorAll('.delete-tab-icon').forEach(icon => {
    icon.addEventListener('click', async () => {
      const tabId = icon.getAttribute('data-tab-id');
      if (confirm('Are you sure you want to delete this tab?')) {
        await API.deleteTab(tabId); // Call the delete API
        const tabs = await API.getTabs(); // Refresh the tabs
        renderTabs(tabs); // Re-render tabs
      }
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
              <div class="images-container">
                ${renderImages(note.images)}
              </div>
              <textarea class="note-area" placeholder="Write your note here... You can also paste images!">${note.content || ''}</textarea>
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
    if (!images) return '';
    const imageArray = typeof images === 'string' ? JSON.parse(images) : images;
    if (!Array.isArray(imageArray)) return '';
    
    return imageArray.map(image => `
      <div class="image-container">
        <img src="${image}" class="pasted-image" />
        <div class="resize-handle"></div>
        <button class="delete-image-btn">×</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error parsing images:', error);
    return '';
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

    // Handle paste event for images
    contentArea.addEventListener('paste', async (event) => {
      const items = event.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = async (e) => {
            const imgSrc = e.target.result;
            const images = Array.from(noteElement.querySelectorAll('.pasted-image'))
              .map(img => img.src);
            images.push(imgSrc);
            await API.updateNote(noteId, titleInput.value, contentArea.value, images);
            renderNotes(tabId, await API.getNotes(tabId)); // Re-render notes to show the new image
          };
          reader.readAsDataURL(file);
        }
      }
    });
  });

  // Add delete image functionality
  document.querySelectorAll('.delete-image-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to delete this image?')) {
        const noteElement = button.closest('.note');
        const noteId = noteElement.dataset.noteId;
        const titleInput = noteElement.querySelector('.note-title');
        const contentArea = noteElement.querySelector('.note-area');
        
        // Remove the image container
        const imageContainer = button.closest('.image-container');
        imageContainer.remove();
        
        // Get remaining images
        const remainingImages = Array.from(noteElement.querySelectorAll('.pasted-image'))
          .map(img => img.src);
        
        // Update note with remaining images
        await API.updateNote(noteId, titleInput.value, contentArea.value, remainingImages);
      }
    });
  });

  // Add image resize functionality
  document.querySelectorAll('.image-container').forEach(container => {
    const img = container.querySelector('.pasted-image');
    const handle = container.querySelector('.resize-handle');
    let isResizing = false;
    let startWidth;
    let startX;

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startWidth = img.offsetWidth;
      startX = e.clientX;
      
      // Add temporary event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Prevent text selection while resizing
      e.preventDefault();
    });

    function handleMouseMove(e) {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + deltaX); // Minimum width of 50px
      img.style.width = `${newWidth}px`;
    }

    function handleMouseUp() {
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
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
