/* ============================================================
   UI — All rendering logic for GrocerSnap
   ============================================================ */

import { categories, getCategoryById } from './categories.js';
import * as db from './db.js';
import { recipes } from './recipes.js';
import * as reminders from './reminders.js';

// ─── State ───
let currentTab = 'list';
let currentCategory = 'all';
let isGalleryView = false;
let editingItemId = null;
let currentPhotoBlob = null;

// ─── Toast ───
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ─── Category Filter ───
export function renderCategoryFilter() {
    const container = document.getElementById('category-filter');
    container.innerHTML = categories.map(cat => `
    <button class="cat-pill ${currentCategory === cat.id ? 'active' : ''}"
            data-cat="${cat.id}"
            style="--cat-color: ${cat.color}">
      <span class="cat-emoji">${cat.icon}</span>
      <span>${cat.name}</span>
    </button>
  `).join('');

    container.querySelectorAll('.cat-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.cat;
            renderCategoryFilter();
            renderItemList();
        });
    });
}

// ─── Stats ───
function updateStats(items) {
    const total = items.length;
    const bought = items.filter(i => i.checked).length;
    const remaining = total - bought;
    document.getElementById('stats-total').textContent = `${total} item${total !== 1 ? 's' : ''}`;
    document.getElementById('stats-bought').textContent = `${bought} bought`;
    document.getElementById('stats-remaining').textContent = `${remaining} remaining`;
}

// ─── Item List ───
export async function renderItemList() {
    let items = await db.getAllItems();

    // Filter by category
    if (currentCategory !== 'all') {
        items = items.filter(i => i.category === currentCategory);
    }

    const unchecked = items.filter(i => !i.checked);
    const checked = items.filter(i => i.checked);

    const allItems = await db.getAllItems();
    updateStats(allItems);

    const container = document.getElementById('grocery-items');
    const boughtSection = document.getElementById('bought-section');
    const boughtContainer = document.getElementById('bought-items');
    const emptyState = document.getElementById('empty-state');

    // Toggle gallery/list
    container.classList.toggle('gallery', isGalleryView);
    boughtContainer.classList.toggle('gallery', isGalleryView);

    if (allItems.length === 0) {
        container.innerHTML = '';
        boughtSection.style.display = 'none';
        emptyState.style.display = '';
        return;
    }
    emptyState.style.display = 'none';

    container.innerHTML = unchecked.map(item => renderItemCard(item)).join('');
    attachCardEvents(container);

    if (checked.length > 0) {
        boughtSection.style.display = '';
        boughtContainer.innerHTML = checked.map(item => renderItemCard(item)).join('');
        attachCardEvents(boughtContainer);
    } else {
        boughtSection.style.display = 'none';
    }
}

function renderItemCard(item) {
    const cat = getCategoryById(item.category);
    const imageHtml = item.photo
        ? `<img class="item-card-image" src="${item.photo}" alt="${item.name}" />`
        : `<div class="item-card-image-placeholder">${cat.icon}</div>`;

    return `
    <div class="item-card ${item.checked ? 'checked' : ''}" data-id="${item.id}">
      ${imageHtml}
      <div class="item-card-body">
        <div class="item-card-name">${escapeHtml(item.name)}</div>
        <div class="item-card-meta">
          <span class="item-card-category" style="--cat-color: ${cat.color}">${cat.icon} ${cat.name}</span>
          ${item.quantity ? `<span class="item-card-qty">${escapeHtml(item.quantity)}</span>` : ''}
        </div>
        ${item.notes ? `<div class="item-card-notes">${escapeHtml(item.notes)}</div>` : ''}
      </div>
      <div class="item-card-actions">
        <button class="card-action-btn fav-btn" data-id="${item.id}" title="Favorite">
          ${item.favorited ? '💛' : '🤍'}
        </button>
        <button class="card-action-btn check-btn ${item.checked ? 'checked' : ''}" data-id="${item.id}" title="Mark as bought">
          ${item.checked ? '✅' : '⬜'}
        </button>
        <button class="card-action-btn edit-btn" data-id="${item.id}" title="Edit">✏️</button>
        <button class="card-action-btn delete-btn" data-id="${item.id}" title="Delete">🗑️</button>
      </div>
    </div>
  `;
}

