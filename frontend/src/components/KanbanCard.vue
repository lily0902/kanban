<template>
  <div
    class="kanban-card"
    :class="{ dragging: isDragging }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="$emit('edit')"
  >
    <div class="card-header">
      <h4 class="card-title">{{ card.title }}</h4>
      <div class="card-actions">
        <button
          class="action-btn edit-btn"
          @click.stop="$emit('edit')"
          title="編輯卡片"
        >
          ✏️
        </button>
        <button
          class="action-btn delete-btn"
          @click.stop="$emit('delete')"
          title="刪除卡片"
        >
          🗑️
        </button>
      </div>
    </div>

    <div v-if="card.description" class="card-description">
      <p>{{ card.description }}</p>
    </div>

    <div class="card-footer">
      <div class="card-meta">
        <span class="card-status" :class="`status-${card.status}`">
          {{ getStatusLabel(card.status) }}
        </span>
        <span
          class="card-date"
          :title="`建立時間: ${formatDate(card.createdAt)}`"
        >
          {{ getRelativeTime(card.updatedAt) }}
        </span>
      </div>
    </div>

    <!-- 拖拽指示器 -->
    <div class="drag-indicator">
      <div class="drag-dots">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "KanbanCard",
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  emits: ["edit", "delete", "drag-start", "drag-end"],
  setup(props, { emit }) {
    const isDragging = ref(false);

    // 狀態標籤對應
    const statusLabels = {
      todo: "待處理",
      inProgress: "進行中",
      inReview: "待驗收",
      done: "已完成",
    }

    // 獲取狀態標籤
    const getStatusLabel = (status) => {
      return statusLabels[status] || status;
    };

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // 取得相對時間
    const getRelativeTime = (dateString) => {
      const now = new Date();
      const date = new Date(dateString);
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "剛剛";
      if (diffMins < 60) return `${diffMins}分鐘前`;
      if (diffHours < 24) return `${diffHours}小時前`;
      if (diffDays < 7) return `${diffDays}天前`;

      return formatDate(dateString).split(" ")[0];
    }

    // 處理拖拽開始
    const handleDragStart = (event) => {
      isDragging.value = true;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", props.card.id);
      event.dataTransfer.setData(
        "application/json",
        JSON.stringify(props.card)
      );

      console.log("卡片拖拽開始:", props.card.title, "ID:", props.card.id);
      emit("drag-start", props.card);
    }

    // 處理拖拽結束
    const handleDragEnd = (event) => {
      isDragging.value = false;
      console.log("卡片拖拽結束");
      emit("drag-end");
    };

    return {
      isDragging,
      getStatusLabel,
      formatDate,
      getRelativeTime,
      handleDragStart,
      handleDragEnd,
    };
  },
};
</script>

<style scoped>
.kanban-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.kanban-card.dragging {
  opacity: 0.5;
  transform: rotate(5deg) scale(1.05);
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.card-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1.4;
  flex: 1;
  word-wrap: break-word;
}

.card-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.kanban-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.card-description {
  margin-bottom: 0.75rem;
}

.card-description p {
  margin: 0;
  font-size: 0.8rem;
  color: #4a5568;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  margin-top: auto;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.card-status {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-todo {
  background: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.status-inProgress {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
}

.status-inReview {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.status-done {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.card-date {
  font-size: 0.7rem;
  color: #718096;
  font-weight: 500;
}

.drag-indicator {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.kanban-card:hover .drag-indicator {
  opacity: 0.3;
}

.drag-dots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  width: 8px;
  height: 12px;
}

.drag-dots span {
  width: 2px;
  height: 2px;
  background: #a0aec0;
  border-radius: 50%;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .kanban-card {
    padding: 0.75rem;
  }

  .card-title {
    font-size: 0.85rem;
  }

  .card-description p {
    font-size: 0.75rem;
  }

  .card-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .card-actions {
    opacity: 1; /* 在行動裝置上始終顯示操作按鈕 */
  }
}

/* 拖拽樣式增強 */
.kanban-card[draggable="true"] {
  cursor: grab;
}

.kanban-card[draggable="true"]:active {
  cursor: grabbing;
}

/* 無障礙存取 */
.kanban-card:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.action-btn:focus {
  outline: 2px solid #667eea;
  outline-offset: 1px;
}
</style>
