document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitOrder();
    });
});

let cartItems = [];
let totalAmount = 0;

function loadCart() {
    const stored = localStorage.getItem('pc_build_cart');
    if (!stored) {
        alert('Your cart is empty. Redirecting to builder.');
        window.location.href = 'builder.html';
        return;
    }

    cartItems = JSON.parse(stored);
    renderCart();
}

function renderCart() {
    const container = document.getElementById('order-items');
    container.innerHTML = '';

    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += parseFloat(item.price);
        container.innerHTML += `
            <div class="flex justify-between items-start text-sm">
                <div>
                    <p class="font-medium text-slate-700">${item.name}</p>
                    <p class="text-xs text-slate-400">${item.category}</p>
                </div>
                <span class="font-semibold text-slate-600">฿${parseFloat(item.price).toLocaleString()}</span>
            </div>
        `;
    });

    const assembly = 500;
    totalAmount = subtotal + assembly;

    document.getElementById('subtotal').innerText = subtotal.toLocaleString();
    document.getElementById('assembly-fee').innerText = assembly.toLocaleString();
    document.getElementById('total').innerText = totalAmount.toLocaleString();
}

async function submitOrder() {
    const customerName = document.getElementById('customer_name').value;
    const customerTaxId = document.getElementById('customer_tax_id').value;
    const customerAddress = document.getElementById('customer_address').value;

    const payload = {
        customer_name: customerName,
        customer_tax_id: customerTaxId,
        customer_address: customerAddress,
        items: cartItems.map(item => ({ id: item.id, price: item.price })),
        total: totalAmount
    };

    try {
        const response = await fetch('/api/orders.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.removeItem('pc_build_cart');
            document.getElementById('order-id').innerText = '#' + result.order_id;
            document.getElementById('success-modal').classList.remove('hidden');
        } else {
            alert('Order Failed: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Order error:', error);
        alert('Network error failed to submit order.');
    }
}
