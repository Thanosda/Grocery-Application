/* ============================================================
   GrocerSnap — Main Entry Point
   ============================================================ */

import './style.css';
import * as db from './js/db.js';
import { predefinedItems } from './js/predefined.js';
import * as ui from './js/ui.js';

async function init() {
    // Open database
    await db.openDB();

    // Seed Quick Add store if empty
    await db.seedQuickAdd(predefinedItems);

    // Seed recipes if empty
    const { recipes } = await import('./js/recipes.js');
    await db.seedRecipes(recipes);

    // Load saved theme
    ui.loadTheme();

    // Populate category select in form
    ui.populateCategorySelect();

    // Render category filter bar
    ui.renderCategoryFilter();

    // Render initial list
    await ui.renderItemList();

    // Init recipe modal close events
    ui.initRecipeModal();

    // ── Event Listeners ──

    // Quick Add Store (Now FAB)
    document.getElementById('quick-add-fab').addEventListener('click', ui.renderPredefinedStore);
    document.getElementById('close-store-btn').addEventListener('click', ui.closePredefinedStore);
    document.getElementById('predefined-store').addEventListener('click', (e) => {
        if (e.target.id === 'predefined-store') ui.closePredefinedStore();
    });

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ui.switchTab(btn.dataset.tab);
        });
    });

    // Add item (Now Header)
    document.getElementById('add-item-header-btn').addEventListener('click', () => {
        ui.openItemModal();
    });

    // View toggle (grid/list)
    document.getElementById('view-toggle-btn').addEventListener('click', () => {
        ui.toggleView();
    });

    // Theme toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        ui.toggleTheme();
    });

    // Item form submit
    document.getElementById('item-form').addEventListener('submit', ui.handleItemFormSubmit);

    // Modal close
    document.getElementById('modal-close-btn').addEventListener('click', ui.closeItemModal);
    document.getElementById('modal-cancel-btn').addEventListener('click', ui.closeItemModal);
    document.getElementById('item-modal').addEventListener('click', (e) => {
        if (e.target.id === 'item-modal') ui.closeItemModal();
    });

    // Quantity presets
    document.querySelector('.qty-presets').addEventListener('click', (e) => {
        if (e.target.classList.contains('qty-preset-btn')) {
            document.getElementById('item-quantity').value = e.target.dataset.qty;
        }
    });

    // Photo upload
    document.getElementById('photo-upload-area').addEventListener('click', () => {
        document.getElementById('item-photo-input').click();
    });
    document.getElementById('item-photo-input').addEventListener('change', (e) => {
        if (e.target.files[0]) ui.handlePhotoUpload(e.target.files[0]);
    });

    // Clear bought
    document.getElementById('clear-bought-btn').addEventListener('click', ui.clearBought);

    // Keyboard shortcut: Escape to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ui.closeItemModal();
        }
    });
}

init().catch(console.error);
