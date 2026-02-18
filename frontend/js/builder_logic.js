/**
 * Intelligent PC Builder Logic
 */

const categories = [
    { id: 'cpu', name: 'CPU', icon: 'fa-microchip' },
    { id: 'mainboard', name: 'Mainboard', icon: 'fa-chess-board' },
    { id: 'ram', name: 'Memory (RAM)', icon: 'fa-memory' },
    { id: 'gpu', name: 'Graphics Card', icon: 'fa-gamepad' },
    { id: 'ssd', name: 'Storage (SSD)', icon: 'fa-hard-drive' },
    { id: 'psu', name: 'Power Supply', icon: 'fa-plug' },
    { id: 'case', name: 'Case', icon: 'fa-box' }
];

const state = {
    components: {},
    products: [],
    currentCategory: null
};

document.addEventListener('DOMContentLoaded', () => {
    initBuilder();
});

async function initBuilder() {
    renderSlots();
    await fetchProducts();
}

async function fetchProducts() {
    try {
        const response = await fetch('/api/products.php');
        state.products = await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Failed to load products. Please check the backend.');
    }
}

function renderSlots() {
    const container = document.getElementById('slots-container');
    container.innerHTML = categories.map(cat => {
        const selected = state.components[cat.id];
        return `
            <div class="component-slot bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4 ${selected ? 'border-blue-500 ring-1 ring-blue-500' : ''}" onclick="openSelection('${cat.id}')">
                <div class="w-12 h-12 rounded-lg ${selected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center text-xl shrink-0">
                    <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">${cat.name}</p>
                    <h3 class="font-bold text-slate-800 truncate">${selected ? selected.name : 'Select ' + cat.name}</h3>
                    ${selected ? `<p class="text-xs text-blue-600 mt-0.5">${formatSpecs(selected)}</p>` : ''}
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

function openSelection(categoryId) {
    state.currentCategory = categoryId;
    const catDef = categories.find(c => c.id === categoryId);
    document.getElementById('modal-title').innerText = `Select ${catDef.name}`;

    const compatible = getCompatibleProducts(catDef.name, categoryId);
    renderProductList(compatible);

    document.getElementById('selection-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('selection-modal').classList.add('hidden');
}

function getCompatibleProducts(categoryName, categoryId) {
    // Determine DB Category
    let dbCategory = categoryName;
    if (categoryId === 'ram') dbCategory = 'RAM'; // Ensure match
    if (categoryId === 'ssd') dbCategory = 'SSD'; // Ensure match

    // Basic filter by category
    let available = state.products.filter(p => p.category === dbCategory || p.category.toLowerCase() === categoryName.toLowerCase());

    // Compatibility Logic
    const cpu = state.components['cpu'];
    const mb = state.components['mainboard'];
    const ram = state.components['ram']; // corrected access

    // 1. CPU <-> Mainboard (Socket)
    if (categoryId === 'mainboard' && cpu) {
        available = available.filter(p => p.specs?.socket === cpu.specs?.socket);
    }
    if (categoryId === 'cpu' && mb) {
        available = available.filter(p => p.specs?.socket === mb.specs?.socket);
    }

    // 2. RAM <-> Mainboard (DDR Type)
    if (categoryId === 'ram' && mb) {
        available = available.filter(p => p.specs?.type === mb.specs?.memory_type);
    }
    if (categoryId === 'mainboard' && ram) {
        available = available.filter(p => p.specs?.memory_type === ram.specs?.type);
    }

    return available;
}

function renderProductList(products) {
    const list = document.getElementById('product-list');
    if (products.length === 0) {
        list.innerHTML = `<div class="text-center py-10 text-slate-400">No compatible products found in stock.</div>`;
        return;
    }

    list.innerHTML = products.map(p => {
        const specsStr = formatSpecs(p);
        return `
            <div onclick="selectProduct(${p.id})" class="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer transition mb-3 flex justify-between items-center group">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <i class="fa-solid fa-box text-slate-300 group-hover:text-blue-500 transition"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800">${p.name}</h4>
                        <p class="text-xs text-slate-500 mt-1">${specsStr}</p>
                        <div class="mt-1 flex gap-2">
                             <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">Stock: ${p.quantity}</span>
                             ${p.warranty_months ? `<span class="text-[10px] bg-green-50 px-2 py-0.5 rounded text-green-600">Warranty: ${p.warranty_months}m</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-blue-600 text-lg">฿${parseFloat(p.price).toLocaleString()}</p>
                    <button class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium group-hover:bg-blue-600 group-hover:text-white transition mt-1">Select</button>
                </div>
            </div>
        `;
    }).join('');
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

    const filled = Object.keys(state.components).length;
    const totalSlots = categories.length;
    document.getElementById('progress-bar').style.width = `${(filled / totalSlots) * 100}%`;
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
    let watts = 50;
    const cpu = state.components['cpu'];
    const gpu = state.components['gpu'];

    if (cpu && cpu.specs?.tdp) watts += parseInt(cpu.specs.tdp);
    if (gpu && gpu.specs?.tdp) watts += parseInt(gpu.specs.tdp);

    return watts;
}

function formatSpecs(product) {
    if (!product.specs) return '';
    const s = product.specs;
    if (product.category === 'CPU') return `${s.socket} | ${s.cores}C/${s.threads}T | ${s.base_clock}`;
    if (product.category === 'Mainboard') return `${s.socket} | ${s.chipset} | ${s.memory_type}`;
    if (product.category === 'RAM') return `${s.type} | ${s.capacity} | ${s.speed}`;
    if (product.category === 'GPU') return `${s.chipset} | ${s.memory}`;
    if (product.category === 'PSU') return `${s.wattage}W | ${s.certification}`;
    if (product.category === 'Case') return `${s.form_factor}`;
    if (product.category === 'SSD') return `${s.capacity} | ${s.interface}`;
    return '';
}
