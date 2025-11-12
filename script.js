// ... rest of your code ...

// DOM Elements
const beatsGrid = document.getElementById('beatsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.querySelector('.cart-count');
const totalAmount = document.querySelector('.total-amount');
const audioPlayerModal = document.getElementById('audioPlayerModal');
const closeModal = document.getElementById('closeModal'); // ✅ Fixed - added initialization

// Complete the rest of your DOM element selections
const audioPlayer = document.getElementById('audioPlayer');
const beatTitle = document.getElementById('beatTitle');
const playPauseBtn = document.getElementById('playPauseBtn');
const genreFilter = document.getElementById('genreFilter');
const sortBy = document.getElementById('sortBy');
const searchInput = document.getElementById('searchInput');
const checkoutBtn = document.getElementById('checkoutBtn');
const emptyCart = document.getElementById('emptyCart');

// Initialize the shop
function initShop() {
  displayBeats(beatsData);
  setupEventListeners();
  updateCartUI();
}

// Display beats in the grid
function displayBeats(beats) {
  beatsGrid.innerHTML = '';
  
  beats.forEach(beat => {
    const beatCard = document.createElement('div');
    beatCard.className = 'beat-card';
    beatCard.innerHTML = `
      <div class="beat-image">
        <img src="${beat.image}" alt="${beat.title}" onerror="this.src='img/beats/placeholder.jpg'">
        ${beat.tags.length > 0 ? `<span class="beat-tag">${beat.tags[0]}</span>` : ''}
        <button class="preview-btn" onclick="previewBeat(${beat.id})">
          <i class="fas fa-play"></i>
        </button>
      </div>
      <div class="beat-info">
        <h3>${beat.title}</h3>
        <div class="beat-meta">
          <span>${beat.genre}</span>
          <span>${beat.bpm} BPM</span>
          <span>${beat.key}</span>
        </div>
        <div class="beat-price">
          <span>$${beat.price}</span>
          <button class="add-to-cart-btn" onclick="addToCart(${beat.id})">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    `;
    beatsGrid.appendChild(beatCard);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Close modal when clicking close button
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      audioPlayerModal.classList.remove('active');
      if (currentBeatPreview) {
        currentBeatPreview.pause();
        currentBeatPreview.currentTime = 0;
      }
    });
  }

  // Close modal when clicking outside
  audioPlayerModal.addEventListener('click', (e) => {
    if (e.target === audioPlayerModal) {
      audioPlayerModal.classList.remove('active');
      if (currentBeatPreview) {
        currentBeatPreview.pause();
        currentBeatPreview.currentTime = 0;
      }
    }
  });

  // Cart event listeners
  if (closeCart) {
    closeCart.addEventListener('click', () => {
      cartSidebar.classList.remove('active');
    });
  }

  // Filter and sort event listeners
  if (genreFilter) {
    genreFilter.addEventListener('change', filterBeats);
  }
  
  if (sortBy) {
    sortBy.addEventListener('change', sortBeats);
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', searchBeats);
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', checkout);
  }
}

// Preview beat function
function previewBeat(beatId) {
  const beat = beatsData.find(b => b.id === beatId);
  if (!beat) return;

  // Set audio source and title
  audioPlayer.src = beat.audio;
  beatTitle.textContent = beat.title;

  // Show modal
  audioPlayerModal.classList.add('active');

  // Store current preview reference
  currentBeatPreview = audioPlayer;
}

// Add to cart function
function addToCart(beatId) {
  const beat = beatsData.find(b => b.id === beatId);
  if (!beat) return;

  const existingItem = cart.find(item => item.id === beatId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...beat,
      quantity: 1
    });
  }

  updateCartUI();
  showNotification(`${beat.title} added to cart!`);
}

// Update cart UI
function updateCartUI() {
  if (!cartItems) return;

  cartItems.innerHTML = '';
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
    if (cartCount) cartCount.textContent = '0';
    if (totalAmount) totalAmount.textContent = '$0.00';
    return;
  }

  let total = 0;
  let itemCount = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    itemCount += item.quantity;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <p>$${item.price} x ${item.quantity}</p>
      </div>
      <div class="cart-item-actions">
        <button onclick="updateQuantity(${item.id}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${item.id}, 1)">+</button>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });

  if (cartCount) cartCount.textContent = itemCount.toString();
  if (totalAmount) totalAmount.textContent = `$${total.toFixed(2)}`;
}

// Update quantity function
function updateQuantity(beatId, change) {
  const item = cart.find(item => item.id === beatId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(beatId);
  } else {
    updateCartUI();
  }
}

// Remove from cart function
function removeFromCart(beatId) {
  cart = cart.filter(item => item.id !== beatId);
  updateCartUI();
  showNotification('Item removed from cart');
}

// Filter beats by genre
function filterBeats() {
  const selectedGenre = genreFilter.value;
  let filteredBeats = beatsData;

  if (selectedGenre !== 'all') {
    filteredBeats = beatsData.filter(beat => beat.genre === selectedGenre);
  }

  displayBeats(filteredBeats);
}

// Sort beats
function sortBeats() {
  const sortValue = sortBy.value;
  let sortedBeats = [...beatsData];

  switch (sortValue) {
    case 'price-low':
      sortedBeats.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedBeats.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sortedBeats.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
      sortedBeats.sort((a, b) => b.id - a.id);
      break;
  }

  displayBeats(sortedBeats);
}

// Search beats
function searchBeats() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredBeats = beatsData.filter(beat => 
    beat.title.toLowerCase().includes(searchTerm) ||
    beat.genre.toLowerCase().includes(searchTerm) ||
    beat.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );

  displayBeats(filteredBeats);
}

// Checkout function
function checkout() {
  if (cart.length === 0) {
    showNotification('Your cart is empty!');
    return;
  }

  // Simulate checkout process
  showNotification('Proceeding to checkout...');
  
  // In a real application, you would redirect to a checkout page
  // or integrate with a payment processor here
  setTimeout(() => {
    showNotification('Checkout completed successfully!');
    cart = [];
    updateCartUI();
    cartSidebar.classList.remove('active');
  }, 2000);
}

// Show notification
function showNotification(message) {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Toggle cart sidebar
function toggleCart() {
  cartSidebar.classList.toggle('active');
}

// Initialize shop when DOM is loaded
document.addEventListener('DOMContentLoaded', initShop);