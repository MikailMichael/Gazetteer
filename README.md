# 🌍 Gazetteer

A responsive and interactive web app that allows users to explore countries across the globe. It fetches live data from multiple APIs to display information such as population, capital city, flags, timezones, weather, currency, news and more — all in a sleek, user-friendly UI

## 🔎 Features

- 🌐 Browse and search for countries using a dropdown menu with autocomplete input
- 🏙️ View key data: capital city, population, flag, currency, region and more
- 🌤️ Real-time weather data for each country’s capital
- 🗺️ Interactive map powered by Leaflet.js with country markers
- 📰 Real-time news data for each country
- 💵 Up-to-date exchange rates for each currency to the USD
- 📡 Data fetched from multiple APIs:
  - [RapidAPICountriesCities API](https://rapidapi.com/natkapral/api/countries-cities/details)
  - [OpenCage API](https://opencagedata.com/api)
  - [GeoNames API](https://www.geonames.org/)
  - [NewsData API](https://newsdata.io/)
  - [OpenExchangeRates API](https://openexchangerates.org/)
  - [OpenWeatherMap API](https://openweathermap.org/)
 
## 📷 Demo

//GIF HERE//

## 🛠️ Tech Stack

- **HTML5**, **CSS3**, **Bootstrap** for Frontend structure and styling
- **JavaScript (ES6)**, **jQuery/AJAX** for main logic and function of the web app
- **Leaflet.js** for map rendering
- **REST APIs** for dynamic country, currency exchange and weather data
- **Fetch API** for asynchronous calls
- **PHP cURL** integration for API requests, and handling backend

## 🖼️ Screenshots

### Country Info View
//SCREENSHOT HERE//

### Weather View
//SCREENSHOT HERE//

## 🚀 Getting Started

To run this project locally:

1. Clone the repo by opening the terminal and entering the command
   `git clone https://github.com/MikailMichael/Gazetteer.git`

2. Navigate into the project folder using the terminal
   `cd Gazetteer`

3. Install Node & Compuser packages
    `npm install`
    `composer install`

4. Copy the sample environment file:

> ⚠️ This project uses PHP, so you may need to run it via a local server (e.g., XAMPP or PHP’s built-in server).