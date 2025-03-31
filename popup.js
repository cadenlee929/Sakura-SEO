// Data collection functions
function getImagesData() {
    const images = Array.from(document.getElementsByTagName('img'));
    return {
        total: images.length,
        withAlt: images.filter(img => img.alt).length,
        withTitle: images.filter(img => img.title).length,
        images: images.map(img => ({
            src: img.src,
            alt: img.alt || '',
            title: img.title || '',
            width: img.width,
            height: img.height,
            loading: img.loading || 'eager',
            visible: img.getClientRects().length > 0
        }))
    };
}

function getSocialData() {
    const socialTags = {
        'og:': Array.from(document.querySelectorAll('meta[property^="og:"]')),
        'twitter:': Array.from(document.querySelectorAll('meta[name^="twitter:"]')),
        'fb:': Array.from(document.querySelectorAll('meta[property^="fb:"]'))
    };

    return {
        openGraph: socialTags['og:'].map(tag => ({
            property: tag.getAttribute('property'),
            content: tag.getAttribute('content')
        })),
        twitter: socialTags['twitter:'].map(tag => ({
            name: tag.getAttribute('name'),
            content: tag.getAttribute('content')
        })),
        facebook: socialTags['fb:'].map(tag => ({
            property: tag.getAttribute('property'),
            content: tag.getAttribute('content')
        }))
    };
}

function getSchemaData() {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    return {
        total: scripts.length,
        schemas: scripts.map(script => {
            try {
                const data = JSON.parse(script.textContent);
                return {
                    type: data['@type'] || 'Unknown',
                    content: script.textContent,
                    valid: true
                };
            } catch (e) {
                return {
                    type: 'Invalid Schema',
                    content: script.textContent,
                    valid: false,
                    error: e.message
                };
            }
        })
    };
}

function getSEOData() {
    return {
        title: document.title || '',
        titleLength: document.title.length,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        metaDescriptionLength: (document.querySelector('meta[name="description"]')?.content || '').length,
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        lang: document.documentElement.lang || '',
        wordCount: (document.body.innerText || '').trim().split(/\s+/).length
    };
}

function getHeadingsData() {
    const headings = {};
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        const elements = document.getElementsByTagName(tag);
        headings[tag] = {
            count: elements.length,
            texts: Array.from(elements).map(el => ({
                text: el.textContent.trim(),
                visible: el.getClientRects().length > 0
            }))
        };
    });
    return headings;
}

function getLinksData() {
    const links = Array.from(document.getElementsByTagName('a'));
    const uniqueUrls = new Set(links.map(link => link.href));
    
    const internalLinks = links.filter(link => link.host === window.location.host);
    const externalLinks = links.filter(link => link.host !== window.location.host);
    
    return {
        total: links.length,
        unique: uniqueUrls.size,
        internal: internalLinks.length,
        external: externalLinks.length,
        internalLinks: internalLinks.map(link => ({
            text: link.textContent.trim(),
            href: link.href,
            nofollow: link.rel?.includes('nofollow')
        })),
        externalLinks: externalLinks.map(link => ({
            text: link.textContent.trim(),
            href: link.href,
            nofollow: link.rel?.includes('nofollow')
        }))
    };
}

function getQuickLinksData() {
    const url = window.location;
    return {
        currentUrl: url.href,
        hostname: url.hostname,
        protocol: url.protocol,
        links: [
            { text: 'Google Search Console', url: `https://search.google.com/search-console?resource_id=${url.hostname}` },
            { text: 'Google PageSpeed Insights', url: `https://pagespeed.web.dev/report?url=${url.href}` },
            { text: 'Mobile-Friendly Test', url: `https://search.google.com/test/mobile-friendly?url=${url.href}` },
            { text: 'Rich Results Test', url: `https://search.google.com/test/rich-results?url=${url.href}` },
            { text: 'SSL Server Test', url: `https://www.ssllabs.com/ssltest/analyze.html?d=${url.hostname}` },
            { text: 'Security Headers', url: `https://securityheaders.com/?q=${url.href}` },
            { text: 'Archive.org', url: `https://web.archive.org/web/*/${url.href}` },
            { text: 'W3C Validator', url: `https://validator.w3.org/nu/?doc=${url.href}` }
        ]
    };
}
// Display functions
function showOverview(url, data) {
    document.getElementById('content').innerHTML = `
        <div class="info-section">
            ${createInfoCard('Title Tag', data.title, data.titleLength, 60)}
            ${createInfoCard('Meta Description', data.metaDescription, data.metaDescriptionLength, 160)}
            ${createCanonicalCard(url, data.canonical)}
            ${createSimpleInfoCard('Word Count', `${data.wordCount.toLocaleString()} words`)}
            ${createSimpleInfoCard('Language', data.lang || 'Not specified')}
        </div>
    `;
}

