const API_BASE_URL = 'http://127.0.0.1:8000';
let products = []
const loginWindow = '/frontend/login'
// Global function so you can call it after Add/Edit/Delete actions
async function loadProducts() {
  try {
    const resp = await authFetch(`${API_BASE_URL}/pcs/all`);
    
    // Check ok status BEFORE trying to parse JSON
    if (!resp.ok) throw new Error("Product fetch failed");
    
    products = await resp.json();
    display(products);

  } catch (error) {
    alert('Server error: Could not load products');
  }
}

function display(data) {
  const total = document.getElementById('statTotal')
  const online = document.getElementById('statInStock')
  const offline = document.getElementById('statOutOfStock')
  total.innerText = products.length
  online.innerText = products.filter(product => product.is_available === 1).length
  offline.innerText = products.filter(product => product.is_available === 0).length











  const tbody = document.getElementById('inventoryTableBody');
  tbody.innerHTML = '';

  data.forEach(element => {
    const row = document.createElement('tr');
    
    // Notice data-id added to buttons
    row.innerHTML = `
      <td>#${element.id}</td>
      <td>
        <img src="${API_BASE_URL}/${element.image}" class="table-thumb" alt="${element.name}">
      </td>
      <td class="font-bold">${element.name}</td>
      <td><span class="type-badge">${element.pc_type}</span></td>
      <td>${element.price} MAD</td>
      <td>
        <span>
          ${element.is_available === 1 ? 'In Stock' : 'Out Of Stock'}
        </span>
      </td>
      <td class="text-right">
        <button class="btn-action btn-edit" data-id="${element.id}" title="Edit Product" onclick="openEdit(${element.id})">✏️ Edit</button>
        <button class="btn-action btn-delete" data-id="${element.id}" title="Delete Product"> 🗑️ Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
  
}

(async function () {
  const token = sessionStorage.getItem('adminToken');

  if (!token) {
    window.location.href = loginWindow;
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/admin/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Invalid token');

    // Token is valid! Now safe to attach DOM events & load products
    loadProducts()

  } catch (err) {
    localStorage.removeItem('token');
    window.location.href = loginWindow;
  }
})();




async function authFetch(url , options={}) {
  
  const token = sessionStorage.getItem('adminToken')

  if (!token){
    window.location.href = loginWindow
  }

  const headers = {...options.headers , 'Authorization' : `Bearer ${token}`}

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    window.location.href = loginWindow;
    throw new Error('Session expired');
    }

  
  return response



}



const logout = document.getElementById('logout')

logout.addEventListener('click' , () => {
  sessionStorage.removeItem('adminToken')
  window.location.href = loginWindow
})
 



const search = document.getElementById('adminSearchInput')



// Add a safety check in case the search bar isn't on the current page
if (search) {
  search.addEventListener('input', () => {
    // .trim() removes leading/trailing spaces
    const query = search.value.toLowerCase().trim();

    const filtered = products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );

    display(filtered);
  });
}
const editModal = document.getElementById('editModal');

async function openEdit(id) {
  try {
    const resp = await authFetch(`${API_BASE_URL}/pcs/article/${id}`);
    
    if (!resp.ok) throw new Error("Product fetch failed");
    
    const data = await resp.json();

    // 1. Inject HTML with populated data
    editModal.innerHTML = `
      <div class="modal-wrapper">
        
        <!-- Modal Header -->
        <div class="modal-header">
          <div>
            <h2 class="modal-title">Edit Product <span id="modalProductIdTag" class="modal-id-badge">#${data.id}</span></h2>
            <p class="modal-subtitle">Modify specifications, inventory status, or pricing.</p>
          </div>
          <button type="button" class="modal-close-btn" id="closeEditModalBtn" aria-label="Close modal">&times;</button>
        </div>

        <!-- Modal Form -->
        <form id="editProductForm" class="modal-body">

          <input type="hidden" id="editProductId" name="id" value="${data.id}">

          <!-- Current Image Preview Banner -->
          <div class="preview-card">
            <img id="editImagePreview" src="${API_BASE_URL}/${data.image}" alt="Product Preview" class="preview-thumb">
            
            <div class="preview-details">
              <span class="preview-label">Active Image</span>
              <span id="editImageName" class="preview-filename">${data.image}</span>
            </div>
          </div>

          <!-- Form Inputs -->
          <div class="form-group">
            <label for="editProductName" class="form-label">Product Name *</label>
            <input type="text" id="editProductName" name="name" class="modal-input" value="${data.name}" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editProductPrice" class="form-label">Price (MAD) *</label>
              <input type="number" id="editProductPrice" name="price" step="0.01" class="modal-input" value="${data.price}" required>
            </div>

            <div class="form-group">
              <label for="editProductType" class="form-label">Category *</label>
              <select id="editProductType" name="pc_type" class="modal-input" required>
                <option value="desktop" ${data.pc_type === 'desktop' ? 'selected' : ''}>Desktop PC</option>
                <option value="laptop" ${data.pc_type === 'laptop' ? 'selected' : ''}>Laptop</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="editProductStock" class="form-label">Availability *</label>
              <select id="editProductStock" name="is_available" class="modal-input" required>
                <option value="1" ${data.is_available == 1 ? 'selected' : ''}>In Stock</option>
                <option value="0" ${data.is_available == 0 ? 'selected' : ''}>Out of Stock</option>
              </select>
            </div>

            <div class="form-group">
              <label for="editProductImage" class="form-label">Replace Image (Optional)</label>
              <input type="file" id="editProductImage" name="image" accept="image/*" class="modal-file-input">
            </div>
          </div>

          <div class="form-group">
            <label for="editProductDescription" class="form-label">Description & Specs *</label>
            <textarea id="editProductDescription" name="description" rows="4" class="modal-input modal-textarea" required>${data.description}</textarea>
          </div>

          <!-- Form Actions -->
          <div class="modal-footer">
            <button type="button" class="btn-cancel" id="cancelEditModalBtn">Cancel</button>
            <button type="submit" class="btn-save">Save Changes</button>
          </div>

        </form>

      </div>
    `;

    // 2. Attach close listeners AFTER the HTML is injected into the DOM
    document.getElementById('closeEditModalBtn').addEventListener('click', () => editModal.close());
    document.getElementById('cancelEditModalBtn').addEventListener('click', () => editModal.close());

    // 3. Open the dialog
    editModal.showModal();

  } catch (error) {
    console.error(error);
    alert('Server error: Could not load product details');
  }
}






// Submit listener for the edit form
document.addEventListener('submit', async (e) => {
  if (e.target && e.target.matches('#editProductForm')) {
    e.preventDefault();

    const form = e.target;
    const productId = document.getElementById('editProductId').value;
    const submitBtn = form.querySelector('.btn-save');

    // Automatically gathers all input values with a `name` attribute
    const formData = new FormData(form);
    // Disable button to prevent double-submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      const response = await authFetch(`${API_BASE_URL}/admin/edit/${productId}`, {
        method: 'POST',
        body: formData // Do NOT add 'Content-Type' header; browser sets multipart/form-data boundary automatically
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();

      // 1. Close the modal
      document.getElementById('editModal').close();

      // 2. Show feedback message
      if (typeof showToast === 'function') {
        showToast(result.message || 'Product updated successfully!');
      } else {
        alert(result.message || 'Product updated successfully!');
      }

      // 3. Refresh the inventory table to show updated data
      if (typeof loadProducts === 'function') {
        loadProducts(); // Call your table refresh function
      }

    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  }
});





// Global click listener for Delete buttons
document.addEventListener('click', async (e) => {
  // Check if the clicked element (or its child) is a delete button
  const deleteBtn = e.target.closest('.btn-delete');

  if (deleteBtn) {
    const productId = deleteBtn.dataset.id; // Reads data-id="${element.id}"

    // 1. Ask for admin confirmation
    const confirmDelete = confirm(`Are you sure you want to delete product #${productId}?`);
    if (!confirmDelete) return;

    // 2. Disable button temporarily
    deleteBtn.disabled = true;

    try {
      // 3. Send POST request to FastAPI backend
      const response = await authFetch(`${API_BASE_URL}/admin/delete/${productId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();
      alert(result.message || 'Product deleted successfully!');

      // 4. Refresh table UI (or remove row directly from DOM)
      if (typeof loadProducts === 'function') {
        loadProducts(); // Call your table refresh function
      } else {
        deleteBtn.closest('tr')?.remove(); // Fallback DOM removal
      }

    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      deleteBtn.disabled = false;
    }
  }
});





document.addEventListener('submit', async (e) => {
  if (e.target && e.target.matches('#productForm')) {
    e.preventDefault();

    const form = e.target;
    // Find whichever button is the submit button inside this form
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('.btn-save');

    const formData = new FormData(form);


    for (let [key, value] of formData.entries()) {
      console.log(key, value);}




    // Disable button to prevent duplicate submissions
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Adding...';
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/admin/add`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();

      // 1. Reset input fields on success
      form.reset();

      // 2. Feedback message
      if (typeof showToast === 'function') {
        showToast(result.message || 'Product added successfully!');
      } else {
        alert(result.message || 'Product added successfully!');
      }

      // 3. Refresh table UI
      if (typeof loadProducts === 'function') {
        loadProducts(); // Call your table refresh function
      } else if (typeof loadProducts === 'function') {
        loadProducts();
      }

    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add product';
      }
    }
  }
});