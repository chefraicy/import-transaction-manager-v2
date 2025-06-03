<template>
  <div class="file-manager fade-in">
    <!-- Header -->
    <div class="file-manager-header card">
      <div class="card-header">
        <h1 class="card-title">
          <span class="nav-icon">📁</span>
          File Manager
        </h1>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            :class="{ loading: isUploading }"
            :disabled="isUploading"
            @click="triggerFileUpload"
          >
            <span>📤</span> {{ isUploading ? 'Uploading...' : 'Upload Files' }}
          </button>
          <button 
            class="btn btn-secondary" 
            :class="{ loading: isDownloading }"
            :disabled="selectedFiles.length === 0 || isDownloading"
            @click="downloadSelected"
          >
            <span>📥</span> {{ isDownloading ? 'Downloading...' : 'Download Selected' }}
          </button>
        </div>
      </div>
      <div class="card-content">
        <p class="description">
          Upload, manage, and process documents. Supports PDF, XLS, CSV, PNG, DOCX and more with OCR capabilities.
        </p>
      </div>
    </div>

    <!-- File Upload Area -->
    <div class="upload-area card">
      <div class="card-content">
        <div 
          class="dropzone" 
          :class="{ 'dragover': isDragOver }"
          @drop="handleDrop"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @click="triggerFileUpload"
        >
          <input 
            ref="fileInput" 
            type="file" 
            multiple 
            accept=".pdf,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.docx,.doc,.txt"
            @change="handleFileSelect"
            style="display: none;"
          >
          <div class="dropzone-content">
            <span class="upload-icon">📁</span>
            <h3>Drop files here or click to upload</h3>
            <p>Supports: PDF, XLS, XLSX, CSV, PNG, JPG, DOCX, DOC, TXT</p>
            <div class="upload-features">
              <div class="feature">
                <span>🔍</span> OCR Text Recognition
              </div>
              <div class="feature">
                <span>📊</span> Data Extraction
              </div>
              <div class="feature">
                <span>🏷️</span> Auto Classification
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Files Grid -->
    <div class="files-grid card">
      <div class="card-header">
        <h2 class="card-title">
          <span class="nav-icon">📄</span>
          Files ({{ files.length }})
        </h2>
      </div>
      <div class="card-content">
        <div class="files-grid-view">
          <div 
            v-for="file in files" 
            :key="file.id" 
            class="file-card"
          >
            <div class="file-preview">
              <span class="file-icon large">{{ getFileIcon(file.type) }}</span>
            </div>
            <div class="file-info">
              <div class="file-name" :title="file.name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="files.length === 0" class="no-files">
            <span class="nav-icon">📭</span>
            <h3>No files uploaded</h3>
            <p>Upload your first document to get started.</p>
            <button class="btn btn-primary" @click="triggerFileUpload">
              <span>📤</span> Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useTransactionStore } from '../stores'

export default {
  name: 'FileManager',
  setup() {
    const store = useTransactionStore()
    const fileInput = ref(null)
    const isDragOver = ref(false)
    const isUploading = ref(false)
    const isDownloading = ref(false)
    const selectedFiles = ref([])
    
    const files = computed(() => store.files)
    
    const getFileIcon = (type) => {
      const icons = {
        'pdf': '📄',
        'excel': '📊',
        'csv': '📈',
        'image': '🖼️',
        'document': '📝',
        'text': '📄'
      }
      return icons[type] || '📄'
    }
    
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const triggerFileUpload = () => {
      fileInput.value?.click()
    }
    
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      uploadFiles(files)
    }
    
    const handleDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      const files = Array.from(event.dataTransfer.files)
      uploadFiles(files)
    }
    
    const uploadFiles = async (fileList) => {
      isUploading.value = true
      
      try {
        for (const file of fileList) {
          const fileData = {
            name: file.name,
            size: file.size,
            type: getFileType(file.name),
            uploadDate: new Date(),
            category: 'other'
          }
          store.addFile(fileData)
        }
        alert(`${fileList.length} file(s) uploaded successfully!`)
      } catch (error) {
        console.error('Upload error:', error)
        alert('Error uploading files. Please try again.')
      } finally {
        isUploading.value = false
      }
    }
    
    const getFileType = (filename) => {
      const ext = filename.split('.').pop()?.toLowerCase()
      if (['pdf'].includes(ext)) return 'pdf'
      if (['xls', 'xlsx'].includes(ext)) return 'excel'
      if (['csv'].includes(ext)) return 'csv'
      if (['png', 'jpg', 'jpeg'].includes(ext)) return 'image'
      if (['doc', 'docx'].includes(ext)) return 'document'
      return 'text'
    }
    
    const downloadSelected = async () => {
      isDownloading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert('Files downloaded successfully!')
      } catch (error) {
        alert('Error downloading files.')
      } finally {
        isDownloading.value = false
      }
    }
    
    return {
      fileInput,
      isDragOver,
      isUploading,
      isDownloading,
      selectedFiles,
      files,
      getFileIcon,
      formatFileSize,
      triggerFileUpload,
      handleFileSelect,
      handleDrop,
      downloadSelected
    }
  }
}
</script>

<style scoped>
.file-manager {
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

.dropzone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone:hover,
.dropzone.dragover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.dropzone-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.dropzone h3 {
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.dropzone p {
  color: #64748b;
  margin-bottom: 2rem;
}

.upload-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.files-grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.file-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.file-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.file-preview {
  margin-bottom: 1rem;
}

.file-icon.large {
  font-size: 3rem;
}

.file-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #64748b;
}

.no-files {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.no-files span {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.no-files h3 {
  margin-bottom: 0.5rem;
  color: #1e293b;
}

.no-files p {
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .upload-features {
    flex-direction: column;
    gap: 1rem;
  }
  
  .files-grid-view {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>