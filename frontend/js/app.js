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
    document.getElementById('nav-dashboard').classList.remove('active');
    document.getElementById('nav-inventory').classList.remove('active');
    document.getElementById(`nav-${pageId}`).classList.add('active');

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
                    '#ffd43b', '#e67e22', '#2c3e50', '#7f8c8d', '#f1c40f', '#d35400', '#34495e'
                ],
                borderColor: '#1a1a1a',
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
                ? `<span class="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold border border-red-500/20 uppercase">Critical Stock</span>`
                : `<span class="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/20 uppercase">In Stock</span>`;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/2 transition border-b border-white/5';
            tr.innerHTML = `
                <td class="p-4 font-mono text-[10px] text-slate-500">ID-${p.id.toString().padStart(4, '0')}</td>
                <td class="p-4">
                    <div class="font-bold text-white">${p.name}</div>
                    <div class="text-[10px] text-slate-500">Premium PC Component</div>
                </td>
                <td class="p-4">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/5 text-slate-400">
                        ${p.category}
                    </span>
                </td>
                <td class="p-4 font-bold ihave-gold">฿${new Intl.NumberFormat('th-TH').format(p.price)}</td>
                <td class="p-4">
                    <div class="flex items-center gap-2">
                        <span class="font-bold ${isLowStock ? 'text-red-400' : 'text-green-400'}">${p.quantity}</span>
                        <div class="w-12 bg-white/5 h-1 rounded-full overflow-hidden">
                            <div class="h-full ${isLowStock ? 'bg-red-500' : 'bg-green-500'}" 
                                 style="width: ${Math.min((p.quantity / (p.min_threshold || 1)) * 50, 100)}%"></div>
                        </div>
                    </div>
                </td>
                <td class="p-4">${statusBadge}</td>
                <td class="p-4 text-center">
                    <div class="flex justify-center gap-3">
                        <button onclick='editProduct(${JSON.stringify(p)})' class="text-slate-400 hover:text-[#ffd43b] transition">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteProduct(${p.id})" class="text-slate-500 hover:text-red-500 transition">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
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