function attachCardEvents(container) {
    container.querySelectorAll('.check-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const item = await db.getItem(id);
            item.checked = !item.checked;
            await db.updateItem(item);

            btn.classList.add('pop');
            if (item.checked && item.reminderDays > 0) {
                reminders.markReminderPurchased(item.name);
            }

            setTimeout(() => renderItemList(), 300);
            showToast(item.checked ? `${item.name} — bought! ✅` : `${item.name} — back on list`, 'success');
        });
    });

    container.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const item = await db.getItem(id);
            item.favorited = !item.favorited;
            await db.updateItem(item);

            if (item.favorited) {
                await db.addFavorite({
                    id: `fav_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    notes: item.notes,
                    photo: item.photo,
                });
                showToast(`${item.name} added to favorites ⭐`, 'success');
            } else {
                const favId = `fav_${item.name.toLowerCase().replace(/\s+/g, '_')}`;
                await db.removeFavorite(favId);
                showToast(`${item.name} removed from favorites`);
            }

            renderItemList();
        });
    });

    container.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const item = await db.getItem(id);
            openItemModal(item);
        });
    });

    container.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const card = btn.closest('.item-card');
            card.classList.add('removing');
            const item = await db.getItem(id);
            setTimeout(async () => {
                await db.deleteItem(id);
                renderItemList();
                showToast(`${item?.name || 'Item'} deleted`, 'error');
            }, 350);
        });
    });
}

// ─── Item Modal ───
export function openItemModal(item = null) {
    editingItemId = item ? item.id : null;
    currentPhotoBlob = null;

    const modal = document.getElementById('item-modal');
    const title = document.getElementById('modal-title');
    const submitText = document.getElementById('modal-submit-text');
    const form = document.getElementById('item-form');
    const preview = document.getElementById('photo-preview');

    title.textContent = item ? 'Edit Item' : 'Add Item';
    submitText.textContent = item ? 'Save Changes' : 'Add Item';

    form.reset();
    document.getElementById('item-id').value = item ? item.id : '';
    document.getElementById('item-name').value = item ? item.name : '';
    document.getElementById('item-category').value = item ? item.category : 'other';
    document.getElementById('item-quantity').value = item ? (item.quantity || '') : '';
    document.getElementById('item-notes').value = item ? (item.notes || '') : '';
    document.getElementById('item-reminder').value = item ? (item.reminderDays || 0) : 0;

    if (item && item.photo) {
        preview.innerHTML = `<img src="${item.photo}" alt="Preview" />`;
        currentPhotoBlob = item.photo;
    } else {
        preview.innerHTML = `<div class="photo-placeholder"><span class="photo-icon">📷</span><span>Tap to add photo</span></div>`;
    }

    modal.style.display = '';

    // Focus name field after animation
    setTimeout(() => document.getElementById('item-name').focus(), 400);
}

export function closeItemModal() {
    const modal = document.getElementById('item-modal');
    modal.style.display = 'none';
    editingItemId = null;
    currentPhotoBlob = null;
}

export async function handleItemFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    if (!name) return;

    const cat = document.getElementById('item-category').value;
    const quantity = document.getElementById('item-quantity').value.trim();
    const notes = document.getElementById('item-notes').value.trim();
    const reminderDays = parseInt(document.getElementById('item-reminder').value) || 0;

    const catObj = getCategoryById(cat);

    const item = {
        id: editingItemId || crypto.randomUUID(),
        name,
        category: cat,
        quantity,
        notes,
        photo: currentPhotoBlob || null,
        checked: false,
        favorited: false,
        reminderDays,
        categoryIcon: catObj.icon,
        createdAt: Date.now(),
    };

    // Preserve existing checked/fav state on edit
    if (editingItemId) {
        const existing = await db.getItem(editingItemId);
        if (existing) {
            item.checked = existing.checked;
            item.favorited = existing.favorited;
            item.createdAt = existing.createdAt;
        }
    }

    await db.addItem(item);

    // Handle reminder
    if (reminderDays > 0) {
        reminders.addReminder(item);
    }

    closeItemModal();
    renderItemList();
    showToast(editingItemId ? `${name} updated ✏️` : `${name} added 🛒`, 'success');
}

export function handlePhotoUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        currentPhotoBlob = e.target.result;
        const preview = document.getElementById('photo-preview');
        preview.innerHTML = `<img src="${currentPhotoBlob}" alt="Preview" />`;
    };
    reader.readAsDataURL(file);
}

// ─── Category Select Populate ───
export function populateCategorySelect() {
    const select = document.getElementById('item-category');
    select.innerHTML = categories
        .filter(c => c.id !== 'all')
        .map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`)
        .join('');
}

// ─── Favorites Tab ───
export async function renderFavorites() {
    const favs = await db.getAllFavorites();
    const container = document.getElementById('favorites-grid');
    const empty = document.getElementById('favorites-empty');

    if (favs.length === 0) {
        container.innerHTML = '';
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';

    container.innerHTML = favs.map(fav => {
        const cat = getCategoryById(fav.category);
        const imageHtml = fav.photo
            ? `<img class="fav-card-image" src="${fav.photo}" alt="${fav.name}" />`
            : `<div class="fav-card-image-placeholder">${cat.icon}</div>`;

        return `
      <div class="fav-card" data-id="${fav.id}">
        ${imageHtml}
        <div class="fav-card-body">
          <div class="fav-card-name">${escapeHtml(fav.name)}</div>
          <span class="fav-card-category" style="--cat-color: ${cat.color}">${cat.icon} ${cat.name}</span>
        </div>
        <div class="fav-card-actions">
          <button class="fav-add-btn" data-id="${fav.id}">+ Add to List</button>
          <button class="fav-remove-btn" data-id="${fav.id}">🗑️</button>
        </div>
      </div>
    `;
    }).join('');

    container.querySelectorAll('.fav-add-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const favs = await db.getAllFavorites();
            const fav = favs.find(f => f.id === id);
            if (fav) {
                const newItem = {
                    id: crypto.randomUUID(),
                    name: fav.name,
                    category: fav.category,
                    quantity: fav.quantity || '',
                    notes: fav.notes || '',
                    photo: fav.photo || null,
                    checked: false,
                    favorited: true,
                    reminderDays: 0,
                    categoryIcon: getCategoryById(fav.category).icon,
                    createdAt: Date.now(),
                };
                await db.addItem(newItem);
                showToast(`${fav.name} added to list 🛒`, 'success');
                renderItemList();
            }
        });
    });

    container.querySelectorAll('.fav-remove-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await db.removeFavorite(id);
            renderFavorites();
            showToast('Removed from favorites');
        });
    });
}

