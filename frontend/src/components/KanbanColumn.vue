<template>
  <div class="kanban-column">
    <div class="column-header">
      <div class="column-title">
        <span 
          class="status-indicator" 
          :style="{ backgroundColor: column.color }"
        ></span>
        <h3>{{ column.title }}</h3>
        <span class="card-count">{{ cards.length }}</span>
      </div>
    </div>

    <div 
      class="column-body"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      :data-status="column.id"
    >
      <div v-if="loading && cards.length === 0" class="loading-placeholder">
        <div class="placeholder-spinner"></div>
        <p>載入中...</p>
      </div>

      <div v-else-if="cards.length === 0" class="empty-placeholder">
        <div class="empty-icon">📝</div>
        <p>暫無卡片</p>
        <small>拖曳卡片到此處或點擊上方新增按鈕</small>
      </div>

      <transition-group 
        name="card-list" 
        tag="div" 
        class="cards-container"
      >
        <KanbanCard
          v-for="card in cards"
          :key="card.id"
          :card="card"
          @edit="$emit('edit-card', card)"
          @delete="$emit('delete-card', card.id)"
          @drag-start="handleDragStart"
          @drag-end="handleDragEnd"
        />
      </transition-group>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import KanbanCard from './KanbanCard.vue'

export default {
  name: 'KanbanColumn',
  components: {
    KanbanCard
  },
  props: {
    column: {
      type: Object,
      required: true
    },
    cards: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['card-moved', 'edit-card', 'delete-card'],
  setup(props, { emit }) {
    const isDragOver = ref(false)
    const dragCounter = ref(0)

    // 处理拖拽开始
    const handleDragStart = (card, event) => {
      console.log('開始拖拽卡片:', card.title, '狀態:', card.status)
      // 不再需要存儲 draggedCard，因為會通過 event 傳遞
    }

    // 处理拖拽结束
    const handleDragEnd = () => {
      console.log('拖拽結束')
      isDragOver.value = false
      dragCounter.value = 0
    }

    // 处理拖拽悬停
    const handleDragOver = (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }

    // 处理拖拽进入
    const handleDragEnter = (event) => {
      event.preventDefault()
      dragCounter.value++
      isDragOver.value = true
    }

    // 处理拖拽离开
    const handleDragLeave = (event) => {
      event.preventDefault()
      dragCounter.value--
      if (dragCounter.value === 0) {
        isDragOver.value = false
      }
    }

    // 处理放置
    const handleDrop = (event) => {
      event.preventDefault()
      event.stopPropagation()
      
      isDragOver.value = false
      dragCounter.value = 0
      
      // 從 dataTransfer 獲取卡片數據
      let cardData
      try {
        const cardJson = event.dataTransfer.getData('application/json')
        if (!cardJson) {
          console.warn('沒有拖拽的卡片數據')
          return
        }
        cardData = JSON.parse(cardJson)
      } catch (error) {
        console.error('解析卡片數據失敗:', error)
        return
      }
      
      const newStatus = props.column.id
      const currentStatus = cardData.status
      
      console.log('卡片放置:', cardData.title, '從', currentStatus, '到', newStatus)
      
      // 如果状态没有改变，不需要更新
      if (newStatus === currentStatus) {
        console.log('狀態相同，無需更新')
        return
      }
      
      // 发出卡片移动事件
      emit('card-moved', cardData.id, newStatus)
    }

    return {
      isDragOver,
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop
    }
  }
}
</script>

<style scoped>
.kanban-column {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  height: fit-content;
  min-height: 400px;
  transition: all 0.2s ease;
}

.kanban-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.column-header {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.column-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.column-title h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  flex: 1;
}

.card-count {
  background: rgba(0, 0, 0, 0.1);
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.column-body {
  padding: 1rem;
  min-height: 300px;
  transition: all 0.2s ease;
}

.column-body[data-status]:hover {
  background: rgba(0, 0, 0, 0.02);
}

.column-body.drag-over {
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed #667eea;
  border-radius: 8px;
}

.loading-placeholder,
.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #718096;
  text-align: center;
}

.placeholder-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}

.empty-placeholder p {
  margin: 0.5rem 0;
  font-weight: 500;
}

.empty-placeholder small {
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1.4;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 卡片列表动画 */
.card-list-enter-active,
.card-list-leave-active {
  transition: all 0.3s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.card-list-move {
  transition: transform 0.3s ease;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .column-header {
    padding: 0.75rem 1rem;
  }
  
  .column-body {
    padding: 0.75rem;
    min-height: 250px;
  }
  
  .column-title h3 {
    font-size: 0.9rem;
  }
  
  .card-count {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>