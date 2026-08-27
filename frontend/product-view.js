const API_BASE_URL = "http://127.0.0.1:8000"; // Adjust to your backend URL
const STORE_WHATSAPP_NUMBER = "212600000000"; // Replace with store owner's phone number

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    showError();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pcs/article/${productId}`);
    if (!response.ok) throw new Error("Product fetch failed");

    const product = await response.json();
    renderProduct(product);
  } catch (error) {
    console.error("Error loading product:", error);
    showError();
  }
});

function renderProduct(product) {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('productWrapper').classList.remove('hidden');

  // Title & Metadata
  document.title = `${product.name} | Apex Hardware`;
  document.getElementById('productTitle').textContent = product.name;
  document.getElementById('productPrice').textContent = `${product.price} MAD`;
  document.getElementById('productDescription').textContent = product.description || "No specific details provided for this hardware.";

  // Image Handling
  const imgElement = document.getElementById('productImg');
  const imagePath = product.image || 'images/default.png';
  imgElement.src = imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}/${imagePath}`;
  imgElement.alt = product.name;

  // Stock Badge
  const isAvailable = (product.is_available ?? product.is_avaible) === 1;
  const stockBadge = document.getElementById('stockBadge');
  stockBadge.textContent = isAvailable ? 'In Stock' : 'Out of Stock';
  stockBadge.className = `tag ${isAvailable ? 'tag-blue' : 'tag-red'}`;

  // WhatsApp Button Link Construction
  const whatsappBtn = document.getElementById('whatsappOrderBtn');
  
  if (isAvailable) {
    const message = `Hello ApexPC! I am interested in ordering this hardware:\n\n` +
                    `🖥️ *Product:* ${product.name}\n` +
                    `💰 *Price:* ${product.price} MAD\n` +
                    `🆔 *Product ID:* #${product.id}\n\n` +
                    `Is this item currently available for delivery?`;

    whatsappBtn.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  } else {
    whatsappBtn.textContent = 'Out of Stock - Inquire via WhatsApp';
    whatsappBtn.style.backgroundColor = '#6b7280';
    const message = `Hello ApexPC! I saw that *${product.name}* (ID: #${product.id}) is out of stock. Do you know when it will be available again?`;
    whatsappBtn.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }
}

function showError() {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('errorState').classList.remove('hidden');
}