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
  // ... implement tab rendering ...
}

function renderNotes(tabId, notes) {
  // ... implement notes rendering ...
}

// Initialize the app
initializeApp();

document.querySelector('#app').innerHTML = `
  <div class="container">
    <div class="sidebar">
      <div class="tabs">
        <div class="tab-header">
          <h3>Tabs</h3>
          <button class="add-tab-btn">+ New Tab</button>
        </div>
        <div class="tab-list">
          <div class="tab-item">
            <button class="tab-button active" data-tab="tab1">Tab 1</button>
          </div>
          <div class="tab-item">
            <button class="tab-button" data-tab="tab2">Tab 2</button>
          </div>
          <div class="tab-item">
            <button class="tab-button" data-tab="tab3">Tab 3</button>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="note-container active" id="tab1">
        <div class="note-header">
          <div class="header-title">
            <h2>Tab 1 Notes</h2>
            <button class="edit-tab-btn">✎</button>
          </div>
          <button class="add-note-btn">+ Add Note</button>
        </div>
        <div class="notes-list">
          <div class="note">
            <input type="text" class="note-title" placeholder="Note title...">
            <div class="note-content">
              <textarea class="note-area" placeholder="Write your note here... You can also paste images!"></textarea>
            </div>
            <button class="delete-note-btn">Delete</button>
          </div>
        </div>
      </div>
      <div class="note-container" id="tab2">
        <div class="note-header">
          <div class="header-title">
            <h2>Tab 2 Notes</h2>
            <button class="edit-tab-btn">✎</button>
          </div>
          <button class="add-note-btn">+ Add Note</button>
        </div>
        <div class="notes-list">
          <div class="note">
            <input type="text" class="note-title" placeholder="Note title...">
            <div class="note-content">
              <textarea class="note-area" placeholder="Write your note here... You can also paste images!"></textarea>
            </div>
            <button class="delete-note-btn">Delete</button>
          </div>
        </div>
      </div>
      <div class="note-container" id="tab3">
        <div class="note-header">
          <div class="header-title">
            <h2>Tab 3 Notes</h2>
            <button class="edit-tab-btn">✎</button>
          </div>
          <button class="add-note-btn">+ Add Note</button>
        </div>
        <div class="notes-list">
          <div class="note">
            <input type="text" class="note-title" placeholder="Note title...">
            <div class="note-content">
              <textarea class="note-area" placeholder="Write your note here... You can also paste images!"></textarea>
            </div>
            <button class="delete-note-btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
`

// Tab switching functionality
const tabButtons = document.querySelectorAll('.tab-button');
const noteContainers = document.querySelectorAll('.note-container');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    noteContainers.forEach(container => container.classList.remove('active'));
    
    button.classList.add('active');
    const tabId = button.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Edit tab name functionality
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-tab-btn')) {
    const noteContainer = e.target.closest('.note-container');
    const header = noteContainer.querySelector('h2');
    const tabId = noteContainer.id;
    const currentName = header.textContent.replace(' Notes', '');
    const newName = prompt('Enter new tab name:', currentName);
    
    if (newName && newName.trim() !== '') {
      header.textContent = `${newName} Notes`;
      // Update corresponding tab in sidebar
      const sidebarTab = document.querySelector(`[data-tab="${tabId}"]`);
      sidebarTab.textContent = newName;
    }
  }
});

// Add new tab functionality
let tabCounter = 4;
document.querySelector('.add-tab-btn').addEventListener('click', () => {
  const tabList = document.querySelector('.tab-list');
  const mainContent = document.querySelector('.main-content');
  const newTabId = `tab${tabCounter}`;
  
  // Create new tab button
  const tabItem = document.createElement('div');
  tabItem.className = 'tab-item';
  tabItem.innerHTML = `
    <button class="tab-button" data-tab="${newTabId}">Tab ${tabCounter}</button>
  `;
  
  // Create new note container
  const noteContainer = document.createElement('div');
  noteContainer.className = 'note-container';
  noteContainer.id = newTabId;
  noteContainer.innerHTML = `
    <div class="note-header">
      <div class="header-title">
        <h2>Tab ${tabCounter} Notes</h2>
        <button class="edit-tab-btn">✎</button>
      </div>
      <button class="add-note-btn">+ Add Note</button>
    </div>
    <div class="notes-list">
      <div class="note">
        <input type="text" class="note-title" placeholder="Note title...">
        <div class="note-content">
          <textarea class="note-area" placeholder="Write your note here... You can also paste images!"></textarea>
        </div>
        <button class="delete-note-btn">Delete</button>
      </div>
    </div>
  `;
  
  tabList.appendChild(tabItem);
  mainContent.appendChild(noteContainer);
  
  // Update tab switching functionality for new tab
  const newTabButton = tabItem.querySelector('.tab-button');
  newTabButton.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.note-container').forEach(container => container.classList.remove('active'));
    
    newTabButton.classList.add('active');
    noteContainer.classList.add('active');
  });
  
  tabCounter++;
});

// Add note functionality
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-note-btn')) {
    const notesList = e.target.closest('.note-container').querySelector('.notes-list');
    const newNote = document.createElement('div');
    newNote.className = 'note';
    newNote.innerHTML = `
      <input type="text" class="note-title" placeholder="Note title...">
      <div class="note-content">
        <textarea class="note-area" placeholder="Write your note here... You can also paste images!"></textarea>
      </div>
      <button class="delete-note-btn">Delete</button>
    `;
    notesList.appendChild(newNote);
  }
});

// Delete note functionality with confirmation
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-note-btn')) {
    const confirmDelete = confirm('Are you sure you want to delete this note?');
    if (confirmDelete) {
      e.target.closest('.note').remove();
    }
  }
});

// Add modal HTML to the document
document.body.insertAdjacentHTML('beforeend', `
  <div class="image-modal" id="imageModal">
    <span class="close-modal">&times;</span>
    <img class="modal-content" id="modalImage">
  </div>
`);

// Update paste event listener to add click functionality to images
document.addEventListener('paste', (e) => {
  const target = e.target;
  if (target.classList.contains('note-area')) {
    const items = e.clipboardData.items;

    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        const reader = new FileReader();
        
        reader.onload = function(event) {
          const img = document.createElement('img');
          img.src = event.target.result;
          img.className = 'pasted-image';
          // Add click event for image preview
          img.onclick = function() {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.style.display = "block";
            modalImg.src = this.src;
          };
          
          const imageContainer = document.createElement('div');
          imageContainer.className = 'image-container';
          
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-image-btn';
          deleteBtn.innerHTML = '×';
          deleteBtn.onclick = function(e) {
            e.stopPropagation(); // Prevent modal from opening when clicking delete
            if (confirm('Are you sure you want to delete this image?')) {
              imageContainer.remove();
            }
          };
          
          imageContainer.appendChild(img);
          imageContainer.appendChild(deleteBtn);
          target.parentNode.insertBefore(imageContainer, target);
        };
        
        reader.readAsDataURL(file);
      }
    }
  }
});

// Close modal when clicking the × button
document.querySelector('.close-modal').onclick = function() {
  document.getElementById('imageModal').style.display = "none";
};

// Close modal when clicking outside the image
document.getElementById('imageModal').onclick = function(e) {
  if (e.target === this) {
    this.style.display = "none";
  }
};

// Close modal with escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('imageModal').style.display = "none";
  }
});
