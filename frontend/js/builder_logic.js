/**
 * Intelligent PC Builder Logic
 */

const categories = [
    { id: 'cpu', name: 'CPU', icon: 'fa-microchip' },
    { id: 'cooler', name: 'CPU Cooler', icon: 'fa-fan' },
    { id: 'mainboard', name: 'Mainboard', icon: 'fa-chess-board' },
    { id: 'ram', name: 'Memory (RAM)', icon: 'fa-memory' },
    { id: 'gpu', name: 'Graphics Card', icon: 'fa-gamepad' },
    { id: 'ssd', name: 'Storage (SSD)', icon: 'fa-hard-drive' },
    { id: 'psu', name: 'Power Supply', icon: 'fa-plug' },
    { id: 'case', name: 'Case', icon: 'fa-box' },
    { id: 'monitor', name: 'Monitor', icon: 'fa-desktop' },
    { id: 'gaminggear', name: 'Gaming Gear', icon: 'fa-keyboard' }
];

const gamesData = [
    { id: 'valorant', name: 'Valorant / CS:GO', tier: 'entry', icon: 'fa-crosshairs' },
    { id: 'elden_ring', name: 'Elden Ring', tier: 'mid', icon: 'fa-dragon' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', tier: 'high', icon: 'fa-robot' }
];

const compatibilityRules = {
    formFactorOrder: ['ITX', 'M-ATX', 'ATX', 'E-ATX'],
    chipsetMap: {
        'LGA1700': ['Z790', 'B760', 'H770', 'Z690', 'B660', 'H610'],
        'AM5': ['X670E', 'X670', 'B650E', 'B650', 'A620'],
        'AM4': ['X570', 'B550', 'A520', 'X470', 'B450']
    },
    isCaseCompatible: (caseForm, mbForm) => {
        const cIdx = compatibilityRules.formFactorOrder.indexOf(caseForm);
        const mIdx = compatibilityRules.formFactorOrder.indexOf(mbForm);
        return cIdx >= mIdx;
    }
};

const state = {
    components: {},
    products: [],
    currentCategory: null,
    suggestedTier: null
};

document.addEventListener('DOMContentLoaded', () => {
    initBuilder();
});

async function initBuilder() {
    renderGameSelector();
    renderSlots();
    await fetchProducts();
}

function renderGameSelector() {
    const container = document.getElementById('game-presets');
    if (!container) return;

    container.innerHTML = gamesData.map(game => `
        <button onclick="applyGamePreset('${game.id}')" class="flex-1 bg-white border border-slate-200 p-3 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left group">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 flex items-center justify-center">
                    <i class="fa-solid ${game.icon}"></i>
                </div>
                <div>
                    <p class="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Best for</p>
                    <h4 class="text-sm font-bold text-slate-800">${game.name}</h4>
                </div>
            </div>
        </button>
    `).join('');
}

function applyGamePreset(gameId) {
    const game = gamesData.find(g => g.id === gameId);
    if (!game) return;

    state.suggestedTier = game.tier;

    // Clear existing to ensure a fresh, clean auto-build
    state.components = {};

    // Auto-select loop
    categories.forEach(cat => {
        const { compatible, suggestions } = getCompatibleProducts(cat.name, cat.id);

        let targetList = suggestions.length > 0 ? suggestions : compatible;

        if (targetList.length > 0) {
            // Pick the best one (usually most expensive in the tier for auto-build "best" experience)
            const sorted = [...targetList].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            state.components[cat.id] = sorted[0];
        }
    });

    renderSlots();
    alert(`Auto-Build completed for ${game.name}! We've selected the best compatible parts for the ${game.tier.toUpperCase()} tier.`);
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products.php');
        state.products = await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback for local testing without actual API
        state.products = [];
    }
}

function renderSlots() {
    const container = document.getElementById('slots-container');
    container.innerHTML = categories.map(cat => {
        const selected = state.components[cat.id];
        const warning = checkItemCompatibility(cat.id, selected);

        return `
            <div class="component-slot bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4 ${selected ? 'border-blue-500 ring-1 ring-blue-500' : ''}" onclick="openSelection('${cat.id}')">
                <div class="w-12 h-12 rounded-lg ${selected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center text-xl shrink-0">
                    <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">${cat.name}</p>
                    <h3 class="font-bold text-slate-800 truncate">${selected ? selected.name : 'Select ' + cat.name}</h3>
                    ${selected ? `<p class="text-xs text-blue-600 mt-0.5">${formatSpecs(selected)}</p>` : ''}
                    ${warning ? `<p class="text-[10px] text-red-500 mt-1 font-bold animate-pulse"><i class="fa-solid fa-triangle-exclamation"></i> ${warning}</p>` : ''}
                </div>
                <div class="text-right">
                    ${selected ?
                `<p class="font-bold text-blue-600">฿${parseFloat(selected.price).toLocaleString()}</p>
                         <button onclick="event.stopPropagation(); removeComponent('${cat.id}')" class="text-xs text-red-400 hover:text-red-600 mt-1">Remove</button>`
                : '<span class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition"><i class="fa-solid fa-plus"></i></span>'}
                </div>
            </div>
        `;
    }).join('');

    updateSummary();
}

