// Example data for 30 days (simulate success rates)
const timelineData = {
  "90d": {dates: [], rates: []},
  "30d": {
    dates: [
      "Apr 14","Apr 15","Apr 16","Apr 17","Apr 18","Apr 19","Apr 20","Apr 21","Apr 22","Apr 23",
      "Apr 24","Apr 25","Apr 26","Apr 27","Apr 28","Apr 29","Apr 30","May 1","May 2","May 3",
      "May 4","May 5","May 6","May 7","May 8","May 9","May 10","May 11","May 12","May 13"
    ],
    rates: [
      83, 89, 85, 87, 82, 88, 90, 89, 81, 84,
      85, 83, 80, 84, 87, 82, 88, 90, 81, 85,
      82, 84, 86, 89, 87, 85, 83, 81, 80, 79
    ]
  },
  "7d": {
    dates: ["May 7","May 8","May 9","May 10","May 11","May 12","May 13"],
    rates: [89, 87, 85, 83, 81, 80, 79]
  },
  "24h": {
    dates: ["May 12", "May 13"],
    rates: [80, 79]
  }
};

// Repo build data
const buildData = [
  {
    repo: "booking-manager",
    success: 12,
    failure: 1,
    cancelled: 0
  },
  {
    repo: "flight-search",
    success: 22,
    failure: 6,
    cancelled: 0
  },
  {
    repo: "loyalty-program",
    success: 9,
    failure: 0,
    cancelled: 0
  },
  {
    repo: "sample-sanity-pipeline",
    success: 10,
    failure: 0,
    cancelled: 0
  }
];

// --- Chart.js chart instances ---
let trendChart, stackedBarChart, pieChart, failureBarChart, successBarChart;

// --- Chart rendering functions ---
function renderSuccessRateTrend(timeline) {
  const ctx = document.getElementById('successRateTrend').getContext('2d');
  if (trendChart) trendChart.destroy();
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timelineData[timeline].dates,
      datasets: [{
        label: 'Overall Success Rate (%)',
        data: timelineData[timeline].rates,
        fill: true,
        backgroundColor: 'rgba(34,197,94,0.08)',
        borderColor: '#22c55e',
        pointBackgroundColor: '#22c55e',
        pointRadius: 4,
        tension: 0.3
      }]
    },
    options: {
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: 'Success Rate Trend (' + document.getElementById('time-range').selectedOptions[0].text + ')',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          min: 70,
          max: 100,
          ticks: { stepSize: 5 }
        }
      }
    }
  });
}

function renderStackedBarChart() {
  const ctx = document.getElementById('stackedBarChart').getContext('2d');
  if (stackedBarChart) stackedBarChart.destroy();
  stackedBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: buildData.map(d => d.repo),
      datasets: [
        {
          label: 'Success',
          data: buildData.map(d => d.success),
          backgroundColor: '#22c55e'
        },
        {
          label: 'Failure',
          data: buildData.map(d => d.failure),
          backgroundColor: '#ef4444'
        },
        {
          label: 'Cancelled',
          data: buildData.map(d => d.cancelled),
          backgroundColor: '#f59e42'
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: true },
        title: {
          display: false
        }
      },
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
}

function renderPieChart() {
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: buildData.map(d => d.repo),
      datasets: [{
        data: buildData.map(d => d.success + d.failure + d.cancelled),
        backgroundColor: ['#2dd4bf','#f472b6','#f59e42','#60a5fa']
      }]
    },
    options: {
      plugins: {
        legend: { display: true, position: 'bottom' }
      }
    }
  });
}

function renderFailureBarChart() {
  const ctx = document.getElementById('failureBarChart').getContext('2d');
  if (failureBarChart) failureBarChart.destroy();
  failureBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: buildData.map(d => d.repo),
      datasets: [{
        label: 'Failure Rate',
        data: buildData.map(d => {
          const total = d.success + d.failure + d.cancelled;
          return total ? d.failure / total : 0;
        }),
        backgroundColor: '#ef4444'
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          min: 0,
          max: 1,
          ticks: {
            callback: val => (val * 100).toFixed(0) + '%'
          }
        }
      }
    }
  });
}

function renderSuccessBarChart() {
  const ctx = document.getElementById('successBarChart').getContext('2d');
  if (successBarChart) successBarChart.destroy();
  successBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: buildData.map(d => d.repo),
      datasets: [{
        label: 'Success Rate',
        data: buildData.map(d => {
          const total = d.success + d.failure + d.cancelled;
          return total ? d.success / total : 0;
        }),
        backgroundColor: '#22c55e'
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          min: 0,
          max: 1,
          ticks: {
            callback: val => (val * 100).toFixed(0) + '%'
          }
        }
      }
    }
  });
}

// --- Initial render ---
function renderAllCharts() {
  renderSuccessRateTrend(document.getElementById('time-range').value);
  renderStackedBarChart();
  renderPieChart();
  renderFailureBarChart();
  renderSuccessBarChart();
}

// --- Event listeners ---
document.addEventListener('DOMContentLoaded', function() {
  // Set up time range change handler
  document.getElementById('time-range').addEventListener('change', function() {
    renderSuccessRateTrend(this.value);
  });
  
  // Render all charts on page load
  renderAllCharts();
});
