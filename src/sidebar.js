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

// Krypto-Funktionalität
const cryptoTabs = document.querySelectorAll('.crypto-tab');
const cryptoTabContents = document.querySelectorAll('.crypto-tab-content');
const cryptoSearchInput = document.getElementById('crypto-search');
const addCryptoBtn = document.getElementById('add-crypto');
const cryptoWatchlist = document.getElementById('crypto-watchlist');
const newCryptoNoteInput = document.getElementById('new-crypto-note');
const saveCryptoNoteBtn = document.getElementById('save-crypto-note');
const cryptoNotesList = document.getElementById('crypto-notes-list');
const cryptoLinkTitleInput = document.getElementById('crypto-link-title');
const cryptoLinkUrlInput = document.getElementById('crypto-link-url');
const saveCryptoLinkBtn = document.getElementById('save-crypto-link');
const addCurrentPageCryptoBtn = document.getElementById('add-current-page-crypto');
const cryptoLinksList = document.getElementById('crypto-links-list');
const cryptoAmountInput = document.getElementById('crypto-amount');
const cryptoCurrencySelect = document.getElementById('crypto-currency');
const cryptoPriceInput = document.getElementById('crypto-price');
const fiatCurrencySelect = document.getElementById('fiat-currency');
const calculationResultDiv = document.getElementById('calculation-result');
const calculateBtn = document.getElementById('calculate-btn');
const saveCalculationBtn = document.getElementById('save-calculation');

// API-Endpunkt für Kryptowährungsdaten
const CRYPTO_API_ENDPOINT = 'https://api.coingecko.com/api/v3';

// Tab-Wechsel-Funktionalität
cryptoTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.getAttribute('data-tab');
    
    // Update aktiven Tab
    cryptoTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Zeige aktiven Tab-Inhalt
    cryptoTabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `${tabId}-content`) {
        content.classList.add('active');
      }
    });
    
    // Speichere Tab-Auswahl im Local Storage
    localStorage.setItem('activeCryptoTab', tabId);
  });
});

// Stelle gespeicherten Tab wieder her
const savedCryptoTab = localStorage.getItem('activeCryptoTab');
if (savedCryptoTab) {
  const savedTab = document.querySelector(`.crypto-tab[data-tab="${savedCryptoTab}"]`);
  if (savedTab) {
    savedTab.click();
  }
}

// Watchlist-Funktionalität
// Lade Watchlist aus Local Storage
loadCryptoWatchlist();

// Kryptowährung zur Watchlist hinzufügen
addCryptoBtn.addEventListener('click', async () => {
  const searchTerm = cryptoSearchInput.value.trim();
  if (searchTerm) {
    try {
      const cryptoData = await searchCryptoCurrency(searchTerm);
      if (cryptoData && cryptoData.length > 0) {
        const crypto = cryptoData[0]; // Nehme den ersten Treffer
        const cryptoItem = {
          id: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.large || crypto.thumb,
          price: crypto.market_data?.current_price?.eur || 0,
          priceChange24h: crypto.market_data?.price_change_percentage_24h || 0,
          lastUpdated: new Date().toISOString()
        };
        
        // Füge zur Watchlist im Local Storage hinzu
        const watchlist = getCryptoWatchlist();
        
        // Prüfe, ob die Kryptowährung bereits existiert
        if (!watchlist.some(item => item.id === cryptoItem.id)) {
          watchlist.push(cryptoItem);
          localStorage.setItem('weblandCryptoWatchlist', JSON.stringify(watchlist));
          
          // Füge zur Watchlist-Anzeige hinzu
          addCryptoToWatchlist(cryptoItem);
          cryptoSearchInput.value = '';
        } else {
          alert('Diese Kryptowährung ist bereits in deiner Watchlist!');
        }
      } else {
        alert('Keine Kryptowährung gefunden. Bitte versuche einen anderen Suchbegriff.');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kryptowährung:', error);
      alert('Fehler beim Hinzufügen der Kryptowährung. Bitte versuche es später erneut.');
    }
  }
});

// Suche nach Kryptowährungen
async function searchCryptoCurrency(query) {
  try {
    // Versuche, die CoinGecko API zu verwenden
    try {
      const response = await fetch(`${CRYPTO_API_ENDPOINT}/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.coins && data.coins.length > 0) {
          // Hole die Details für die erste Münze
          const coin = data.coins[0];
          const detailsResponse = await fetch(`${CRYPTO_API_ENDPOINT}/coins/${coin.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
          
          if (detailsResponse.ok) {
            const coinDetails = await detailsResponse.json();
            return [coinDetails];
          }
        }
      }
    } catch (apiError) {
      console.error('API-Fehler:', apiError);
      // Fallback zu Dummy-Daten, wenn die API nicht verfügbar ist
    }
    
    // Fallback zu Dummy-Daten
    const dummyData = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        thumb: 'https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png',
        market_data: {
          current_price: { eur: 50000 },
          price_change_percentage_24h: 2.5
        }
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        large: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        thumb: 'https://assets.coingecko.com/coins/images/279/thumb/ethereum.png',
        market_data: {
          current_price: { eur: 3000 },
          price_change_percentage_24h: -1.2
        }
      }
    ];
    
    // Filtere basierend auf der Suchanfrage
    return dummyData.filter(crypto => 
      crypto.name.toLowerCase().includes(query.toLowerCase()) || 
      crypto.symbol.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Fehler bei der Kryptowährungssuche:', error);
    return [];
  }
}

