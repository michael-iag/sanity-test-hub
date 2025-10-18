// JavaScript for repository analytics page
document.addEventListener('DOMContentLoaded', function() {
    // Load repositories into selector
    const repoSelector = document.getElementById('repository');
    
    // First check if REPOSITORIES is available
    if (typeof REPOSITORIES === 'undefined') {
        console.error('REPOSITORIES is not defined. Make sure config.js is loaded.');
        return;
    }
    
    // Populate repository dropdown
    REPOSITORIES.forEach(repo => {
        const option = document.createElement('option');
        option.value = repo.name;
        option.textContent = repo.name;
        repoSelector.appendChild(option);
    });
    
    // Handle repository selection
    repoSelector.addEventListener('change', function() {
        const selectedRepo = this.value;
        if (selectedRepo) {
            loadRepositoryData(selectedRepo);
        } else {
            clearRepositoryData();
        }
    });
    
    // Initial state - empty
    clearRepositoryData();
});

function loadRepositoryData(repoName) {
    // Find repository in data
    const repo = REPOSITORIES.find(r => r.name === repoName);
    if (!repo) {
        console.error('Repository not found:', repoName);
        return;
    }
    
    // Update dashboard metrics
    updateMetricsDashboard(repo);
    
    // For now, use sample data for other sections
    // In a real implementation, this would fetch data from the API
    updateTestReliability(getMockTestData(repo));
    updateFailurePatterns(getMockFailureData(repo));
}

