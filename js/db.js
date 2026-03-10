/* ============================================================
   IndexedDB Wrapper — Local storage for items, favorites
   ============================================================ */

const DB_NAME = 'GrocerSnapDB';
const DB_VERSION = 1;

let dbInstance = null;

export function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) { resolve(dbInstance); return; }
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('items')) {
                const itemStore = db.createObjectStore('items', { keyPath: 'id' });
                itemStore.createIndex('category', 'category', { unique: false });
                itemStore.createIndex('checked', 'checked', { unique: false });
            }
            if (!db.objectStoreNames.contains('favorites')) {
                db.createObjectStore('favorites', { keyPath: 'id' });
            }
        };

        req.onsuccess = (e) => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };

        req.onerror = (e) => reject(e.target.error);
    });
}

// ─── Generic helpers ───
function txStore(storeName, mode = 'readonly') {
    return dbInstance.transaction(storeName, mode).objectStore(storeName);
}

function promisifyReq(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// ─── Items CRUD ───
export async function addItem(item) {
    const store = txStore('items', 'readwrite');
    return promisifyReq(store.put(item));
}

export async function updateItem(item) {
    const store = txStore('items', 'readwrite');
    return promisifyReq(store.put(item));
}

export async function deleteItem(id) {
    const store = txStore('items', 'readwrite');
    return promisifyReq(store.delete(id));
}

export async function getItem(id) {
    const store = txStore('items');
    return promisifyReq(store.get(id));
}

export async function getAllItems() {
    const store = txStore('items');
    return promisifyReq(store.getAll());
}

export async function clearCheckedItems() {
    const items = await getAllItems();
    const checked = items.filter(i => i.checked);
    const store = txStore('items', 'readwrite');
    for (const item of checked) {
        store.delete(item.id);
    }
    return new Promise((resolve) => {
        store.transaction.oncomplete = () => resolve();
    });
}

// ─── Favorites CRUD ───
export async function addFavorite(item) {
    const store = txStore('favorites', 'readwrite');
    const fav = { ...item, id: item.favId || item.id };
    delete fav.checked;
    delete fav.createdAt;
    return promisifyReq(store.put(fav));
}

export async function removeFavorite(id) {
    const store = txStore('favorites', 'readwrite');
    return promisifyReq(store.delete(id));
}

export async function getAllFavorites() {
    const store = txStore('favorites');
    return promisifyReq(store.getAll());
}

export async function isFavorite(name) {
    const favs = await getAllFavorites();
    return favs.some(f => f.name.toLowerCase() === name.toLowerCase());
}
