// Global variables
let profitChart = null;
let revenueChart = null;
let currentCurrency = 'USD';

// Currency configurations
const currencyConfig = {
    USD: {
        symbol: '$',
        code: 'USD',
        name: 'US Dollar',
        exchangeRate: 1 // Base currency
    },
    AED: {
        symbol: 'د.إ',
        code: 'AED',
        name: 'UAE Dirham',
        exchangeRate: 3.67 // 1 USD = 3.67 AED (approximate)
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    animateHeroProfit();
    initializeCharts();
});

// Initialize the application
function initializeApp() {
    // Set default values for calculator
    document.getElementById('amazon-fees').value = '15';
    document.getElementById('quantity').value = '1';
    
    // Add fade-in animation to sections
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        observer.observe(section);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Calculator inputs - real-time calculation
    const calculatorInputs = [
        'product-cost', 'selling-price', 'shipping-cost', 
        'amazon-fees', 'ad-spend', 'quantity'
    ];
    
    calculatorInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', debounce(calculateProfit, 300));
        }
    });

    // Currency selector event listener
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
        currencySelect.addEventListener('change', changeCurrency);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Animate hero profit counter
function animateHeroProfit() {
    const profitElement = document.getElementById('hero-profit');
    const targetValue = 2450;
    let currentValue = 0;
    const increment = targetValue / 100;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        profitElement.textContent = Math.floor(currentValue).toLocaleString();
    }, 20);
}

// Calculate profit function
function calculateProfit() {
    // Get input values
    const productCost = parseFloat(document.getElementById('product-cost').value) || 0;
    const sellingPrice = parseFloat(document.getElementById('selling-price').value) || 0;
    const shippingCost = parseFloat(document.getElementById('shipping-cost').value) || 0;
    const amazonFeesPercent = parseFloat(document.getElementById('amazon-fees').value) || 15;
    const adSpend = parseFloat(document.getElementById('ad-spend').value) || 0;
    const quantity = parseInt(document.getElementById('quantity').value) || 1;

    // Calculate values
    const revenue = sellingPrice * quantity;
    const amazonFees = (sellingPrice * amazonFeesPercent / 100) * quantity;
    const totalCosts = (productCost * quantity) + (shippingCost * quantity) + amazonFees + adSpend;
    const netProfit = revenue - totalCosts;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

    // Update display
    updateResultDisplay('revenue', revenue);
    updateResultDisplay('total-costs', totalCosts);
    updateResultDisplay('net-profit', netProfit);
    document.getElementById('profit-margin').textContent = profitMargin.toFixed(1) + '%';
    document.getElementById('roi').textContent = roi.toFixed(1) + '%';

    // Update profit chart
    updateProfitChart(revenue, totalCosts, netProfit);

    // Add visual feedback
    const netProfitElement = document.getElementById('net-profit');
    netProfitElement.style.color = netProfit >= 0 ? '#10b981' : '#ef4444';
}

// Update result display with currency formatting
function updateResultDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    const formattedValue = formatCurrency(value);
    element.textContent = formattedValue;
    
    // Add animation
    element.style.transform = 'scale(1.05)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// Format currency based on current selection
function formatCurrency(amount) {
    const config = currencyConfig[currentCurrency];
    const convertedAmount = Math.abs(amount) * config.exchangeRate;
    return config.symbol + convertedAmount.toFixed(2);
}

// Change currency function
function changeCurrency() {
    const currencySelect = document.getElementById('currency-select');
    currentCurrency = currencySelect.value;
    
    // Update all currency symbols and codes in the UI
    updateCurrencyDisplay();
    
    // Recalculate with new currency
    calculateProfit();
    
    // Update analytics with new currency
    updateAnalyticsCurrency();
}

