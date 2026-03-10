/* ============================================================
   Reminders — Recurring purchase reminder logic
   ============================================================ */

const REMINDERS_KEY = 'grocersnap_reminders';

export function getReminders() {
    try {
        return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveReminders(reminders) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function addReminder(item) {
    const reminders = getReminders();
    // Remove existing reminder for same item name
    const filtered = reminders.filter(r => r.name.toLowerCase() !== item.name.toLowerCase());
    filtered.push({
        id: item.id || crypto.randomUUID(),
        name: item.name,
        category: item.category,
        icon: item.categoryIcon || '📦',
        intervalDays: item.reminderDays,
        lastPurchased: Date.now(),
        photo: item.photo || null,
    });
    saveReminders(filtered);
}

export function removeReminder(id) {
    const reminders = getReminders().filter(r => r.id !== id);
    saveReminders(reminders);
}

export function markReminderPurchased(name) {
    const reminders = getReminders();
    const r = reminders.find(rem => rem.name.toLowerCase() === name.toLowerCase());
    if (r) {
        r.lastPurchased = Date.now();
        saveReminders(reminders);
    }
}

export function getDueReminders() {
    const reminders = getReminders();
    const now = Date.now();
    return reminders.filter(r => {
        const elapsed = (now - r.lastPurchased) / (1000 * 60 * 60 * 24);
        return elapsed >= r.intervalDays;
    });
}

export function getReminderStatus(reminder) {
    const now = Date.now();
    const elapsed = (now - reminder.lastPurchased) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.max(0, Math.ceil(reminder.intervalDays - elapsed));
    if (daysLeft <= 0) return { status: 'due', text: 'Due now!', daysLeft: 0 };
    return { status: 'upcoming', text: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`, daysLeft };
}
