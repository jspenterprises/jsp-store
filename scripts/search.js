import { products } from './products.js';

const normalize = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();

const filterProducts = () => {
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

document.querySelector('main').innerHTML += `<pre>${JSON.stringify(
    filterProducts(),
    null,
    4
)}</pre>`;
