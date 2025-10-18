// Configuration for the Sanity Test Reports Hub
// Automatically updated by GitHub Actions on 2025-10-18 02:07:27

const REPOSITORIES = [
    {
        "name": "sample-sanity-pipeline",
        "description": null,
        "url": "https://michael-iag.github.io/sample-sanity-pipeline/",
        "stats": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "critical": 0
        },
        "lastUpdate": "1 weeks ago",
        "lastUpdateTimestamp": "2025-10-08T10:08:33Z",
        "workflowStatus": "success",
        "lastCommit": {
            "message": "Update Back to Hub button",
            "author": "Michael Olawuwo"
        }
    },
    {
        "name": "flight-search",
        "description": "Flight search",
        "url": "https://michael-iag.github.io/flight-search/",
        "stats": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "critical": 0
        },
        "lastUpdate": "1 weeks ago",
        "lastUpdateTimestamp": "2025-10-08T10:08:36Z",
        "workflowStatus": "success",
        "lastCommit": {
            "message": "Failed test simulations",
            "author": "Michael Olawuwo"
        }
    },
    {
        "name": "booking-manager",
        "description": "Booking Manager Suite",
        "url": "https://michael-iag.github.io/booking-manager/",
        "stats": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "critical": 0
        },
        "lastUpdate": "1 weeks ago",
        "lastUpdateTimestamp": "2025-10-08T10:08:27Z",
        "workflowStatus": "success",
        "lastCommit": {
            "message": "Add manual trigger to workflow",
            "author": "Michael Olawuwo"
        }
    },
    {
        "name": "loyalty-program",
        "description": "Loyal Program Suite",
        "url": "https://michael-iag.github.io/loyalty-program/",
        "stats": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "critical": 0
        },
        "lastUpdate": "1 weeks ago",
        "lastUpdateTimestamp": "2025-10-08T10:08:32Z",
        "workflowStatus": "success",
        "lastCommit": {
            "message": "Add xml upload to workflow",
            "author": "Michael Olawuwo"
        }
    }
];

// Calculate overall statistics
function calculateOverallStats() {
    return {
        repositories: 4,
        tests: 0,
        passed: 0,
        failed: 0,
        critical: 0,
        passRate: 0,
        lastUpdated: "2025-10-18T02:07:27+0100"
    };
}

const OVERALL_STATS = calculateOverallStats();
