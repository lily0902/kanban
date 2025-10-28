<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditing ? '編輯卡片' : '新增卡片' }}
        </h2>
        <button 
          class="close-btn"
          @click="$emit('cancel')"
          type="button"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="card-title" class="form-label">
            卡片標題 <span class="required">*</span>
          </label>
          <input
            id="card-title"
            ref="titleInput"
            v-model="formData.title"
            type="text"
            class="form-input"
            :class="{ 'error': errors.title }"
            placeholder="請輸入卡片標題..."
            maxlength="100"
            required
          />
          <div v-if="errors.title" class="error-message">
            {{ errors.title }}
          </div>
          <div class="input-info">
            {{ formData.title.length }}/100 字元
          </div>
        </div>

        <div class="form-group">
          <label for="card-description" class="form-label">
            卡片描述
          </label>
          <textarea
            id="card-description"
            v-model="formData.description"
            class="form-textarea"
            :class="{ 'error': errors.description }"
            placeholder="請輸入卡片描述（可選）..."
            rows="4"
            maxlength="500"
          ></textarea>
          <div v-if="errors.description" class="error-message">
            {{ errors.description }}
          </div>
          <div class="input-info">
            {{ formData.description.length }}/500 字元
          </div>
        </div>

        <div class="form-group">
          <label for="card-status" class="form-label">
            卡片狀態
          </label>
          <select
            id="card-status"
            v-model="formData.status"
            class="form-select"
            :class="{ 'error': errors.status }"
          >
            <option
              v-for="status in statusOptions"
              :key="status.value"
              :value="status.value"
            >
              {{ status.label }}
            </option>
          </select>
          <div v-if="errors.status" class="error-message">
            {{ errors.status }}
          </div>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('cancel')"
          >
            取消
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid || loading"
          >
            <span v-if="loading">儲存中...</span>
            <span v-else>{{ isEditing ? '更新' : '建立' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'

export default {
  name: 'CardModal',
  props: {
    card: {
      type: Object,
      default: null
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save', 'cancel'],
  setup(props, { emit }) {
    const titleInput = ref(null)
    const loading = ref(false)

    // 表單資料
    const formData = reactive({
      title: '',
      description: '',
      status: 'todo'
    })

    // 錯誤資訊
    const errors = reactive({
      title: '',
      description: '',
      status: ''
    })

    // 狀態選項
    const statusOptions = [
      { value: 'todo', label: '待處理' },
      { value: 'inProgress', label: '進行中' },
      { value: 'inReview', label: '待驗收' },
      { value: 'done', label: '已完成' }
    ]

    // 表單驗證
    const isFormValid = computed(() => {
      return formData.title.trim().length > 0 && 
             !errors.title && 
             !errors.description && 
             !errors.status
    })

    // 初始化表單資料
    const initFormData = () => {
      if (props.isEditing && props.card) {
        formData.title = props.card.title || ''
        formData.description = props.card.description || ''
        formData.status = props.card.status || 'todo'
      } else {
        formData.title = ''
        formData.description = ''
        formData.status = 'todo'
      }
      clearErrors()
    }

    // 清除錯誤資訊
    const clearErrors = () => {
      errors.title = ''
      errors.description = ''
      errors.status = ''
    }

    // 驗證表單
    const validateForm = () => {
      clearErrors()
      let isValid = true

      // 驗證標題
      if (!formData.title.trim()) {
        errors.title = '卡片標題不能為空'
        isValid = false
      } else if (formData.title.trim().length > 100) {
        errors.title = '卡片標題不能超過100個字元'
        isValid = false
      }

      // 驗證描述
      if (formData.description.length > 500) {
        errors.description = '卡片描述不能超過500個字元'
        isValid = false
      }

      // 驗證狀態
      const validStatuses = statusOptions.map(s => s.value)
      if (!validStatuses.includes(formData.status)) {
        errors.status = '請選擇有效的卡片狀態'
        isValid = false
      }

      return isValid
    }

    // 處理表單提交
    const handleSubmit = async () => {
      if (!validateForm()) {
        return
      }

      try {
        loading.value = true

        const cardData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          status: formData.status
        }

        emit('save', cardData)
      } catch (error) {
        console.error('儲存卡片失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 處理點擊遮罩層
    const handleOverlayClick = (event) => {
      if (event.target === event.currentTarget) {
        emit('cancel')
      }
    }

    // 元件掛載時初始化
    onMounted(async () => {
      initFormData()
      
      // 聚焦到標題輸入框
      await nextTick()
      if (titleInput.value) {
        titleInput.value.focus()
        if (props.isEditing && formData.title) {
          titleInput.value.select()
        }
      }
    })

    return {
      titleInput,
      loading,
      formData,
      errors,
      statusOptions,
      isFormValid,
      handleSubmit,
      handleOverlayClick
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #718096;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2d3748;
}

.modal-form {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
  font-size: 0.875rem;
}

.required {
  color: #e53e3e;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  font-family: inherit;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: #e53e3e;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
}

.form-select {
  cursor: pointer;
}

.error-message {
  margin-top: 0.5rem;
  color: #e53e3e;
  font-size: 0.75rem;
  font-weight: 500;
}

.input-info {
  margin-top: 0.25rem;
  color: #718096;
  font-size: 0.75rem;
  text-align: right;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  min-width: 80px;
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  color: #4a5568;
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 動畫 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-header {
    padding: 1rem 1rem 0.75rem;
  }

  .modal-title {
    font-size: 1.1rem;
  }

  .modal-form {
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
  }
}

/* 鍵盤導航支援 */
.form-input:focus,
.form-textarea:focus,
.form-select:focus,
.btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>