// Update currency display throughout the UI
function updateCurrencyDisplay() {
    const config = currencyConfig[currentCurrency];
    
    // Update currency symbols
    document.querySelectorAll('.currency-symbol').forEach(element => {
        element.textContent = config.symbol;
    });
    
    // Update currency codes
    document.querySelectorAll('.currency-code').forEach(element => {
        element.textContent = config.code;
    });
    
    // Update hero currency
    const heroCurrency = document.querySelector('.hero .currency');
    if (heroCurrency) {
        heroCurrency.textContent = config.symbol;
    }
}

// Update analytics currency
function updateAnalyticsCurrency() {
    const config = currencyConfig[currentCurrency];
    
    // Update revenue
    const revenueElement = document.getElementById('total-revenue');
    if (revenueElement) {
        const baseValue = 12450; // Base USD value
        const convertedValue = Math.floor(baseValue * config.exchangeRate);
        revenueElement.textContent = convertedValue.toLocaleString();
    }
    
    // Update profit
    const profitElement = document.getElementById('total-profit');
    if (profitElement) {
        const baseValue = 3240; // Base USD value
        const convertedValue = Math.floor(baseValue * config.exchangeRate);
        profitElement.textContent = convertedValue.toLocaleString();
    }
    
    // Update hero profit
    const heroProfitElement = document.getElementById('hero-profit');
    if (heroProfitElement) {
        const baseValue = 2450; // Base USD value
        const convertedValue = Math.floor(baseValue * config.exchangeRate);
        heroProfitElement.textContent = convertedValue.toLocaleString();
    }
}

// Initialize charts
function initializeCharts() {
    initializeProfitChart();
    initializeRevenueChart();
}

// Initialize profit chart
function initializeProfitChart() {
    const canvas = document.getElementById('profitChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Simple chart implementation
    drawProfitChart(ctx, 0, 0, 0);
}

// Draw profit chart
function drawProfitChart(ctx, revenue, costs, profit) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    if (revenue === 0 && costs === 0) {
        // Draw placeholder
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(50, height - 50, 80, 30);
        ctx.fillRect(150, height - 50, 80, 30);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.fillText('Revenue', 60, height - 10);
        ctx.fillText('Costs', 165, height - 10);
        return;
    }
    
    const maxValue = Math.max(revenue, costs) * 1.2;
    const revenueHeight = (revenue / maxValue) * (height - 100);
    const costsHeight = (costs / maxValue) * (height - 100);
    
    // Draw bars
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(50, height - 50 - revenueHeight, 80, revenueHeight);
    
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(150, height - 50 - costsHeight, 80, costsHeight);
    
    // Draw labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px Inter';
    ctx.fillText('Revenue', 60, height - 10);
    ctx.fillText('Costs', 165, height - 10);
    
    // Draw values
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 10px Inter';
    ctx.fillText(formatCurrency(revenue), 45, height - 55 - revenueHeight);
    ctx.fillText(formatCurrency(costs), 145, height - 55 - costsHeight);
}

// Update profit chart
function updateProfitChart(revenue, costs, profit) {
    const canvas = document.getElementById('profitChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    drawProfitChart(ctx, revenue, costs, profit);
}

// Initialize revenue chart
function initializeRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    drawRevenueChart(ctx);
}

