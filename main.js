/* ============================================================
   GrocerSnap — Main Entry Point
   ============================================================ */

import './style.css';
import { openDB } from './js/db.js';
import * as ui from './js/ui.js';

async function init() {
    // Open database
    await openDB();

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

    // Check due reminders
    ui.checkDueReminders();

    // ── Event Listeners ──

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ui.switchTab(btn.dataset.tab);
        });
    });

    // Add item FAB
    document.getElementById('add-item-fab').addEventListener('click', () => {
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
