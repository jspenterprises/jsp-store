'use strict';
import { formatRupiah } from './globals.js';
import { products } from './products.js';

const getProductFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('name');
    return products.find((p) => p.name === productName);
};

const renderProduct = () => {
    const product = getProductFromURL();
    const container = document.querySelector('.product-container');
    const amountInput = container.querySelector('input[name="amount"]');
    const minusButton = container.querySelector('.amount-controls button:first-child');
    const plusButton = container.querySelector('.amount-controls button:last-child');
    const subtotalPriceElm = container.querySelector('.subtotal .price');
    const addToCartForm = container.querySelector('.product-controls');

    if (!product || !container) {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = '<p>Product not found!</p>';
        }
        return;
    }

    const { name, manufacturer, price, category } = product;
    const imagePath = `/assets/products/${name}.webp`;

    document.title = `${name} - JSP Store`;

    container.querySelector('.product-image img').src = imagePath;
    container.querySelector('.product-image img').alt = name;
    container.querySelector('.product-name').textContent = name;
    container.querySelector(
        '.product-manufacturer'
    ).innerHTML = `<a href="/search.html?category=${category}">${category}</a> by <a href="/search.html?manufacturer=${manufacturer}">${manufacturer}</a>`;
    container.querySelector('.product-price').textContent = formatRupiah(price);

    const updateSubtotal = () => {
        const amount = parseInt(amountInput.value, 10);
        const subtotal = price * amount;
        subtotalPriceElm.textContent = formatRupiah(subtotal);
    };

    minusButton.addEventListener('click', () => {
        let amount = parseInt(amountInput.value, 10);
        if (amount > 1) {
            amountInput.value = amount - 1;
            updateSubtotal();
        }
    });

    plusButton.addEventListener('click', () => {
        let amount = parseInt(amountInput.value, 10);
        amountInput.value = amount + 1;
        updateSubtotal();
    });

    amountInput.addEventListener('change', () => {
        let amount = parseInt(amountInput.value, 10);
        if (amount < 1 || isNaN(amount)) {
            amountInput.value = 1;
        }
        updateSubtotal();
    });

    addToCartForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const amount = parseInt(amountInput.value, 10);
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        const existingItemIndex = cart.findIndex((item) => item.name === product.name);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].amount += amount;
        } else {
            cart.push({ name: product.name, price: product.price, amount: amount });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${amount}x ${product.name} added to cart!`);
        window.location.reload();
    });

    updateSubtotal();

    const description = `
        <p>
            <strong>Tags:</strong> ${product.tags
                .map((tag) => `<a href="/search.html?tags=${tag}">${tag}</a>`)
                .join(', ')}
        </p>
    `;
    container.querySelector('.product-description').innerHTML = description;
};

renderProduct();
