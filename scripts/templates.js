'use strict';
import { formatRupiah, pickRandomElmsNoDupe } from './globals.js';
import { products } from './products.js';

/** @type {Record<string, (elm: HTMLElement | null, data?: Record<string, any>) => HTMLElement>} */
const templates = {
    header: () => {
        const headerElm = document.createElement('header');
        headerElm.innerHTML = `<div class="inner">
                <div>
                    <a class="logo" href="/">
                        <img src="/assets/mascot/icon.svg" alt="Pixo" />
                        <span>JSP</span>
                    </a>
                    <form action="/search.html" class="search">
                        <button
                            class="mobile-search-toggle"
                            onclick="this.nextElementSibling.focus()"
                            type="button"
                        >
                            <i data-lucide="search"></i> Search
                        </button>
                        <input
                            type="search"
                            name="q"
                            placeholder="Search for parts"
                            id="search"
                            required
                        />
                        <button type="reset" onclick="this.previousElementSibling.focus()">
                            <i data-lucide="x"></i>
                        </button>
                        <button type="submit">
                            <i data-lucide="search"></i>
                        </button>
                    </form>
                </div>
                <div>
                    <a href="/about.html">About Us</a>
                    <a href="/cart.html" class="cart">
                        <i data-lucide="shopping-cart"></i>
                    </a>
                </div>
            </div>`;
        return headerElm;
    },
    footer: () => {
        const footerElm = document.createElement('footer');
        footerElm.innerHTML = `<div class="inner">
                <div class="footer-main">
                    <div class="links">
                        <div>
                            <a class="logo" href="/">
                                <img src="/assets/mascot/icon.svg" alt="Pixo" />
                                <span>JSP</span>
                            </a>
                        </div>
                        <section>
                            <div>COMPANY</div>
                            <ul>
                                <li><a href="/about.html">About Us</a></li>
                                <li><a href="/tos.html">Terms of Service</a></li>
                                <li><a href="/pp.html">Privacy Policy</a></li>
                            </ul>
                        </section>
                        <section>
                            <div>CREDIT</div>
                            <ul>
                                <li><a href="javascript:eval('\u0061\u006C\u0065\u0072\u0074\u0028\u0027\u003A\u0050\u0027\u0029')">&#82;&#101;&#105;&#110;</a></li>
                                <li><a href="javascript:eval('\u0061\u006C\u0065\u0072\u0074\u0028\u0027\u003A\u0050\u0027\u0029')">&#74;&#111;&#97;&#110;&#110;&#97;</a></li>
                                <li><a href="https://lucide.dev/">Lucide Icons</a></li>
                                <li><a href="https://simpleicons.org/">Simple Icons</a></li>
                            </ul>
                        </section>
                    </div>

                    <section class="socials">
                        <ul>
                            <li>
                                <a href="javascript:void(0);"><i data-si="instagram"></i></a>
                            </li>
                            <li>
                                <a href="javascript:void(0);"><i data-si="facebook"></i></a>
                            </li>
                            <li>
                                <a href="javascript:void(0);"><i data-si="discord"></i></a>
                            </li>
                            <li>
                                <a href="javascript:void(0);"><i data-si="x"></i></a>
                            </li>
                        </ul>
                    </section>
                </div>
                <div class="copyright">&copy; <span class="brand">JSP Store</span> 2025</div>
            </div>`;
        return footerElm;
    },
    'product-categories': () => {
        const categoryImage = {
            CPU: '/assets/products/AMD Ryzen 9 9950X 16 Cores.webp',
            'CPU Cooler': '/assets/products/Noctua NH-D15 G2.webp',
            Case: '/assets/products/Lian Li O11 Dynamic EVO.webp',
            GPU: '/assets/products/NVIDIA GeForce RTX 5090 24GB.webp',
            HDD: '/assets/products/WD Blue 4TB 5400RPM.webp',
            Headphones: '/assets/products/Audeze Penrose.webp',
            Keyboard: '/assets/products/Corsair K100 RGB.webp',
            Monitor: '/assets/products/ASUS ROG Swift PG32UQX 32 inch 4K.webp',
            Motherboard: '/assets/products/ASUS ROG Crosshair X870E Extreme.webp',
            Mouse: '/assets/products/Razer Viper V2 Pro.webp',
            'Power Supply Unit': '/assets/products/Seasonic Prime TX-1000 Titanium.webp',
            RAM: '/assets/products/G.Skill Trident Z5 RGB 64GB DDR5 7200MHz.webp',
            SSD: '/assets/products/Samsung 990 Pro 4TB NVMe.webp',
        };

        /** @type {(category: string) => string} */
        const categoryCard = (category) => `
            <li>
                <a href="/search.html?category=${encodeURIComponent(category)}">
                    <div class="product-image"><img  src="${
                        categoryImage[category]
                    }" alt="${category}"></div>
                    <div>${category}</div>
                </a>
            </li>
        `;
        const productCategoriesElm = document.createElement('ul');
        productCategoriesElm.innerHTML = Object.keys(categoryImage)
            .map((category) => categoryCard(category))
            .join('');
        return productCategoriesElm;
    },
    'product-card': (elm, data) => {
        const { productName } = data;
        const product = products.find((p) => p.name === productName);
        if (!product) return;
        const cardElm = document.createElement('a');
        cardElm.href = `/product.html?name=${product.name}`;
        cardElm.innerHTML = `
            <div class="product-image">
                <img src="/assets/products/${product.name}.webp" alt="${product.name}" />
            </div>
            <div class="name">${product.name}</div>
            <div class="price">${formatRupiah(product.price)}</div>
        `;
        return cardElm;
    },
    'home-recommended': () => {
        const recommendedElm = document.createElement('div');

        pickRandomElmsNoDupe(products, 10).forEach((p) => {
            const card = templates['product-card'](null, { productName: p.name });
            card.classList.add('product-card'); // ensure class is applied
            recommendedElm.appendChild(card);
        });

        return recommendedElm;
    },
    'home-review': (elm) => {
        const reviewCardElm = document.createElement('div');
        reviewCardElm.innerHTML = `
            <img src="${elm.dataset.imgsrc}" alt="${elm.dataset.name}">
            <div class="name">${elm.dataset.name}</div>
            <div class="stars">
                <i data-lucide="star" fill="currentColor"></i>
                <i data-lucide="star" fill="currentColor"></i>
                <i data-lucide="star" fill="currentColor"></i>
                <i data-lucide="star" fill="currentColor"></i>
                <i data-lucide="star" fill="currentColor"></i>
            </div>
            <div class="message">
                ${elm.dataset.message}
            </div>
        `;
        return reviewCardElm;
    },
};

