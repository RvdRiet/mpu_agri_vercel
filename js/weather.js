/**
 * Weather page — WeatherAPI.com integration with mock fallback.
 */
(function () {
  'use strict';

  var API_KEY = 'b98f7f0765e247c695a125709261802';
  var BASE_URL = 'https://api.weatherapi.com/v1';

  var LOCATION_MAP = {
    'nelspruit':     'Nelspruit, South Africa',
    'white-river':   'White River, Mpumalanga',
    'barberton':     'Barberton, South Africa',
    'ermelo':        'Ermelo, South Africa',
    'standerton':    'Standerton, South Africa',
    'secunda':       'Secunda, South Africa',
    'lydenburg':     'Lydenburg, South Africa',
    'sabie':         'Sabie, Mpumalanga',
    'hazyview':      'Hazyview, South Africa',
    'komatipoort':   'Komatipoort, South Africa',
    'malelane':      'Malelane, South Africa',
    'bethal':        'Bethal, South Africa',
    'middelburg':    'Middelburg, Mpumalanga',
    'witbank':       'Witbank, South Africa',
    'piet-retief':   'Piet Retief, South Africa',
    'volksrust':     'Volksrust, South Africa'
  };

  var MOCK_WEATHER = {
    'nelspruit':     { temp: 28, rain: 8,  humidity: 72, wind: 12, condition: 'Partly cloudy' },
    'white-river':   { temp: 27, rain: 10, humidity: 68, wind: 14, condition: 'Partly cloudy' },
    'barberton':     { temp: 26, rain: 5,  humidity: 65, wind: 16, condition: 'Sunny' },
    'ermelo':        { temp: 22, rain: 15, humidity: 58, wind: 20, condition: 'Cloudy' },
    'standerton':    { temp: 23, rain: 12, humidity: 62, wind: 18, condition: 'Partly cloudy' },
    'secunda':       { temp: 21, rain: 18, humidity: 55, wind: 22, condition: 'Overcast' },
    'lydenburg':     { temp: 24, rain: 6,  humidity: 60, wind: 15, condition: 'Sunny' },
    'sabie':         { temp: 23, rain: 14, humidity: 70, wind: 10, condition: 'Light rain' },
    'hazyview':      { temp: 29, rain: 7,  humidity: 75, wind: 8,  condition: 'Partly cloudy' },
    'komatipoort':   { temp: 32, rain: 4,  humidity: 78, wind: 6,  condition: 'Sunny' },
    'malelane':      { temp: 30, rain: 6,  humidity: 76, wind: 9,  condition: 'Sunny' },
    'bethal':        { temp: 22, rain: 11, humidity: 57, wind: 19, condition: 'Cloudy' },
    'middelburg':    { temp: 21, rain: 16, humidity: 54, wind: 21, condition: 'Overcast' },
    'witbank':       { temp: 20, rain: 14, humidity: 52, wind: 23, condition: 'Partly cloudy' },
    'piet-retief':   { temp: 24, rain: 9,  humidity: 64, wind: 17, condition: 'Sunny' },
    'volksrust':     { temp: 23, rain: 13, humidity: 59, wind: 18, condition: 'Partly cloudy' }
  };

  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  var select = document.getElementById('locationSelect');
  var btn = document.getElementById('getWeatherBtn');
  var tempEl = document.getElementById('weatherTemp');
  var rainEl = document.getElementById('weatherRain');
  var humidityEl = document.getElementById('weatherHumidity');
  var windEl = document.getElementById('weatherWind');
  var conditionEl = document.getElementById('weatherCondition');
  var conditionIcon = document.getElementById('weatherCondIcon');
  var locationLabel = document.getElementById('weatherLocationLabel');
  var forecastBody = document.getElementById('forecastBody');
  var statusBanner = document.getElementById('weatherStatus');
  var lastUpdated = document.getElementById('weatherLastUpdated');

  function setLoading(on) {
    if (btn) {
      btn.disabled = on;
      btn.textContent = on ? 'Loading...' : 'Get Weather';
    }
  }

  function showStatus(msg, type) {
    if (!statusBanner) return;
    statusBanner.className = 'info-banner info-banner--' + (type || 'info');
    statusBanner.textContent = msg;
    statusBanner.hidden = false;
  }

  function hideStatus() {
    if (statusBanner) statusBanner.hidden = true;
  }

  function updateDisplay(data) {
    if (tempEl) tempEl.textContent = Math.round(data.temp) + '°C';
    if (rainEl) rainEl.textContent = data.rain + 'mm';
    if (humidityEl) humidityEl.textContent = data.humidity + '%';
    if (windEl) windEl.textContent = Math.round(data.wind) + ' km/h';
    if (conditionEl) conditionEl.textContent = data.condition || '';
    if (conditionIcon && data.icon) {
      conditionIcon.innerHTML = '<img src="' + data.icon + '" alt="" style="width:48px;height:48px;">';
    }
  }

  function updateForecast(days) {
    if (!forecastBody || !days) return;
    forecastBody.innerHTML = days.map(function (d) {
      var icon = d.icon ? '<img src="' + d.icon + '" alt="" style="width:24px;height:24px;vertical-align:middle;margin-right:6px;">' : '';
      return '<tr>' +
        '<td>' + d.day + '</td>' +
        '<td>' + icon + d.cond + '</td>' +
        '<td>' + Math.round(d.high) + '°C</td>' +
        '<td>' + Math.round(d.low) + '°C</td>' +
        '<td>' + d.rain + 'mm</td>' +
      '</tr>';
    }).join('');
  }

  function fetchFromAPI(locationId) {
    var query = LOCATION_MAP[locationId] || locationId;
    var url = BASE_URL + '/forecast.json?key=' + API_KEY + '&q=' + encodeURIComponent(query) + '&days=5&aqi=no';

    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('API responded with status ' + res.status);
        return res.json();
      })
      .then(function (json) {
        var current = json.current;
        var forecast = json.forecast && json.forecast.forecastday;

        var weatherData = {
          temp: current.temp_c,
          rain: current.precip_mm,
          humidity: current.humidity,
          wind: current.wind_kph,
          condition: current.condition.text,
          icon: 'https:' + current.condition.icon,
          feelsLike: current.feelslike_c,
          uv: current.uv
        };

        var forecastDays = [];
        if (forecast) {
          forecast.forEach(function (fd) {
            var dt = new Date(fd.date + 'T12:00:00');
            forecastDays.push({
              day: DAY_NAMES[dt.getDay()],
              cond: fd.day.condition.text,
              icon: 'https:' + fd.day.condition.icon,
              high: fd.day.maxtemp_c,
              low: fd.day.mintemp_c,
              rain: fd.day.totalprecip_mm
            });
          });
        }

        return { weather: weatherData, forecast: forecastDays, location: json.location.name };
      });
  }

  function useMockData(locationId) {
    var data = MOCK_WEATHER[locationId] || MOCK_WEATHER['nelspruit'];
    updateDisplay(data);
    updateForecast([
      { day: 'Today', cond: data.condition, high: data.temp + 2, low: data.temp - 8, rain: data.rain, icon: '' },
      { day: 'Tomorrow', cond: 'Partly cloudy', high: data.temp + 1, low: data.temp - 7, rain: Math.round(data.rain * 0.5), icon: '' },
      { day: '+2 days', cond: 'Sunny', high: data.temp + 3, low: data.temp - 6, rain: 0, icon: '' },
      { day: '+3 days', cond: 'Scattered showers', high: data.temp - 1, low: data.temp - 9, rain: Math.round(data.rain * 1.5), icon: '' },
      { day: '+4 days', cond: 'Partly cloudy', high: data.temp, low: data.temp - 8, rain: Math.round(data.rain * 0.3), icon: '' }
    ]);
    showStatus('Showing offline sample data. Live weather data could not be loaded.', 'warning');
  }

  function loadWeather() {
    var locationId = (select && select.value) ? select.value : 'nelspruit';
    setLoading(true);
    hideStatus();

    if (locationLabel) {
      var selectedOpt = select && select.options[select.selectedIndex];
      locationLabel.textContent = selectedOpt ? selectedOpt.textContent : locationId;
    }

    fetchFromAPI(locationId)
      .then(function (result) {
        updateDisplay(result.weather);
        updateForecast(result.forecast);
        if (locationLabel && result.location) locationLabel.textContent = result.location;
        if (lastUpdated) lastUpdated.textContent = 'Last updated: ' + new Date().toLocaleTimeString('en-ZA');
        hideStatus();
      })
      .catch(function () {
        useMockData(locationId);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  if (btn) btn.addEventListener('click', loadWeather);
  if (select) select.addEventListener('change', loadWeather);

  loadWeather();

  if (typeof IntersectionObserver !== 'undefined') {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
})();