// ─── Recipes Tab ───
export function renderRecipes() {
    const container = document.getElementById('recipes-grid');
    container.innerHTML = recipes.map(r => `
    <div class="recipe-card" data-recipe="${r.id}">
      <div class="recipe-card-image">${r.emoji}</div>
      <div class="recipe-card-body">
        <div class="recipe-card-title">${r.name}</div>
        <div class="recipe-card-desc">${r.description}</div>
        <div class="recipe-card-count">${r.ingredients.length} ingredients</div>
      </div>
    </div>
  `).join('');

    container.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.recipe;
            openRecipeModal(id);
        });
    });
}

function openRecipeModal(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const modal = document.getElementById('recipe-modal');
    const title = document.getElementById('recipe-modal-title');
    const body = document.getElementById('recipe-modal-body');

    title.textContent = recipe.name;
    body.innerHTML = `
    <div class="recipe-detail-image">${recipe.emoji}</div>
    <p class="recipe-detail-desc">${recipe.description}</p>
    <div>
      <div class="recipe-ingredients-title">🧾 Ingredients (${recipe.ingredients.length})</div>
      <ul class="recipe-ingredient-list">
        ${recipe.ingredients.map(ing => `
          <li class="recipe-ingredient-item">
            <span class="ing-emoji">${ing.icon}</span>
            <span style="flex:1">${ing.name}</span>
            <span style="color:var(--text-muted);font-size:var(--fs-xs)">${ing.quantity}</span>
          </li>
        `).join('')}
      </ul>
    </div>
    <button class="recipe-add-all-btn" id="recipe-add-all">🛒 Add All to List</button>
  `;

    modal.style.display = '';

    document.getElementById('recipe-add-all').addEventListener('click', async () => {
        for (const ing of recipe.ingredients) {
            const item = {
                id: crypto.randomUUID(),
                name: ing.name,
                category: ing.category,
                quantity: ing.quantity,
                notes: `From: ${recipe.name}`,
                photo: null,
                checked: false,
                favorited: false,
                reminderDays: 0,
                categoryIcon: ing.icon,
                createdAt: Date.now(),
            };
            await db.addItem(item);
        }
        closeRecipeModal();
        switchTab('list');
        renderItemList();
        showToast(`${recipe.ingredients.length} ingredients added from ${recipe.name} 🍳`, 'success');
    });
}

