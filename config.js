// Configuration for the Sanity Test Reports Hub
// Automatically updated by GitHub Actions on 2025-08-02 02:19:37

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
        "lastUpdate": "13 weeks ago",
        "lastUpdateTimestamp": "2025-05-02T11:00:18Z",
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
            "total": 7,
            "passed": 7,
            "failed": 0,
            "critical": 3
        },
        "lastUpdate": "11 weeks ago",
        "lastUpdateTimestamp": "2025-05-15T17:46:21Z",
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
            "total": 6,
            "passed": 6,
            "failed": 0,
            "critical": 2
        },
        "lastUpdate": "11 weeks ago",
        "lastUpdateTimestamp": "2025-05-13T20:02:05Z",
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
            "total": 7,
            "passed": 7,
            "failed": 0,
            "critical": 2
        },
        "lastUpdate": "12 weeks ago",
        "lastUpdateTimestamp": "2025-05-09T18:05:07Z",
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
        tests: 20,
        passed: 20,
        failed: 0,
        critical: 7,
        passRate: 100,
        lastUpdated: "2025-08-02T02:19:37+0100"
    };
}

const OVERALL_STATS = calculateOverallStats();
