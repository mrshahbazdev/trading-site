document.addEventListener('DOMContentLoaded', () => {
    // Top Navigation Tabs
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Sidebar Tabs (Favorites / Top Movers)
    const sidebarTabs = document.querySelectorAll('.sidebar-tabs .tab-btn');
    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            sidebarTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Calendar Widget Tabs
    const widgetTabs = document.querySelectorAll('.widget-tabs .w-tab');
    widgetTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            widgetTabs.forEach(t => {
                t.classList.remove('active');
                // Remove blue color from icon in non-active tabs
                const icon = t.querySelector('i');
                if (icon) icon.classList.remove('text-blue');
            });

            tab.classList.add('active');
            // Add blue color to icon in active tab
            const icon = tab.querySelector('i');
            if (icon) icon.classList.add('text-blue');
        });
    });

    // Chart Toolbar Buttons
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active state for tools that don't have active-blue class
            if (!btn.classList.contains('active-blue')) {
                btn.classList.toggle('active');
            }
        });
    });

    // Bottom Panel Tabs
    const panelTabs = document.querySelectorAll('.p-tab');
    panelTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            panelTabs.forEach(t => {
                t.classList.remove('active');
                const icon = t.querySelector('i');
                if (icon) icon.classList.remove('text-blue');
            });

            tab.classList.add('active');
            const icon = tab.querySelector('i');
            if (icon) icon.classList.add('text-blue');

            // Switch panel content based on tab
            if (tab.textContent.includes('Open Positions')) {
                renderPositionsTable();
            } else {
                const panelContent = document.querySelector('.panel-content');
                let h3Text = "You don't have any finance history";
                let pText = "Do some payment and here you'll see your finance history";
                let iconClass = "fas fa-credit-card";

                if (tab.textContent.includes('Positions') || tab.textContent.includes('Orders')) {
                    h3Text = `You don't have any ${tab.textContent.trim().toLowerCase()}`;
                    pText = "Open a trade to see it here";
                    iconClass = "fas fa-chart-line";
                }

                panelContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="${iconClass}"></i>
                        </div>
                        <h3>${h3Text}</h3>
                        <p>${pText}</p>
                    </div>
                `;
            }
        });
    });

    // Wait for container to be rendered with actual dimensions
    const domElement = document.getElementById('tvchart');

    // Initialize TradingView Lightweight Chart
    const chartProperties = {
        width: domElement.clientWidth || 800,
        height: domElement.clientHeight || 400,
        layout: {
            backgroundColor: '#1e222d',
            textColor: '#d1d4dc',
        },
        grid: {
            vertLines: { color: '#2a2e39' },
            horzLines: { color: '#2a2e39' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: '#2a2e39',
        },
        timeScale: {
            borderColor: '#2a2e39',
            timeVisible: true,
            secondsVisible: false,
        },
    };

    const chart = LightweightCharts.createChart(domElement, chartProperties);
    const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
    });

    // Generate mock historical data
    let currentBar = {
        time: Math.floor(Date.now() / 1000) - 100 * 60,
        open: 1.15100,
        high: 1.15200,
        low: 1.15000,
        close: 1.15162,
    };

    let historicalData = [];
    for (let i = 0; i < 100; i++) {
        let volatility = 0.0005;
        let change = (Math.random() - 0.5) * volatility;
        let open = currentBar.close;
        let close = open + change;
        let high = Math.max(open, close) + Math.random() * 0.0002;
        let low = Math.min(open, close) - Math.random() * 0.0002;

        currentBar = {
            time: currentBar.time + 60, // Add 1 minute
            open: open,
            high: high,
            low: low,
            close: close,
        };
        historicalData.push(currentBar);
    }

    candleSeries.setData(historicalData);

    // Handle Window Resize for Chart
    window.addEventListener('resize', () => {
        chart.resize(domElement.clientWidth, domElement.clientHeight);
    });

    // Simulate Live Price Ticks
    setInterval(() => {
        let volatility = 0.0002;
        let change = (Math.random() - 0.5) * volatility;

        // Update current bar
        currentBar.close += change;
        if(currentBar.close > currentBar.high) currentBar.high = currentBar.close;
        if(currentBar.close < currentBar.low) currentBar.low = currentBar.close;

        // Tick new time if needed
        let currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - currentBar.time > 60) {
             currentBar = {
                 time: currentTime,
                 open: currentBar.close,
                 high: currentBar.close,
                 low: currentBar.close,
                 close: currentBar.close
             };
        }

        candleSeries.update(currentBar);
        updateLivePrices(currentBar.close, change);

    }, 1000); // Tick every second

    // Live Price Updates to UI
    function updateLivePrices(newPrice, change) {
        // Find EURUSD in symbol list
        const eurusdItem = Array.from(symbolItems).find(item =>
            item.querySelector('.asset-name').textContent === 'EURUSD'
        );

        const priceStr = newPrice.toFixed(5);
        const isUp = change >= 0;
        const flashClass = isUp ? 'flash-green' : 'flash-red';

        // Update Symbol List Item
        if (eurusdItem) {
            const priceEl = eurusdItem.querySelector('.asset-price');
            priceEl.textContent = priceStr;
            flashElement(priceEl, flashClass);
        }

        // Update Order Entry if selected
        if (selectedAssetName.textContent === 'EURUSD') {
            selectedAssetPrice.textContent = priceStr;
            flashElement(selectedAssetPrice, flashClass);

            // Update buttons
            const sellBtn = document.querySelector('.sell-btn .btn-price');
            const buyBtn = document.querySelector('.buy-btn .btn-price');

            sellBtn.textContent = priceStr;
            // Mock a higher buy price based on spread
            buyBtn.textContent = (parseFloat(priceStr) + 0.00041).toFixed(5);

            flashElement(sellBtn.parentElement, flashClass);
            flashElement(buyBtn.parentElement, flashClass);

            // Update chart header OHLC
            const ohlcSpans = document.querySelectorAll('.ohlc span');
            if (ohlcSpans.length >= 4) {
                const cSpan = ohlcSpans[3].querySelector('span');
                cSpan.textContent = priceStr;
                cSpan.className = isUp ? 'text-green' : 'text-red';
            }
        }
    }

    function flashElement(el, flashClass) {
        if (!el) return;
        el.classList.remove('flash-green', 'flash-red');
        // Force reflow
        void el.offsetWidth;
        el.classList.add(flashClass);
    }

    // Volume Controls
    const volMinus = document.querySelector('.vol-btn.minus');
    const volPlus = document.querySelector('.vol-btn.plus');
    const volValue = document.querySelector('.volume-value');

    if (volMinus && volPlus && volValue) {
        volMinus.addEventListener('click', () => {
            let val = parseFloat(volValue.textContent);
            if (val > 0.01) {
                volValue.textContent = (val - 0.01).toFixed(2);
            }
        });

        volPlus.addEventListener('click', () => {
            let val = parseFloat(volValue.textContent);
            volValue.textContent = (val + 0.01).toFixed(2);
        });
    }

    // Symbol Selection
    const symbolItems = document.querySelectorAll('.symbol-item');
    const selectedAssetName = document.querySelector('.selected-asset .asset-name');
    const selectedAssetSpread = document.querySelector('.selected-asset .asset-spread');
    const selectedAssetPrice = document.querySelector('.selected-asset .asset-price');
    const selectedAssetIcon = document.querySelector('.selected-asset .asset-icon');
    const chartPairName = document.querySelector('.chart-title .pair-name');
    const chartIcon = document.querySelector('.chart-title .asset-icon');

    symbolItems.forEach(item => {
        item.addEventListener('click', () => {
            const name = item.querySelector('.asset-name').textContent;
            const spread = item.querySelector('.asset-spread').textContent;
            const price = item.querySelector('.asset-price').textContent;
            const iconClass = Array.from(item.querySelector('.asset-icon').classList).find(c => c.endsWith('-icon'));

            // Update order panel
            selectedAssetName.textContent = name;
            selectedAssetSpread.textContent = spread;
            selectedAssetPrice.textContent = price;

            selectedAssetIcon.className = `asset-icon ${iconClass}`;

            // Update chart header
            chartPairName.textContent = name;
            chartIcon.className = `asset-icon small ${iconClass}`;

            // Update buttons
            document.querySelector('.sell-btn .btn-price').textContent = price;
            // Mock a slightly higher buy price
            document.querySelector('.buy-btn .btn-price').textContent = (parseFloat(price) + 0.00041).toFixed(5);
        });
    });

// Order Execution Logic
let openPositions = [];
let accountBalance = 100001.00;
let usedMargin = 0;

function updateAccountStats() {
    const statValues = document.querySelectorAll('.nav-center .stat-value');

    // Calculate total floating PnL
    let totalPnl = 0;
    openPositions.forEach(pos => {
        const currentPrice = parseFloat(document.querySelector('.sell-btn .btn-price').textContent); // Simplify using EURUSD price
        // Mock PnL calculation
        if(pos.type === 'BUY') {
            pos.pnl = (currentPrice - pos.openPrice) * pos.volume * 100000;
        } else {
            pos.pnl = (pos.openPrice - currentPrice) * pos.volume * 100000;
        }
        totalPnl += pos.pnl;
    });

    const equity = accountBalance + totalPnl;
    const freeMargin = equity - usedMargin;
    const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : 0;

    // Profit
    statValues[0].innerHTML = `${totalPnl.toFixed(2)} <span class="currency">USD</span>`;
    statValues[0].className = `stat-value ${totalPnl >= 0 ? 'text-green' : 'text-red'}`;

    // Equity
    statValues[1].innerHTML = `${equity.toFixed(2)} <span class="currency">USD</span>`;

    // Balance
    statValues[2].innerHTML = `${accountBalance.toFixed(2)} <span class="currency">USD</span>`;

    // Free Funds
    statValues[3].innerHTML = `${freeMargin.toFixed(2)} <span class="currency">USD</span>`;

    // Margin
    statValues[4].innerHTML = `${usedMargin.toFixed(2)} <span class="currency">USD</span>`;

    // Margin Lvl
    statValues[5].innerHTML = `${marginLevel.toFixed(2)} <span class="currency">%</span>`;

    renderPositionsTable();
}

window.renderPositionsTable = function() {
    const panelContent = document.querySelector('.panel-content');

    if (openPositions.length === 0) {
        panelContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3>You don't have any open positions</h3>
                <p>Open a trade to see it here</p>
            </div>
        `;
        return;
    }

    let tableHtml = `
        <table class="positions-table">
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Ticket</th>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Volume</th>
                    <th>Open Price</th>
                    <th>S/L</th>
                    <th>T/P</th>
                    <th>Current Price</th>
                    <th>Swap</th>
                    <th>Profit</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    openPositions.forEach((pos, index) => {
        const currentPrice = parseFloat(document.querySelector('.sell-btn .btn-price').textContent).toFixed(5);
        const pnlClass = pos.pnl >= 0 ? 'text-green' : 'text-red';

        tableHtml += `
            <tr>
                <td><strong>${pos.symbol}</strong></td>
                <td>#${pos.ticket}</td>
                <td>${pos.time}</td>
                <td class="${pos.type === 'BUY' ? 'text-green' : 'text-red'}">${pos.type}</td>
                <td>${pos.volume.toFixed(2)}</td>
                <td>${pos.openPrice.toFixed(5)}</td>
                <td>0.00000</td>
                <td>0.00000</td>
                <td>${currentPrice}</td>
                <td>0.00</td>
                <td class="${pnlClass}"><strong>${pos.pnl.toFixed(2)}</strong></td>
                <td><button class="close-btn" data-index="${index}"><i class="fas fa-times text-red"></i></button></td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table>`;
    panelContent.innerHTML = tableHtml;

    // Attach close button listeners
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            closePosition(index);
        });
    });
}

function closePosition(index) {
    const pos = openPositions[index];
    accountBalance += pos.pnl; // Realize PnL
    usedMargin -= (pos.volume * 100000) / 100; // Release margin
    openPositions.splice(index, 1);
    updateAccountStats();

    // Add marker to chart
    if (candleSeries) {
        const markers = candleSeries.markers() || [];
        markers.push({
            time: Math.floor(Date.now() / 1000),
            position: pos.type === 'BUY' ? 'aboveBar' : 'belowBar',
            color: '#f44336',
            shape: 'arrowDown',
            text: 'Close ' + pos.type
        });
        // Sort markers by time as required by lightweight-charts
        markers.sort((a, b) => a.time - b.time);
        candleSeries.setMarkers(markers);
    }
}

document.querySelector('.buy-btn').addEventListener('click', (e) => {
    e.preventDefault();
    executeTrade('BUY');
});

document.querySelector('.sell-btn').addEventListener('click', (e) => {
    e.preventDefault();
    executeTrade('SELL');
});

// Make functions global for testing
window.executeTrade = function(type) {
    const symbol = document.querySelector('.selected-asset .asset-name').textContent;
    const volume = parseFloat(document.querySelector('.volume-value').textContent);
    const price = parseFloat(document.querySelector(type === 'BUY' ? '.buy-btn .btn-price' : '.sell-btn .btn-price').textContent);

    const now = new Date();
    const timeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;

    const marginRequired = (volume * 100000) / 100; // Mock leverage 1:100

    if (accountBalance - usedMargin < marginRequired) {
        alert("Not enough free margin!");
        return;
    }

    usedMargin += marginRequired;

    openPositions.push({
        ticket: Math.floor(Math.random() * 10000000),
        symbol: symbol,
        time: timeStr,
        type: type,
        volume: volume,
        openPrice: price,
        pnl: 0
    });

    // Auto switch to Open Positions tab
    const openPosTab = document.querySelector('.p-tab:nth-child(1)');
    if (openPosTab) {
        // Click the tab, which will trigger renderPositionsTable in the event listener if we fixed it, or we call it manually
        openPosTab.click();
    }

    // Force rendering table regardless of tab state to ensure playwright sees it
    renderPositionsTable();

    updateAccountStats();

    // Add visual marker on chart
    if (candleSeries) {
        const markers = candleSeries.markers() || [];
        markers.push({
            time: Math.floor(Date.now() / 1000),
            position: type === 'BUY' ? 'belowBar' : 'aboveBar',
            color: type === 'BUY' ? '#26a69a' : '#ef5350',
            shape: type === 'BUY' ? 'arrowUp' : 'arrowDown',
            text: type + ' @ ' + price.toFixed(5)
        });
        markers.sort((a, b) => a.time - b.time);
        candleSeries.setMarkers(markers);
    }
}

// Update PnL every second
setInterval(updateAccountStats, 1000);


    // Clock update
    const clockElement = document.querySelector('.clock');
    if (clockElement) {
        setInterval(() => {
            const now = new Date();
            const hours = String(now.getUTCHours()).padStart(2, '0');
            const minutes = String(now.getUTCMinutes()).padStart(2, '0');
            const seconds = String(now.getUTCSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds} (UTC +0)`;
        }, 1000);
    }
});