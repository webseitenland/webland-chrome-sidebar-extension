# Webland Chrome Sidebar Extension project by Webseitenland

**This project was created by [webseitenland.de](https://webseitenland.de/).**

**Project start date:** June 18, 2025

The contents of this project are protected by copyright.  
You may view the code, but copying, modifying, or redistributing it in any form is strictly prohibited.  
For more information, please refer to the `LICENSE` file.

Eine moderne Chrome-Sidebar-Extension mit nützlichen Features für den täglichen Gebrauch.

## Features

- **Notizen**: Erstelle und verwalte Notizen direkt im Browser
- **Lesezeichen**: Speichere und organisiere deine Lieblingswebseiten
- **Aufgaben**: Verwalte deine Aufgaben mit einer einfachen To-Do-Liste
- **Wetter**: Erhalte aktuelle Wetterinformationen für deinen Standort
- **Übersetzer**: Übersetze Texte zwischen verschiedenen Sprachen
- **Dark/Light Mode**: Wechsle zwischen dunklem und hellem Design
- **Suchfunktion**: Durchsuche deine Notizen, Lesezeichen und Aufgaben

## Installation

1. Lade das Repository herunter oder klone es:
   ```
   git clone https://github.com/username/webland-chrome-sidebar-extension.git
   ```

2. Öffne Chrome und navigiere zu `chrome://extensions/`

3. Aktiviere den "Entwicklermodus" in der oberen rechten Ecke

4. Klicke auf "Entpackte Erweiterung laden" und wähle den Ordner des Projekts aus

5. Die Extension sollte nun in Chrome installiert sein und kann verwendet werden

## Verwendung

- Klicke auf das Webland-Icon in der Chrome-Toolbar, um die Sidebar zu öffnen
- Verwende die Navigation, um zwischen den verschiedenen Features zu wechseln
- Klicke auf das Mond/Sonne-Symbol, um zwischen Dark und Light Mode zu wechseln

## API-Keys

Für einige Features (wie Wetter und Übersetzer) werden API-Keys benötigt:

1. Für das Wetter-Feature:
   - Registriere dich bei [OpenWeatherMap](https://openweathermap.org/api)
   - Ersetze `WEATHER_API_KEY` in `src/sidebar.js` mit deinem API-Key

2. Für das Übersetzer-Feature:
   - Implementiere eine Übersetzungs-API deiner Wahl

## Technologien

- HTML5
- CSS3 mit CSS-Variablen für Theming
- Vanilla JavaScript
- Chrome Extension API
- Font Awesome Icons

## Anpassung

Du kannst die Extension nach deinen Wünschen anpassen:

- Ändere die Farbpalette in `css/sidebar.css` unter den `:root`-Variablen
- Füge neue Features hinzu, indem du die HTML-Struktur erweiterst und entsprechende JavaScript-Funktionen implementierst
- Passe die Icons an, indem du die Font Awesome-Klassen in der HTML-Datei änderst

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz - siehe die [LICENSE](LICENSE) Datei für Details.

## Autor

Dein Name - [Deine Website](https://deinewebsite.de)

## Danksagungen

- [Font Awesome](https://fontawesome.com/) für die Icons
- [OpenWeatherMap](https://openweathermap.org/) für die Wetter-API 