function updateMetricsDashboard(repo) {
    const dashboard = document.querySelector('.metrics-dashboard');
    dashboard.innerHTML = ''; // Clear existing cards
    
    // Create metric cards
    const cards = [
        {
            title: 'Pass Rate',
            value: `${calculatePassRate(repo.stats)}%`,
            icon: 'fa-chart-line',
            color: '#3498db'
        },
        {
            title: 'Total Tests',
            value: repo.stats.total,
            icon: 'fa-vial',
            color: '#2c3e50'
        },
        {
            title: 'Passed Tests',
            value: repo.stats.passed,
            icon: 'fa-check',
            color: '#2ecc71'
        },
        {
            title: 'Failed Tests',
            value: repo.stats.failed,
            icon: 'fa-times',
            color: '#e74c3c'
        },
        {
            title: 'Critical Tests',
            value: repo.stats.critical || 0,
            icon: 'fa-exclamation-triangle',
            color: '#f39c12'
        },
        {
            title: 'Last Updated',
            value: formatLastUpdated(repo.lastUpdateTimestamp),
            icon: 'fa-clock',
            color: '#9b59b6'
        }
    ];
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'metric-card';
        cardElement.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div style="background-color: ${card.color}; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 15px;">
                    <i class="fas ${card.icon}"></i>
                </div>
                <div>
                    <div style="font-size: 22px; font-weight: bold;">${card.value}</div>
                    <div style="color: #777;">${card.title}</div>
                </div>
            </div>
        `;
        dashboard.appendChild(cardElement);
    });
}

function updateTestReliability(testData) {
    const tableBody = document.querySelector('#reliabilityTable tbody');
    tableBody.innerHTML = ''; // Clear existing rows
    
    testData.forEach(test => {
        const row = document.createElement('tr');
        
        // Create status icon
        let statusIcon, statusColor;
        if (test.status === 'pass') {
            statusIcon = 'fa-check-circle';
            statusColor = '#2ecc71';
        } else {
            statusIcon = 'fa-times-circle';
            statusColor = '#e74c3c';
        }
        
        // Create reliability bar
        const reliabilityBar = `
            <div style="width: 100px; height: 8px; background-color: #eee; border-radius: 4px; overflow: hidden;">
                <div style="width: ${test.reliability}%; height: 100%; background-color: ${test.reliability > 80 ? '#2ecc71' : '#f39c12'}"></div>
            </div>
            <div style="font-size: 12px; margin-top: 3px;">${test.reliability}%</div>
        `;
        
        row.innerHTML = `
            <td>${test.name}</td>
            <td>${reliabilityBar}</td>
            <td>${test.lastRun}</td>
            <td>${test.duration.toFixed(2)}s</td>
            <td><i class="fas ${statusIcon}" style="color: ${statusColor};"></i></td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updateFailurePatterns(failureData) {
    const container = document.getElementById('failurePatterns');
    container.innerHTML = '';
    
    if (failureData.length === 0) {
        container.innerHTML = '<p>No recurring failure patterns detected.</p>';
        return;
    }
    
    failureData.forEach(failure => {
        const element = document.createElement('div');
        element.style.marginBottom = '15px';
        element.style.padding = '10px';
        element.style.borderLeft = '3px solid #e74c3c';
        element.style.backgroundColor = '#fafafa';
        
        element.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">${failure.pattern}</div>
            <div style="display: flex; justify-content: space-between; color: #777; font-size: 14px;">
                <div>Occurrences: ${failure.occurrences}</div>
                <div>Last seen: ${failure.lastSeen}</div>
            </div>
            <div style="margin-top: 8px; font-family: monospace; font-size: 13px; background-color: #f5f5f5; padding: 8px; border-radius: 4px;">
                ${failure.example}
            </div>
        `;
        
        container.appendChild(element);
    });
}

function clearRepositoryData() {
    document.querySelector('.metrics-dashboard').innerHTML = 
        '<div style="grid-column: 1/-1; text-align: center; padding: 50px 0; color: #777;">Select a repository to view its analytics</div>';
    
    document.querySelector('#reliabilityTable tbody').innerHTML = '';
    document.querySelector('#failurePatterns').innerHTML = '';
}

// Helper functions
function calculatePassRate(stats) {
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.passed / stats.total) * 100);
}

function formatLastUpdated(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Mock data generators
function getMockTestData(repo) {
    // Generate some sample test data based on the repository stats
    const tests = [];
    const testCount = repo.stats.total || 5;
    
    for (let i = 1; i <= testCount; i++) {
        const isPass = i <= repo.stats.passed;
        tests.push({
            name: `Test ${i}: ${getRandomTestName()}`,
            reliability: Math.round(70 + Math.random() * 30),
            lastRun: getRandomLastRunTime(),
            duration: 0.5 + Math.random() * 2.5,
            status: isPass ? 'pass' : 'fail'
        });
    }
    
    return tests;
}

function getMockFailureData(repo) {
    // If no failures, return empty array
    if (repo.stats.failed === 0) return [];
    
    // Generate some sample failure patterns
    const failures = [];
    const failureCount = Math.min(repo.stats.failed, 3);
    
    const failurePatterns = [
        {
            pattern: "Connection timeout in API request",
            example: "Error: Request timed out after 5000ms - endpoint: /api/flights/search"
        },
        {
            pattern: "Validation error in form submission",
            example: "AssertionError: expected status 200 but got 400 - Error: Invalid date format"
        },
        {
            pattern: "Missing dependency in test environment",
            example: "ReferenceError: paymentProcessor is not defined at BookingService.processPayment"
        },
        {
            pattern: "Race condition in async operations",
            example: "TypeError: Cannot read property 'status' of undefined - context: order processing"
        }
    ];
    
    for (let i = 0; i < failureCount; i++) {
        const pattern = failurePatterns[i % failurePatterns.length];
        failures.push({
            pattern: pattern.pattern,
            occurrences: Math.floor(2 + Math.random() * 8),
            lastSeen: getRandomLastRunTime(),
            example: pattern.example
        });
    }
    
    return failures;
}

function getRandomTestName() {
    const testNames = [
        "User login validation",
        "Flight search results",
        "Booking confirmation",
        "Payment processing",
        "Email notification",
        "User profile update",
        "Flight status check",
        "Seat selection",
        "Itinerary generation",
        "Baggage allowance calculation"
    ];
    
    return testNames[Math.floor(Math.random() * testNames.length)];
}

function getRandomLastRunTime() {
    const times = [
        "Today, 09:15",
        "Today, 11:32",
        "Yesterday, 16:45",
        "Yesterday, 14:23",
        "2 days ago",
        "3 days ago"
    ];
    
    return times[Math.floor(Math.random() * times.length)];
} 