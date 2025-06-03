import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTransactionStore = defineStore('transaction', () => {
  // State
  const transactions = ref([
    {
      id: 1,
      awb: 'AWB-001-2024',
      hawb: 'HAWB-001-2024',
      description: 'Electronics Import - Smartphones',
      status: 'in-transit',
      priority: 'high',
      plannedLanding: '2024-01-15',
      actualLanding: null,
      customsClearance: null,
      release: null,
      shipper: 'Tech Corp Ltd',
      consignee: 'Electronics Retailer Inc',
      origin: 'Hong Kong',
      destination: 'Manila',
      weight: '500kg',
      value: '$50,000',
      createdAt: new Date('2024-01-10').toISOString()
    },
    {
      id: 2,
      awb: 'AWB-002-2024',
      hawb: 'HAWB-002-2024',
      description: 'Medical Supplies Import',
      status: 'customs',
      priority: 'urgent',
      plannedLanding: '2024-01-12',
      actualLanding: '2024-01-12',
      customsClearance: null,
      release: null,
      shipper: 'MedSupply Co',
      consignee: 'Hospital Network',
      origin: 'Singapore',
      destination: 'Cebu',
      weight: '200kg',
      value: '$25,000',
      createdAt: new Date('2024-01-08').toISOString()
    }
  ])

  const files = ref([
    {
      id: 1,
      name: 'AWB-001-2024-invoice.pdf',
      type: 'invoice',
      size: '2.5MB',
      uploadedAt: new Date('2024-01-10').toISOString(),
      transactionId: 1
    },
    {
      id: 2,
      name: 'AWB-001-2024-packing-list.pdf',
      type: 'packing-list',
      size: '1.2MB',
      uploadedAt: new Date('2024-01-10').toISOString(),
      transactionId: 1
    }
  ])

  const permits = ref([
    {
      id: 1,
      type: 'FDA',
      number: 'FDA-2024-001',
      status: 'approved',
      issuedDate: '2024-01-05',
      expiryDate: '2024-07-05',
      transactionId: 1
    },
    {
      id: 2,
      type: 'BOC',
      number: 'BOC-2024-002',
      status: 'pending',
      issuedDate: null,
      expiryDate: null,
      transactionId: 2
    }
  ])

  const logs = ref([
    {
      id: 1,
      type: 'transaction_created',
      message: 'Transaction AWB-001-2024 created',
      timestamp: new Date('2024-01-10T10:00:00').toISOString(),
      level: 'info'
    },
    {
      id: 2,
      type: 'file_uploaded',
      message: 'Invoice uploaded for AWB-001-2024',
      timestamp: new Date('2024-01-10T10:30:00').toISOString(),
      level: 'info'
    },
    {
      id: 3,
      type: 'permit_created',
      message: 'FDA permit application submitted for AWB-001-2024',
      timestamp: new Date('2024-01-10T11:00:00').toISOString(),
      level: 'info'
    }
  ])

  // Actions
  function addTransaction(transaction) {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    transactions.value.push(newTransaction)
    addLog('transaction_created', `Transaction ${newTransaction.awb} created`, 'info')
    return newTransaction
  }

  function updateTransaction(id, updates) {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transactions.value[index] = { ...transactions.value[index], ...updates }
      addLog('transaction_updated', `Transaction ${transactions.value[index].awb} updated`, 'info')
      return transactions.value[index]
    }
    return null
  }

  function deleteTransaction(id) {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index !== -1) {
      const transaction = transactions.value[index]
      transactions.value.splice(index, 1)
      addLog('transaction_deleted', `Transaction ${transaction.awb} deleted`, 'warning')
      return true
    }
    return false
  }

  function addFile(file) {
    const newFile = {
      ...file,
      id: Date.now(),
      uploadedAt: new Date().toISOString()
    }
    files.value.push(newFile)
    addLog('file_uploaded', `File ${newFile.name} uploaded`, 'info')
    return newFile
  }

  function deleteFile(id) {
    const index = files.value.findIndex(f => f.id === id)
    if (index !== -1) {
      const file = files.value[index]
      files.value.splice(index, 1)
      addLog('file_deleted', `File ${file.name} deleted`, 'warning')
      return true
    }
    return false
  }

  function addPermit(permit) {
    const newPermit = {
      ...permit,
      id: Date.now()
    }
    permits.value.push(newPermit)
    addLog('permit_created', `${newPermit.type} permit application submitted`, 'info')
    return newPermit
  }

  function updatePermit(id, updates) {
    const index = permits.value.findIndex(p => p.id === id)
    if (index !== -1) {
      permits.value[index] = { ...permits.value[index], ...updates }
      addLog('permit_updated', `${permits.value[index].type} permit updated`, 'info')
      return permits.value[index]
    }
    return null
  }

  function addLog(type, message, level = 'info') {
    const newLog = {
      id: Date.now(),
      type,
      message,
      level,
      timestamp: new Date().toISOString()
    }
    logs.value.push(newLog)
    return newLog
  }

  // Computed
  const activeTransactions = computed(() => {
    return transactions.value.filter(t => !['completed', 'cancelled'].includes(t.status))
  })

  const completedTransactions = computed(() => {
    return transactions.value.filter(t => t.status === 'completed')
  })

  const pendingPermits = computed(() => {
    return permits.value.filter(p => p.status === 'pending')
  })

  const recentLogs = computed(() => {
    return logs.value.slice(-10).reverse()
  })

  return {
    // State
    transactions,
    files,
    permits,
    logs,
    // Actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addFile,
    deleteFile,
    addPermit,
    updatePermit,
    addLog,
    // Computed
    activeTransactions,
    completedTransactions,
    pendingPermits,
    recentLogs
  }
})