// Hole Watchlist aus Local Storage
function getCryptoWatchlist() {
  const watchlist = localStorage.getItem('weblandCryptoWatchlist');
  return watchlist ? JSON.parse(watchlist) : [];
}

// Lade Watchlist in die Anzeige
function loadCryptoWatchlist() {
  const watchlist = getCryptoWatchlist();
  cryptoWatchlist.innerHTML = '';
  
  if (watchlist.length === 0) {
    cryptoWatchlist.innerHTML = '<div class="empty-state">Deine Watchlist ist leer. Füge Kryptowährungen hinzu, um sie zu verfolgen.</div>';
    return;
  }
  
  watchlist.forEach(crypto => addCryptoToWatchlist(crypto));
  
  // Aktualisiere die Preise alle 60 Sekunden
  setTimeout(updateCryptoPrices, 60000);
}

// Füge Kryptowährung zur Watchlist-Anzeige hinzu
function addCryptoToWatchlist(crypto) {
  const cryptoItem = document.createElement('div');
  cryptoItem.classList.add('crypto-item');
  cryptoItem.dataset.id = crypto.id;
  
  const priceChangeClass = crypto.priceChange24h >= 0 ? 'positive' : 'negative';
  const priceChangeIcon = crypto.priceChange24h >= 0 ? 'fa-caret-up' : 'fa-caret-down';
  
  cryptoItem.innerHTML = `
    <div class="crypto-item-header">
      <div class="crypto-item-name">
        <img src="${crypto.image}" alt="${crypto.name}" onerror="this.src='assets/icons/logo.png'">
        <span>${crypto.name} (${crypto.symbol.toUpperCase()})</span>
      </div>
      <div class="crypto-item-price">${formatCurrency(crypto.price, 'EUR')}</div>
    </div>
    <div class="crypto-item-details">
      <div class="crypto-item-change ${priceChangeClass}">
        <i class="fas ${priceChangeIcon}"></i>
        <span>${Math.abs(crypto.priceChange24h).toFixed(2)}%</span>
      </div>
      <div class="crypto-item-actions">
        <button class="refresh" title="Aktualisieren"><i class="fas fa-sync-alt"></i></button>
        <button class="alert" title="Preisalarm"><i class="fas fa-bell"></i></button>
        <button class="delete" title="Entfernen"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `;
  
  // Event-Listener für Aktionen
  cryptoItem.querySelector('.refresh').addEventListener('click', () => {
    refreshCryptoPrice(crypto.id);
  });
  
  cryptoItem.querySelector('.alert').addEventListener('click', () => {
    setupPriceAlert(crypto);
  });
  
  cryptoItem.querySelector('.delete').addEventListener('click', () => {
    deleteCryptoFromWatchlist(crypto.id);
    cryptoItem.remove();
  });
  
  cryptoWatchlist.appendChild(cryptoItem);
}

// Formatiere Währung
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Lösche Kryptowährung aus Watchlist
function deleteCryptoFromWatchlist(id) {
  let watchlist = getCryptoWatchlist();
  watchlist = watchlist.filter(crypto => crypto.id !== id);
  localStorage.setItem('weblandCryptoWatchlist', JSON.stringify(watchlist));
}

// Aktualisiere Krypto-Preise
async function updateCryptoPrices() {
  const watchlist = getCryptoWatchlist();
  
  if (watchlist.length === 0) return;
  
  try {
    // Versuche, die CoinGecko API zu verwenden
    try {
      const ids = watchlist.map(crypto => crypto.id).join(',');
      const response = await fetch(`${CRYPTO_API_ENDPOINT}/coins/markets?vs_currency=eur&ids=${ids}&price_change_percentage=24h`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          data.forEach(coinData => {
            const cryptoIndex = watchlist.findIndex(crypto => crypto.id === coinData.id);
            
            if (cryptoIndex !== -1) {
              watchlist[cryptoIndex].price = coinData.current_price;
              watchlist[cryptoIndex].priceChange24h = coinData.price_change_percentage_24h;
              watchlist[cryptoIndex].lastUpdated = new Date().toISOString();
              
              // Aktualisiere die Anzeige
              const cryptoItem = document.querySelector(`.crypto-item[data-id="${coinData.id}"]`);
              if (cryptoItem) {
                updateCryptoItemUI(cryptoItem, watchlist[cryptoIndex]);
              }
            }
          });
          
          // Speichere aktualisierte Watchlist
          localStorage.setItem('weblandCryptoWatchlist', JSON.stringify(watchlist));
          
          // Prüfe Preisalarme
          checkPriceAlerts(watchlist);
          
          // Plane nächste Aktualisierung
          setTimeout(updateCryptoPrices, 60000);
          return;
        }
      }
    } catch (apiError) {
      console.error('API-Fehler:', apiError);
      // Fallback zu simulierten Daten, wenn die API nicht verfügbar ist
    }
    
    // Fallback zu simulierten Daten
    watchlist.forEach(crypto => {
      // Simuliere Preisänderungen
      const randomChange = (Math.random() * 5) - 2.5; // Zufällige Änderung zwischen -2.5% und +2.5%
      const newPrice = crypto.price * (1 + (randomChange / 100));
      
      crypto.price = newPrice;
      crypto.priceChange24h = randomChange;
      crypto.lastUpdated = new Date().toISOString();
      
      // Aktualisiere die Anzeige
      const cryptoItem = document.querySelector(`.crypto-item[data-id="${crypto.id}"]`);
      if (cryptoItem) {
        updateCryptoItemUI(cryptoItem, crypto);
      }
    });
    
    // Speichere aktualisierte Watchlist
    localStorage.setItem('weblandCryptoWatchlist', JSON.stringify(watchlist));
    
    // Prüfe Preisalarme
    checkPriceAlerts(watchlist);
    
    // Plane nächste Aktualisierung
    setTimeout(updateCryptoPrices, 60000);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Krypto-Preise:', error);
  }
}

