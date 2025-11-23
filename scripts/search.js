'use strict';
import { products } from './products.js';
import { renderTemplate } from './templates.js';

const normalize = (str) => str.toLowerCase().replace(/\s+/g, ' ').trim();
const encode = (str) => str.replace(/\s+/g, '-');
const decode = (str) => str.replace(/-/g, ' ');

const ITEMS_PER_PAGE = 10;

const getStateFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const q = normalize(urlParams.get('q') || '');
    const categories = (urlParams.get('category') || '').split('_').filter(Boolean).map(decode);
    const manufacturers = (urlParams.get('manufacturer') || '').split('_').filter(Boolean).map(decode);
    const tags = (urlParams.get('tags') || '').split('_').filter(Boolean).map(decode);
    const page = parseInt(urlParams.get('page') || '1', 10);
    return { q, categories, manufacturers, tags, page };
};

const getFilteredProducts = () => {
    const { q, categories: selectedCategories, manufacturers: selectedManufacturers, tags: selectedTags } = getStateFromURL();

    return products.filter((p) => {
        if (
            q &&
            !normalize(`${p.name} ${p.category} ${p.manufacturer} ${p.tags.join(' ')}`).includes(q)
        )
            return false;
        if (selectedCategories.length && !selectedCategories.includes(p.category)) return false;
        if (selectedManufacturers.length && !selectedManufacturers.includes(p.manufacturer)) return false;
        if (selectedTags.length && !selectedTags.some((tag) => p.tags.includes(tag))) return false;
        return true;
    });
};

const updateURLParams = (params) => {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value.length === 0) {
            url.searchParams.delete(key);
        } else {
            const encodedValue = Array.isArray(value)
                ? value.map(encode).join('_')
                : encode(String(value));
            url.searchParams.set(key, encodedValue);
        }
    });
    history.pushState({}, '', url);
    window.dispatchEvent(new Event('filtersChanged'));
};

const handleCategoryChange = (event) => {
    const { checked, value } = event.target;
    const { categories } = getStateFromURL();
    const newCategories = checked ? [...categories, value] : categories.filter((c) => c !== value);
    updateURLParams({ category: newCategories, page: 1 });
};

const handleTagChange = (event) => {
    const { checked, value } = event.target;
    const { tags } = getStateFromURL();
    const allTagCheckboxes = document.querySelectorAll(`input[type="checkbox"][value="${value}"]`);
    allTagCheckboxes.forEach((checkbox) => {
        checkbox.checked = checked;
    });
    const newTags = checked ? [...new Set([...tags, value])] : tags.filter((t) => t !== value);
    updateURLParams({ tags: newTags, page: 1 });
};

