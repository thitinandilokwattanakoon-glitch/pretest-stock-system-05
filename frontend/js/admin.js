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

let activeChatUserId = null;
let currentAdminId = 1; // Default admin ID for testing

function showSection(sectionId) {
    const sections = ['orders', 'warranty', 'serials', 'chat'];
    sections.forEach(id => {
        const sectionEl = document.getElementById(`section-${id}`);
        const navEl = document.getElementById(`nav-${id}`);
        if (!sectionEl || !navEl) return;

        if (id === sectionId) {
            sectionEl.classList.remove('hidden');
            navEl.classList.add('bg-blue-600', 'text-white');
            navEl.classList.remove('text-slate-400', 'hover:bg-slate-800');
        } else {
            sectionEl.classList.add('hidden');
            navEl.classList.remove('bg-blue-600', 'text-white');
            navEl.classList.add('text-slate-400', 'hover:bg-slate-800');
        }
    });

    if (sectionId === 'chat') {
        initAdminChat();
    }
}

// Chat Implementation
function initAdminChat() {
    fetchChatUsers();
    setInterval(() => {
        if (activeChatUserId) fetchAdminMessages(activeChatUserId);
        fetchChatUsers();
    }, 3000);
}

async function fetchChatUsers() {
    try {
        const response = await fetch('/api/messages.php');
        const messages = await response.json();

        // Group by user
        const users = {};
        messages.forEach(m => {
            if (!m.is_admin_reply) {
                users[m.sender_id] = { username: m.username, lastMessage: m.message, time: m.created_at };
            }
        });

        const list = document.getElementById('chat-user-list');
        list.innerHTML = Object.entries(users).map(([id, user]) => `
            <div onclick="selectChatUser(${id}, '${user.username}')" class="p-4 hover:bg-slate-100 cursor-pointer transition ${activeChatUserId == id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-bold text-slate-800">${user.username}</span>
                    <span class="text-[10px] text-slate-400">${new Date(user.time).toLocaleTimeString()}</span>
                </div>
                <p class="text-xs text-slate-500 truncate">${user.lastMessage}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching chat users:', error);
    }
}

async function selectChatUser(userId, username) {
    activeChatUserId = userId;
    document.getElementById('admin-chat-header').innerText = `Chatting with: ${username}`;
    fetchAdminMessages(userId);

    // Highlight active user in sidebar
    fetchChatUsers();
}

async function fetchAdminMessages(userId) {
    if (!userId) return;
    try {
        const response = await fetch(`/api/messages.php?sender_id=${userId}`);
        const messages = await response.json();

        const container = document.getElementById('admin-chat-messages');
        const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

        container.innerHTML = messages.map(m => `
            <div class="flex ${m.is_admin_reply ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[70%] rounded-2xl px-4 py-2 text-sm ${m.is_admin_reply ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-noneshadow-sm'}">
                    ${m.message}
                </div>
            </div>
        `).join('');

        if (atBottom) container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

document.getElementById('admin-chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('admin-chat-input');
    const message = input.value.trim();
    if (!message || !activeChatUserId) return;

    try {
        const response = await fetch('/api/messages.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: currentAdminId,
                receiver_id: activeChatUserId,
                message: message,
                is_admin_reply: true
            })
        });

        if (response.ok) {
            input.value = '';
            fetchAdminMessages(activeChatUserId);
        }
    } catch (error) {
        console.error('Error sending admin reply:', error);
    }
});

// TODO: Implement details view modal logic
