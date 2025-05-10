// Dynamic repository rendering script
document.addEventListener('DOMContentLoaded', function() {
    // Update dashboard stats
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = OVERALL_STATS.repositories;
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = OVERALL_STATS.passRate + '%';
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = OVERALL_STATS.critical;
    
    // Set the last update time from pipeline execution data
    if (OVERALL_STATS.lastUpdated) {
        try {
            // Parse the timestamp
            const lastUpdateDate = new Date(OVERALL_STATS.lastUpdated);
            
            // Get today's date for comparison
            const today = new Date();
            const isToday = today.toDateString() === lastUpdateDate.toDateString();
            
            // Get the last updated card
            const lastUpdatedCard = document.querySelector('.stat-card:nth-child(4) .stat-value');
            
            // Clear existing content
            lastUpdatedCard.innerHTML = '';
            
            if (isToday) {
                // If update was today, show "Today" and time
                const todayElem = document.createElement('div');
                todayElem.textContent = 'Today';
                todayElem.style.fontWeight = 'bold';
                
                const timeElem = document.createElement('div');
                timeElem.textContent = '@ ' + lastUpdateDate.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                timeElem.style.fontSize = '28px';
                timeElem.style.fontWeight = 'bold';
                
                lastUpdatedCard.appendChild(todayElem);
                lastUpdatedCard.appendChild(timeElem);
            } else {
                // Otherwise show formatted date
                const dateElem = document.createElement('div');
                dateElem.textContent = lastUpdateDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                dateElem.style.fontWeight = 'bold';

                const timeElem = document.createElement('div');
                timeElem.textContent = '@ ' + lastUpdateDate.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                timeElem.style.fontSize = '28px';
                timeElem.style.fontWeight = 'bold';
                
                lastUpdatedCard.appendChild(dateElem);
                lastUpdatedCard.appendChild(timeElem);
            }
        } catch (error) {
            // If date parsing fails, just show the string
            document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = 
                'Updated: ' + OVERALL_STATS.lastUpdated;
        }
    } else {
        // Fallback if no lastUpdated value exists
        document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = 'Recently Updated';
    }

    // Clear existing repositories
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    
    if (!gridView || !listView) {
        console.error('Repository view containers not found');
        return;
    }
    
    gridView.innerHTML = '';
    listView.innerHTML = '';
    
    // Render repositories from config
    if (typeof REPOSITORIES !== 'undefined' && Array.isArray(REPOSITORIES)) {
        REPOSITORIES.forEach(repo => {
            // Create grid view card
            const gridCard = createGridCard(repo);
            gridView.appendChild(gridCard);
            
            // Create list view item
            const listItem = createListItem(repo);
            listView.appendChild(listItem);
        });
        
        // Set initial view (grid is default)
        gridView.style.display = 'grid';
        listView.style.display = 'none';
    } else {
        console.error('REPOSITORIES is not defined or is not an array');
    }
    
    // Ensure the view buttons work
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', function() {
            gridView.style.display = 'grid';
            listView.style.display = 'none';
            
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        });
    }
    
    if (listViewBtn) {
        listViewBtn.addEventListener('click', function() {
            gridView.style.display = 'none';
            listView.style.display = 'block';
            
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
        });
    }
});

// Add from=hub parameter to URLs
function addHubParameter(url) {
    // Check if the URL already has parameters
    if (url.includes('?')) {
        return `${url}&from=hub`;
    } else {
        return `${url}?from=hub`;
    }
}

// Function to determine status based on time elapsed
function getStatusFromTimestamp(timestamp) {
    if (!timestamp) return "danger"; // No timestamp = danger
    
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInDays = Math.floor((now - updated) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) {
        return "success"; // Less than 1 day = success (green)
    } else if (diffInDays < 3) {
        return "warning"; // Between 1-5 days = warning (yellow)
    } else {
        return "danger";  // 5+ days = danger (red)
    }
}

// Function to determine the appropriate status icon based on test results
function getStatusIcon(repo) {
    // If there are failed tests, show a failure icon
    if (repo.stats.failed > 0) {
        return '<i class="fas fa-times-circle" style="color: #e74c3c; margin-right: 8px; font-size: 1.1em;"></i>';
    } else {
        return '<i class="fas fa-check-circle" style="color: #2ecc71; margin-right: 8px; font-size: 1.1em;"></i>';
    }
}