const createCategoryFilter = (categories, selectedCategories) => {
    const details = document.createElement('details');
    details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Category';
    summary.dataset.filterKey = 'category';
    if (selectedCategories.length > 0) {
        const count = document.createElement('span');
        count.className = 'filter-count';
        count.textContent = selectedCategories.length;
        summary.appendChild(count);
    }
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

const handleManufacturerChange = (event) => {
    const { checked, value } = event.target;
    const { manufacturers } = getStateFromURL();
    const newManufacturers = checked ? [...manufacturers, value] : manufacturers.filter((m) => m !== value);
    updateURLParams({ manufacturer: newManufacturers, page: 1 });
};

const createManufacturerFilter = (manufacturers, selectedManufacturers) => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Manufacturer';
    summary.dataset.filterKey = 'manufacturer';
    if (selectedManufacturers.length > 0) {
        const count = document.createElement('span');
        count.className = 'filter-count';
        count.textContent = selectedManufacturers.length;
        summary.appendChild(count);
    }
    const content = document.createElement('div');
    content.className = 'content';
    const ul = document.createElement('ul');
    manufacturers.forEach((manufacturer) => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = manufacturer;
        checkbox.checked = selectedManufacturers.includes(manufacturer);
        checkbox.addEventListener('change', handleManufacturerChange);
        label.appendChild(checkbox);
        label.append(manufacturer);
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
        summary.dataset.filterKey = category;
        const selectedCount = tags.filter((tag) => selectedTags.includes(tag)).length;
        if (selectedCount > 0) {
            const count = document.createElement('span');
            count.className = 'filter-count';
            count.textContent = selectedCount;
            summary.appendChild(count);
        }
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
    const openStates = new Map();
    filtersElm.querySelectorAll('details').forEach((details) => {
        const summary = details.querySelector('summary');
        const key = summary?.dataset.filterKey;
        if (key) {
            openStates.set(key, details.open);
        }
    });
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
    const allManufacturers = [...new Set(products.map((p) => p.manufacturer))].sort();
    const { categories: selectedCategories, manufacturers: selectedManufacturers, tags: selectedTags } = getStateFromURL();
    filtersElm.innerHTML = '';
    const categoryFilter = createCategoryFilter(allCategories, selectedCategories);
    filtersElm.appendChild(categoryFilter);
    const manufacturerFilter = createManufacturerFilter(allManufacturers, selectedManufacturers);
    filtersElm.appendChild(manufacturerFilter);
    const tagFilter = createTagFilter(categoriesAndTags, selectedTags);
    filtersElm.appendChild(tagFilter);
    filtersElm.querySelectorAll('details').forEach((details) => {
        const summary = details.querySelector('summary');
        const key = summary?.dataset.filterKey;
        if (key && openStates.has(key)) {
            details.open = openStates.get(key);
        }
    });
};

const paginationElm = document.querySelector('.pagination');

const renderPagination = (totalItems, currentPage) => {
    if (!paginationElm) return;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    paginationElm.innerHTML = '';
    if (totalPages <= 1) return;
    const createButton = (icon, page, disabled) => {
        const button = document.createElement('button');
        button.innerHTML = `<i data-lucide="${icon}"></i>`;
        button.disabled = disabled;
        if (!disabled) {
            button.addEventListener('click', () => {
                updateURLParams({ page: page });
            });
        }
        return button;
    };
    const firstButton = createButton('chevron-first', 1, currentPage === 1);
    const prevButton = createButton('chevron-left', currentPage - 1, currentPage === 1);
    const nextButton = createButton('chevron-right', currentPage + 1, currentPage === totalPages);
    const lastButton = createButton('chevron-last', totalPages, currentPage === totalPages);
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationElm.append(firstButton, prevButton, pageInfo, nextButton, lastButton);
    window.lucide.createIcons();
};

const resultsElm = document.querySelector('.search-results');
const resultsSummaryElm = document.querySelector('.results-summary');
const clearFiltersBtn = document.querySelector('.clear-filters');

const areFiltersActive = () => {
    const { q, categories, manufacturers, tags } = getStateFromURL();
    return q || categories.length > 0 || manufacturers.length > 0 || tags.length > 0;
};

const toggleClearFiltersBtn = () => {
    if (!clearFiltersBtn) return;
    clearFiltersBtn.style.display = areFiltersActive() ? 'flex' : 'none';
};

const handleClearFilters = () => {
    updateURLParams({ q: null, category: null, tags: null, page: 1 });
};

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', handleClearFilters);
}


const updateSearchResults = () => {
    if (!resultsElm || !resultsSummaryElm) return;

    const { page, q } = getStateFromURL();
    const filteredProducts = getFilteredProducts();

    if (filteredProducts.length === 0) {
        resultsSummaryElm.textContent = q ? `No results found for "${q}"` : 'No results found';
    } else {
        resultsSummaryElm.textContent = `Showing ${filteredProducts.length} result${
            filteredProducts.length > 1 ? 's' : ''
        }${q ? ` for "${q}"` : ''}`;
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    resultsElm.replaceChildren();
    paginatedProducts.forEach((p) => {
        const card = renderTemplate('product-card', { productName: p.name, variant: 'wide' });
        resultsElm.appendChild(card);
    });
    renderPagination(filteredProducts.length, page);
};

renderFilters();

    updateSearchResults();
    toggleClearFiltersBtn();

window.addEventListener('filtersChanged', () => {
    renderFilters();

        updateSearchResults();
    toggleClearFiltersBtn();
});

window.addEventListener('popstate', () => {
    renderFilters();

        updateSearchResults();
    toggleClearFiltersBtn();
});
