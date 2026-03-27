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

            // In a real app, this would switch the panel content
            const contentH3 = document.querySelector('.empty-state h3');
            const contentP = document.querySelector('.empty-state p');
            const contentIcon = document.querySelector('.empty-icon i');

            if (tab.textContent.includes('Positions') || tab.textContent.includes('Orders')) {
                contentH3.textContent = `You don't have any ${tab.textContent.trim().toLowerCase()}`;
                contentP.textContent = "Open a trade to see it here";
                contentIcon.className = 'fas fa-chart-line';
            } else {
                contentH3.textContent = "You don't have any finance history";
                contentP.textContent = "Do some payment and here you'll see your finance history";
                contentIcon.className = 'fas fa-credit-card';
            }
        });
    });

    // Close measure tooltip
    const closeTooltipBtn = document.querySelector('.measure-tooltip i');
    if (closeTooltipBtn) {
        closeTooltipBtn.addEventListener('click', (e) => {
            e.target.parentElement.style.display = 'none';
        });
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