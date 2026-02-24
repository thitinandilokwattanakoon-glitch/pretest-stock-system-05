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
        <div id="chat-window" class="hidden w-80 h-96 ihave-bg-surface rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-300">
            <div class="p-4 bg-[#1a1a1a] text-white flex justify-between items-center border-b border-white/5">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                        <h4 class="font-bold text-xs uppercase tracking-widest">iHave<span class="ihave-gold">SUPPORT</span></h4>
                        <p class="text-[9px] text-slate-500 uppercase font-bold">Expert Technicians Online</p>
                    </div>
                </div>
                <button onclick="toggleChat()" class="hover:bg-white/5 rounded-full w-8 h-8 flex items-center justify-center transition border border-white/5"><i class="fa-solid fa-xmark text-xs"></i></button>
            </div>
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a]">
                <!-- Messages will appear here -->
            </div>
            <div class="p-4 border-t border-white/5 bg-[#1a1a1a]">
                <form id="chat-form" class="flex gap-2">
                    <input type="text" id="chat-input" placeholder="Ask about compatibility..." class="flex-1 text-xs bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#ffd43b] text-white transition-all">
                    <button type="submit" class="bg-[#ffd43b] text-black rounded-xl px-4 py-2 hover:scale-105 transition-all shadow-lg active:scale-95">
                        <i class="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                </form>
            </div>
        </div>
        <button onclick="toggleChat()" class="w-14 h-14 bg-[#ffd43b] rounded-full shadow-[0_0_20px_rgba(255,212,59,0.3)] text-black text-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative group overflow-hidden">
            <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <i class="fa-solid fa-comments relative z-10 transition-transform group-hover:rotate-12"></i>
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
            <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${m.is_admin_reply ? 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none' : 'bg-[#ffd43b] text-black font-bold rounded-tr-none shadow-lg'}">
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
