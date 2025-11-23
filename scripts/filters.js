'use strict';
import { products } from './products.js';

const filtersElm = document.querySelector('.filters');

const getFiltersFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categories = (urlParams.get('category') || '').split(',').filter(Boolean);
    const tags = (urlParams.get('tags') || '').split(',').filter(Boolean);
    return { categories, tags };
};

const updateURL = (key, value) => {
    const url = new URL(window.location);
    if (!value) {
        url.searchParams.delete(key);
    } else {
        url.searchParams.set(key, value);
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
        
    updateURL('category', newCategories.join(','));
};

const handleTagChange = (event) => {
    const { checked, value } = event.target;
    const { tags } = getFiltersFromURL();

    const newTags = checked
        ? [...tags, value]
        : tags.filter((t) => t !== value);
        
    updateURL('tags', newTags.join(','));
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

export const renderFilters = () => {
    const categoriesAndTags = products.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = new Set();
        }
        product.tags.forEach(tag => acc[product.category].add(tag));
        return acc;
    }, {});

    for (const category in categoriesAndTags) {
        categoriesAndTags[category] = [...categoriesAndTags[category]].sort();
    }
    
    const allCategories = Object.keys(categoriesAndTags).sort();

    const { categories: selectedCategories, tags: selectedTags } = getFiltersFromURL();

    filtersElm.innerHTML = '';

    const categoryFilter = createCategoryFilter(allCategories, selectedCategories);
    filtersElm.appendChild(categoryFilter);

    const tagFilter = createTagFilter(categoriesAndTags, selectedTags);
    filtersElm.appendChild(tagFilter);
};
