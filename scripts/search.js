import { products } from './products.js';
import { renderTemplate } from './templates.js';

const normalize = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();

export const filterProducts = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const q = normalize(urlParams.get('q') || '');

    const category = (urlParams.get('category') || '')
        .split(',')
        .map((c) => c.toLowerCase())
        .filter(Boolean);

    const tags = (urlParams.get('tags') || '')
        .split(',')
        .map((t) => t.toLowerCase())
        .filter(Boolean);

    return products.filter((p) => {
        // q search
        if (q) {
            const haystack = normalize(
                `${p.name} ${p.category} ${p.manufacturer} ${p.tags.join(' ')}`
            );
            if (!haystack.includes(q)) return false;
        }

        // category filter
        if (category.length && !category.includes(p.category.toLowerCase())) {
            return false;
        }

        // tag filter
        if (tags.length) {
            const productTags = p.tags.map((t) => t.toLowerCase());
            if (!tags.every((tag) => productTags.includes(tag))) {
                return false;
            }
        }

        return true;
    });
};

const resultsElm = document.querySelector('.search-results');
const updateSearchResults = () => {
    const filteredProducts = filterProducts();
    resultsElm.replaceChildren();
    filteredProducts.forEach((p) => {
        const card = renderTemplate('product-card', { productName: p.name, variant: 'wide' });
        resultsElm.appendChild(card);
    });
};
updateSearchResults();