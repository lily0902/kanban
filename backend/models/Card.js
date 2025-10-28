const { v4: uuidv4 } = require('uuid');

// 卡片狀態列舉
const CARD_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  IN_REVIEW: 'inReview',
  DONE: 'done'
};

// 狀態顯示名稱對應
const STATUS_LABELS = {
  [CARD_STATUS.TODO]: '待處理',
  [CARD_STATUS.IN_PROGRESS]: '進行中',
  [CARD_STATUS.IN_REVIEW]: '待驗收',
  [CARD_STATUS.DONE]: '已完成'
};

class Card {
  constructor(title, description = '', status = CARD_STATUS.TODO) {
    this.id = uuidv4();
    this.title = title;
    this.description = description;
    this.status = status;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  // 更新卡片資訊
  update(updates) {
    const allowedUpdates = ['title', 'description', 'status'];
    
    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        // 驗證狀態值
        if (key === 'status' && !Object.values(CARD_STATUS).includes(updates[key])) {
          throw new Error(`無效的狀態值: ${updates[key]}`);
        }
        this[key] = updates[key];
      }
    }
    
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // 取得狀態顯示名稱
  getStatusLabel() {
    return STATUS_LABELS[this.status] || this.status;
  }

  // 驗證卡片資料
  validate() {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('卡片標題不能為空');
    }
    
    if (!Object.values(CARD_STATUS).includes(this.status)) {
      throw new Error(`無效的狀態: ${this.status}`);
    }
    
    return true;
  }

  // 轉換為 JSON 格式
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      statusLabel: this.getStatusLabel(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = {
  Card,
  CARD_STATUS,
  STATUS_LABELS
};