// Draw revenue chart
function drawRevenueChart(ctx) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Sample data for the last 7 days
    const data = [8500, 9200, 8800, 10500, 11200, 9800, 12450];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart settings
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    const maxValue = Math.max(...data) * 1.2;
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw line chart
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#2563eb';
    data.forEach((value, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    
    labels.forEach((label, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        ctx.fillText(label, x, height - 20);
    });
    
    // Draw y-axis labels
    ctx.textAlign = 'right';
    const config = currencyConfig[currentCurrency];
    for (let i = 0; i <= 5; i++) {
        const value = (maxValue / 5) * (5 - i);
        const convertedValue = Math.round(value * config.exchangeRate);
        const y = padding + (chartHeight / 5) * i;
        ctx.fillText(config.symbol + convertedValue.toLocaleString(), padding - 10, y + 4);
    }
}

// Keyword research function
function searchKeywords() {
    const keyword = document.getElementById('keyword-input').value.trim();
    const resultsContainer = document.getElementById('keyword-results');
    
    if (!keyword) {
        resultsContainer.innerHTML = '<p style="color: #6b7280;">Please enter a keyword to search.</p>';
        return;
    }
    
    // Show loading state
    resultsContainer.innerHTML = '<div class="loading-spinner">Searching keywords...</div>';
    
    // Simulate API call with setTimeout
    setTimeout(() => {
        const mockResults = generateMockKeywordResults(keyword);
        displayKeywordResults(mockResults, resultsContainer);
    }, 1500);
}

// Generate mock keyword results
function generateMockKeywordResults(keyword) {
    const baseKeywords = [
        `${keyword} best`,
        `${keyword} cheap`,
        `${keyword} review`,
        `${keyword} buy online`,
        `${keyword} price`,
        `${keyword} sale`,
        `${keyword} discount`,
        `${keyword} quality`
    ];
    
    return baseKeywords.map(kw => ({
        keyword: kw,
        volume: Math.floor(Math.random() * 10000) + 1000,
        competition: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        cpc: (Math.random() * 2 + 0.5).toFixed(2)
    }));
}

// Display keyword results
function displayKeywordResults(results, container) {
    let html = '<div class="keyword-list">';
    
    results.forEach(result => {
        const competitionClass = result.competition.toLowerCase();
        html += `
            <div class="keyword-item">
                <div class="keyword-text">${result.keyword}</div>
                <div class="keyword-stats">
                    <span class="volume">${result.volume.toLocaleString()} searches</span>
                    <span class="competition ${competitionClass}">${result.competition}</span>
                    <span class="cpc">${currencyConfig[currentCurrency].symbol}${(result.cpc * currencyConfig[currentCurrency].exchangeRate).toFixed(2)}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Analyze trends function
function analyzeTrends() {
    const category = document.getElementById('category-filter').value;
    const resultsContainer = document.getElementById('trend-results');
    
    // Show loading state
    resultsContainer.innerHTML = '<div class="loading-spinner">Analyzing trends...</div>';
    
    setTimeout(() => {
        const mockTrends = generateMockTrendResults(category);
        displayTrendResults(mockTrends, resultsContainer);
    }, 2000);
}

// Generate mock trend results
function generateMockTrendResults(category) {
    const categoryName = category || 'All Categories';
    const trends = [
        { product: 'Wireless Earbuds', growth: '+45%', demand: 'High' },
        { product: 'Smart Watch', growth: '+32%', demand: 'High' },
        { product: 'Phone Case', growth: '+28%', demand: 'Medium' },
        { product: 'Bluetooth Speaker', growth: '+15%', demand: 'Medium' },
        { product: 'Power Bank', growth: '+12%', demand: 'Low' }
    ];
    
    return {
        category: categoryName,
        trends: trends
    };
}

// Display trend results
function displayTrendResults(results, container) {
    let html = `<h4>Trending in ${results.category}</h4><div class="trend-list">`;
    
    results.trends.forEach(trend => {
        const demandClass = trend.demand.toLowerCase();
        html += `
            <div class="trend-item">
                <div class="trend-product">${trend.product}</div>
                <div class="trend-stats">
                    <span class="growth positive">${trend.growth}</span>
                    <span class="demand ${demandClass}">${trend.demand} Demand</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Score product function
function scoreProduct() {
    const productUrl = document.getElementById('product-url').value.trim();
    const resultsContainer = document.getElementById('score-results');
    
    if (!productUrl) {
        resultsContainer.innerHTML = '<p style="color: #6b7280;">Please enter a product URL.</p>';
        return;
    }
    
    if (!isValidAmazonUrl(productUrl)) {
        resultsContainer.innerHTML = '<p style="color: #ef4444;">Please enter a valid Amazon product URL.</p>';
        return;
    }
    
    // Show loading state
    resultsContainer.innerHTML = '<div class="loading-spinner">Analyzing product...</div>';
    
    setTimeout(() => {
        const score = generateProductScore();
        displayProductScore(score, resultsContainer);
    }, 2500);
}

// Validate Amazon URL
function isValidAmazonUrl(url) {
    return url.includes('amazon.') && (url.includes('/dp/') || url.includes('/gp/product/'));
}

// Generate product score
function generateProductScore() {
    return {
        overall: Math.floor(Math.random() * 40) + 60, // 60-100
        criteria: {
            demand: Math.floor(Math.random() * 30) + 70,
            competition: Math.floor(Math.random() * 40) + 50,
            profitability: Math.floor(Math.random() * 35) + 65,
            reviews: Math.floor(Math.random() * 25) + 75,
            trend: Math.floor(Math.random() * 30) + 60
        }
    };
}

// Display product score
function displayProductScore(score, container) {
    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };
    
    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Poor';
    };
    
    let html = `
        <div class="product-score">
            <div class="overall-score">
                <div class="score-circle" style="border-color: ${getScoreColor(score.overall)}">
                    <span class="score-number">${score.overall}</span>
                    <span class="score-label">${getScoreLabel(score.overall)}</span>
                </div>
            </div>
            <div class="score-breakdown">
    `;
    
    Object.entries(score.criteria).forEach(([criterion, value]) => {
        html += `
            <div class="score-item">
                <span class="criterion">${criterion.charAt(0).toUpperCase() + criterion.slice(1)}:</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${value}%; background-color: ${getScoreColor(value)}"></div>
                </div>
                <span class="score-value">${value}%</span>
            </div>
        `;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
}

// Update analytics counters with animation
function updateAnalyticsCounters() {
    const counters = [
        { id: 'total-revenue', target: 12450 },
        { id: 'total-profit', target: 3240 },
        { id: 'total-orders', target: 156 },
        { id: 'avg-margin', target: 26.1 }
    ];
    
    counters.forEach(counter => {
        animateCounter(counter.id, counter.target);
    });
}

// Animate counter
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = 0;
    const increment = target / 100;
    const isDecimal = target % 1 !== 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 20);
}

// Add CSS for additional styling
const additionalStyles = `
    .loading-spinner {
        text-align: center;
        color: #6b7280;
        padding: 20px;
    }
    
    .keyword-list, .trend-list {
        max-height: 200px;
        overflow-y: auto;
    }
    
    .keyword-item, .trend-item {
        padding: 10px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .keyword-stats, .trend-stats {
        display: flex;
        gap: 10px;
        font-size: 0.8rem;
    }
    
    .competition.low, .demand.low { color: #10b981; }
    .competition.medium, .demand.medium { color: #f59e0b; }
    .competition.high, .demand.high { color: #ef4444; }
    
    .product-score {
        text-align: center;
    }
    
    .overall-score {
        margin-bottom: 20px;
    }
    
    .score-circle {
        width: 80px;
        height: 80px;
        border: 4px solid;
        border-radius: 50%;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }
    
    .score-number {
        font-size: 1.5rem;
        font-weight: bold;
    }
    
    .score-label {
        font-size: 0.7rem;
        text-transform: uppercase;
    }
    
    .score-breakdown {
        text-align: left;
    }
    
    .score-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
    }
    
    .criterion {
        min-width: 80px;
        font-size: 0.8rem;
    }
    
    .score-bar {
        flex: 1;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .score-fill {
        height: 100%;
        transition: width 0.5s ease;
    }
    
    .score-value {
        min-width: 35px;
        font-size: 0.8rem;
        font-weight: 600;
    }
`;

// Add the additional styles to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize analytics counters when page loads
setTimeout(updateAnalyticsCounters, 1000);