// Create a repository card for grid view
function createGridCard(repo) {
    const card = document.createElement('div');
    card.className = 'repository-card';
    
    // Add from=hub parameter to URL
    const reportUrl = addHubParameter(repo.url);
    
    // Find repo index for timestamp class
    const repoIndex = REPOSITORIES.findIndex(r => r.name === repo.name);
    
    // Create timestamp element with proper class for dynamic updates
    let timeDisplay;
    if (repo.lastUpdateTimestamp) {
        timeDisplay = `<span class="timestamp-repo-${repoIndex}">${getRelativeTimeString(repo.lastUpdateTimestamp)}</span>`;
    } else {
        timeDisplay = repo.lastUpdate;
    }
    
    // Get status based on timestamp rather than pass rate
    const status = getStatusFromTimestamp(repo.lastUpdateTimestamp);
    
    // Get the status icon
    const statusIcon = getStatusIcon(repo);
    
    card.innerHTML = `
        <div class="repository-header">
            <div class="repository-name">${statusIcon}${repo.name}</div>
            <div class="repository-description">${repo.description}</div>
        </div>
        <div class="repository-stats">
            <div class="repo-stat">
                <div class="repo-stat-value">${repo.stats.total}</div>
                <div class="repo-stat-label">Total Tests</div>
            </div>
            <div class="repo-stat">
                <div class="repo-stat-value">${repo.stats.passed}</div>
                <div class="repo-stat-label">Passed</div>
            </div>
            <div class="repo-stat">
                <div class="repo-stat-value">${repo.stats.failed}</div>
                <div class="repo-stat-label">Failed</div>
            </div>
        </div>
        <div class="repository-footer">
            <div class="last-update">
                <span class="status-indicator status-${status}"></span>
                ${timeDisplay}
            </div>
            <a href="${reportUrl}" class="view-report" target="_blank">View Allure Report</a>
        </div>
    `;
    
    return card;
}

// Create a repository item for list view
function createListItem(repo) {
    const item = document.createElement('div');
    item.className = 'repository-list-item';
    
    // Add from=hub parameter to URL
    const reportUrl = addHubParameter(repo.url);
    
    // Find repo index for timestamp class
    const repoIndex = REPOSITORIES.findIndex(r => r.name === repo.name);
    
    // Create timestamp element with proper class for dynamic updates
    let timeDisplay;
    if (repo.lastUpdateTimestamp) {
        timeDisplay = `<span class="timestamp-repo-${repoIndex}">${getRelativeTimeString(repo.lastUpdateTimestamp)}</span>`;
    } else {
        timeDisplay = repo.lastUpdate;
    }
    
    // Get status based on timestamp rather than pass rate
    const status = getStatusFromTimestamp(repo.lastUpdateTimestamp);
    
    // Get the status icon
    const statusIcon = getStatusIcon(repo);
    
    item.innerHTML = `
        <div class="repository-info">
            <div class="repository-icon">
                <i class="fas fa-code-branch"></i>
            </div>
            <div class="repository-details">
                <h3>${statusIcon}${repo.name}</h3>
                <p>${repo.description}</p>
            </div>
        </div>
        <div class="repository-metrics">
            <div class="repository-metric">
                <div class="repository-metric-value">${repo.stats.total}</div>
                <div class="repository-metric-label">Total</div>
            </div>
            <div class="repository-metric">
                <div class="repository-metric-value">${repo.stats.passed}</div>
                <div class="repository-metric-label">Passed</div>
            </div>
            <div class="repository-metric">
                <div class="repository-metric-value">${repo.stats.failed}</div>
                <div class="repository-metric-label">Failed</div>
            </div>
        </div>
        <div class="repository-actions">
            <div class="last-update">
                <span class="status-indicator status-${status}"></span>
                ${timeDisplay}
            </div>
            <a href="${reportUrl}" class="view-report" target="_blank">View Allure Report</a>
        </div>
    `;
    
    return item;
}
