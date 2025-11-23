'use strict';
import { products } from './products.js';
import { formatRupiah } from './globals.js';

const cartItemsContainer = document.querySelector('.cart-items');
const cartTotalElm = document.querySelector('.cart-summary .total .price');
const orderForm = document.getElementById('order-form');
const checkoutButton = document.querySelector('.checkout-button');

const getCart = () => {
    return JSON.parse(localStorage.getItem('cart') || '[]');
};

const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const updateCheckoutButtonState = () => {
    if (!orderForm || !checkoutButton) return;
    const cart = getCart();
    const isFormValid = orderForm.checkValidity();
    const isCartEmpty = cart.length === 0;
    checkoutButton.disabled = !isFormValid || isCartEmpty;
};

orderForm.addEventListener('input', updateCheckoutButtonState);

orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(orderForm);
    const orderDetails = Object.fromEntries(formData.entries());
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.amount, 0);

    const orderSummary = {
        ...orderDetails,
        items: cart,
        total,
    };

    sessionStorage.setItem('orderSummary', JSON.stringify(orderSummary));
    saveCart([]); // Clear the cart
    window.location.href = '/order-summary.html';
});

const updateCartItemAmount = (productName, newAmount) => {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.name === productName);
    if (itemIndex > -1) {
        cart[itemIndex].amount = newAmount;
        if (cart[itemIndex].amount <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart(cart);
        window.dispatchEvent(new Event('cartUpdated'));
        renderCart();
    }
};

const removeItemFromCart = (productName) => {
    let cart = getCart();
    const newCart = cart.filter(item => item.name !== productName);
    saveCart(newCart);
    window.dispatchEvent(new Event('cartUpdated'));
    renderCart();
};

const renderCart = () => {
    const cart = getCart();
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotalElm.textContent = formatRupiah(0);
        return;
    }

    cart.forEach((item) => {
        const product = products.find(p => p.name === item.name);
        if (!product) return; // Should not happen if products data is consistent

        const itemSubtotal = product.price * item.amount;
        total += itemSubtotal;

        const cartItemElm = document.createElement('div');
        cartItemElm.className = 'cart-item';
        cartItemElm.innerHTML = `
            <div class="item-image">
                <img src="/assets/products/${product.name}.webp" alt="${product.name}" />
            </div>
            <div class="item-info">
                <div class="item-details">
                    <a href="/product.html?name=${encodeURIComponent(product.name)}" class="item-name">${product.name}</a>
                    <div class="item-price">${formatRupiah(product.price)}</div>
                </div>
                <div class="item-actions">
                    <div class="amount-controls">
                        <button class="decrease-amount"><i data-lucide="minus"></i></button>
                        <input type="number" value="${item.amount}" min="1" data-product-name="${product.name}" />
                        <button class="increase-amount"><i data-lucide="plus"></i></button>
                    </div>
                    <button class="remove-item"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
        `;

        cartItemElm.querySelector('.decrease-amount').addEventListener('click', () => {
            let amount = parseInt(cartItemElm.querySelector('input').value, 10);
            if (amount > 1) {
                updateCartItemAmount(product.name, amount - 1);
            }
        });

        cartItemElm.querySelector('.increase-amount').addEventListener('click', () => {
            let amount = parseInt(cartItemElm.querySelector('input').value, 10);
            updateCartItemAmount(product.name, amount + 1);
        });

        cartItemElm.querySelector('input[type="number"]').addEventListener('change', (event) => {
            let amount = parseInt(event.target.value, 10);
            if (isNaN(amount) || amount < 1) {
                amount = 1; // Default to 1 if invalid
            }
            updateCartItemAmount(product.name, amount);
        });

        cartItemElm.querySelector('.remove-item').addEventListener('click', () => {
            removeItemFromCart(product.name);
        });

        cartItemsContainer.appendChild(cartItemElm);
    });

    cartTotalElm.textContent = formatRupiah(total);
    window.lucide.createIcons();
    updateCheckoutButtonState();
};

renderCart();