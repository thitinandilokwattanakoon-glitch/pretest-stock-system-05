/**
 * Simple Chat System for PC Builder
 */

const CHAT_INTERVAL = 3000; // Poll every 3s
let chatUser = null;
let chatOpen = false;

document.addEventListener('DOMContentLoaded', () => {
    initChat();
});

async function initChat() {
    // Check if user is logged in
    try {
        const response = await fetch('/api/auth_check.php');
        const data = await response.json();
        if (data.authenticated) {
            chatUser = data.user;
            renderChatWidget();
            startChatPolling();
        }
    } catch (error) {
        console.log('Chat disabled: User not logged in');
    }
}

function renderChatWidget() {
    const div = document.createElement('div');
    div.id = 'chat-widget';
    div.className = 'fixed bottom-6 right-6 z-[100] flex flex-col items-end';
    div.innerHTML = `
        <div id="chat-window" class="hidden w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-300">
            <div class="p-4 bg-blue-600 text-white flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-sm">Customer Support</h4>
                    <p class="text-[10px] opacity-80">Online - How can we help?</p>
                </div>
                <button onclick="toggleChat()" class="hover:bg-blue-500 rounded p-1 transition"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                <!-- Messages will appear here -->
            </div>
            <div class="p-3 border-t border-slate-100 bg-white">
                <form id="chat-form" class="flex gap-2">
                    <input type="text" id="chat-input" placeholder="Type a message..." class="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button type="submit" class="bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700 transition">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
        <button onclick="toggleChat()" class="w-14 h-14 bg-blue-600 rounded-full shadow-lg text-white text-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <i class="fa-solid fa-comments"></i>
        </button>
    `;
    document.body.appendChild(div);

    document.getElementById('chat-form').addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });
}

function toggleChat() {
    chatOpen = !chatOpen;
    const window = document.getElementById('chat-window');
    if (chatOpen) {
        window.classList.remove('hidden');
        fetchMessages();
    } else {
        window.classList.add('hidden');
    }
}

async function fetchMessages() {
    if (!chatOpen || !chatUser) return;

    try {
        const response = await fetch(`/api/messages.php?sender_id=${chatUser.id}`);
        const messages = await response.json();
        renderMessages(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

function renderMessages(messages) {
    const container = document.getElementById('chat-messages');
    const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;

    container.innerHTML = messages.map(m => `
        <div class="flex ${m.is_admin_reply ? 'justify-start' : 'justify-end'}">
            <div class="max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.is_admin_reply ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}">
                ${m.message}
            </div>
        </div>
    `).join('');

    if (atBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message || !chatUser) return;

    try {
        const response = await fetch('/api/messages.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: chatUser.id,
                message: message,
                is_admin_reply: false
            })
        });

        if (response.ok) {
            input.value = '';
            fetchMessages();
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function startChatPolling() {
    setInterval(fetchMessages, CHAT_INTERVAL);
}