function createInfoCard(label, content, length, limit) {
    return `
        <div class="info-card">
            <div class="seo-row">
                <div class="seo-label">
                    ${label} <span class="info-icon" title="The ${label.toLowerCase()} is an HTML element that specifies the ${label.toLowerCase()} of a web page">ⓘ</span>
                </div>
                <div class="seo-content">
                    ${content || `${label} is missing`}
                    <div class="seo-meta ${length <= limit ? 'success' : 'warning'}">
                        ${length <= limit ? '✓' : '⚠️'} ${length} characters
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createCanonicalCard(url, canonical) {
    return `
        <div class="info-card">
            <div class="seo-row">
                <div class="seo-label">
                    Canonical URL <span class="info-icon" title="Specifies the preferred URL for the current page">ⓘ</span>
                </div>
                <div class="seo-content">
                    ${canonical ? `<a href="${canonical}" target="_blank" class="url-link">${canonical}</a>` : 'Not specified'}
                    ${canonical ? `<div class="seo-meta ${canonical === url ? 'success' : 'warning'}">
                        ${canonical === url ? '✓ canonical' : '⚠️ different from URL'}
                    </div>` : ''}
                </div>
            </div>
        </div>
    `;
}

function createSimpleInfoCard(label, content) {
    return `
        <div class="info-card">
            <div class="seo-row">
                <div class="seo-label">
                    ${label} <span class="info-icon" title="Information about ${label.toLowerCase()}">ⓘ</span>
                </div>
                <div class="seo-content">${content}</div>
            </div>
        </div>
    `;
}

// Event handlers
document.addEventListener('DOMContentLoaded', function() {
    let activeTab = 'overview';
    
    // Initialize navigation
    initializeNavigation();
    
    // Initial analysis - ensure we have access to the active tab first
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
            analyzeCurrentPage();
        }
    });
});

function initializeNavigation() {
    // Add click handlers for nav buttons
    document.querySelectorAll('.nav-item').forEach(button => {
        // Set initial active state for overview tab
        if (button.dataset.tab === 'overview') {
            button.classList.add('active');
        }
        
        button.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            activeTab = this.dataset.tab;
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0]) {
                    analyzeCurrentPage();
                }
            });
        });
    });

    // Add click handlers for footer links
    initializeFooterLinks();
}

function initializeFooterLinks() {
    const footerLinks = document.querySelectorAll('.footer-links a');
    footerLinks[0].addEventListener('click', e => handleFooterLink(e, 'robots.txt'));
    footerLinks[1].addEventListener('click', e => handleFooterLink(e, 'sitemap.xml'));
}

function handleFooterLink(e, file) {
    e.preventDefault();
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const url = new URL(tabs[0].url);
        chrome.tabs.create({ url: `${url.protocol}//${url.hostname}/${file}` });
    });
}

