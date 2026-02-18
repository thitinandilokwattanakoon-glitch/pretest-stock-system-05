document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

async function fetchOrders() {
    try {
        const response = await fetch('/api/admin.php?action=get_orders');
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">No orders found.</td></tr>`;
        return;
    }

    orders.forEach(order => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'paid': 'bg-blue-100 text-blue-700',
            'shipped': 'bg-purple-100 text-purple-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700'
        };

        const statusClass = statusColors[order.status] || 'bg-slate-100 text-slate-700';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                <td class="p-4 font-mono text-xs text-slate-500">#${order.id}</td>
                <td class="p-4 font-medium text-slate-700">${order.customer_name}</td>
                <td class="p-4 text-slate-600">฿${parseFloat(order.total_amount).toLocaleString()}</td>
                <td class="p-4"><span class="px-2 py-1 rounded text-xs font-semibold ${statusClass}">${order.status.toUpperCase()}</span></td>
                <td class="p-4 text-slate-500 text-xs">${new Date(order.created_at).toLocaleDateString()}</td>
                <td class="p-4">
                    <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                </td>
            </tr>
        `;
    });
}

function showSection(sectionId) {
    // Basic tab switching logic
    ['orders', 'warranty', 'serials'].forEach(id => {
        document.getElementById(`section-${id}`).classList.add('hidden');
        document.getElementById(`nav-${id}`).classList.remove('bg-blue-600', 'text-white');
        document.getElementById(`nav-${id}`).classList.add('text-slate-400', 'hover:bg-slate-800'); // reset style
    });

    document.getElementById(`section-${sectionId}`).classList.remove('hidden');
    // Active style logic needed (simplified here)
    // In a real app, I'd manage classes better
}

// TODO: Implement details view modal logic
