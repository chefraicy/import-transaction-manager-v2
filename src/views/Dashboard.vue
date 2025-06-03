<template>
  <div class="dashboard fade-in">
    <!-- Welcome Section -->
    <div class="welcome-section card">
      <div class="card-header">
        <h1 class="card-title">
          <span class="nav-icon">🏠</span>
          Welcome to Import Transaction Manager
        </h1>
        <div class="current-time">{{ currentTime }}</div>
      </div>
      <div class="card-content">
        <p class="welcome-text">
          Your comprehensive solution for managing import transactions, permits, and documentation. 
          Track your shipments from planned landing to customs clearance release.
        </p>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-section">
      <div class="grid grid-4">
        <div class="kpi-card card">
          <div class="card-content">
            <div class="kpi-header">
              <span class="kpi-icon">📦</span>
              <h3>Active Transactions</h3>
            </div>
            <div class="kpi-value">{{ activeTransactions.length }}</div>
            <div class="kpi-trend positive">+12% from last month</div>
          </div>
        </div>
        
        <div class="kpi-card card">
          <div class="card-content">
            <div class="kpi-header">
              <span class="kpi-icon">⏱️</span>
              <h3>Avg. Clearance Time</h3>
            </div>
            <div class="kpi-value">{{ averageClearanceTime }}h</div>
            <div class="kpi-trend negative">+5% from last month</div>
          </div>
        </div>
        
        <div class="kpi-card card">
          <div class="card-content">
            <div class="kpi-header">
              <span class="kpi-icon">📄</span>
              <h3>Pending Permits</h3>
            </div>
            <div class="kpi-value">{{ pendingPermits.length }}</div>
            <div class="kpi-trend neutral">No change</div>
          </div>
        </div>
        
        <div class="kpi-card card">
          <div class="card-content">
            <div class="kpi-header">
              <span class="kpi-icon">✅</span>
              <h3>Success Rate</h3>
            </div>
            <div class="kpi-value">{{ successRate }}%</div>
            <div class="kpi-trend positive">+3% from last month</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="nav-icon">⚡</span>
          Quick Actions
        </h2>
      </div>
      <div class="card-content">
        <div class="actions-grid grid grid-3">
          <router-link to="/transactions" class="action-btn btn btn-primary">
            <span>📋</span>
            <div>
              <h4>New Transaction</h4>
              <p>Create a new import transaction</p>
            </div>
          </router-link>
          
          <router-link to="/file-manager" class="action-btn btn btn-secondary">
            <span>📁</span>
            <div>
              <h4>Upload Documents</h4>
              <p>Add supporting documentation</p>
            </div>
          </router-link>
          
          <router-link to="/permits" class="action-btn btn btn-success">
            <span>📄</span>
            <div>
              <h4>Submit Permit</h4>
              <p>Apply for import permits</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="nav-icon">📝</span>
          Recent Activity
        </h2>
        <router-link to="/logs" class="btn btn-sm btn-secondary">View All</router-link>
      </div>
      <div class="card-content">
        <div class="activity-list">
          <div 
            v-for="log in recentLogs" 
            :key="log.id"
            class="activity-item"
          >
            <div class="activity-icon">{{ getActivityIcon(log.type) }}</div>
            <div class="activity-content">
              <div class="activity-message">{{ log.message }}</div>
              <div class="activity-time">{{ formatTime(log.timestamp) }}</div>
            </div>
          </div>
          
          <div v-if="recentLogs.length === 0" class="no-activity">
            <span class="nav-icon">📭</span>
            <p>No recent activity</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Urgent Items -->
    <div class="urgent-items card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="nav-icon">🚨</span>
          Urgent Items
        </h2>
      </div>
      <div class="card-content">
        <div class="urgent-list">
          <div 
            v-for="item in urgentItems" 
            :key="item.id"
            class="urgent-item"
          >
            <div class="urgent-priority">
              <span class="priority priority-high">{{ item.priority }}</span>
            </div>
            <div class="urgent-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.description }}</p>
              <div class="urgent-deadline">Due: {{ formatDate(item.deadline) }}</div>
            </div>
            <div class="urgent-actions">
              <button class="btn btn-sm btn-primary">Action</button>
            </div>
          </div>
          
          <div v-if="urgentItems.length === 0" class="no-urgent">
            <span class="nav-icon">✅</span>
            <p>No urgent items - you're all caught up!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTransactionStore } from '../stores'
import { format } from 'date-fns'

export default {
  name: 'Dashboard',
  setup() {
    const store = useTransactionStore()
    const currentTime = ref('')
    let timeInterval = null

    const updateTime = () => {
      currentTime.value = format(new Date(), 'PPpp')
    }

    const averageClearanceTime = computed(() => {
      // Mock calculation - in real app, calculate from actual data
      return Math.floor(Math.random() * 48) + 24
    })

    const successRate = computed(() => {
      const total = store.transactions.length
      if (total === 0) return 100
      const completed = store.completedTransactions.length
      return Math.round((completed / total) * 100)
    })

    const recentLogs = computed(() => {
      return store.logs.slice(-5).reverse()
    })

    const urgentItems = computed(() => {
      // Mock urgent items - in real app, filter from actual data
      return [
        {
          id: 1,
          title: 'FDA Permit Expiring',
          description: 'FDA import permit for AWB-12345 expires in 2 days',
          priority: 'High',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 2,
          title: 'Customs Clearance Delayed',
          description: 'HAWB-67890 stuck in customs for 3 days',
          priority: 'High',
          deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        }
      ]
    })

    const getActivityIcon = (type) => {
      const icons = {
        transaction_created: '📦',
        transaction_updated: '🔄',
        transaction_deleted: '🗑️',
        file_uploaded: '📁',
        file_deleted: '🗑️',
        permit_created: '📄',
        permit_updated: '✏️'
      }
      return icons[type] || '📝'
    }

    const formatTime = (timestamp) => {
      return format(new Date(timestamp), 'MMM dd, HH:mm')
    }

    const formatDate = (date) => {
      return format(new Date(date), 'MMM dd, yyyy')
    }

    onMounted(() => {
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      currentTime,
      activeTransactions: store.activeTransactions,
      pendingPermits: store.pendingPermits,
      averageClearanceTime,
      successRate,
      recentLogs,
      urgentItems,
      getActivityIcon,
      formatTime,
      formatDate
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-text {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.6;
}

.current-time {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.kpi-section {
  margin-bottom: 2rem;
}

.kpi-card {
  transition: transform 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.kpi-icon {
  font-size: 2rem;
}

.kpi-header h3 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.kpi-trend {
  font-size: 0.8rem;
  font-weight: 500;
}

.kpi-trend.positive {
  color: #059669;
}

.kpi-trend.negative {
  color: #dc2626;
}

.kpi-trend.neutral {
  color: #64748b;
}

.actions-grid {
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  text-align: left;
  width: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.action-btn span {
  font-size: 2rem;
  flex-shrink: 0;
}

.action-btn h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.action-btn p {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
}

.activity-list,
.urgent-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-message {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #64748b;
}

.urgent-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.urgent-priority {
  flex-shrink: 0;
}

.urgent-content {
  flex: 1;
}

.urgent-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.urgent-content p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #64748b;
}

.urgent-deadline {
  font-size: 0.8rem;
  color: #dc2626;
  font-weight: 500;
}

.urgent-actions {
  flex-shrink: 0;
}

.no-activity,
.no-urgent {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.no-activity span,
.no-urgent span {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .action-btn {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .urgent-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>