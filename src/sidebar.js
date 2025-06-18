/* © Webseitenland – https://webseitenland.de – Code & Design by Webseitenland. See LICENSE for details. */

// theme toggle functionality
const themeToggle = document.getElementById('theme-toggle-icon');
const htmlElement = document.documentElement;

// set current year for copyright
document.getElementById('current-year').textContent = new Date().getFullYear();

// get saved theme or set default
let currentTheme = localStorage.getItem('theme') || 'light';
applyTheme(currentTheme);

// theme toggle event listener
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  localStorage.setItem('theme', currentTheme);
});

// apply theme
function applyTheme(theme) {
  if (theme === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    themeToggle.classList.remove('fa-moon');
    themeToggle.classList.add('fa-sun');
  } else {
    htmlElement.removeAttribute('data-theme');
    themeToggle.classList.remove('fa-sun');
    themeToggle.classList.add('fa-moon');
  }
}

// feature navigation
const featureItems = document.querySelectorAll('.feature-item');
const featurePanels = document.querySelectorAll('.feature-panel');

featureItems.forEach(item => {
  item.addEventListener('click', () => {
    const featureId = item.getAttribute('data-feature');
    
    // update active state for menu items
    featureItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    // show active panel
    featurePanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === `${featureId}-panel`) {
        panel.classList.add('active');
      }
    });

    // save feature selection in local storage
    localStorage.setItem('activeFeature', featureId);
  });
});

// restore saved feature selection
const savedFeature = localStorage.getItem('activeFeature');
if (savedFeature) {
  const savedFeatureItem = document.querySelector(`.feature-item[data-feature="${savedFeature}"]`);
  if (savedFeatureItem) {
    savedFeatureItem.click();
  }
}

// notes functionality
const saveNoteBtn = document.getElementById('save-note');
const newNoteInput = document.getElementById('new-note');
const notesList = document.getElementById('notes-list');

// load notes from local storage
loadNotes();

// save new note
saveNoteBtn.addEventListener('click', () => {
  const noteText = newNoteInput.value.trim();
  if (noteText) {
    const noteId = Date.now();
    const note = {
      id: noteId,
      text: noteText,
      date: new Date().toLocaleString('de-DE')
    };
    
    // add note to local storage
    const notes = getNotes();
    notes.push(note);
    localStorage.setItem('weblandNotes', JSON.stringify(notes));
    
    // add note to list and clear input
    addNoteToList(note);
    newNoteInput.value = '';
  }
});

// get notes from local storage
function getNotes() {
  const notes = localStorage.getItem('weblandNotes');
  return notes ? JSON.parse(notes) : [];
}

// load notes to list
function loadNotes() {
  const notes = getNotes();
  notesList.innerHTML = '';
  notes.forEach(note => addNoteToList(note));
}

// add note to list
function addNoteToList(note) {
  const noteItem = document.createElement('div');
  noteItem.classList.add('note-item');
  noteItem.dataset.id = note.id;
  
  noteItem.innerHTML = `
    <div class="note-content">${note.text}</div>
    <div class="note-date">${note.date}</div>
    <div class="note-actions">
      <button class="edit"><i class="fas fa-edit"></i></button>
      <button class="delete"><i class="fas fa-trash"></i></button>
    </div>
  `;
  
  // event listeners for delete and edit
  noteItem.querySelector('.delete').addEventListener('click', () => {
    deleteNote(note.id);
    noteItem.remove();
  });
  
  noteItem.querySelector('.edit').addEventListener('click', () => {
    editNote(noteItem, note);
  });
  
  notesList.prepend(noteItem);
}

// delete note
function deleteNote(id) {
  let notes = getNotes();
  notes = notes.filter(note => note.id !== id);
  localStorage.setItem('weblandNotes', JSON.stringify(notes));
}