function checkItemCompatibility(catId, selected) {
    if (!selected) return null;

    const cpu = state.components['cpu'];
    const mb = state.components['mainboard'];
    const gpu = state.components['gpu'];
    const psu = state.components['psu'];
    const pcCase = state.components['case'];
    const ram = state.components['ram'];

    // Real-time checks after selection
    if (catId === 'mainboard') {
        if (cpu && selected.specs?.socket !== cpu.specs?.socket) return "Socket mismatch with CPU!";
        if (ram && selected.specs?.memory_type !== ram.specs?.type) return "RAM type mismatch!";
        if (pcCase && !compatibilityRules.isCaseCompatible(pcCase.specs?.form_factor, selected.specs?.form_factor)) return "Mainboard too large for Case!";
    }

    if (catId === 'gpu' && pcCase) {
        if (selected.specs?.length_mm > pcCase.specs?.max_gpu_length) return "GPU too long for Case!";
    }

    if (catId === 'psu') {
        const totalTDP = calculateWattage();
        const recommendedMin = totalTDP + 150; // Add 150W cushion for transients
        if (selected.specs?.wattage < recommendedMin) return `Wattage might be insufficient! (Recommended: ${recommendedMin}W+)`;
    }

    return null;
}

function openSelection(categoryId) {
    state.currentCategory = categoryId;
    const catDef = categories.find(c => c.id === categoryId);
    document.getElementById('modal-title').innerText = `Select ${catDef.name}`;

    const { compatible, suggestions } = getCompatibleProducts(catDef.name, categoryId);
    renderProductList(compatible, suggestions);

    document.getElementById('selection-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('selection-modal').classList.add('hidden');
}

function getCompatibleProducts(categoryName, categoryId) {
    const categoryMap = {
        'cpu': 'CPU',
        'cooler': 'Cooler',
        'mainboard': 'Mainboard',
        'ram': 'RAM',
        'gpu': 'GPU',
        'ssd': 'SSD',
        'psu': 'PSU',
        'case': 'Case',
        'monitor': 'Monitor',
        'gaminggear': 'GamingGear'
    };

    let dbCategory = categoryMap[categoryId] || categoryName;
    let available = state.products.filter(p => p.category === dbCategory);

    const cpu = state.components['cpu'];
    const mb = state.components['mainboard'];
    const ram = state.components['ram'];
    const pcCase = state.components['case'];

    // Pre-filtering in Choice Modal
    if (categoryId === 'mainboard') {
        if (cpu) available = available.filter(p => p.specs?.socket === cpu.specs?.socket);
        if (ram) available = available.filter(p => p.specs?.memory_type === ram.specs?.type);
        if (pcCase) available = available.filter(p => compatibilityRules.isCaseCompatible(pcCase.specs?.form_factor, p.specs?.form_factor));
    }

    if (categoryId === 'cpu' && mb) {
        available = available.filter(p => p.specs?.socket === mb.specs?.socket);
    }

    if (categoryId === 'ram' && mb) {
        available = available.filter(p => p.specs?.type === mb.specs?.memory_type);
    }

    if (categoryId === 'case' && mb) {
        available = available.filter(p => compatibilityRules.isCaseCompatible(p.specs?.form_factor, mb.specs?.form_factor));
    }

    // Sort by tier if suggested
    let suggestions = [];
    if (state.suggestedTier) {
        suggestions = available.filter(p => isProductInTier(p, state.suggestedTier));
    }

    return { compatible: available, suggestions };
}

function isProductInTier(p, tier) {
    const price = parseFloat(p.price);
    if (tier === 'entry') return price < 10000;
    if (tier === 'mid') return price >= 10000 && price < 25000;
    if (tier === 'high') return price >= 25000;
    return false;
}

function renderProductList(products, suggestions) {
    const list = document.getElementById('product-list');
    if (products.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-slate-400">No compatible products found in stock.</div>`;
        return;
    }

    let html = '';

    if (suggestions.length > 0) {
        html += `<h5 class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2"><i class="fa-solid fa-star"></i> Recommended for Tier: ${state.suggestedTier.toUpperCase()}</h5>`;
        html += suggestions.map(p => renderProductCard(p, true)).join('');
        html += `<div class="h-px bg-slate-200 my-6"></div>`;
        html += `<h5 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">All Compatible Products</h5>`;
    }

    html += products.filter(p => !suggestions.includes(p)).map(p => renderProductCard(p, false)).join('');
    list.innerHTML = html;
}

function renderProductCard(p, isSuggested) {
    const specsStr = formatSpecs(p);
    return `
        <div onclick="selectProduct(${p.id})" class="bg-white p-4 rounded-xl border ${isSuggested ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200'} hover:border-blue-400 cursor-pointer transition mb-3 flex justify-between items-center group relative overflow-hidden">
            ${isSuggested ? '<div class="absolute top-0 right-0 bg-blue-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">TOP PICK</div>' : ''}
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-box text-slate-300 group-hover:text-blue-500 transition"></i>
                </div>
                <div class="min-w-0">
                    <h4 class="font-bold text-slate-800 truncate">${p.name}</h4>
                    <p class="text-xs text-slate-500 mt-1">${specsStr}</p>
                    <div class="mt-1 flex gap-2">
                        <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">Stock: ${p.quantity}</span>
                        ${p.warranty_months ? `<span class="text-[10px] bg-green-50 px-2 py-0.5 rounded text-green-600">Warranty: ${p.warranty_months}m</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="text-right shrink-0">
                <p class="font-bold text-blue-600 text-lg">฿${parseFloat(p.price).toLocaleString()}</p>
                <button class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium group-hover:bg-blue-600 group-hover:text-white transition mt-1">Select</button>
            </div>
        </div>
    `;
}

function selectProduct(id) {
    const product = state.products.find(p => p.id === id);
    if (product) {
        state.components[state.currentCategory] = product;
        renderSlots();
        closeModal();
    }
}

function removeComponent(catId) {
    delete state.components[catId];
    renderSlots();
}

function updateSummary() {
    let total = 0;
    const summaryList = document.getElementById('summary-list');
    summaryList.innerHTML = '';

    let hasItems = false;
    for (const [key, comp] of Object.entries(state.components)) {
        if (comp) {
            hasItems = true;
            total += parseFloat(comp.price);
            summaryList.innerHTML += `
                 <div class="flex justify-between items-start text-sm mb-2">
                    <span class="text-slate-600 truncate w-2/3">${comp.name}</span>
                    <span class="font-bold text-slate-800">฿${parseFloat(comp.price).toLocaleString()}</span>
                </div>
            `;
        }
    }

    if (!hasItems) {
        summaryList.innerHTML = `
            <div class="text-center text-slate-400 py-10">
                <i class="fa-solid fa-microchip text-4xl mb-3 opacity-50"></i>
                <p>Select components to start your build</p>
            </div>
        `;
    }

    const watts = calculateWattage();
    document.getElementById('total-wattage').innerText = watts;

    document.getElementById('header-total-price').innerText = total.toLocaleString();
    document.getElementById('summary-total-price').innerText = total.toLocaleString();

    const filledCount = Object.keys(state.components).length;
    const totalSlots = categories.length;
    document.getElementById('progress-bar').style.width = `${(filledCount / totalSlots) * 100}%`;
}

function proceedToCheckout() {
    const items = [];
    for (const [key, comp] of Object.entries(state.components)) {
        if (comp) items.push(comp);
    }

    if (items.length === 0) {
        alert('Please select at least one component.');
        return;
    }

    localStorage.setItem('pc_build_cart', JSON.stringify(items));
    window.location.href = 'checkout.html';
}

function calculateWattage() {
    let watts = 80; // Motherboard + Fans + SSD base (upped from 50)
    const cpu = state.components['cpu'];
    const gpu = state.components['gpu'];

    if (cpu && cpu.specs?.tdp) watts += parseInt(cpu.specs.tdp);
    if (gpu && gpu.specs?.tdp) watts += parseInt(gpu.specs.tdp);

    // If it's a high-end CPU/GPU, add a safety buffer
    if (cpu && (cpu.name.includes('i9') || cpu.name.includes('Ryzen 9'))) watts += 50;
    if (gpu && (gpu.name.includes('4090') || gpu.name.includes('7900'))) watts += 100;

    return watts;
}

function formatSpecs(product) {
    if (!product.specs) return '';
    const s = product.specs;
    if (product.category === 'CPU') return `${s.socket} | ${s.cores}C/${s.threads}T | ${s.base_clock}`;
    if (product.category === 'Mainboard') return `${s.socket} | ${s.chipset} | ${s.form_factor} | ${s.memory_type}`;
    if (product.category === 'RAM') return `${s.type} | ${s.capacity} | ${s.speed}`;
    if (product.category === 'GPU') return `${s.chipset} | ${s.memory} | ${s.length_mm}mm`;
    if (product.category === 'PSU') return `${s.wattage}W | ${s.certification}`;
    if (product.category === 'Case') return `${s.form_factor} | Max GPU: ${s.max_gpu_length}mm`;
    if (product.category === 'SSD') return `${s.capacity} | ${s.interface}`;
    if (product.category === 'Monitor') return `${s.size} | ${s.resolution} | ${s.refresh_rate}`;
    if (product.category === 'Cooler') return `${s.type} | ${s.tdp_rating ? s.tdp_rating + 'W TDP' : s.size}`;
    if (product.category === 'GamingGear') return `${s.type} | ${s.switch || s.dpi + ' DPI'}`;
    return '';
}

