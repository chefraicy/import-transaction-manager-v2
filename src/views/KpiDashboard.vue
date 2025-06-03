<template>
  <div class="kpi-dashboard fade-in">
    <!-- Header -->
    <div class="dashboard-header card">
      <div class="card-header">
        <h1 class="card-title">
          <span class="nav-icon">📊</span>
          KPI Dashboard
        </h1>
        <div class="header-actions">
          <select v-model="timeRange" class="form-select">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button class="btn btn-secondary" @click="exportReport">
            <span>📊</span> Export Report
          </button>
        </div>
      </div>
      <div class="card-content">
        <p class="description">
          Track key performance indicators from planned landing to customs clearance release.
        </p>
      </div>
    </div>

    <!-- Key Metrics Grid -->
    <div class="metrics-grid grid grid-4">
      <div class="metric-card card">
        <div class="card-content">
          <div class="metric-header">
            <div class="metric-icon">⏱️</div>
            <div class="metric-trend" :class="clearanceTimeTrend.direction">
              <span>{{ clearanceTimeTrend.icon }}</span>
              {{ clearanceTimeTrend.percentage }}%
            </div>
          </div>
          <div class="metric-value">{{ avgClearanceTime }}h</div>
          <div class="metric-label">Avg Clearance Time</div>
          <div class="metric-subtitle">From landing to release</div>
        </div>
      </div>
      
      <div class="metric-card card">
        <div class="card-content">
          <div class="metric-header">
            <div class="metric-icon">✅</div>
            <div class="metric-trend" :class="successRateTrend.direction">
              <span>{{ successRateTrend.icon }}</span>
              {{ successRateTrend.percentage }}%
            </div>
          </div>
          <div class="metric-value">{{ successRate }}%</div>
          <div class="metric-label">Success Rate</div>
          <div class="metric-subtitle">Cleared without issues</div>
        </div>
      </div>
      
      <div class="metric-card card">
        <div class="card-content">
          <div class="metric-header">
            <div class="metric-icon">📋</div>
            <div class="metric-trend" :class="permitTimeTrend.direction">
              <span>{{ permitTimeTrend.icon }}</span>
              {{ permitTimeTrend.percentage }}%
            </div>
          </div>
          <div class="metric-value">{{ avgPermitTime }}h</div>
          <div class="metric-label">Avg Permit Time</div>
          <div class="metric-subtitle">OGA response time</div>
        </div>
      </div>
      
      <div class="metric-card card">
        <div class="card-content">
          <div class="metric-header">
            <div class="metric-icon">💰</div>
            <div class="metric-trend" :class="costTrend.direction">
              <span>{{ costTrend.icon }}</span>
              {{ costTrend.percentage }}%
            </div>
          </div>
          <div class="metric-value">${{ avgCost }}</div>
          <div class="metric-label">Avg Cost per Shipment</div>
          <div class="metric-subtitle">Including fees & delays</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row grid grid-2">
      <!-- Clearance Time Trend -->
      <div class="chart-card card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="nav-icon">📈</span>
            Clearance Time Trend
          </h3>
        </div>
        <div class="card-content">
          <div class="chart-container">
            <canvas ref="clearanceChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Status Distribution -->
      <div class="chart-card card">
        <div class="card-header">
          <h3 class="card-title">
            <span class="nav-icon">🥧</span>
            Status Distribution
          </h3>
        </div>
        <div class="card-content">
          <div class="chart-container">
            <canvas ref="statusChart" width="400" height="200"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Breakdown -->
    <div class="performance-breakdown card">
      <div class="card-header">
        <h3 class="card-title">
          <span class="nav-icon">⚡</span>
          Performance Breakdown
        </h3>
        <div class="breakdown-filters">
          <select v-model="breakdownBy" class="form-select">
            <option value="carrier">By Carrier</option>
            <option value="origin">By Origin</option>
            <option value="oga">By OGA Office</option>
            <option value="priority">By Priority</option>
          </select>
        </div>
      </div>
      <div class="card-content">
        <div class="breakdown-table">
          <table class="table">
            <thead>
              <tr>
                <th>{{ getBreakdownHeader() }}</th>
                <th>Total Shipments</th>
                <th>Avg Clearance Time</th>
                <th>Success Rate</th>
                <th>Avg Cost</th>
                <th>Performance Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in performanceBreakdown" :key="item.name">
                <td>
                  <div class="breakdown-name">
                    <strong>{{ item.name }}</strong>
                  </div>
                </td>
                <td>{{ item.totalShipments }}</td>
                <td>
                  <span class="time-value" :class="getTimeClass(item.avgClearanceTime)">
                    {{ item.avgClearanceTime }}h
                  </span>
                </td>
                <td>
                  <span class="rate-value" :class="getRateClass(item.successRate)">
                    {{ item.successRate }}%
                  </span>
                </td>
                <td>${{ item.avgCost }}</td>
                <td>
                  <div class="performance-score">
                    <div class="score-bar">
                      <div 
                        class="score-fill" 
                        :style="{ width: item.performanceScore + '%' }"
                        :class="getScoreClass(item.performanceScore)"
                      ></div>
                    </div>
                    <span class="score-text">{{ item.performanceScore }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Timeline Analysis -->
    <div class="timeline-analysis card">
      <div class="card-header">
        <h3 class="card-title">
          <span class="nav-icon">⏰</span>
          Timeline Analysis
        </h3>
      </div>
      <div class="card-content">
        <div class="timeline-metrics grid grid-3">
          <div class="timeline-metric">
            <div class="metric-icon">🛬</div>
            <div class="metric-info">
              <div class="metric-value">{{ avgLandingToCustoms }}h</div>
              <div class="metric-label">Landing to Customs</div>
            </div>
          </div>
          
          <div class="timeline-metric">
            <div class="metric-icon">📋</div>
            <div class="metric-info">
              <div class="metric-value">{{ avgCustomsProcessing }}h</div>
              <div class="metric-label">Customs Processing</div>
            </div>
          </div>
          
          <div class="timeline-metric">
            <div class="metric-icon">🚚</div>
            <div class="metric-info">
              <div class="metric-value">{{ avgReleaseToDelivery }}h</div>
              <div class="metric-label">Release to Delivery</div>
            </div>
          </div>
        </div>
        
        <div class="timeline-chart">
          <canvas ref="timelineChart" width="800" height="300"></canvas>
        </div>
      </div>
    </div>

    <!-- Bottleneck Analysis -->
    <div class="bottleneck-analysis card">
      <div class="card-header">
        <h3 class="card-title">
          <span class="nav-icon">🚧</span>
          Bottleneck Analysis
        </h3>
      </div>
      <div class="card-content">
        <div class="bottlenecks-grid grid grid-2">
          <div class="bottleneck-item">
            <div class="bottleneck-header">
              <div class="bottleneck-icon">⚠️</div>
              <div class="bottleneck-title">Top Delays</div>
            </div>
            <div class="bottleneck-list">
              <div v-for="delay in topDelays" :key="delay.reason" class="delay-item">
                <div class="delay-reason">{{ delay.reason }}</div>
                <div class="delay-impact">
                  <span class="delay-time">+{{ delay.avgDelay }}h</span>
                  <span class="delay-frequency">{{ delay.frequency }}% of cases</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bottleneck-item">
            <div class="bottleneck-header">
              <div class="bottleneck-icon">💡</div>
              <div class="bottleneck-title">Improvement Opportunities</div>
            </div>
            <div class="improvement-list">
              <div v-for="opportunity in improvements" :key="opportunity.area" class="improvement-item">
                <div class="improvement-area">{{ opportunity.area }}</div>
                <div class="improvement-potential">
                  <span class="potential-savings">-{{ opportunity.potentialSavings }}h</span>
                  <span class="potential-impact">{{ opportunity.impact }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts & Notifications -->
    <div class="alerts-section card">
      <div class="card-header">
        <h3 class="card-title">
          <span class="nav-icon">🔔</span>
          Performance Alerts
        </h3>
      </div>
      <div class="card-content">
        <div class="alerts-list">
          <div v-for="alert in performanceAlerts" :key="alert.id" class="alert-item" :class="`alert-${alert.severity}`">
            <div class="alert-icon">{{ alert.icon }}</div>
            <div class="alert-content">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="alert-message">{{ alert.message }}</div>
              <div class="alert-time">{{ formatDate(alert.timestamp) }}</div>
            </div>
            <div class="alert-actions">
              <button class="btn btn-sm btn-secondary" @click="dismissAlert(alert.id)">
                Dismiss
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="performanceAlerts.length === 0" class="no-alerts">
          <span class="nav-icon">✅</span>
          <p>No performance alerts at this time. All metrics are within normal ranges.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTransactionStore } from '../stores'
import { format } from 'date-fns'

export default {
  name: 'KpiDashboard',
  setup() {
    const store = useTransactionStore()
    
    // Reactive data
    const timeRange = ref('30')
    const breakdownBy = ref('carrier')
    const clearanceChart = ref(null)
    const statusChart = ref(null)
    const timelineChart = ref(null)
    
    const performanceAlerts = ref([
      {
        id: 1,
        severity: 'warning',
        icon: '⚠️',
        title: 'Clearance Time Increase',
        message: 'Average clearance time has increased by 15% compared to last month',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        severity: 'info',
        icon: 'ℹ️',
        title: 'FDA Processing Delay',
        message: 'FDA permits are taking 20% longer than usual this week',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ])

    // Computed properties
    const avgClearanceTime = computed(() => {
      // Mock calculation - in real app, this would calculate from actual data
      return 48
    })

    const successRate = computed(() => {
      return 94
    })

    const avgPermitTime = computed(() => {
      return 24
    })

    const avgCost = computed(() => {
      return 1250
    })

    const clearanceTimeTrend = computed(() => {
      return {
        direction: 'up',
        icon: '↗️',
        percentage: 8
      }
    })

    const successRateTrend = computed(() => {
      return {
        direction: 'down',
        icon: '↘️',
        percentage: 2
      }
    })

    const permitTimeTrend = computed(() => {
      return {
        direction: 'up',
        icon: '↗️',
        percentage: 15
      }
    })

    const costTrend = computed(() => {
      return {
        direction: 'down',
        icon: '↘️',
        percentage: 5
      }
    })

    const avgLandingToCustoms = computed(() => 12)
    const avgCustomsProcessing = computed(() => 28)
    const avgReleaseToDelivery = computed(() => 8)

    const performanceBreakdown = computed(() => {
      const breakdowns = {
        carrier: [
          { name: 'China Airlines', totalShipments: 45, avgClearanceTime: 42, successRate: 96, avgCost: 1180, performanceScore: 88 },
          { name: 'Lufthansa Cargo', totalShipments: 38, avgClearanceTime: 38, successRate: 98, avgCost: 1320, performanceScore: 92 },
          { name: 'FedEx', totalShipments: 52, avgClearanceTime: 52, successRate: 89, avgCost: 1450, performanceScore: 78 },
          { name: 'DHL', totalShipments: 29, avgClearanceTime: 46, successRate: 94, avgCost: 1280, performanceScore: 85 }
        ],
        origin: [
          { name: 'China', totalShipments: 78, avgClearanceTime: 45, successRate: 92, avgCost: 1200, performanceScore: 82 },
          { name: 'Germany', totalShipments: 34, avgClearanceTime: 38, successRate: 97, avgCost: 1350, performanceScore: 89 },
          { name: 'Japan', totalShipments: 28, avgClearanceTime: 41, successRate: 95, avgCost: 1280, performanceScore: 87 },
          { name: 'UK', totalShipments: 24, avgClearanceTime: 52, successRate: 88, avgCost: 1420, performanceScore: 76 }
        ],
        oga: [
          { name: 'Customs', totalShipments: 89, avgClearanceTime: 32, successRate: 96, avgCost: 980, performanceScore: 91 },
          { name: 'FDA', totalShipments: 45, avgClearanceTime: 58, successRate: 87, avgCost: 1580, performanceScore: 72 },
          { name: 'USDA', totalShipments: 23, avgClearanceTime: 48, successRate: 92, avgCost: 1320, performanceScore: 81 },
          { name: 'EPA', totalShipments: 7, avgClearanceTime: 72, successRate: 85, avgCost: 1890, performanceScore: 65 }
        ],
        priority: [
          { name: 'Urgent', totalShipments: 18, avgClearanceTime: 28, successRate: 98, avgCost: 1680, performanceScore: 89 },
          { name: 'High', totalShipments: 42, avgClearanceTime: 38, successRate: 95, avgCost: 1380, performanceScore: 86 },
          { name: 'Medium', totalShipments: 78, avgClearanceTime: 48, successRate: 93, avgCost: 1180, performanceScore: 82 },
          { name: 'Low', totalShipments: 26, avgClearanceTime: 65, successRate: 89, avgCost: 980, performanceScore: 75 }
        ]
      }
      return breakdowns[breakdownBy.value] || []
    })

    const topDelays = computed(() => [
      { reason: 'Missing Documentation', avgDelay: 18, frequency: 23 },
      { reason: 'OGA Permit Delays', avgDelay: 32, frequency: 18 },
      { reason: 'Customs Examination', avgDelay: 12, frequency: 15 },
      { reason: 'Payment Processing', avgDelay: 8, frequency: 12 }
    ])

    const improvements = computed(() => [
      { area: 'Document Preparation', potentialSavings: 12, impact: 'High' },
      { area: 'Pre-clearance Process', potentialSavings: 8, impact: 'Medium' },
      { area: 'Carrier Coordination', potentialSavings: 6, impact: 'Medium' },
      { area: 'Payment Automation', potentialSavings: 4, impact: 'Low' }
    ])

    // Methods
    const getBreakdownHeader = () => {
      const headers = {
        carrier: 'Carrier',
        origin: 'Origin Country',
        oga: 'OGA Office',
        priority: 'Priority Level'
      }
      return headers[breakdownBy.value] || 'Category'
    }

    const getTimeClass = (time) => {
      if (time <= 24) return 'excellent'
      if (time <= 48) return 'good'
      if (time <= 72) return 'average'
      return 'poor'
    }

    const getRateClass = (rate) => {
      if (rate >= 95) return 'excellent'
      if (rate >= 90) return 'good'
      if (rate >= 85) return 'average'
      return 'poor'
    }

    const getScoreClass = (score) => {
      if (score >= 85) return 'excellent'
      if (score >= 75) return 'good'
      if (score >= 65) return 'average'
      return 'poor'
    }

    const formatDate = (date) => {
      return format(new Date(date), 'MMM dd, HH:mm')
    }

    const dismissAlert = (alertId) => {
      const index = performanceAlerts.value.findIndex(a => a.id === alertId)
      if (index > -1) {
        performanceAlerts.value.splice(index, 1)
      }
    }

    const exportReport = () => {
      console.log('Exporting KPI report...')
    }

    const initializeCharts = () => {
      // Mock chart initialization - in real app, use Chart.js or similar
      console.log('Initializing charts...')
    }

    onMounted(() => {
      nextTick(() => {
        initializeCharts()
      })
    })

    return {
      timeRange,
      breakdownBy,
      clearanceChart,
      statusChart,
      timelineChart,
      performanceAlerts,
      avgClearanceTime,
      successRate,
      avgPermitTime,
      avgCost,
      clearanceTimeTrend,
      successRateTrend,
      permitTimeTrend,
      costTrend,
      avgLandingToCustoms,
      avgCustomsProcessing,
      avgReleaseToDelivery,
      performanceBreakdown,
      topDelays,
      improvements,
      getBreakdownHeader,
      getTimeClass,
      getRateClass,
      getScoreClass,
      formatDate,
      dismissAlert,
      exportReport
    }
  }
}
</script>

<style scoped>
.kpi-dashboard {
  padding: 0;
}

.description {
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Metrics Grid */
.metrics-grid {
  margin-bottom: 2rem;
  gap: 1rem;
}

.metric-card .card-content {
  padding: 1.5rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.metric-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.metric-trend {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.metric-trend.up {
  background: #fef3c7;
  color: #92400e;
}

.metric-trend.down {
  background: #dcfce7;
  color: #166534;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.metric-label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.metric-subtitle {
  font-size: 0.8rem;
  color: #64748b;
}

/* Charts */
.charts-row {
  margin-bottom: 2rem;
  gap: 1rem;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
}

/* Performance Breakdown */
.breakdown-filters {
  display: flex;
  gap: 1rem;
}

.breakdown-table {
  overflow-x: auto;
}

.breakdown-name {
  font-weight: 500;
}

.time-value,
.rate-value {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.time-value.excellent,
.rate-value.excellent {
  background: #dcfce7;
  color: #166534;
}

.time-value.good,
.rate-value.good {
  background: #dbeafe;
  color: #1d4ed8;
}

.time-value.average,
.rate-value.average {
  background: #fef3c7;
  color: #92400e;
}

.time-value.poor,
.rate-value.poor {
  background: #fecaca;
  color: #dc2626;
}

.performance-score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-bar {
  width: 60px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.score-fill.excellent {
  background: #10b981;
}

.score-fill.good {
  background: #3b82f6;
}

.score-fill.average {
  background: #f59e0b;
}

.score-fill.poor {
  background: #ef4444;
}

.score-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

/* Timeline Analysis */
.timeline-metrics {
  margin-bottom: 2rem;
  gap: 1rem;
}

.timeline-metric {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.timeline-metric .metric-icon {
  font-size: 2rem;
}

.timeline-metric .metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.timeline-metric .metric-label {
  font-size: 0.9rem;
  color: #64748b;
}

.timeline-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
}

/* Bottleneck Analysis */
.bottlenecks-grid {
  gap: 2rem;
}

.bottleneck-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.bottleneck-icon {
  font-size: 1.5rem;
}

.bottleneck-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.bottleneck-list,
.improvement-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delay-item,
.improvement-item {
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.delay-reason,
.improvement-area {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.delay-impact,
.improvement-potential {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delay-time,
.potential-savings {
  font-weight: 600;
  color: #dc2626;
}

.delay-frequency {
  font-size: 0.9rem;
  color: #64748b;
}

.potential-impact {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.potential-impact:contains('High') {
  background: #fecaca;
  color: #dc2626;
}

/* Alerts */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.alert-item.alert-warning {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.alert-item.alert-info {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.alert-item.alert-error {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.alert-icon {
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.alert-message {
  color: #374151;
  margin-bottom: 0.5rem;
}

.alert-time {
  font-size: 0.8rem;
  color: #64748b;
}

.alert-actions {
  margin-top: 0.25rem;
}

.no-alerts {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.no-alerts span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
  
  .bottlenecks-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .timeline-metrics {
    grid-template-columns: 1fr;
  }
  
  .delay-impact,
  .improvement-potential {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>