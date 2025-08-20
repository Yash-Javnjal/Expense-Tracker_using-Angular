const API_URL = "http://localhost:8080/api/expenses";
const entryForm = document.getElementById("entry-form");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const descInput = document.getElementById("description");
const msgArea = document.getElementById("message-area");
const recentList = document.getElementById("recent-list");
const filteredList = document.getElementById("filtered-list");
const totalAmountEl = document.getElementById("total-amount");
const totalEntriesEl = document.getElementById("total-entries");
const avgEntryEl = document.getElementById("avg-entry");
const monthlySummaryEl = document.getElementById("monthly-summary");
const sortSelect = document.getElementById("sort");
const darkToggle = document.getElementById("darkModeToggle");

let entries = [];

document.addEventListener("DOMContentLoaded", () => {
    loadEntries();
    setupFilterBtns();
});

// Load entries from API
async function loadEntries() {
    try {
        const res = await fetch(API_URL);
        entries = await res.json();
        renderEntries(recentList, entries);
        updateStats();
    } catch (err) {
        displayMessage("Unable to load expenses from server", "error");
    }
}

// Add new entry
entryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entry = {
        amount: parseFloat(amountInput.value),
        category: categoryInput.value,
        description: descInput.value,
        date: new Date().toISOString()
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry)
        });

        if (!res.ok) throw new Error("Failed to add expense");

        const newEntry = await res.json();
        entries.unshift(newEntry);
        renderEntries(recentList, entries);
        updateStats();
        entryForm.reset();
        displayMessage("Expense added successfully!", "success");
    } catch (err) {
        displayMessage("Failed to add expense. Please try again.", "error");
    }
});

// Delete entry
async function removeEntry(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        entries = entries.filter(e => e.id !== id);
        renderEntries(recentList, entries);
        clearFilteredList();
        updateStats();
        displayMessage("Expense deleted successfully", "success");
    } catch (err) {
        displayMessage("Failed to delete expense", "error");
    }
}

// Edit entry
function editEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    amountInput.value = entry.amount;
    categoryInput.value = entry.category;
    descInput.value = entry.description;

    entryForm.onsubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amountInput.value),
                    category: categoryInput.value,
                    description: descInput.value,
                    date: entry.date
                })
            });
            const updatedEntry = await res.json();
            const index = entries.findIndex(e => e.id === id);
            entries[index] = updatedEntry;
            renderEntries(recentList, entries);
            updateStats();
            entryForm.reset();
            entryForm.onsubmit = null;
            displayMessage("Expense updated!", "success");
        } catch (err) {
            displayMessage("Failed to update expense", "error");
        }
    }
}

// Category icons
function getCategoryIcon(category) {
    const icons = {
        food: "🍽️",
        clothing: "👕",
        transport: "🚗",
        electronics: "📱",
        entertainment: "🎬",
        hospital: "🏥",
        other: "📋"
    };
    return icons[category] || "📋";
}

// Render entries
function renderEntries(container, list) {
    container.innerHTML = "";
    
    if (!list.length) {
        container.innerHTML = `<div class="no-entries">No expenses to display</div>`;
        return;
    }

    list.forEach(entry => {
        const div = document.createElement("div");
        div.className = "entry-item";
        div.innerHTML = `
            <div class="entry-icon">${getCategoryIcon(entry.category)}</div>
            <div class="entry-info">
                <div class="entry-name">${entry.description}</div>
                <div class="entry-category">${entry.category}</div>
                <div class="entry-date">${new Date(entry.date).toLocaleString()}</div>
            </div>
            <div class="entry-value">
                <div class="entry-price">Rs.${entry.amount.toFixed(2)}</div>
                <button class="btn-delete" onclick="removeEntry(${entry.id})">Delete</button>
                <button class="btn-edit" onclick="editEntry(${entry.id})">Edit</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Clear filtered list
function clearFilteredList() {
    filteredList.innerHTML = `<div class="no-entries">Select a category to filter expenses</div>`;
}

// Update stats & summary
function updateStats() {
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    const avg = entries.length ? total / entries.length : 0;

    totalAmountEl.textContent = `Rs.${total.toFixed(2)}`;
    totalEntriesEl.textContent = entries.length;
    avgEntryEl.textContent = `Rs.${avg.toFixed(2)}`;

    updateSummary();
}

// Monthly summary
function updateSummary() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthEntries = entries.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalMonth = monthEntries.reduce((sum, e) => sum + e.amount, 0);

    const catBreakdown = {};
    monthEntries.forEach(e => {
        if (!catBreakdown[e.category]) catBreakdown[e.category] = 0;
        catBreakdown[e.category] += e.amount;
    });

    let html = `<div>Total spent this month: Rs.${totalMonth.toFixed(2)}</div>`;
    html += `<ul>`;
    for (let cat in catBreakdown) {
        html += `<li>${cat}: Rs.${catBreakdown[cat].toFixed(2)}</li>`;
    }
    html += `</ul>`;
    monthlySummaryEl.innerHTML = html.length ? html : `<div class="no-entries">No expenses this month</div>`;
}

// Display message
function displayMessage(msg, type) {
    msgArea.innerHTML = `<div class="${type === 'success' ? 'success-msg' : 'error-msg'}">${msg}</div>`;
    setTimeout(() => { msgArea.innerHTML = ""; }, 4000);
}

// Filter buttons
function setupFilterBtns() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const category = btn.getAttribute("data-category");
            const list = category ? entries.filter(e => e.category === category) : entries;
            renderEntries(filteredList, list);
        });
    });
}

// Sorting
sortSelect.addEventListener("change", (e) => {
    const sortBy = e.target.value;
    let sorted = [...entries];
    if (sortBy === "amount") sorted.sort((a,b) => b.amount - a.amount);
    else if (sortBy === "date") sorted.sort((a,b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === "category") sorted.sort((a,b) => a.category.localeCompare(b.category));
    renderEntries(recentList, sorted);
});

// Dark mode toggle
const darkToggleCheckbox = document.getElementById("darkModeToggle");

darkToggleCheckbox.addEventListener("change", () => {
    const isDark = darkToggleCheckbox.checked;

    document.body.classList.toggle("dark-mode", isDark);
    document.querySelectorAll('.left-col, .right-col, .stats-box, .add-form-box, .entry-item, .filtered-section').forEach(el => {
        el.classList.toggle('dark-mode', isDark);
    });
});

