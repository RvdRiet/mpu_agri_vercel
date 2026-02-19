(function () {
  'use strict';

  var RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';

  var FEEDS = [
    {
      url: 'https://www.farmersweekly.co.za/feed/',
      id: 'fw',
      name: "Farmer's Weekly",
      site: 'https://www.farmersweekly.co.za'
    },
    {
      url: 'https://www.foodformzansi.co.za/feed/',
      id: 'ffm',
      name: 'Food For Mzansi',
      site: 'https://www.foodformzansi.co.za'
    },
    {
      url: 'https://www.africanfarming.com/feed/',
      id: 'af',
      name: 'African Farming',
      site: 'https://www.africanfarming.com'
    },
    {
      url: 'https://www.ndmc.gov.za/feed/',
      id: 'ndmc',
      name: 'National Disaster Management Centre',
      site: 'https://www.ndmc.gov.za',
      farmingOnly: true
    },
    {
      url: 'https://workingonfire.org/feed/',
      id: 'wof',
      name: 'Working on Fire',
      site: 'https://workingonfire.org',
      farmingOnly: true
    }
  ];

  var CATEGORY_KEYWORDS = {
    crop: [
      'crop', 'maize', 'wheat', 'sorghum', 'soybean', 'sunflower', 'sugarcane',
      'citrus', 'avocado', 'mango', 'fruit', 'vegetable', 'potato', 'tomato',
      'harvest', 'planting', 'seed', 'grain', 'cereal', 'horticulture',
      'vineyard', 'wine', 'orchard', 'macadamia', 'pecan', 'nut', 'no-till',
      'conservation agriculture', 'fertiliser', 'fertilizer', 'herbicide',
      'pesticide', 'fungicide', 'weed', 'canola', 'barley', 'oats', 'cotton',
      'groundnut', 'bean', 'legume', 'cabbage', 'onion', 'banana', 'litchi'
    ],
    livestock: [
      'livestock', 'cattle', 'beef', 'dairy', 'cow', 'bull', 'calf', 'calves',
      'sheep', 'lamb', 'wool', 'goat', 'pig', 'pork', 'poultry', 'chicken',
      'broiler', 'layer', 'egg', 'rabbit', 'aquaculture', 'fish', 'tilapia',
      'feedlot', 'abattoir', 'slaughter', 'meat', 'weaner', 'stud',
      'breeding', 'auction', 'kraal', 'grazing', 'pasture', 'fodder',
      'silage', 'hay', 'mohair', 'angora', 'dorper', 'bonsmara', 'nguni',
      'boer goat', 'merino', 'herd', 'flock'
    ],
    disease: [
      'disease', 'outbreak', 'fmd', 'foot-and-mouth', 'foot and mouth',
      'african swine fever', 'asf', 'avian influenza', 'bird flu', 'newcastle',
      'lumpy skin', 'anthrax', 'brucellosis', 'rift valley fever', 'rvf',
      'bluetongue', 'blue tongue', 'armyworm', 'fall armyworm', 'locust',
      'pest', 'infestation', 'blight', 'rust', 'fungal', 'virus', 'bacterial',
      'parasite', 'tick', 'worm', 'mastitis', 'quarantine', 'biosecurity',
      'vaccination', 'epidemic', 'pandemic', 'alert', 'warning', 'risk',
      'threat', 'stalk borer', 'quelea', 'sclerotinia', 'phytophthora'
    ],
    weather: [
      'drought', 'flood', 'flooding', 'hail', 'frost', 'heat wave', 'heatwave',
      'cold front', 'storm', 'cyclone', 'el nino', 'el niño', 'la nina',
      'la niña', 'rainfall', 'rain', 'dry spell', 'water shortage', 'dam level',
      'dam levels', 'irrigation', 'water restriction', 'climate change',
      'climate', 'weather', 'temperature', 'wind', 'fire', 'veld fire',
      'wildfire', 'snow', 'disaster', 'disaster management', 'emergency',
      'early warning', 'relief', 'response', 'firefighter', 'firefighting'
    ]
  };

  var MPUMALANGA_KEYWORDS = [
    'mpumalanga', 'nelspruit', 'mbombela', 'ermelo', 'bethal', 'standerton',
    'middelburg', 'witbank', 'emalahleni', 'secunda', 'carolina', 'barberton',
    'komatipoort', 'malelane', 'white river', 'hazyview', 'sabie', 'graskop',
    'lydenburg', 'mashishing', 'burgersfort', 'piet retief', 'volksrust',
    'hendrina', 'delmas', 'balfour', 'gert sibande', 'ehlanzeni',
    'nkangala', 'lowveld', 'highveld', 'bushveld', 'kruger',
    'inkomati', 'crocodile river', 'komati'
  ];

  var allArticles = [];
  var currentFilter = 'all';
  var searchQuery = '';
  var feedsLoaded = 0;
  var feedsFailed = 0;

  function isMpumalangaRelated(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < MPUMALANGA_KEYWORDS.length; i++) {
      if (lower.indexOf(MPUMALANGA_KEYWORDS[i]) !== -1) return true;
    }
    return false;
  }

  function classifyArticle(title, snippet) {
    var text = (title + ' ' + snippet).toLowerCase();
    var scores = { crop: 0, livestock: 0, disease: 0, weather: 0 };

    Object.keys(CATEGORY_KEYWORDS).forEach(function (cat) {
      CATEGORY_KEYWORDS[cat].forEach(function (kw) {
        if (text.indexOf(kw) !== -1) scores[cat]++;
      });
    });

    var best = 'general';
    var bestScore = 0;
    Object.keys(scores).forEach(function (cat) {
      if (scores[cat] > bestScore) {
        bestScore = scores[cat];
        best = cat;
      }
    });

    if (scores.disease > 0 && scores.disease >= bestScore) {
      best = 'disease';
    }

    return bestScore > 0 ? best : 'general';
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html || '';
    return tmp.textContent || tmp.innerText || '';
  }

  function truncate(str, len) {
    str = str.replace(/\s+/g, ' ').trim();
    if (str.length <= len) return str;
    return str.substring(0, len).replace(/\s+\S*$/, '') + '...';
  }

  function relativeTime(dateStr) {
    try {
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      var now = new Date();
      var diff = Math.floor((now - d) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
      if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
      if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
      return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  function formatDate(dateStr) {
    try {
      var d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  var CATEGORY_LABELS = {
    crop: { icon: '&#127806;', label: 'Crop', cls: 'crop' },
    livestock: { icon: '&#128004;', label: 'Livestock', cls: 'livestock' },
    disease: { icon: '&#9888;', label: 'Disease & Pest', cls: 'disease' },
    weather: { icon: '&#127782;', label: 'Weather', cls: 'weather' },
    general: { icon: '&#128240;', label: 'General', cls: 'general' }
  };

  function buildCard(article) {
    var cat = CATEGORY_LABELS[article.category] || CATEGORY_LABELS.general;
    var sourceClass = 'alert-card__source--' + article.sourceId;

    var mpBadge = article.mpumalanga
      ? '<span class="alert-card__category alert-card__category--mpumalanga">&#128205; Mpumalanga</span>'
      : '';

    return '<div class="alert-card" data-category="' + article.category + '" data-mp="' + (article.mpumalanga ? '1' : '0') + '">' +
      '<div class="alert-card__header">' +
        '<span class="alert-card__source ' + sourceClass + '">' + article.sourceName + '</span>' +
        '<span class="alert-card__category alert-card__category--' + cat.cls + '">' + cat.icon + ' ' + cat.label + '</span>' +
        mpBadge +
        '<span class="alert-card__date" title="' + formatDate(article.date) + '">' + relativeTime(article.date) + '</span>' +
      '</div>' +
      '<h3 class="alert-card__title"><a href="' + article.link + '" target="_blank" rel="noopener">' + article.title + '</a></h3>' +
      '<p class="alert-card__snippet">' + article.snippet + '</p>' +
      '<div class="alert-card__footer">' +
        '<a href="' + article.link + '" target="_blank" rel="noopener" class="alert-card__read-more">Read full article &#8594;</a>' +
        '<span class="alert-card__attribution">Source: ' + article.sourceName + '</span>' +
      '</div>' +
    '</div>';
  }

  function updateCounts() {
    var counts = { all: allArticles.length, mpumalanga: 0, crop: 0, livestock: 0, disease: 0, weather: 0, general: 0 };
    allArticles.forEach(function (a) {
      if (counts[a.category] !== undefined) counts[a.category]++;
      if (a.mpumalanga) counts.mpumalanga++;
    });
    Object.keys(counts).forEach(function (key) {
      var el = document.getElementById('count-' + key);
      if (el) el.textContent = counts[key];
    });
  }

  function renderArticles() {
    var container = document.getElementById('alertsContainer');
    if (!container) return;

    var filtered = allArticles.filter(function (a) {
      if (currentFilter === 'mpumalanga' && !a.mpumalanga) return false;
      if (currentFilter !== 'all' && currentFilter !== 'mpumalanga' && a.category !== currentFilter) return false;
      if (searchQuery) {
        var text = (a.title + ' ' + a.snippet + ' ' + a.sourceName).toLowerCase();
        return text.indexOf(searchQuery) !== -1;
      }
      return true;
    });

    if (filtered.length === 0) {
      var msg = allArticles.length === 0
        ? 'No articles could be loaded. Please check your internet connection and try again.'
        : 'No articles match the current filter. Try a different category or search term.';
      container.innerHTML = '<div class="alerts-empty"><div class="alerts-empty__icon">&#128240;</div><p>' + msg + '</p></div>';
      return;
    }

    var html = '<div class="alerts-grid">';
    filtered.forEach(function (a) {
      html += buildCard(a);
    });
    html += '</div>';
    container.innerHTML = html;
  }

  function updateStatus(msg, state) {
    var el = document.getElementById('feedStatus');
    if (!el) return;
    var dotClass = state === 'ok' ? 'dot' : state === 'error' ? 'dot dot--error' : 'dot dot--loading';
    el.innerHTML = '<span class="' + dotClass + '"></span> ' + msg;
  }

  function fetchFeed(feed, callback) {
    var url = RSS2JSON_BASE + encodeURIComponent(feed.url);

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status !== 'ok' || !data.items) {
          callback([], feed);
          return;
        }
        var articles = data.items.map(function (item) {
          var rawText = stripHtml(item.description || item.content || '');
          var snippet = truncate(rawText, 200);
          var title = stripHtml(item.title || '');
          var fullText = title + ' ' + rawText;
          var category = classifyArticle(title, snippet);
          return {
            title: title,
            link: item.link || '',
            date: item.pubDate || '',
            snippet: snippet,
            sourceId: feed.id,
            sourceName: feed.name,
            category: category,
            mpumalanga: isMpumalangaRelated(fullText)
          };
        });
        if (feed.farmingOnly) {
          articles = articles.filter(function (a) {
            return a.category !== 'general';
          });
        }
        callback(articles, feed);
      })
      .catch(function () {
        callback([], feed);
      });
  }

  function onFeedLoaded(articles, feed) {
    if (articles.length > 0) {
      feedsLoaded++;
      allArticles = allArticles.concat(articles);
    } else {
      feedsFailed++;
    }

    var totalDone = feedsLoaded + feedsFailed;

    if (totalDone < FEEDS.length) {
      updateStatus('Loading feeds... (' + totalDone + '/' + FEEDS.length + ')', 'loading');
      return;
    }

    allArticles.sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });

    updateCounts();

    if (feedsLoaded === 0) {
      updateStatus('Could not load feeds — showing cached or no results', 'error');
    } else if (feedsFailed > 0) {
      updateStatus(allArticles.length + ' articles from ' + feedsLoaded + '/' + FEEDS.length + ' sources (updated ' + new Date().toLocaleTimeString('en-ZA') + ')', 'ok');
    } else {
      updateStatus(allArticles.length + ' articles from ' + FEEDS.length + ' sources (updated ' + new Date().toLocaleTimeString('en-ZA') + ')', 'ok');
    }

    renderArticles();
  }

  function loadAllFeeds() {
    allArticles = [];
    feedsLoaded = 0;
    feedsFailed = 0;
    updateStatus('Loading feeds...', 'loading');

    var container = document.getElementById('alertsContainer');
    if (container) {
      container.innerHTML =
        '<div class="alerts-loading">' +
          '<div class="alerts-loading__spinner"></div>' +
          '<p class="alerts-loading__text">Fetching latest farming news from Farmer\'s Weekly, Food For Mzansi, African Farming, NDMC, and Working on Fire...</p>' +
        '</div>';
    }

    FEEDS.forEach(function (feed) {
      fetchFeed(feed, onFeedLoaded);
    });
  }

  function initFilters() {
    var pills = document.querySelectorAll('.filter-pill');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        currentFilter = pill.getAttribute('data-filter');
        renderArticles();
      });
    });

    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      var debounce;
      searchInput.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(function () {
          searchQuery = searchInput.value.toLowerCase().trim();
          renderArticles();
        }, 300);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFilters();
    loadAllFeeds();

    setInterval(loadAllFeeds, 30 * 60 * 1000);
  });
})();