export const renderTemplates = () => {
    const nodes = document.querySelectorAll('[data-template]');
    nodes.forEach((node) => {
        const id = node.dataset.template;
        const render = templates[id];
        if (!render) return;

        const rendered = render(node);
        rendered.classList.add(id);
        node.replaceWith(rendered);
    });
};

export const renderSimpleIcons = async () => {
    const iconTemplates = document.querySelectorAll('i[data-si]');
    if (!iconTemplates.length) return;

    const parser = new DOMParser();

    const slugs = [
        // Prevent duplicate
        ...new Set(
            /** @type {string[]} */
            Array.from(iconTemplates, (el) => el.dataset.si).filter(Boolean)
        ),
    ];

    // Fetch all SVGs in parallel
    const results = await Promise.all(
        slugs.map(async (slug) => {
            const res = await fetch(`https://unpkg.com/simple-icons@v15/icons/${slug}.svg`);
            return [slug, await res.text()];
        })
    );

    // Map for quick lookup
    const cache = new Map(results);

    // Replace each icon
    for (const iconTemplate of iconTemplates) {
        const slug = iconTemplate.dataset.si;
        if (!slug) continue;

        const svgText = cache.get(slug);
        if (!svgText) continue;

        const svg = parser.parseFromString(svgText, 'image/svg+xml').querySelector('svg');
        if (!svg) continue;

        const attrs = {
            width: '1em',
            height: '1em',
            fill: 'currentColor',
            'stroke-color': 'currentColor',
        };
        Object.keys(attrs).forEach((key) => svg.setAttribute(key, attrs[key]));

        iconTemplate.replaceWith(svg);
    }
};
