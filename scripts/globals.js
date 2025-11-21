import { categoryTags, products } from './products.js';
import { renderSimpleIcons, renderTemplates } from './templates.js';

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

renderTemplates();
renderSimpleIcons();
lucide.createIcons({
    attrs: {
        width: '1em',
        height: '1em',
    },
});

const updateAtTop = () => {
    const atTop = window.scrollY === 0;
    document.body.dataset.atTop = atTop;
};

updateAtTop();
window.addEventListener('scroll', updateAtTop);

const debug = document.createElement('pre');
debug.innerText = JSON.stringify(categoryTags, null, 4);

