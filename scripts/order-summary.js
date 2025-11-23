'use strict';
import { formatRupiah } from './globals.js';

const renderOrderSummary = () => {
    const orderSummaryContainer = document.querySelector('.order-summary-container');
    const orderSummary = JSON.parse(sessionStorage.getItem('orderSummary'));

    if (!orderSummary || !orderSummaryContainer) {
        orderSummaryContainer.innerHTML = '<p>No order summary found.</p>';
        return;
    }

    const { fullName, phoneNumber, email, dob, address, notes, items, total } = orderSummary;

    orderSummaryContainer.innerHTML = `
        <div class="order-details">
            <h2>Order Details</h2>
            <div class="detail-item">
                <strong>Full Name:</strong>
                <span>${fullName}</span>
            </div>
            <div class="detail-item">
                <strong>Phone Number:</strong>
                <span>${phoneNumber}</span>
            </div>
            <div class="detail-item">
                <strong>Email:</strong>
                <span>${email}</span>
            </div>
            <div class="detail-item">
                <strong>Date of Birth:</strong>
                <span>${dob}</span>
            </div>
            <div class="detail-item">
                <strong>Address:</strong>
                <span>${address}</span>
            </div>
            ${notes ? `
            <div class="detail-item">
                <strong>Additional Notes:</strong>
                <span>${notes}</span>
            </div>` : ''}
        </div>

        <div class="order-items">
            <h2>Items Ordered</h2>
            <div class="order-items-list">
                ${items.map(item => `
                    <div class="order-item">
                        <div class="item-image">
                            <img src="/assets/products/${item.name}.webp" alt="${item.name}" />
                        </div>
                        <div class="item-details">
                            <div>${item.name} (x${item.amount})</div>
                            <div>${formatRupiah(item.price)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-total summary-item">
                <strong>Total:</strong>
                <span>${formatRupiah(total)}</span>
            </div>
        </div>
    `;
};

renderOrderSummary();
