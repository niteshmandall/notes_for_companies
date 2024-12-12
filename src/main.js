import './style.css'

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
            <button class="tab-button active" data-tab="tab1">
              <span class="tab-name">Tab 1</span>
              <button class="edit-tab-btn">✎</button>
            </button>
          </div>
          <div class="tab-item">
            <button class="tab-button" data-tab="tab2">
              <span class="tab-name">Tab 2</span>
              <button class="edit-tab-btn">✎</button>
            </button>
          </div>
          <div class="tab-item">
            <button class="tab-button" data-tab="tab3">
              <span class="tab-name">Tab 3</span>
              <button class="edit-tab-btn">✎</button>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="note-container active" id="tab1">
        <div class="note-header">
          <h2>Tab 1 Notes</h2>
          <button class="add-note-btn">+ Add Note</button>
        </div>
        <div class="notes-list">
          <div class="note">
            <input type="text" class="note-title" placeholder="Note title...">
            <textarea class="note-area" placeholder="Write your note here..."></textarea>
            <button class="delete-note-btn">Delete</button>
          </div>
        </div>
      </div>
      <div class="note-container" id="tab2">
        <div class="note-header">
          <h2>Tab 2 Notes</h2>
          <button class="add-note-btn">+ Add Note</button>
        </div>
        <div class="notes-list">
          <div class="note">
            <input type="text" class="note-title" placeholder="Note title...">
            <textarea class="note-area" placeholder="Write your note here..."></textarea>
            <button class="delete-note-btn">Delete</button>
          </div>
        </div>
      </div>
      <div class="note-container" id="tab3">
        <div class="note-header">
          <h2>Tab 3 Notes</h2>
          <button class="add-note-btn">+ Add Note</button>
        </div>
        <div class="notes-list">
          <div class="note">
            <input type="text" class="note-title" placeholder="Note title...">
            <textarea class="note-area" placeholder="Write your note here..."></textarea>
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
  button.addEventListener('click', (e) => {
    if (!e.target.classList.contains('edit-tab-btn')) {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      noteContainers.forEach(container => container.classList.remove('active'));
      
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    }
  });
});

// Edit tab name functionality
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-tab-btn')) {
    e.stopPropagation();
    const tabButton = e.target.closest('.tab-button');
    const tabNameSpan = tabButton.querySelector('.tab-name');
    const currentName = tabNameSpan.textContent;
    const newName = prompt('Enter new tab name:', currentName);
    
    if (newName && newName.trim() !== '') {
      tabNameSpan.textContent = newName;
      // Update corresponding header in main content
      const tabId = tabButton.getAttribute('data-tab');
      const header = document.querySelector(`#${tabId} h2`);
      header.textContent = `${newName} Notes`;
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
    <button class="tab-button" data-tab="${newTabId}">
      <span class="tab-name">Tab ${tabCounter}</span>
      <button class="edit-tab-btn">✎</button>
    </button>
  `;
  
  // Create new note container
  const noteContainer = document.createElement('div');
  noteContainer.className = 'note-container';
  noteContainer.id = newTabId;
  noteContainer.innerHTML = `
    <div class="note-header">
      <h2>Tab ${tabCounter} Notes</h2>
      <button class="add-note-btn">+ Add Note</button>
    </div>
    <div class="notes-list">
      <div class="note">
        <input type="text" class="note-title" placeholder="Note title...">
        <textarea class="note-area" placeholder="Write your note here..."></textarea>
        <button class="delete-note-btn">Delete</button>
      </div>
    </div>
  `;
  
  tabList.appendChild(tabItem);
  mainContent.appendChild(noteContainer);
  
  // Update tab switching functionality for new tab
  const newTabButton = tabItem.querySelector('.tab-button');
  newTabButton.addEventListener('click', (e) => {
    if (!e.target.classList.contains('edit-tab-btn')) {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.note-container').forEach(container => container.classList.remove('active'));
      
      newTabButton.classList.add('active');
      noteContainer.classList.add('active');
    }
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
      <textarea class="note-area" placeholder="Write your note here..."></textarea>
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