// Aktualisiere die UI eines Krypto-Items
function updateCryptoItemUI(cryptoItem, crypto) {
  cryptoItem.querySelector('.crypto-item-price').textContent = formatCurrency(crypto.price, 'EUR');
  
  const changeElement = cryptoItem.querySelector('.crypto-item-change');
  changeElement.classList.remove('positive', 'negative');
  changeElement.classList.add(crypto.priceChange24h >= 0 ? 'positive' : 'negative');
  
  const iconElement = changeElement.querySelector('i');
  iconElement.classList.remove('fa-caret-up', 'fa-caret-down');
  iconElement.classList.add(crypto.priceChange24h >= 0 ? 'fa-caret-up' : 'fa-caret-down');
  
  changeElement.querySelector('span').textContent = `${Math.abs(crypto.priceChange24h).toFixed(2)}%`;
}

// Aktualisiere einzelnen Krypto-Preis
async function refreshCryptoPrice(id) {
  const watchlist = getCryptoWatchlist();
  const cryptoIndex = watchlist.findIndex(crypto => crypto.id === id);
  
  if (cryptoIndex !== -1) {
    try {
      // Versuche, die CoinGecko API zu verwenden
      try {
        const response = await fetch(`${CRYPTO_API_ENDPOINT}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.market_data) {
            watchlist[cryptoIndex].price = data.market_data.current_price.eur;
            watchlist[cryptoIndex].priceChange24h = data.market_data.price_change_percentage_24h;
            watchlist[cryptoIndex].lastUpdated = new Date().toISOString();
            
            // Aktualisiere die Anzeige
            const cryptoItem = document.querySelector(`.crypto-item[data-id="${id}"]`);
            if (cryptoItem) {
              updateCryptoItemUI(cryptoItem, watchlist[cryptoIndex]);
            }
            
            // Speichere aktualisierte Watchlist
            localStorage.setItem('weblandCryptoWatchlist', JSON.stringify(watchlist));
            
            // Prüfe Preisalarme
            checkPriceAlerts([watchlist[cryptoIndex]]);
            
            return;
          }
        }
      } catch (apiError) {
        console.error('API-Fehler:', apiError);
        // Fallback zu simulierten Daten, wenn die API nicht verfügbar ist
      }
      
      // Fallback zu simulierten Daten
      const randomChange = (Math.random() * 5) - 2.5;
      const newPrice = watchlist[cryptoIndex].price * (1 + (randomChange / 100));
      
      watchlist[cryptoIndex].price = newPrice;
      watchlist[cryptoIndex].priceChange24h = randomChange;
      watchlist[cryptoIndex].lastUpdated = new Date().toISOString();
      
      // Aktualisiere die Anzeige
      const cryptoItem = document.querySelector(`.crypto-item[data-id="${id}"]`);
      if (cryptoItem) {
        updateCryptoItemUI(cryptoItem, watchlist[cryptoIndex]);
      }
      
      // Speichere aktualisierte Watchlist
      localStorage.setItem('weblandCryptoWatchlist', JSON.stringify(watchlist));
      
      // Prüfe Preisalarme
      checkPriceAlerts([watchlist[cryptoIndex]]);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Krypto-Preises:', error);
    }
  }
}

// Preisalarm-Funktionalität
function setupPriceAlert(crypto) {
  const currentPrice = crypto.price;
  const targetPrice = prompt(`Gib einen Zielpreis für ${crypto.name} ein (aktueller Preis: ${formatCurrency(currentPrice, 'EUR')}):`, currentPrice);
  
  if (targetPrice === null) return; // Abgebrochen
  
  const parsedPrice = parseFloat(targetPrice);
  
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    alert('Bitte gib einen gültigen Preis ein.');
    return;
  }
  
  // Hole bestehende Alarme
  const alerts = getPriceAlerts();
  
  // Füge neuen Alarm hinzu
  alerts.push({
    cryptoId: crypto.id,
    cryptoName: crypto.name,
    cryptoSymbol: crypto.symbol,
    targetPrice: parsedPrice,
    currentPrice: currentPrice,
    createdAt: new Date().toISOString()
  });
  
  // Speichere Alarme
  localStorage.setItem('weblandCryptoPriceAlerts', JSON.stringify(alerts));
  
  alert(`Preisalarm für ${crypto.name} bei ${formatCurrency(parsedPrice, 'EUR')} gesetzt.`);
}

// Hole Preisalarme aus Local Storage
function getPriceAlerts() {
  const alerts = localStorage.getItem('weblandCryptoPriceAlerts');
  return alerts ? JSON.parse(alerts) : [];
}

// Prüfe Preisalarme
function checkPriceAlerts(cryptoList) {
  const alerts = getPriceAlerts();
  const triggeredAlerts = [];
  
  cryptoList.forEach(crypto => {
    const cryptoAlerts = alerts.filter(alert => alert.cryptoId === crypto.id);
    
    cryptoAlerts.forEach(alert => {
      const currentPrice = crypto.price;
      const targetPrice = alert.targetPrice;
      const previousPrice = alert.currentPrice;
      
      // Prüfe, ob der Preis den Zielpreis überschritten oder unterschritten hat
      if ((previousPrice < targetPrice && currentPrice >= targetPrice) || 
          (previousPrice > targetPrice && currentPrice <= targetPrice)) {
        triggeredAlerts.push(alert);
      }
    });
  });
  
  // Zeige Benachrichtigungen für ausgelöste Alarme
  triggeredAlerts.forEach(alert => {
    const crypto = cryptoList.find(c => c.id === alert.cryptoId);
    if (crypto) {
      const message = `Preisalarm: ${crypto.name} (${crypto.symbol.toUpperCase()}) hat ${formatCurrency(alert.targetPrice, 'EUR')} erreicht. Aktueller Preis: ${formatCurrency(crypto.price, 'EUR')}`;
      
      // Zeige Benachrichtigung
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Webland Krypto Preisalarm', {
          body: message,
          icon: crypto.image
        });
      } else {
        alert(message);
      }
      
      // Entferne ausgelösten Alarm
      const remainingAlerts = alerts.filter(a => a !== alert);
      localStorage.setItem('weblandCryptoPriceAlerts', JSON.stringify(remainingAlerts));
    }
  });
}

// Krypto-Notizen-Funktionalität
// Lade Notizen aus Local Storage
loadCryptoNotes();

// Speichere neue Notiz
saveCryptoNoteBtn.addEventListener('click', () => {
  const noteText = newCryptoNoteInput.value.trim();
  if (noteText) {
    const noteId = Date.now();
    const note = {
      id: noteId,
      text: noteText,
      date: new Date().toLocaleString('de-DE')
    };
    
    // Füge Notiz zum Local Storage hinzu
    const notes = getCryptoNotes();
    notes.push(note);
    localStorage.setItem('weblandCryptoNotes', JSON.stringify(notes));
    
    // Füge Notiz zur Liste hinzu und leere das Eingabefeld
    addCryptoNoteToList(note);
    newCryptoNoteInput.value = '';
  }
});

// Hole Notizen aus Local Storage
function getCryptoNotes() {
  const notes = localStorage.getItem('weblandCryptoNotes');
  return notes ? JSON.parse(notes) : [];
}

// Lade Notizen in die Liste
function loadCryptoNotes() {
  const notes = getCryptoNotes();
  cryptoNotesList.innerHTML = '';
  
  if (notes.length === 0) {
    cryptoNotesList.innerHTML = '<div class="empty-state">Keine Notizen vorhanden. Erstelle deine erste Krypto-Notiz.</div>';
    return;
  }
  
  notes.forEach(note => addCryptoNoteToList(note));
}

// Füge Notiz zur Liste hinzu
function addCryptoNoteToList(note) {
  const noteItem = document.createElement('div');
  noteItem.classList.add('crypto-note-item');
  noteItem.dataset.id = note.id;
  
  noteItem.innerHTML = `
    <div class="note-content">${note.text}</div>
    <div class="note-date">${note.date}</div>
    <div class="note-actions">
      <button class="edit" title="Bearbeiten"><i class="fas fa-edit"></i></button>
      <button class="delete" title="Löschen"><i class="fas fa-trash"></i></button>
    </div>
  `;
  
  // Event-Listener für Löschen und Bearbeiten
  noteItem.querySelector('.delete').addEventListener('click', () => {
    deleteCryptoNote(note.id);
    noteItem.remove();
  });
  
  noteItem.querySelector('.edit').addEventListener('click', () => {
    editCryptoNote(noteItem, note);
  });
  
  cryptoNotesList.prepend(noteItem);
}

// Lösche Notiz
function deleteCryptoNote(id) {
  let notes = getCryptoNotes();
  notes = notes.filter(note => note.id !== id);
  localStorage.setItem('weblandCryptoNotes', JSON.stringify(notes));
}

// Bearbeite Notiz
function editCryptoNote(noteItem, note) {
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
      // Aktualisiere Notiz im Local Storage
      const notes = getCryptoNotes();
      const noteIndex = notes.findIndex(n => n.id === note.id);
      if (noteIndex !== -1) {
        notes[noteIndex].text = newText;
        notes[noteIndex].date = new Date().toLocaleString('de-DE');
        localStorage.setItem('weblandCryptoNotes', JSON.stringify(notes));
        
        // Aktualisiere UI
        noteContent.innerHTML = newText;
        noteItem.querySelector('.note-date').textContent = notes[noteIndex].date;
      }
    }
  });
}

// Krypto-Links-Funktionalität
// Lade Links aus Local Storage
loadCryptoLinks();

// Speichere neuen Link
saveCryptoLinkBtn.addEventListener('click', () => {
  const title = cryptoLinkTitleInput.value.trim();
  const url = cryptoLinkUrlInput.value.trim();
  
  if (title && url) {
    saveCryptoLink(title, url);
  }
});

// Füge aktuelle Seite als Link hinzu
addCurrentPageCryptoBtn.addEventListener('click', async () => {
  try {
    // Hole aktuelle Tab-Informationen
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab) {
      cryptoLinkTitleInput.value = tab.title;
      cryptoLinkUrlInput.value = tab.url;
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der aktuellen Seite:', error);
  }
});

// Speichere Link
function saveCryptoLink(title, url) {
  const linkId = Date.now();
  const link = {
    id: linkId,
    title: title,
    url: url,
    favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
  };
  
  // Füge Link zum Local Storage hinzu
  const links = getCryptoLinks();
  links.push(link);
  localStorage.setItem('weblandCryptoLinks', JSON.stringify(links));
  
  // Füge Link zur Liste hinzu und leere die Eingabefelder
  addCryptoLinkToList(link);
  cryptoLinkTitleInput.value = '';
  cryptoLinkUrlInput.value = '';
}

// Hole Links aus Local Storage
function getCryptoLinks() {
  const links = localStorage.getItem('weblandCryptoLinks');
  return links ? JSON.parse(links) : [];
}

// Lade Links in die Liste
function loadCryptoLinks() {
  const links = getCryptoLinks();
  cryptoLinksList.innerHTML = '';
  
  if (links.length === 0) {
    cryptoLinksList.innerHTML = '<div class="empty-state">Keine Links vorhanden. Füge Krypto-bezogene Links hinzu.</div>';
    return;
  }
  
  links.forEach(link => addCryptoLinkToList(link));
}

// Füge Link zur Liste hinzu
function addCryptoLinkToList(link) {
  const linkItem = document.createElement('div');
  linkItem.classList.add('crypto-link-item');
  linkItem.dataset.id = link.id;
  
  linkItem.innerHTML = `
    <img class="favicon" src="${link.favicon}" alt="" onerror="this.src='assets/icons/logo.png'">
    <div class="link-title">${link.title}</div>
    <div class="link-actions">
      <button class="open" title="Öffnen"><i class="fas fa-external-link-alt"></i></button>
      <button class="delete" title="Löschen"><i class="fas fa-trash"></i></button>
    </div>
  `;
  
  // Event-Listener für Öffnen und Löschen
  linkItem.querySelector('.open').addEventListener('click', () => {
    chrome.tabs.create({ url: link.url });
  });
  
  linkItem.querySelector('.delete').addEventListener('click', () => {
    deleteCryptoLink(link.id);
    linkItem.remove();
  });
  
  cryptoLinksList.appendChild(linkItem);
}

// Lösche Link
function deleteCryptoLink(id) {
  let links = getCryptoLinks();
  links = links.filter(link => link.id !== id);
  localStorage.setItem('weblandCryptoLinks', JSON.stringify(links));
}

// Krypto-Rechner-Funktionalität
// Berechne Wert
calculateBtn.addEventListener('click', () => {
  const amount = parseFloat(cryptoAmountInput.value);
  const price = parseFloat(cryptoPriceInput.value);
  
  if (!isNaN(amount) && !isNaN(price)) {
    const total = amount * price;
    calculationResultDiv.textContent = formatCurrency(total, fiatCurrencySelect.value);
  } else {
    alert('Bitte gib gültige Zahlen für Menge und Preis ein.');
  }
});

// Hole aktuelle Preise für ausgewählte Kryptowährung
cryptoCurrencySelect.addEventListener('change', async () => {
  const selectedCrypto = cryptoCurrencySelect.value;
  
  try {
    // In einer echten Anwendung würde hier ein API-Aufruf erfolgen
    // Da wir keine echte API verwenden, simulieren wir die Daten
    
    const dummyPrices = {
      'BTC': 50000,
      'ETH': 3000,
      'BNB': 500,
      'XRP': 0.8,
      'ADA': 1.2,
      'SOL': 150,
      'DOT': 30
    };
    
    cryptoPriceInput.value = dummyPrices[selectedCrypto] || 0;
  } catch (error) {
    console.error('Fehler beim Abrufen des Krypto-Preises:', error);
  }
});

// Speichere Berechnung
saveCalculationBtn.addEventListener('click', () => {
  const amount = parseFloat(cryptoAmountInput.value);
  const price = parseFloat(cryptoPriceInput.value);
  
  if (!isNaN(amount) && !isNaN(price)) {
    const total = amount * price;
    const calculation = {
      id: Date.now(),
      amount: amount,
      cryptoCurrency: cryptoCurrencySelect.value,
      cryptoName: cryptoCurrencySelect.options[cryptoCurrencySelect.selectedIndex].text,
      price: price,
      fiatCurrency: fiatCurrencySelect.value,
      total: total,
      date: new Date().toLocaleString('de-DE')
    };
    
    // Speichere Berechnung im Local Storage
    const calculations = getSavedCalculations();
    calculations.push(calculation);
    localStorage.setItem('weblandCryptoCalculations', JSON.stringify(calculations));
    
    alert(`Berechnung gespeichert: ${amount} ${calculation.cryptoCurrency} = ${formatCurrency(total, calculation.fiatCurrency)}`);
  } else {
    alert('Bitte gib gültige Zahlen für Menge und Preis ein.');
  }
});

// Hole gespeicherte Berechnungen aus Local Storage
function getSavedCalculations() {
  const calculations = localStorage.getItem('weblandCryptoCalculations');
  return calculations ? JSON.parse(calculations) : [];
}

// Portfolio-Funktionalität
const portfolioList = document.getElementById('crypto-portfolio');
const portfolioTotalValue = document.getElementById('portfolio-total-value');
const addPortfolioItemBtn = document.getElementById('add-portfolio-item');
const portfolioModal = document.getElementById('portfolio-modal');
const portfolioForm = document.getElementById('portfolio-form');
const portfolioCryptoSelect = document.getElementById('portfolio-crypto');
const portfolioAmountInput = document.getElementById('portfolio-amount');
const portfolioBuyPriceInput = document.getElementById('portfolio-buy-price');
const portfolioBuyDateInput = document.getElementById('portfolio-buy-date');
const portfolioNotesInput = document.getElementById('portfolio-notes');
const savePortfolioBtn = document.getElementById('save-portfolio');
const cancelPortfolioBtn = document.getElementById('cancel-portfolio');
const portfolioModalClose = document.querySelector('.portfolio-modal-close');
const portfolioChart = document.getElementById('portfolio-chart');

// Setze das heutige Datum als Standard für das Kaufdatum
portfolioBuyDateInput.valueAsDate = new Date();

// Lade Portfolio aus Local Storage
loadPortfolio();

// Modal öffnen
addPortfolioItemBtn.addEventListener('click', () => {
  portfolioModal.classList.add('active');
  // Setze das heutige Datum als Standard für das Kaufdatum
  portfolioBuyDateInput.valueAsDate = new Date();
});

// Modal schließen
portfolioModalClose.addEventListener('click', closePortfolioModal);
cancelPortfolioBtn.addEventListener('click', closePortfolioModal);

// Schließe Modal, wenn außerhalb geklickt wird
portfolioModal.addEventListener('click', (e) => {
  if (e.target === portfolioModal) {
    closePortfolioModal();
  }
});

// Schließe Portfolio-Modal
function closePortfolioModal() {
  portfolioModal.classList.remove('active');
  portfolioForm.reset();
}

// Portfolio-Formular absenden
portfolioForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const cryptoId = portfolioCryptoSelect.value;
  const amount = parseFloat(portfolioAmountInput.value);
  const buyPrice = parseFloat(portfolioBuyPriceInput.value);
  const buyDate = portfolioBuyDateInput.value;
  const notes = portfolioNotesInput.value.trim();
  
  if (!cryptoId || isNaN(amount) || isNaN(buyPrice) || !buyDate) {
    alert('Bitte fülle alle erforderlichen Felder aus.');
    return;
  }
  
  // Hole Krypto-Details
  const cryptoOption = portfolioCryptoSelect.options[portfolioCryptoSelect.selectedIndex];
  const cryptoName = cryptoOption.text;
  
  // Erstelle Portfolio-Element
  const portfolioItem = {
    id: Date.now(),
    cryptoId: cryptoId,
    cryptoName: cryptoName,
    amount: amount,
    buyPrice: buyPrice,
    buyDate: buyDate,
    notes: notes,
    currentPrice: 0, // Wird später aktualisiert
    image: `https://assets.coingecko.com/coins/images/1/large/${cryptoId.toLowerCase()}.png` // Beispiel-URL
  };
  
  // Füge zum Portfolio im Local Storage hinzu
  const portfolio = getPortfolio();
  portfolio.push(portfolioItem);
  localStorage.setItem('weblandCryptoPortfolio', JSON.stringify(portfolio));
  
  // Füge zur Portfolio-Anzeige hinzu
  addPortfolioItemToList(portfolioItem);
  
  // Aktualisiere Gesamtwert
  updatePortfolioTotalValue();
  
  // Aktualisiere Chart
  updatePortfolioChart();
  
  // Schließe Modal
  closePortfolioModal();
});

// Hole Portfolio aus Local Storage
function getPortfolio() {
  const portfolio = localStorage.getItem('weblandCryptoPortfolio');
  return portfolio ? JSON.parse(portfolio) : [];
}

// Lade Portfolio in die Anzeige
function loadPortfolio() {
  const portfolio = getPortfolio();
  portfolioList.innerHTML = '';
  
  if (portfolio.length === 0) {
    portfolioList.innerHTML = '<div class="empty-state">Dein Portfolio ist leer. Füge Positionen hinzu, um dein Krypto-Portfolio zu verwalten.</div>';
    portfolioTotalValue.textContent = formatCurrency(0, 'EUR');
    return;
  }
  
  portfolio.forEach(item => addPortfolioItemToList(item));
  
  // Aktualisiere Preise
  updatePortfolioPrices();
  
  // Aktualisiere Chart
  updatePortfolioChart();
}

// Füge Portfolio-Element zur Liste hinzu
function addPortfolioItemToList(item) {
  // Hole aktuellen Preis (simuliert)
  const currentPrice = item.currentPrice || getSimulatedPrice(item.cryptoId);
  const totalValue = item.amount * currentPrice;
  const totalCost = item.amount * item.buyPrice;
  const profit = totalValue - totalCost;
  const profitPercentage = (profit / totalCost) * 100;
  
  const portfolioItem = document.createElement('div');
  portfolioItem.classList.add('portfolio-item');
  portfolioItem.dataset.id = item.id;
  
  const profitClass = profit >= 0 ? 'positive' : 'negative';
  
  portfolioItem.innerHTML = `
    <div class="portfolio-item-header">
      <div class="portfolio-item-name">
        <img src="${item.image}" alt="${item.cryptoName}" onerror="this.src='assets/icons/logo.png'">
        <span>${item.cryptoName}</span>
      </div>
      <div class="portfolio-item-amount">${item.amount} ${item.cryptoId}</div>
    </div>
    <div class="portfolio-item-details">
      <div class="portfolio-item-detail">
        <div class="detail-label">Kaufpreis</div>
        <div class="detail-value">${formatCurrency(item.buyPrice, 'EUR')}</div>
      </div>
      <div class="portfolio-item-detail">
        <div class="detail-label">Aktueller Preis</div>
        <div class="detail-value" data-current-price>${formatCurrency(currentPrice, 'EUR')}</div>
      </div>
      <div class="portfolio-item-detail">
        <div class="detail-label">Kaufdatum</div>
        <div class="detail-value">${formatDate(item.buyDate)}</div>
      </div>
      <div class="portfolio-item-detail">
        <div class="detail-label">Gesamtwert</div>
        <div class="detail-value" data-total-value>${formatCurrency(totalValue, 'EUR')}</div>
      </div>
    </div>
    <div class="portfolio-item-profit">
      <div class="profit-label">Gewinn/Verlust</div>
      <div class="profit-value ${profitClass}" data-profit>
        ${formatCurrency(profit, 'EUR')} (${profitPercentage.toFixed(2)}%)
      </div>
    </div>
    ${item.notes ? `<div class="portfolio-item-notes">${item.notes}</div>` : ''}
    <div class="portfolio-item-actions">
      <button class="edit" title="Bearbeiten"><i class="fas fa-edit"></i></button>
      <button class="delete" title="Löschen"><i class="fas fa-trash"></i></button>
    </div>
  `;
  
  // Event-Listener für Löschen und Bearbeiten
  portfolioItem.querySelector('.delete').addEventListener('click', () => {
    deletePortfolioItem(item.id);
    portfolioItem.remove();
    updatePortfolioTotalValue();
    updatePortfolioChart();
  });
  
  portfolioItem.querySelector('.edit').addEventListener('click', () => {
    editPortfolioItem(item);
  });
  
  portfolioList.appendChild(portfolioItem);
  
  // Aktualisiere Gesamtwert
  updatePortfolioTotalValue();
}

// Formatiere Datum
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE');
}

// Simuliere Krypto-Preis
function getSimulatedPrice(cryptoId) {
  const basePrices = {
    'BTC': 50000,
    'ETH': 3000,
    'BNB': 500,
    'XRP': 0.8,
    'ADA': 1.2,
    'SOL': 150,
    'DOT': 30
  };
  
  const basePrice = basePrices[cryptoId] || 100;
  // Füge zufällige Schwankung hinzu (±5%)
  const randomFactor = 0.95 + (Math.random() * 0.1);
  return basePrice * randomFactor;
}

// Aktualisiere Portfolio-Preise
function updatePortfolioPrices() {
  const portfolio = getPortfolio();
  
  if (portfolio.length === 0) return;
  
  try {
    // In einer echten Anwendung würde hier ein API-Aufruf erfolgen
    // Da wir keine echte API verwenden, simulieren wir die Aktualisierung
    
    portfolio.forEach(item => {
      // Simuliere aktuellen Preis
      const currentPrice = getSimulatedPrice(item.cryptoId);
      item.currentPrice = currentPrice;
      
      // Aktualisiere die Anzeige
      const portfolioItem = document.querySelector(`.portfolio-item[data-id="${item.id}"]`);
      if (portfolioItem) {
        const totalValue = item.amount * currentPrice;
        const totalCost = item.amount * item.buyPrice;
        const profit = totalValue - totalCost;
        const profitPercentage = (profit / totalCost) * 100;
        
        portfolioItem.querySelector('[data-current-price]').textContent = formatCurrency(currentPrice, 'EUR');
        portfolioItem.querySelector('[data-total-value]').textContent = formatCurrency(totalValue, 'EUR');
        
        const profitElement = portfolioItem.querySelector('[data-profit]');
        profitElement.textContent = `${formatCurrency(profit, 'EUR')} (${profitPercentage.toFixed(2)}%)`;
        profitElement.classList.remove('positive', 'negative');
        profitElement.classList.add(profit >= 0 ? 'positive' : 'negative');
      }
    });
    
    // Speichere aktualisiertes Portfolio
    localStorage.setItem('weblandCryptoPortfolio', JSON.stringify(portfolio));
    
    // Aktualisiere Gesamtwert
    updatePortfolioTotalValue();
    
    // Aktualisiere Chart
    updatePortfolioChart();
    
    // Plane nächste Aktualisierung
    setTimeout(updatePortfolioPrices, 60000);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Portfolio-Preise:', error);
  }
}

// Aktualisiere Gesamtwert des Portfolios
function updatePortfolioTotalValue() {
  const portfolio = getPortfolio();
  
  if (portfolio.length === 0) {
    portfolioTotalValue.textContent = formatCurrency(0, 'EUR');
    return;
  }
  
  let totalValue = 0;
  
  portfolio.forEach(item => {
    const currentPrice = item.currentPrice || getSimulatedPrice(item.cryptoId);
    totalValue += item.amount * currentPrice;
  });
  
  portfolioTotalValue.textContent = formatCurrency(totalValue, 'EUR');
}

// Lösche Portfolio-Element
function deletePortfolioItem(id) {
  let portfolio = getPortfolio();
  portfolio = portfolio.filter(item => item.id !== id);
  localStorage.setItem('weblandCryptoPortfolio', JSON.stringify(portfolio));
}

// Bearbeite Portfolio-Element
function editPortfolioItem(item) {
  // Fülle das Formular mit den vorhandenen Daten
  portfolioCryptoSelect.value = item.cryptoId;
  portfolioAmountInput.value = item.amount;
  portfolioBuyPriceInput.value = item.buyPrice;
  portfolioBuyDateInput.value = item.buyDate;
  portfolioNotesInput.value = item.notes || '';
  
  // Ändere den Formular-Submit-Handler für die Bearbeitung
  const originalSubmitHandler = portfolioForm.onsubmit;
  
  portfolioForm.onsubmit = (e) => {
    e.preventDefault();
    
    const updatedItem = {
      ...item,
      cryptoId: portfolioCryptoSelect.value,
      cryptoName: portfolioCryptoSelect.options[portfolioCryptoSelect.selectedIndex].text,
      amount: parseFloat(portfolioAmountInput.value),
      buyPrice: parseFloat(portfolioBuyPriceInput.value),
      buyDate: portfolioBuyDateInput.value,
      notes: portfolioNotesInput.value.trim()
    };
    
    // Aktualisiere im Local Storage
    const portfolio = getPortfolio();
    const itemIndex = portfolio.findIndex(i => i.id === item.id);
    if (itemIndex !== -1) {
      portfolio[itemIndex] = updatedItem;
      localStorage.setItem('weblandCryptoPortfolio', JSON.stringify(portfolio));
      
      // Aktualisiere die Anzeige
      const portfolioItem = document.querySelector(`.portfolio-item[data-id="${item.id}"]`);
      if (portfolioItem) {
        portfolioItem.remove();
        addPortfolioItemToList(updatedItem);
      }
    }
    
    // Schließe Modal und setze den Original-Handler zurück
    closePortfolioModal();
    portfolioForm.onsubmit = originalSubmitHandler;
  };
  
  // Öffne das Modal
  portfolioModal.classList.add('active');
  
  // Wenn das Modal geschlossen wird, setze den Original-Handler zurück
  const resetHandler = () => {
    portfolioForm.onsubmit = originalSubmitHandler;
  };
  
  portfolioModalClose.addEventListener('click', resetHandler, { once: true });
  cancelPortfolioBtn.addEventListener('click', resetHandler, { once: true });
}

// Aktualisiere Portfolio-Chart
function updatePortfolioChart() {
  const portfolio = getPortfolio();
  
  if (portfolio.length === 0) {
    // Wenn kein Chart-Element vorhanden ist, erstelle einen leeren Chart
    if (!window.portfolioChartInstance) {
      // Hier würde normalerweise ein Chart erstellt werden
      // Da wir keine Chart-Bibliothek eingebunden haben, zeigen wir eine Nachricht an
      portfolioChart.innerHTML = '<div class="empty-state">Füge Positionen hinzu, um dein Portfolio-Chart zu sehen.</div>';
    }
    return;
  }
  
  // Gruppiere Portfolio nach Kryptowährungen
  const portfolioData = {};
  let totalValue = 0;
  
  portfolio.forEach(item => {
    const currentPrice = item.currentPrice || getSimulatedPrice(item.cryptoId);
    const value = item.amount * currentPrice;
    totalValue += value;
    
    if (portfolioData[item.cryptoId]) {
      portfolioData[item.cryptoId].value += value;
    } else {
      portfolioData[item.cryptoId] = {
        name: item.cryptoName,
        value: value
      };
    }
  });
  
  // Berechne Prozentsätze
  Object.keys(portfolioData).forEach(key => {
    portfolioData[key].percentage = (portfolioData[key].value / totalValue) * 100;
  });
  
  // Hier würde normalerweise ein Chart erstellt werden
  // Da wir keine Chart-Bibliothek eingebunden haben, zeigen wir eine Textdarstellung an
  
  let chartHtml = '<div class="portfolio-distribution">';
  chartHtml += '<h4>Portfolio-Verteilung</h4>';
  chartHtml += '<div class="distribution-bars">';
  
  Object.keys(portfolioData).forEach(key => {
    const data = portfolioData[key];
    chartHtml += `
      <div class="distribution-item">
        <div class="distribution-label">${data.name}</div>
        <div class="distribution-bar-container">
          <div class="distribution-bar" style="width: ${data.percentage}%"></div>
        </div>
        <div class="distribution-value">${data.percentage.toFixed(1)}%</div>
      </div>
    `;
  });
  
  chartHtml += '</div></div>';
  
  portfolioChart.innerHTML = chartHtml;
  }

// Benachrichtigungsberechtigungen anfordern
if ('Notification' in window) {
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
} 