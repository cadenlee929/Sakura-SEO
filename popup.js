// Function to get SEO data from the page
function getSEOData() {
    const title = document.title || '';
    const titleLength = title.length;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const robotsMeta = document.querySelector('meta[name="robots"]')?.content || '';
    
    return { 
        title,
        titleLength,
        metaDescription,
        canonical,
        robotsMeta
    };
}

// Function to show overview tab
function showOverview(url, data) {
    const { title, titleLength, metaDescription, canonical, robotsMeta } = data;
    
    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <div class="info-card">
                <div class="label">
                    <span class="icon">📝</span> Title
                    <span class="status-tag ${titleLength <= 60 ? 'success' : 'warning'}">
                        ${titleLength} characters
                    </span>
                </div>
                <div class="value">${title}</div>
            </div>
            
            <div class="info-card">
                <div class="label">
                    <span class="icon">📄</span> Description
                    <span class="status-tag ${metaDescription ? 'success' : 'warning'}">
                        ${metaDescription ? metaDescription.length + ' characters' : 'Missing'}
                    </span>
                </div>
                <div class="value">${metaDescription || 'Not specified'}</div>
            </div>

            <div class="info-card">
                <div class="label">
                    <span class="icon">🔗</span> URL
                </div>
                <div class="value url-value">${url}</div>
            </div>

            <div class="info-card">
                <div class="label">
                    <span class="icon">📍</span> Canonical
                    <span class="status-tag ${canonical === url ? 'success' : 'warning'}">
                        ${canonical === url ? 'Valid' : 'Warning'}
                    </span>
                </div>
                <div class="value">${canonical || 'Not specified'}</div>
            </div>
        </div>
    `;
}

// Function to get headings data
function getHeadingsData() {
    const headings = {};
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        const elements = document.getElementsByTagName(tag);
        headings[tag] = {
            count: elements.length,
            texts: Array.from(elements).map(el => ({
                text: el.textContent.trim(),
                visible: el.getClientRects().length > 0  // Check if heading is visible
            }))
        };
    });
    return headings;
}

// Function to show overview tab
function showOverview(url, data) {
    const { title, titleLength, metaDescription, metaKeywords, canonical, robotsMeta, lang, author, publisher } = data;
    
    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <div class="info-card">
                <div class="label">Title</div>
                <div class="value">${title || 'Title is missing'}</div>
                <div class="meta-info">${titleLength} characters</div>
            </div>
            
            <div class="info-card">
                <div class="label">Description</div>
                <div class="value">${metaDescription || 'Description is missing'}</div>
                <div class="meta-info">${metaDescription ? metaDescription.length + ' characters' : ''}</div>
            </div>

            <div class="info-card">
                <div class="label">Keywords</div>
                <div class="value">${metaKeywords || 'Keywords are missing!'}</div>
            </div>

            <div class="info-card">
                <div class="label">URL</div>
                <div class="value url-value">${url}</div>
            </div>

            <div class="info-card">
                <div class="label">Canonical</div>
                <div class="value">${canonical || 'Canonical is missing'}</div>
            </div>

            <div class="info-card">
                <div class="label">Robots Tag</div>
                <div class="value">${robotsMeta || 'Robots meta tag is not defined.'}</div>
            </div>

            <div class="info-card">
                <div class="label">Author</div>
                <div class="value">${author || 'Author is missing.'}</div>
            </div>

            <div class="info-card">
                <div class="label">Publisher</div>
                <div class="value">${publisher || 'Publisher is missing.'}</div>
            </div>

            <div class="info-card">
                <div class="label">Lang</div>
                <div class="value">${lang || 'Language is not specified'}</div>
            </div>
        </div>
    `;
}

// Function to show headings tab
function showHeadings(url, data) {
    let headingsHtml = '';
    let headingStats = '';
    
    // Create stats summary
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        const count = data[tag].count;
        headingStats += `
            <div class="stat-item">
                <div class="stat-value">${count}</div>
                <div class="stat-label">${tag.toUpperCase()}</div>
            </div>
        `;
    });

    document.getElementById('content').innerHTML = `
        <div class="info-section">
            <div class="heading-list">
                ${Object.entries(data).map(([tag, info]) => `
                    ${info.texts.map(item => `
                        <div class="heading-item">
                            <div class="label">${tag.toUpperCase()}</div>
                            <div class="value">${item.text}</div>
                        </div>
                    `).join('')}
                `).join('')}
            </div>
        </div>
        <div class="stats-summary">
            ${headingStats}
        </div>
    `;
}

// Function to run when popup opens
document.addEventListener('DOMContentLoaded', function() {
    let activeTab = 'overview';
    
    // Add click handlers to nav buttons
    document.querySelectorAll('.nav-item').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            activeTab = this.dataset.tab;
            
            // Re-run the analysis for the selected tab
            analyzeCurrentPage();
        });
    });

    function analyzeCurrentPage() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tab = tabs[0];
            const url = tab.url;

            if (activeTab === 'overview') {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: getSEOData
                }, (results) => {
                    showOverview(url, results[0].result);
                });
            } else if (activeTab === 'headings') {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: getHeadingsData
                }, (results) => {
                    showHeadings(url, results[0].result);
                });
            }
        });
    }

    // Initial analysis
    analyzeCurrentPage();
});


// Add this function to analyze links
function getLinksData() {
    const links = document.getElementsByTagName('a');
    return {
        total: links.length,
        internal: Array.from(links).filter(link => 
            link.host === window.location.host).length,
        external: Array.from(links).filter(link => 
            link.host !== window.location.host).length,
        nofollow: Array.from(links).filter(link => 
            link.rel?.includes('nofollow')).length,
        broken: Array.from(links).filter(link => 
            !link.href || link.href === '#').length,
        details: Array.from(links).map(link => ({
            text: link.textContent.trim(),
            href: link.href,
            type: link.host === window.location.host ? 'internal' : 'external',
            rel: link.rel || 'follow'
        }))
    };
}