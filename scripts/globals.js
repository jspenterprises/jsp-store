import { renderAllTemplates, renderSimpleIcons } from './templates.js';
import { categoryTags } from './products.js';

/**
 * @param {number} input
 */
export const formatRupiah = (input, decimalPlaces = 0) => {
    const n = Number(input);
    if (!isFinite(n)) return '';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    }).format(n);
};

/**
 * @template
 * @param {T[]} array
 * @param {number} count
 * @returns {T[]}
 */
export const pickRandomElmsNoDupe = (array, count) => {
    if (!Array.isArray(array)) return [];
    const c = Math.min(Math.max(count, 0), array.length);

    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy.slice(0, c);
};

const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.amount, 0);
    const cartCountElm = document.querySelector('.cart-count');

    if (cartCountElm) {
        cartCountElm.textContent = totalItems > 99 ? '99+' : totalItems.toString();
        cartCountElm.style.display = totalItems > 0 ? 'flex' : 'none';
    }
};

renderAllTemplates();
renderSimpleIcons();
lucide.createIcons({
    attrs: {
        width: '1em',
        height: '1em',
    },
});

updateCartCount(); // Initial call
window.addEventListener('storage', updateCartCount); // Update on storage changes
window.addEventListener('cartUpdated', updateCartCount); // Custom event for internal updates

const updateAtTop = () => {
    const atTop = window.scrollY === 0;
    document.body.dataset.atTop = atTop;
};

updateAtTop();
window.addEventListener('scroll', updateAtTop);

const debug = document.createElement('pre');
debug.innerText = JSON.stringify(categoryTags, null, 4);
