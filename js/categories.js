/* ============================================================
   Categories — Color-coded grocery categories with emoji icons
   ============================================================ */

export const categories = [
  { id: 'all',       name: 'All',            icon: '🏷️', color: 'var(--accent)' },
  { id: 'fruits',    name: 'Fruits',          icon: '🍎', color: 'var(--cat-fruits)' },
  { id: 'vegetables',name: 'Vegetables',      icon: '🥦', color: 'var(--cat-vegetables)' },
  { id: 'bakery',    name: 'Bakery',          icon: '🍞', color: 'var(--cat-bakery)' },
  { id: 'meat',      name: 'Meat & Seafood',  icon: '🥩', color: 'var(--cat-meat)' },
  { id: 'beverages', name: 'Beverages',       icon: '🧃', color: 'var(--cat-beverages)' },
  { id: 'snacks',    name: 'Snacks',          icon: '🍪', color: 'var(--cat-snacks)' },
  { id: 'household', name: 'Household',       icon: '🧹', color: 'var(--cat-household)' },
  { id: 'personal',  name: 'Personal Care',   icon: '🧴', color: 'var(--cat-personal)' },
  { id: 'other',     name: 'Other',           icon: '📦', color: 'var(--cat-other)' },
];

export function getCategoryById(id) {
  return categories.find(c => c.id === id) || categories[categories.length - 1];
}

export function getCategoryColor(id) {
  const cat = getCategoryById(id);
  return cat.color;
}