// edit note
function editNote(noteItem, note) {
  const noteContent = noteItem.querySelector('.note-content');
  const currentText = noteContent.textContent;
  
  noteContent.innerHTML = `
    <textarea class="edit-note-textarea">${currentText}</textarea>
    <button class="btn-primary save-edit">Speichern</button>
  `;
  
  const textarea = noteContent.querySelector('.edit-note-textarea');
  const saveBtn = noteContent.querySelector('.save-edit');
  
  textarea.focus();
  
  saveBtn.addEventListener('click', () => {
    const newText = textarea.value.trim();
    if (newText) {
      // update note in local storage
      const notes = getNotes();
      const noteIndex = notes.findIndex(n => n.id === note.id);
      if (noteIndex !== -1) {
        notes[noteIndex].text = newText;
        notes[noteIndex].date = new Date().toLocaleString('de-DE');
        localStorage.setItem('weblandNotes', JSON.stringify(notes));
        
        // update ui
        noteContent.innerHTML = newText;
        noteItem.querySelector('.note-date').textContent = notes[noteIndex].date;
      }
    }
  });
}

// bookmarks functionality
const addBookmarkBtn = document.getElementById('add-current-page');
const bookmarksList = document.getElementById('bookmarks-list');

// load bookmarks from local storage
loadBookmarks();

// add current tab as bookmark
addBookmarkBtn.addEventListener('click', async () => {
  try {
    // get current tab information
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      const bookmark = {
        id: Date.now(),
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl || 'assets/icons/logo.png'
      };
      
      // add bookmark to local storage
      const bookmarks = getBookmarks();
      
      // check if url already exists
      if (!bookmarks.some(b => b.url === bookmark.url)) {
        bookmarks.push(bookmark);
        localStorage.setItem('weblandBookmarks', JSON.stringify(bookmarks));
        
        // add bookmark to list
        addBookmarkToList(bookmark);
      }
    }
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Lesezeichens:', error);
  }
});

// get bookmarks from local storage
function getBookmarks() {
  const bookmarks = localStorage.getItem('weblandBookmarks');
  return bookmarks ? JSON.parse(bookmarks) : [];
}

// load bookmarks to list
function loadBookmarks() {
  const bookmarks = getBookmarks();
  bookmarksList.innerHTML = '';
  bookmarks.forEach(bookmark => addBookmarkToList(bookmark));
}

// add bookmark to list
function addBookmarkToList(bookmark) {
  const bookmarkItem = document.createElement('div');
  bookmarkItem.classList.add('bookmark-item');
  bookmarkItem.dataset.id = bookmark.id;
  
  bookmarkItem.innerHTML = `
    <img class="favicon" src="${bookmark.favicon}" alt="" onerror="this.src='assets/icons/logo.png'">
    <div class="bookmark-title">${bookmark.title}</div>
    <div class="bookmark-actions">
      <button class="open" title="Öffnen"><i class="fas fa-external-link-alt"></i></button>
      <button class="delete" title="Löschen"><i class="fas fa-trash"></i></button>
    </div>
  `;
  
  // event listeners for open and delete
  bookmarkItem.querySelector('.open').addEventListener('click', () => {
    chrome.tabs.create({ url: bookmark.url });
  });
  
  bookmarkItem.querySelector('.delete').addEventListener('click', () => {
    deleteBookmark(bookmark.id);
    bookmarkItem.remove();
  });
  
  bookmarksList.appendChild(bookmarkItem);
}

// delete bookmark
function deleteBookmark(id) {
  let bookmarks = getBookmarks();
  bookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
  localStorage.setItem('weblandBookmarks', JSON.stringify(bookmarks));
}

// tasks functionality
const addTodoBtn = document.getElementById('add-todo');
const newTodoInput = document.getElementById('new-todo');
const todoList = document.getElementById('todo-list');

// load tasks from local storage
loadTodos();

// add new task
addTodoBtn.addEventListener('click', () => {
  const todoText = newTodoInput.value.trim();
  if (todoText) {
    const todoId = Date.now();
    const todo = {
      id: todoId,
      text: todoText,
      completed: false,
      date: new Date().toLocaleDateString('de-DE')
    };
    
    // add task to local storage
    const todos = getTodos();
    todos.push(todo);
    localStorage.setItem('weblandTodos', JSON.stringify(todos));
    
    // add task to list and clear input
    addTodoToList(todo);
    newTodoInput.value = '';
  }
});

// get tasks from local storage
function getTodos() {
  const todos = localStorage.getItem('weblandTodos');
  return todos ? JSON.parse(todos) : [];
}

