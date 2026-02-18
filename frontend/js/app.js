const API_BASE = '/api';

// State
let chartInstance = null;
let currentUser = null;

// Auth Check
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth_check.php`);
        const data = await response.json();

        if (!response.ok || !data.authenticated) {
            window.location.href = 'login.html';
        } else {
            currentUser = data.user;
            document.getElementById('user-name').innerText = currentUser.username;
        }
    } catch (error) {
        window.location.href = 'login.html';
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/logout.php`);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Navigation
function showPage(pageId) {
    document.getElementById('page-dashboard').classList.add('hidden');
    document.getElementById('page-inventory').classList.add('hidden');
    document.getElementById(`page-${pageId}`).classList.remove('hidden');

    // Update Sidebar Active State
    document.getElementById('nav-dashboard').classList.remove('bg-blue-50', 'text-blue-600');
    document.getElementById('nav-inventory').classList.remove('bg-blue-50', 'text-blue-600');
    document.getElementById('nav-dashboard').classList.add('text-slate-600');
    document.getElementById('nav-inventory').classList.add('text-slate-600');

    document.getElementById(`nav-${pageId}`).classList.add('bg-blue-50', 'text-blue-600');
    document.getElementById(`nav-${pageId}`).classList.remove('text-slate-600');

    if (pageId === 'dashboard') loadDashboard();
    if (pageId === 'inventory') loadInventory();
}

// === Dashboard Logic ===
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/dashboard.php`);
        const data = await response.json();

        // Update Stats
        document.getElementById('total-items').innerText = data.total_items;
        document.getElementById('low-stock-count').innerText = data.low_stock_count;
        document.getElementById('total-value').innerText = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(data.total_value);

        // Update Chart
        renderChart(data.categories);

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderChart(categories) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    if (chartInstance) chartInstance.destroy();

    const labels = categories.map(c => c.category);
    const values = categories.map(c => c.count);

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

function refreshDashboard() {
    loadDashboard();
}

// === Inventory Logic ===
async function loadInventory() {
    try {
        const response = await fetch(`${API_BASE}/products.php`);
        const products = await response.json();
        const tbody = document.getElementById('product-table-body');
        tbody.innerHTML = '';

        products.forEach(p => {
            const isLowStock = p.quantity <= p.min_threshold;
            const statusBadge = isLowStock
                ? `<span class="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold">Low Stock</span>`
                : `<span class="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">In Stock</span>`;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';
            tr.innerHTML = `
                <td class="p-4 font-mono text-slate-400">#${p.id}</td>
                <td class="p-4 font-medium text-slate-800">${p.name}</td>
                <td class="p-4"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">${p.category}</span></td>
                <td class="p-4 font-semibold text-slate-700">${new Intl.NumberFormat('th-TH').format(p.price)}</td>
                <td class="p-4 ${isLowStock ? 'text-red-600 font-bold' : ''}">${p.quantity}</td>
                <td class="p-4">${statusBadge}</td>
                <td class="p-4 text-center">
                    <button onclick='editProduct(${JSON.stringify(p)})' class="text-blue-500 hover:text-blue-700 mx-1"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-700 mx-1"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

// === CRUD Operations ===
function openModal(isEdit = false) {
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('modal-title').innerText = isEdit ? 'Edit Product' : 'Add New Product';
    if (!isEdit) {
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
    }
}

function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

function editProduct(product) {
    document.getElementById('product-id').value = product.id;
    document.getElementById('name').value = product.name;
    document.getElementById('category').value = product.category;
    document.getElementById('price').value = product.price;
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('min_threshold').value = product.min_threshold;
    openModal(true);
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('product-id').value;
    const data = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value,
        quantity: document.getElementById('quantity').value,
        min_threshold: document.getElementById('min_threshold').value
    };

    if (id) data.id = id;

    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(`${API_BASE}/products.php`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            closeModal();
            loadInventory();
        } else {
            alert('Operation failed');
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
});

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_BASE}/products.php?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadInventory();
        } else {
            alert('Failed to delete');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadDashboard();
});