function showImages(url, data) {
    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <div class="link-stats">
                <div class="link-stat-item">
                    <div class="link-stat-value">${data.total}</div>
                    <div class="link-stat-label">Total</div>
                </div>
                <div class="link-stat-item">
                    <div class="link-stat-value">${data.withAlt}</div>
                    <div class="link-stat-label">With Alt</div>
                </div>
                <div class="link-stat-item">
                    <div class="link-stat-value">${data.withTitle}</div>
                    <div class="link-stat-label">With Title</div>
                </div>
            </div>
            
            <div class="link-section">
                <div class="link-section-header">
                    <div class="link-section-title">Images</div>
                </div>
                ${data.images.map(img => `
                    <div class="link-item">
                        <div class="link-text">
                            <strong>Source:</strong> ${img.src}<br>
                            <strong>Alt:</strong> ${img.alt || '<span style="color: #f97316;">Missing</span>'}<br>
                            <strong>Title:</strong> ${img.title || '<span style="color: #f97316;">Missing</span>'}<br>
                            <strong>Size:</strong> ${img.width}x${img.height}<br>
                            <strong>Loading:</strong> ${img.loading}
                        </div>
                        ${img.visible ? '<div class="seo-meta success">✓ Visible</div>' : '<div class="seo-meta warning">⚠️ Not visible</div>'}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showSocial(url, data) {
    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <div class="link-section">
                <div class="link-section-header">
                    <div class="link-section-title">Open Graph Tags</div>
                </div>
                ${data.openGraph.map(tag => `
                    <div class="link-item">
                        <div class="link-text">
                            <strong>${tag.property}:</strong> ${tag.content}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="link-section">
                <div class="link-section-header">
                    <div class="link-section-title">Twitter Card Tags</div>
                </div>
                ${data.twitter.map(tag => `
                    <div class="link-item">
                        <div class="link-text">
                            <strong>${tag.name}:</strong> ${tag.content}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="link-section">
                <div class="link-section-header">
                    <div class="link-section-title">Facebook Tags</div>
                </div>
                ${data.facebook.map(tag => `
                    <div class="link-item">
                        <div class="link-text">
                            <strong>${tag.property}:</strong> ${tag.content}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showSchema(url, data) {
    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <div class="link-stats">
                <div class="link-stat-item">
                    <div class="link-stat-value">${data.total}</div>
                    <div class="link-stat-label">Total Schemas</div>
                </div>
            </div>
            
            <div class="link-section">
                <div class="link-section-header">
                    <div class="link-section-title">Structured Data</div>
                </div>
                ${data.schemas.map(schema => `
                    <div class="link-item">
                        <div class="link-text">
                            <strong>Type:</strong> ${schema.type}<br>
                            <strong>Content:</strong><br>
                            <pre style="background: #f8f9fa; padding: 8px; border-radius: 4px; overflow-x: auto;">${schema.content}</pre>
                        </div>
                        ${schema.valid ? 
                            '<div class="seo-meta success">✓ Valid JSON-LD</div>' : 
                            `<div class="seo-meta warning">⚠️ Invalid Schema<br>${schema.error}</div>`
                        }
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showQuick(url, data) {
    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <div class="link-section">
                <div class="link-section-header">
                    <div class="link-section-title">Quick SEO Tools</div>
                </div>
                ${data.links.map(link => `
                    <div class="link-item">
                        <div class="link-text">${link.text}</div>
                        <a href="${link.url}" target="_blank" class="link-url">Check Now</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function analyzeCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];
        const url = tab.url;

        const analysisFunction = {
            'overview': getSEOData,
            'headings': getHeadingsData,
            'links': getLinksData,
            'images': getImagesData,
            'schema': getSchemaData,
            'social': getSocialData,
            'quick': getQuickLinksData
        }[activeTab];

        if (analysisFunction) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: analysisFunction
            }, (results) => {
                const displayFunction = {
                    'overview': showOverview,
                    'headings': showHeadings,
                    'links': showLinks,
                    'images': showImages,
                    'schema': showSchema,
                    'social': showSocial,
                    'quick': showQuick
                }[activeTab];
                
                displayFunction(url, results[0].result);
            });
        }
    });
}

function showLinks(url, data) {
    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <div class="link-stats">
                <div class="link-stat-item">
                    <div class="link-stat-value">${data.total}</div>
                    <div class="link-stat-label">Total</div>
                </div>
                <div class="link-stat-item">
                    <div class="link-stat-value">${data.unique}</div>
                    <div class="link-stat-label">Unique</div>
                </div>
                <div class="link-stat-item">
                    <div class="link-stat-value">${data.internal}</div>
                    <div class="link-stat-label">Internal</div>
                </div>
                <div class="link-stat-item">
                    <div class="link-stat-value">${data.external}</div>
                    <div class="link-stat-label">External</div>
                </div>
            </div>
            
            <button class="highlight-button" id="highlightNofollowBtn">HIGHLIGHT NOFOLLOW LINKS</button>
            
            <div class="link-section">
                <div class="link-section-header">
                    <div class="link-section-title">Internal links</div>
                </div>
                ${data.internalLinks.map(link => `
                    <div class="link-item ${link.nofollow ? 'nofollow' : ''}">
                        <div class="link-anchor">ANCHOR LINK</div>
                        <div class="link-text">${link.text}</div>
                        <a href="${link.href}" target="_blank" class="link-url">${link.href}</a>
                        ${link.nofollow ? '<span class="nofollow-badge">nofollow</span>' : ''}
                    </div>
                `).join('')}
            </div>
            
            <div class="link-section">
                <div class="link-section-header">
                    <div class="link-section-title">External links</div>
                </div>
                ${data.externalLinks.map(link => `
                    <div class="link-item ${link.nofollow ? 'nofollow' : ''}">
                        <div class="link-anchor">ANCHOR LINK</div>
                        <div class="link-text">${link.text}</div>
                        <a href="${link.href}" target="_blank" class="link-url">${link.href}</a>
                        ${link.nofollow ? '<span class="nofollow-badge">nofollow</span>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('highlightNofollowBtn').addEventListener('click', function() {
        const nofollowLinks = document.querySelectorAll('.link-item.nofollow');
        nofollowLinks.forEach(link => {
            link.style.background = link.style.background ? '' : '#fff5f5';
            link.style.borderColor = link.style.borderColor ? '' : '#f97316';
        });
        this.textContent = this.textContent.includes('HIGHLIGHT') ? 'UNHIGHLIGHT NOFOLLOW LINKS' : 'HIGHLIGHT NOFOLLOW LINKS';
    });
}
function showHeadings(url, data) {
    let headingStats = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(tag => `
        <div class="stat-item">
            <div class="stat-value">${data[tag].count}</div>
            <div class="stat-label">${tag.toUpperCase()}</div>
        </div>
    `).join('');

    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <h2>All headers in order of their appearance in HTML.</h2>
            <div class="heading-list">
                ${Object.entries(data).map(([tag, info]) => 
                    info.texts.map(item => `
                        <div class="heading-item heading-${tag}">
                            <div class="label">${tag.toUpperCase()}</div>
                            <div class="value">${item.text}</div>
                        </div>
                    `).join('')
                ).join('')}
            </div>
        </div>
        <div class="stats-summary">
            ${headingStats}
        </div>
    `;
}