// load tasks to list
function loadTodos() {
  const todos = getTodos();
  todoList.innerHTML = '';
  todos.forEach(todo => addTodoToList(todo));
}

// add task to list
function addTodoToList(todo) {
  const todoItem = document.createElement('li');
  todoItem.classList.add('todo-item');
  if (todo.completed) {
    todoItem.classList.add('completed');
  }
  todoItem.dataset.id = todo.id;
  
  todoItem.innerHTML = `
    <input type="checkbox" ${todo.completed ? 'checked' : ''}>
    <span class="todo-text">${todo.text}</span>
    <button class="delete-todo"><i class="fas fa-trash"></i></button>
  `;
  
  // event listeners for checkbox and delete
  const checkbox = todoItem.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('change', () => {
    toggleTodoComplete(todo.id, checkbox.checked);
    todoItem.classList.toggle('completed', checkbox.checked);
  });
  
  todoItem.querySelector('.delete-todo').addEventListener('click', () => {
    deleteTodo(todo.id);
    todoItem.remove();
  });
  
  todoList.appendChild(todoItem);
}

// toggle task completion
function toggleTodoComplete(id, completed) {
  const todos = getTodos();
  const todoIndex = todos.findIndex(todo => todo.id === id);
  if (todoIndex !== -1) {
    todos[todoIndex].completed = completed;
    localStorage.setItem('weblandTodos', JSON.stringify(todos));
  }
}

// delete task
function deleteTodo(id) {
  let todos = getTodos();
  todos = todos.filter(todo => todo.id !== id);
  localStorage.setItem('weblandTodos', JSON.stringify(todos));
}

// weather functionality
const getWeatherBtn = document.getElementById('get-weather');
const weatherLocationInput = document.getElementById('weather-location');
const weatherInfo = document.getElementById('weather-info');

// weather api key (example - should be replaced by a real api key)
const WEATHER_API_KEY = 'deine_api_key_hier';

// get weather
getWeatherBtn.addEventListener('click', () => {
  const location = weatherLocationInput.value.trim();
  if (location) {
    getWeatherData(location);
  }
});

