<template>
  <div class="transactions fade-in">
    <!-- Header -->
    <div class="transactions-header card">
      <div class="card-header">
        <h1 class="card-title">
          <span class="nav-icon">📋</span>
          Import Transactions
        </h1>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            :class="{ loading: isSubmitting }"
            :disabled="isSubmitting"
            @click="showCreateModal = true"
          >
            <span>➕</span> New Transaction
          </button>
          <button 
            class="btn btn-secondary" 
            :class="{ loading: isLoading }"
            :disabled="isLoading"
            @click="exportTransactions"
          >
            <span>📊</span> Export
          </button>
        </div>
      </div>
      <div class="card-content">
        <p class="description">
          Manage your import transactions from planned landing to customs clearance release.
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters card">
      <div class="card-content">
        <div class="filter-grid grid grid-4">
          <div class="form-group">
            <label class="form-label">Search</label>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-input" 
              placeholder="AWB, HAWB, or description..."
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">Status</label>
            <select v-model="statusFilter" class="form-select">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="customs">At Customs</option>
              <option value="cleared">Cleared</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Priority</label>
            <select v-model="priorityFilter" class="form-select">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">Date Range</label>
            <select v-model="dateFilter" class="form-select">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="transactions-table card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="nav-icon">📦</span>
          Active Transactions ({{ filteredTransactions.length }})
        </h2>
        <div class="table-actions">
          <button 
            class="btn btn-sm btn-secondary" 
            :class="{ loading: isLoading }"
            :disabled="isLoading"
            @click="refreshTransactions"
          >
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>
      <div class="card-content">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>AWB/HAWB</th>
                <th>Description</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Planned Landing</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                <td>
                  <div class="transaction-id">
                    <strong>{{ transaction.awb || transaction.hawb }}</strong>
                    <div class="transaction-type">{{ transaction.type }}</div>
                  </div>
                </td>
                <td>
                  <div class="transaction-description">
                    {{ transaction.description }}
                  </div>
                </td>
                <td>{{ transaction.origin }}</td>
                <td>{{ transaction.destination }}</td>
                <td>
                  <div class="planned-landing">
                    {{ formatDate(transaction.plannedLanding) }}
                    <div class="landing-time">{{ formatTime(transaction.plannedLanding) }}</div>
                  </div>
                </td>
                <td>
                  <span class="status" :class="`status-${transaction.status}`">
                    {{ getStatusText(transaction.status) }}
                  </span>
                </td>
                <td>
                  <span class="priority" :class="`priority-${transaction.priority}`">
                    {{ transaction.priority }}
                  </span>
                </td>
                <td>
                  <div class="progress-container">
                    <div class="progress">
                      <div 
                        class="progress-bar" 
                        :style="{ width: transaction.progress + '%' }"
                      ></div>
                    </div>
                    <span class="progress-text">{{ transaction.progress }}%</span>
                  </div>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn btn-sm btn-primary" 
                      @click="viewTransaction(transaction)"
                    >
                      View
                    </button>
                    <button 
                      class="btn btn-sm btn-secondary" 
                      @click="editTransaction(transaction)"
                    >
                      Edit
                    </button>
                    <button 
                      class="btn btn-sm btn-danger" 
                      @click="deleteTransaction(transaction)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="filteredTransactions.length === 0" class="no-transactions">
            <span class="nav-icon">📭</span>
            <h3>No transactions found</h3>
            <p>Create your first import transaction to get started.</p>
            <button class="btn btn-primary" @click="showCreateModal = true">
              <span>➕</span> Create Transaction
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? 'Create New Transaction' : 'Edit Transaction' }}</h3>
          <button class="modal-close" @click="closeModals">×</button>
        </div>
        <div class="modal-content">
          <form @submit.prevent="saveTransaction">
            <div class="form-grid grid grid-2">
              <div class="form-group">
                <label class="form-label">AWB Number</label>
                <input 
                  v-model="transactionForm.awb" 
                  type="text" 
                  class="form-input" 
                  placeholder="Air Waybill Number"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">HAWB Number</label>
                <input 
                  v-model="transactionForm.hawb" 
                  type="text" 
                  class="form-input" 
                  placeholder="House Air Waybill Number"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">Type</label>
                <select v-model="transactionForm.type" class="form-select">
                  <option value="air-freight">Air Freight</option>
                  <option value="ocean-freight">Ocean Freight</option>
                  <option value="express">Express</option>
                  <option value="courier">Courier</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select v-model="transactionForm.priority" class="form-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">Origin</label>
                <input 
                  v-model="transactionForm.origin" 
                  type="text" 
                  class="form-input" 
                  placeholder="Origin country/city"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">Destination</label>
                <input 
                  v-model="transactionForm.destination" 
                  type="text" 
                  class="form-input" 
                  placeholder="Destination country/city"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">Planned Landing Date</label>
                <input 
                  v-model="transactionForm.plannedLanding" 
                  type="datetime-local" 
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label class="form-label">Carrier</label>
                <input 
                  v-model="transactionForm.carrier" 
                  type="text" 
                  class="form-input" 
                  placeholder="Airline/Shipping company"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea 
                v-model="transactionForm.description" 
                class="form-textarea" 
                placeholder="Transaction description, cargo details, etc."
              ></textarea>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModals">
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                :class="{ loading: isSubmitting }"
                :disabled="isSubmitting"
              >
                {{ showCreateModal ? 'Create Transaction' : 'Update Transaction' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTransactionStore } from '../stores'
import { format } from 'date-fns'

export default {
  name: 'Transactions',
  setup() {
    const store = useTransactionStore()
    
    // Reactive data
    const searchQuery = ref('')
    const statusFilter = ref('all')
    const priorityFilter = ref('all')
    const dateFilter = ref('all')
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const editingTransaction = ref(null)
    
    const transactionForm = ref({
      awb: '',
      hawb: '',
      type: 'air-freight',
      priority: 'medium',
      origin: '',
      destination: '',
      plannedLanding: '',
      carrier: '',
      description: '',
      status: 'pending',
      progress: 0
    })

    // Computed properties
    const filteredTransactions = computed(() => {
      let filtered = store.transactions
      
      // Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(t => 
          (t.awb && t.awb.toLowerCase().includes(query)) ||
          (t.hawb && t.hawb.toLowerCase().includes(query)) ||
          (t.description && t.description.toLowerCase().includes(query))
        )
      }
      
      // Status filter
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(t => t.status === statusFilter.value)
      }
      
      // Priority filter
      if (priorityFilter.value !== 'all') {
        filtered = filtered.filter(t => t.priority === priorityFilter.value)
      }
      
      return filtered
    })

    // Methods
    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'Pending',
        'in-transit': 'In Transit',
        'customs': 'At Customs',
        'cleared': 'Cleared',
        'completed': 'Completed',
        'cancelled': 'Cancelled'
      }
      return statusMap[status] || status
    }

    const formatDate = (date) => {
      return format(new Date(date), 'MMM dd, yyyy')
    }

    const formatTime = (date) => {
      return format(new Date(date), 'HH:mm')
    }

    const isLoading = ref(false)
    const isSubmitting = ref(false)

    const viewTransaction = (transaction) => {
      try {
        console.log('Viewing transaction:', transaction)
        alert(`Viewing transaction: ${transaction.awb || transaction.hawb}`)
      } catch (error) {
        console.error('Error viewing transaction:', error)
        alert('Error viewing transaction. Please try again.')
      }
    }

    const editTransaction = (transaction) => {
      try {
        editingTransaction.value = transaction
        transactionForm.value = { ...transaction }
        showEditModal.value = true
      } catch (error) {
        console.error('Error editing transaction:', error)
        alert('Error opening edit form. Please try again.')
      }
    }

    const deleteTransaction = (transaction) => {
      try {
        const confirmed = confirm(`Are you sure you want to delete transaction ${transaction.awb || transaction.hawb}?`)
        if (confirmed) {
          store.deleteTransaction(transaction.id)
          alert('Transaction deleted successfully!')
        }
      } catch (error) {
        console.error('Error deleting transaction:', error)
        alert('Error deleting transaction. Please try again.')
      }
    }

    const saveTransaction = async () => {
      try {
        isSubmitting.value = true
        
        // Validate form
        if (!transactionForm.value.awb && !transactionForm.value.hawb) {
          alert('Please enter either AWB or HAWB number')
          return
        }
        
        if (!transactionForm.value.origin || !transactionForm.value.destination) {
          alert('Please enter both origin and destination')
          return
        }

        if (showCreateModal.value) {
          store.addTransaction(transactionForm.value)
          alert('Transaction created successfully!')
        } else if (showEditModal.value) {
          store.updateTransaction(editingTransaction.value.id, transactionForm.value)
          alert('Transaction updated successfully!')
        }
        
        closeModals()
      } catch (error) {
        console.error('Error saving transaction:', error)
        alert('Error saving transaction. Please try again.')
      } finally {
        isSubmitting.value = false
      }
    }

    const closeModals = () => {
      showCreateModal.value = false
      showEditModal.value = false
      editingTransaction.value = null
      resetForm()
    }

    const resetForm = () => {
      transactionForm.value = {
        awb: '',
        hawb: '',
        type: 'air-freight',
        priority: 'medium',
        origin: '',
        destination: '',
        plannedLanding: '',
        carrier: '',
        description: '',
        status: 'pending',
        progress: 0
      }
    }

    const refreshTransactions = async () => {
      try {
        isLoading.value = true
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Transactions refreshed')
        alert('Transactions refreshed successfully!')
      } catch (error) {
        console.error('Error refreshing transactions:', error)
        alert('Error refreshing transactions. Please try again.')
      } finally {
        isLoading.value = false
      }
    }

    const exportTransactions = async () => {
      try {
        isLoading.value = true
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('Exporting transactions...')
        alert('Transactions exported successfully!')
      } catch (error) {
        console.error('Error exporting transactions:', error)
        alert('Error exporting transactions. Please try again.')
      } finally {
        isLoading.value = false
      }
    }

    // Initialize with sample data
    onMounted(() => {
      if (store.transactions.length === 0) {
        // Add sample transactions
        const sampleTransactions = [
          {
            awb: 'AWB-2024-001',
            hawb: 'HAWB-001',
            type: 'air-freight',
            priority: 'high',
            origin: 'Shanghai, China',
            destination: 'Los Angeles, USA',
            plannedLanding: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            carrier: 'China Airlines',
            description: 'Electronic components for manufacturing',
            status: 'in-transit',
            progress: 65
          },
          {
            awb: 'AWB-2024-002',
            hawb: 'HAWB-002',
            type: 'ocean-freight',
            priority: 'medium',
            origin: 'Hamburg, Germany',
            destination: 'New York, USA',
            plannedLanding: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            carrier: 'Maersk Line',
            description: 'Automotive parts shipment',
            status: 'customs',
            progress: 80
          }
        ]
        
        sampleTransactions.forEach(transaction => {
          store.addTransaction(transaction)
        })
      }
    })

    return {
      searchQuery,
      statusFilter,
      priorityFilter,
      dateFilter,
      showCreateModal,
      showEditModal,
      editingTransaction,
      transactionForm,
      filteredTransactions,
      isLoading,
      isSubmitting,
      getStatusText,
      formatDate,
      formatTime,
      viewTransaction,
      editTransaction,
      deleteTransaction,
      saveTransaction,
      closeModals,
      resetForm,
      refreshTransactions,
      exportTransactions
    }
  }
}
</script>

<style scoped>
.transactions {
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
}

.filter-grid {
  gap: 1rem;
}

.table-container {
  overflow-x: auto;
}

.table {
  min-width: 1000px;
}

.transaction-id {
  font-weight: 600;
}

.transaction-type {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: capitalize;
}

.transaction-description {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.planned-landing {
  font-weight: 500;
}

.landing-time {
  font-size: 0.8rem;
  color: #64748b;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress {
  width: 60px;
}

.progress-text {
  font-size: 0.8rem;
  color: #64748b;
  min-width: 35px;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.no-transactions {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.no-transactions span {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.no-transactions h3 {
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.no-transactions p {
  margin-bottom: 2rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1e293b;
}

.modal-content {
  padding: 1.5rem;
}

.form-grid {
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>