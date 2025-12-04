const form = document.getElementById('form');
const search = document.getElementById('search');
const result = document.getElementById('result');
const more = document.getElementById('more');

const apiURL = 'https://api.lyrics.ovh';

// Search by song or artist
async function searchSongs(term) {
  try {
    const res = await fetch(`${apiURL}/suggest/${term}`);
    
    if (!res.ok) {
      throw new Error('Failed to search songs');
    }
    
    const data = await res.json();
    showData(data);
  } catch (error) {
    result.innerHTML = '<p>Error searching for songs. Please try again.</p>';
    more.innerHTML = '';
    console.error('Search error:', error);
  }
}

// Show song and artist in DOM (using safe DOM manipulation)
function showData(data) {
  // Clear previous results
  result.innerHTML = '';
  more.innerHTML = '';

  // Check if we have valid data
  if (!data || !data.data || data.data.length === 0) {
    const noResults = document.createElement('p');
    noResults.textContent = 'No songs found. Please try a different search term.';
    result.appendChild(noResults);
    return;
  }

  // Create songs list
  const ul = document.createElement('ul');
  ul.className = 'songs';

  data.data.forEach((song) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    const strong = document.createElement('strong');
    strong.textContent = song.artist.name;
    span.appendChild(strong);
    span.appendChild(document.createTextNode(` - ${song.title}`));
    li.appendChild(span);

    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = 'Get Lyrics';
    button.dataset.artist = song.artist.name;
    button.dataset.songtitle = song.title;

    li.appendChild(button);
    ul.appendChild(li);
  });

  result.appendChild(ul);

  // Handle pagination
  if (data.prev || data.next) {
    if (data.prev) {
      const prevButton = document.createElement('button');
      prevButton.className = 'btn';
      prevButton.textContent = 'Prev';
      prevButton.addEventListener('click', () => getMoreSongs(data.prev));
      more.appendChild(prevButton);
    }

    if (data.next) {
      const nextButton = document.createElement('button');
      nextButton.className = 'btn';
      nextButton.textContent = 'Next';
      nextButton.addEventListener('click', () => getMoreSongs(data.next));
      more.appendChild(nextButton);
    }
  }
}

// Get prev and next songs
async function getMoreSongs(url) {
  try {
    // Handle both relative and absolute URLs
    const fetchUrl = url.startsWith('http') ? url : `${apiURL}${url}`;
    const res = await fetch(fetchUrl);
    
    if (!res.ok) {
      throw new Error('Failed to load more songs');
    }
    
    const data = await res.json();
    showData(data);
  } catch (error) {
    result.innerHTML = '<p>Error loading more songs. Please try again.</p>';
    more.innerHTML = '';
    console.error('Pagination error:', error);
  }
}

// Get lyrics for song (using safe DOM manipulation)
async function getLyrics(artist, songTitle) {
  try {
    const res = await fetch(`${apiURL}/v1/${artist}/${songTitle}`);
    
    if (!res.ok) {
      throw new Error('Lyrics not found');
    }
    
    const data = await res.json();

    // Clear previous results
    result.innerHTML = '';
    more.innerHTML = '';

    if (data.error || !data.lyrics) {
      const errorMessage = document.createElement('p');
      errorMessage.textContent = data.error || 'No lyrics found for this song.';
      result.appendChild(errorMessage);
      return;
    }

    // Create heading
    const heading = document.createElement('h2');
    const strong = document.createElement('strong');
    strong.textContent = artist;
    heading.appendChild(strong);
    heading.appendChild(document.createTextNode(` - ${songTitle}`));
    result.appendChild(heading);

    // Create lyrics block with line breaks
    const span = document.createElement('span');
    const lines = data.lyrics.split(/\r\n|\r|\n/);
    lines.forEach((line, index) => {
      span.appendChild(document.createTextNode(line));
      if (index < lines.length - 1) {
        span.appendChild(document.createElement('br'));
      }
    });

    result.appendChild(span);
  } catch (error) {
    result.innerHTML = '<p>Error fetching lyrics. Please try again.</p>';
    more.innerHTML = '';
    console.error('Lyrics error:', error);
  }
}

// Event listeners
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const searchTerm = search.value.trim();

  if (!searchTerm) {
    alert('Please type in a song or artist');
  } else {
    searchSongs(searchTerm);
  }
});

// Get lyrics button click
result.addEventListener('click', (e) => {
  const clickedEl = e.target;

  if (clickedEl.tagName === 'BUTTON' && clickedEl.dataset.artist) {
    const artist = clickedEl.getAttribute('data-artist');
    const songTitle = clickedEl.getAttribute('data-songtitle');

    getLyrics(artist, songTitle);
  }
});
