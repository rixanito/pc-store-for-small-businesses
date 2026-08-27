
const API_BASE_URL = 'http://127.0.0.1:8000';

// 1. Fetch data from the FastAPI endpoints
async function fetchPCs(endpoint = '/pcs/all') {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch PCs:', error);
    return [];
  }
}





// Helper functions for URL slugs and titles
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w\-]+/g, '');     // Remove all non-word chars
}

function capitalizeWords(str) {
  return str ? str.replace(/\b\w/g, char => char.toUpperCase()) : '';
}

// Display function in your preferred style
// Helper to truncate long descriptions
function truncateText(text, maxLength = 85) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

function displayPc(infos) {
  const feed = document.querySelector('.product-grid');
  if (!feed) return;

  feed.innerHTML = '';

  infos.forEach(element => {
    const image_path = element.image || 'images/default.png';
    const url = slugify(element.name);
    
    // Check both spellings for safety
    const isAvailable = (element.is_available ?? element.is_avaible) === 1; 
    const shortDescription = truncateText(element.description, 85);

    const row = document.createElement('article');
    row.classList.add('card');

    row.innerHTML = `
      <a href="product-view.html?slug=${url}&id=${element.id}" class="card-link">
        <div class="card-image">
          <span class="tag tag-${isAvailable ? 'blue' : 'red'}">
            ${isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
          <img src="${image_path.startsWith('http') ? image_path : API_BASE_URL + '/' + image_path}" onerror="this.src='${API_BASE_URL+'/'}images/default.png'"
           loading="lazy" alt="${element.name}">
        </div>
        <div class="card-content">
          <h2 class="product-title">${element.name}</h2>
          <p class="specs" title="${element.description || ''}">${shortDescription}</p>
          <span class="price">${element.price} MAD</span>
        </div>
      </a>
      
    `;

    feed.appendChild(row);
  });
}






function setupCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-bar .chip');

  filterButtons.forEach(button => {
    button.addEventListener('click', async () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const label = button.textContent.trim().toLowerCase();
      let endpoint = '/pcs/all';

      if (label.includes('gaming') || label.includes('desktop')) {
        endpoint = '/pcs/desktops';
      } else if (label.includes('laptop')) {
        endpoint = '/pcs/laptops';
      }

      const pcs = await fetchPCs(endpoint);
      displayPc(pcs);
    });
  });
}

let products = [];

async function init() {
  setupCategoryFilters();
  products = await fetchPCs('/pcs/all');
  displayPc(products);
}

const search = document.getElementById('search-bar');

// Add a safety check in case the search bar isn't on the current page
if (search) {
  search.addEventListener('input', () => {
    // .trim() removes leading/trailing spaces
    const query = search.value.toLowerCase().trim();

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );

    displayPc(filtered);
  });
}

init();