function closeRecipeModal() {
    document.getElementById('recipe-modal').style.display = 'none';
}

// ─── Reminders Tab ───
export function renderReminders() {
    const allReminders = reminders.getReminders();
    const container = document.getElementById('reminders-list');
    const empty = document.getElementById('reminders-empty');

    if (allReminders.length === 0) {
        container.innerHTML = '';
        empty.style.display = '';
        return;
    }
    empty.style.display = 'none';

    container.innerHTML = allReminders.map(r => {
        const status = reminders.getReminderStatus(r);
        return `
      <div class="reminder-card ${status.status === 'due' ? 'due' : ''}">
        <div class="reminder-card-icon">${r.icon}</div>
        <div class="reminder-card-body">
          <div class="reminder-card-name">${escapeHtml(r.name)}</div>
          <div class="reminder-card-info">Every ${r.intervalDays} day${r.intervalDays !== 1 ? 's' : ''}</div>
        </div>
        <span class="reminder-card-status ${status.status}">${status.text}</span>
        <button class="reminder-add-btn" data-name="${escapeHtml(r.name)}" data-cat="${r.category}">+ Add</button>
      </div>
    `;
    }).join('');

    container.querySelectorAll('.reminder-add-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const name = btn.dataset.name;
            const cat = btn.dataset.cat;
            const item = {
                id: crypto.randomUUID(),
                name,
                category: cat,
                quantity: '',
                notes: 'Added from reminder',
                photo: null,
                checked: false,
                favorited: false,
                reminderDays: 0,
                categoryIcon: getCategoryById(cat).icon,
                createdAt: Date.now(),
            };
            await db.addItem(item);
            reminders.markReminderPurchased(name);
            renderReminders();
            showToast(`${name} added to list 🛒`, 'success');
        });
    });
}

// ─── Tab Switching ───
export function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    document.getElementById(`tab-${tabId}`).style.display = '';

    // Show/hide category filter and stats
    const catFilter = document.getElementById('category-filter');
    const statsBar = document.getElementById('stats-bar');
    if (tabId === 'list') {
        catFilter.style.display = '';
        statsBar.style.display = '';
        renderItemList();
    } else {
        catFilter.style.display = 'none';
        statsBar.style.display = 'none';
    }

    if (tabId === 'favorites') renderFavorites();
    if (tabId === 'recipes') renderRecipes();
    if (tabId === 'reminders') renderReminders();
}

// ─── View Toggle ───
export function toggleView() {
    isGalleryView = !isGalleryView;
    const gridIcon = document.querySelector('.icon-grid');
    const listIcon = document.querySelector('.icon-list');
    if (isGalleryView) {
        gridIcon.style.display = 'none';
        listIcon.style.display = '';
    } else {
        gridIcon.style.display = '';
        listIcon.style.display = 'none';
    }
    renderItemList();
}

// ─── Theme Toggle ───
export function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('grocersnap_theme', next);

    const moonIcon = document.querySelector('.icon-moon');
    const sunIcon = document.querySelector('.icon-sun');
    if (next === 'dark') {
        moonIcon.style.display = '';
        sunIcon.style.display = 'none';
    } else {
        moonIcon.style.display = 'none';
        sunIcon.style.display = '';
    }
}

export function loadTheme() {
    const saved = localStorage.getItem('grocersnap_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const moonIcon = document.querySelector('.icon-moon');
    const sunIcon = document.querySelector('.icon-sun');
    if (saved === 'dark') {
        moonIcon.style.display = '';
        sunIcon.style.display = 'none';
    } else {
        moonIcon.style.display = 'none';
        sunIcon.style.display = '';
    }
}

// ─── Clear Bought ───
export async function clearBought() {
    await db.clearCheckedItems();
    renderItemList();
    showToast('All bought items cleared 🗑️');
}

// ─── Init Recipe Modal Close ───
export function initRecipeModal() {
    document.getElementById('recipe-modal-close').addEventListener('click', closeRecipeModal);
    document.getElementById('recipe-modal').addEventListener('click', (e) => {
        if (e.target.id === 'recipe-modal') closeRecipeModal();
    });
}

// ─── Check Due Reminders on Load ───
export function checkDueReminders() {
    const due = reminders.getDueReminders();
    if (due.length > 0) {
        setTimeout(() => {
            showToast(`🔔 ${due.length} item${due.length > 1 ? 's' : ''} due for repurchase!`, 'warning');
        }, 1000);
    }
}

// ─── Utilities ───
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