// get weather data from api
async function getWeatherData(location) {
  try {
    // OpenWeatherMap api url
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&lang=de&appid=${WEATHER_API_KEY}`;
    
    // since we don't have a real api key, we'll show example data here
    // in a real application, this would be a fetch call
    
    // example data
    const weatherData = {
      name: location,
      main: {
        temp: Math.floor(Math.random() * 30),
        feels_like: Math.floor(Math.random() * 30),
        humidity: Math.floor(Math.random() * 100)
      },
      weather: [{
        main: 'Clear',
        description: 'Klarer Himmel',
        icon: '01d'
      }],
      wind: {
        speed: Math.floor(Math.random() * 10)
      }
    };
    
    displayWeatherData(weatherData);
    
    // save last searched location
    localStorage.setItem('lastWeatherLocation', location);
  } catch (error) {
    console.error('Fehler beim Abrufen der Wetterdaten:', error);
    weatherInfo.innerHTML = `<p class="error">Fehler beim Abrufen der Wetterdaten. Bitte versuche es später erneut.</p>`;
  }
}

// display weather data
function displayWeatherData(data) {
  // weather icon based on code
  const getWeatherIcon = (code) => {
    const icons = {
      '01d': 'fa-sun',
      '01n': 'fa-moon',
      '02d': 'fa-cloud-sun',
      '02n': 'fa-cloud-moon',
      '03d': 'fa-cloud',
      '03n': 'fa-cloud',
      '04d': 'fa-cloud',
      '04n': 'fa-cloud',
      '09d': 'fa-cloud-showers-heavy',
      '09n': 'fa-cloud-showers-heavy',
      '10d': 'fa-cloud-rain',
      '10n': 'fa-cloud-rain',
      '11d': 'fa-bolt',
      '11n': 'fa-bolt',
      '13d': 'fa-snowflake',
      '13n': 'fa-snowflake',
      '50d': 'fa-smog',
      '50n': 'fa-smog'
    };
    
    return icons[code] || 'fa-cloud';
  };
  
  weatherInfo.innerHTML = `
    <div class="weather-location">${data.name}</div>
    <div class="weather-main">
      <div class="weather-icon">
        <i class="fas ${getWeatherIcon(data.weather[0].icon)}"></i>
      </div>
      <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
    </div>
    <div class="weather-description">${data.weather[0].description}</div>
    <div class="weather-details">
      <div class="weather-detail">
        <div class="weather-detail-label">Gefühlt</div>
        <div class="weather-detail-value">${Math.round(data.main.feels_like)}°C</div>
      </div>
      <div class="weather-detail">
        <div class="weather-detail-label">Luftfeuchtigkeit</div>
        <div class="weather-detail-value">${data.main.humidity}%</div>
      </div>
      <div class="weather-detail">
        <div class="weather-detail-label">Wind</div>
        <div class="weather-detail-value">${data.wind.speed} km/h</div>
      </div>
    </div>
  `;
}

// restore last searched location
const lastWeatherLocation = localStorage.getItem('lastWeatherLocation');
if (lastWeatherLocation) {
  weatherLocationInput.value = lastWeatherLocation;
  getWeatherData(lastWeatherLocation);
}

// translator functionality
const translateBtn = document.getElementById('translate-btn');
const sourceText = document.getElementById('source-text');
const translatedTextDiv = document.getElementById('translated-text');
const sourceLanguage = document.getElementById('source-language');
const targetLanguage = document.getElementById('target-language');

// swap languages
document.querySelector('.language-selector i').addEventListener('click', () => {
  if (sourceLanguage.value !== 'auto') {
    const temp = sourceLanguage.value;
    sourceLanguage.value = targetLanguage.value;
    targetLanguage.value = temp;
  }
});

// translate text
translateBtn.addEventListener('click', async () => {
  const text = sourceText.value.trim();
  if (text) {
    translateText(text, sourceLanguage.value, targetLanguage.value);
  }
});

// translate text (example implementation)
function translateText(text, sourceLang, targetLang) {
  // in a real application, this would be an api call
  // since we don't have a real api, we'll show only an example here
  
  translatedTextDiv.innerHTML = `<p>Dies ist eine Beispielübersetzung für: "${text}"</p>
    <p><em>In einer echten Anwendung würde hier die übersetzte Version des Textes von ${sourceLang} nach ${targetLang} stehen.</em></p>`;
  
  // save last translation settings
  localStorage.setItem('lastTranslateSource', sourceLang);
  localStorage.setItem('lastTranslateTarget', targetLang);
}

// restore last translation settings
const lastTranslateSource = localStorage.getItem('lastTranslateSource');
const lastTranslateTarget = localStorage.getItem('lastTranslateTarget');

if (lastTranslateSource) {
  sourceLanguage.value = lastTranslateSource;
}

if (lastTranslateTarget) {
  targetLanguage.value = lastTranslateTarget;
}

// search functionality
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (searchTerm.length > 0) {
    // search notes
    searchNotes(searchTerm);
    
    // search bookmarks
    searchBookmarks(searchTerm);
    
    // search tasks
    searchTodos(searchTerm);
  } else {
    // if search field is empty, show all elements again
    resetSearch();
  }
});

// search notes
function searchNotes(term) {
  const noteItems = document.querySelectorAll('.note-item');
  noteItems.forEach(item => {
    const noteContent = item.querySelector('.note-content').textContent.toLowerCase();
    if (noteContent.includes(term)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// search bookmarks
function searchBookmarks(term) {
  const bookmarkItems = document.querySelectorAll('.bookmark-item');
  bookmarkItems.forEach(item => {
    const bookmarkTitle = item.querySelector('.bookmark-title').textContent.toLowerCase();
    if (bookmarkTitle.includes(term)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// search tasks
function searchTodos(term) {
  const todoItems = document.querySelectorAll('.todo-item');
  todoItems.forEach(item => {
    const todoText = item.querySelector('.todo-text').textContent.toLowerCase();
    if (todoText.includes(term)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

// reset search
function resetSearch() {
  // reset notes
  document.querySelectorAll('.note-item').forEach(item => {
    item.style.display = 'block';
  });
  
  // reset bookmarks
  document.querySelectorAll('.bookmark-item').forEach(item => {
    item.style.display = 'flex';
  });
  
  // reset tasks
  document.querySelectorAll('.todo-item').forEach(item => {
    item.style.display = 'flex';
  });
} 