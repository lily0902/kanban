<template>
  <div class="kanban-app">
    <header class="app-header">
      <h1 class="app-title">📋 Kanban 看板系統</h1>
      <div class="header-actions">
        <button 
          class="btn btn-primary"
          @click="showNewCardModal = true"
        >
          ➕ 新增卡片
        </button>
        <button 
          class="btn btn-secondary"
          @click="refreshCards"
          :disabled="loading"
        >
          🔄 重新整理
        </button>
      </div>
    </header>

    <main class="kanban-board">
      <div class="board-columns">
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :column="column"
          :cards="getCardsByStatus(column.id)"
          :loading="loading"
          @card-moved="handleCardMoved"
          @edit-card="handleEditCard"
          @delete-card="handleDeleteCard"
        />
      </div>
    </main>

    <!-- 新增/编辑卡片模态框 -->
    <CardModal
      v-if="showNewCardModal || showEditCardModal"
      :card="editingCard"
      :is-editing="showEditCardModal"
      @save="handleSaveCard"
      @cancel="handleCancelEdit"
    />

    <!-- 載入提示 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>
    </div>

    <!-- 通知提示 -->
    <div 
      v-if="notification.show" 
      :class="['notification', notification.type]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import KanbanColumn from './components/KanbanColumn.vue'
import CardModal from './components/CardModal.vue'
import { cardService } from './services/cardService.js'

export default {
  name: 'App',
  components: {
    KanbanColumn,
    CardModal
  },
  setup() {
    // 响应式数据
    const cards = ref([])
    const loading = ref(false)
    const showNewCardModal = ref(false)
    const showEditCardModal = ref(false)
    const editingCard = ref(null)
    
    const notification = reactive({
      show: false,
      message: '',
      type: 'success'
    })

    // 看板列定義
    const columns = [
      { id: 'todo', title: '待處理', color: '#6c757d' },
      { id: 'inProgress', title: '進行中', color: '#007bff' },
      { id: 'inReview', title: '待驗收', color: '#ffc107' },
      { id: 'done', title: '已完成', color: '#28a745' }
    ]

    // 显示通知
    const showNotification = (message, type = 'success') => {
      notification.message = message
      notification.type = type
      notification.show = true
      
      setTimeout(() => {
        notification.show = false
      }, 3000)
    }

    // 根据状态获取卡片
    const getCardsByStatus = (status) => {
      return cards.value.filter(card => card.status === status)
    }

    // 加载所有卡片
    const loadCards = async () => {
      try {
        loading.value = true
        const response = await cardService.getAllCards()
        cards.value = response.data.cards
      } catch (error) {
        console.error('加载卡片失败:', error)
        showNotification('載入卡片失敗，請稍後重試', 'error')
      } finally {
        loading.value = false
      }
    }

    // 刷新卡片
    const refreshCards = () => {
      loadCards()
    }

    // 处理卡片移动
    const handleCardMoved = async (cardId, newStatus) => {
      console.log('處理卡片移動 - ID:', cardId, '新狀態:', newStatus)
      
      // 找到要移動的卡片
      const card = cards.value.find(c => c.id === cardId)
      if (!card) {
        console.error('找不到卡片:', cardId)
        showNotification('找不到要移動的卡片', 'error')
        return
      }
      
      const oldStatus = card.status
      console.log('卡片原始狀態:', oldStatus, '→ 新狀態:', newStatus)
      
      // 樂觀更新：先更新 UI
      card.status = newStatus
      card.updatedAt = new Date().toISOString()
      
      try {
        // 發送後端更新請求
        const response = await cardService.updateCard(cardId, { status: newStatus })
        console.log('後端更新成功:', response)
        
        // 更新完整的卡片數據
        const updatedCard = response.data
        const cardIndex = cards.value.findIndex(c => c.id === cardId)
        if (cardIndex !== -1) {
          cards.value[cardIndex] = updatedCard
        }
        
        showNotification(`卡片已移至「${getStatusLabel(newStatus)}」`)
      } catch (error) {
        console.error('更新卡片状态失败:', error)
        showNotification('更新卡片狀態失敗，請稍後重試', 'error')
        
        // 恢復原始狀態
        card.status = oldStatus
        
        // 重新載入以確保數據一致
        await loadCards()
      }
    }
    
    // 獲取狀態標籤
    const getStatusLabel = (status) => {
      const labels = {
        todo: '待處理',
        inProgress: '進行中',
        inReview: '待驗收',
        done: '已完成'
      }
      return labels[status] || status
    }

    // 处理编辑卡片
    const handleEditCard = (card) => {
      editingCard.value = { ...card }
      showEditCardModal.value = true
    }

    // 处理删除卡片
    const handleDeleteCard = async (cardId) => {
      if (!confirm('確定要刪除這張卡片嗎？')) {
        return
      }

      try {
        await cardService.deleteCard(cardId)
        cards.value = cards.value.filter(c => c.id !== cardId)
        showNotification('卡片刪除成功')
      } catch (error) {
        console.error('删除卡片失败:', error)
        showNotification('刪除卡片失敗，請稍後重試', 'error')
      }
    }

    // 处理保存卡片
    const handleSaveCard = async (cardData) => {
      try {
        if (showEditCardModal.value) {
          // 更新卡片
          const response = await cardService.updateCard(editingCard.value.id, cardData)
          const updatedCard = response.data
          
          const index = cards.value.findIndex(c => c.id === updatedCard.id)
          if (index !== -1) {
            cards.value[index] = updatedCard
          }
          
          showNotification('卡片更新成功')
        } else {
          // 建立新卡片
          const response = await cardService.createCard(cardData)
          const newCard = response.data
          cards.value.push(newCard)
          showNotification('卡片建立成功')
        }
        
        handleCancelEdit()
      } catch (error) {
        console.error('保存卡片失败:', error)
        showNotification('保存卡片失敗，請稍後重試', 'error')
      }
    }

    // 取消编辑
    const handleCancelEdit = () => {
      showNewCardModal.value = false
      showEditCardModal.value = false
      editingCard.value = null
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadCards()
    })

    return {
      cards,
      loading,
      columns,
      showNewCardModal,
      showEditCardModal,
      editingCard,
      notification,
      getCardsByStatus,
      getStatusLabel,
      refreshCards,
      handleCardMoved,
      handleEditCard,
      handleDeleteCard,
      handleSaveCard,
      handleCancelEdit
    }
  }
}
</script>

<style scoped>
.kanban-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', 'Microsoft YaHei', sans-serif;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.kanban-board {
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #28a745;
}

.notification.error {
  background: #dc3545;
}

.notification.warning {
  background: #ffc107;
  color: #212529;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .kanban-board {
    padding: 1rem;
  }
  
  .board-columns {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>