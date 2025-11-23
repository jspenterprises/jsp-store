'use strict';
import { products } from './products.js';
import { renderTemplate } from './templates.js';

const normalize = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();
const encode = (str) => str.replace(/\s+/g, '-');
const decode = (str) => str.replace(/-/g, ' ');

export const filterProducts = () => {
    const {
        q,
        categories: selectedCategories,
        tags: selectedTags,
    } = getFiltersFromURL();

    return products.filter((p) => {
        // q search
        if (q) {
            const haystack = normalize(
                `${p.name} ${p.category} ${p.manufacturer} ${p.tags.join(' ')}`
            );
            if (!haystack.includes(q)) return false;
        }

        // category filter
        if (selectedCategories.length && !selectedCategories.includes(p.category)) {
            return false;
        }

        // tag filter
        if (selectedTags.length) {
            if (!selectedTags.every((tag) => p.tags.includes(tag))) {
                return false;
            }
        }

        return true;
    });
};

const getFiltersFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = normalize(urlParams.get('q') || '');
    const categories = (urlParams.get('category') || '')
        .split('_')
        .filter(Boolean)
        .map(decode);
    const tags = (urlParams.get('tags') || '').split('_').filter(Boolean).map(decode);
    return { q, categories, tags };
};

const updateURL = (key, value) => {
    const url = new URL(window.location);
    if (!value || value.length === 0) {
        url.searchParams.delete(key);
    } else {
        const encodedValue = Array.isArray(value)
            ? value.map(encode).join('_')
            : encode(value);
        url.searchParams.set(key, encodedValue);
    }
    history.pushState({}, '', url);
    window.dispatchEvent(new Event('filtersChanged'));
};

const handleCategoryChange = (event) => {
    const { checked, value } = event.target;
    const { categories } = getFiltersFromURL();

    const newCategories = checked
        ? [...categories, value]
        : categories.filter((c) => c !== value);

    updateURL('category', newCategories);
};

const handleTagChange = (event) => {
    const { checked, value } = event.target;
    const { tags } = getFiltersFromURL();

    // Sync all checkboxes with the same tag value
    const allTagCheckboxes = document.querySelectorAll(
        `input[type="checkbox"][value="${value}"]`
    );
    allTagCheckboxes.forEach((checkbox) => {
        checkbox.checked = checked;
    });

    const newTags = checked
        ? [...new Set([...tags, value])]
        : tags.filter((t) => t !== value);

    updateURL('tags', newTags);
};

const createCategoryFilter = (categories, selectedCategories) => {
    const details = document.createElement('details');
    details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Category';
    const content = document.createElement('div');
    content.className = 'content';
    const ul = document.createElement('ul');

    categories.forEach((category) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category;
        checkbox.checked = selectedCategories.includes(category);
        checkbox.addEventListener('change', handleCategoryChange);
        label.appendChild(checkbox);
        label.append(category);
        li.appendChild(label);
        ul.appendChild(li);
    });

    content.appendChild(ul);
    details.appendChild(summary);
    details.appendChild(content);
    return details;
};

const createTagFilter = (categoriesAndTags, selectedTags) => {
    const tagFiltersContainer = document.createDocumentFragment();

    for (const category in categoriesAndTags) {
        const tags = categoriesAndTags[category];
        if (tags.length === 0) continue;

        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = category;
        const content = document.createElement('div');
        content.className = 'content';
        const ul = document.createElement('ul');

        tags.forEach((tag) => {
            const li = document.createElement('li');
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag;
            checkbox.checked = selectedTags.includes(tag);
            checkbox.addEventListener('change', handleTagChange);
            label.appendChild(checkbox);
            label.append(tag);
            li.appendChild(label);
            ul.appendChild(li);
        });

        content.appendChild(ul);
        details.appendChild(summary);
        details.appendChild(content);
        tagFiltersContainer.appendChild(details);
    }
    return tagFiltersContainer;
};

const renderFilters = () => {
    const filtersElm = document.querySelector('.filters');
    if (!filtersElm) return;
    
    const categoriesAndTags = products.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = new Set();
        }
        product.tags.forEach((tag) => acc[product.category].add(tag));
        return acc;
    }, {});

    for (const category in categoriesAndTags) {
        categoriesAndTags[category] = [...categoriesAndTags[category]].sort();
    }

    const allCategories = Object.keys(categoriesAndTags).sort();

    const { categories: selectedCategories, tags: selectedTags } =
        getFiltersFromURL();

    filtersElm.innerHTML = '';

    const categoryFilter = createCategoryFilter(allCategories, selectedCategories);
    filtersElm.appendChild(categoryFilter);

    const tagFilter = createTagFilter(categoriesAndTags, selectedTags);
    filtersElm.appendChild(tagFilter);
};

const resultsElm = document.querySelector('.search-results');
const updateSearchResults = () => {
    const filteredProducts = filterProducts();
    resultsElm.replaceChildren();
    filteredProducts.forEach((p) => {
        const card = renderTemplate('product-card', {
            productName: p.name,
            variant: 'wide',
        });
        resultsElm.appendChild(card);
    });
};

renderFilters();
updateSearchResults();

window.addEventListener('filtersChanged', () => {
    renderFilters(); 
    updateSearchResults();
});

window.addEventListener('popstate', () => {
    renderFilters();
    updateSearchResults();
});
