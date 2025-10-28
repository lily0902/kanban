const express = require('express');
const router = express.Router();
const { Card, CARD_STATUS } = require('../models/Card');

// 記憶體儲存（實際專案中應使用資料庫）
let cards = [
  new Card('範例任務 1', '這是一個範例任務描述', CARD_STATUS.TODO),
  new Card('範例任務 2', '這是另一個範例任務', CARD_STATUS.IN_PROGRESS),
  new Card('範例任務 3', '已完成的範例任務', CARD_STATUS.DONE)
];

// 獲取所有卡片
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    
    let filteredCards = cards;
    
    // 如果指定了狀態，進行過濾
    if (status && Object.values(CARD_STATUS).includes(status)) {
      filteredCards = cards.filter(card => card.status === status);
    }
    
    // 按狀態分組返回
    const groupedCards = {
      [CARD_STATUS.TODO]: filteredCards.filter(card => card.status === CARD_STATUS.TODO),
      [CARD_STATUS.IN_PROGRESS]: filteredCards.filter(card => card.status === CARD_STATUS.IN_PROGRESS),
      [CARD_STATUS.IN_REVIEW]: filteredCards.filter(card => card.status === CARD_STATUS.IN_REVIEW),
      [CARD_STATUS.DONE]: filteredCards.filter(card => card.status === CARD_STATUS.DONE)
    };
    
    res.json({
      success: true,
      data: {
        cards: filteredCards.map(card => card.toJSON()),
        grouped: groupedCards,
        total: filteredCards.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '取得卡片失敗',
      message: error.message
    });
  }
});

// 根據 ID 獲取單個卡片
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const card = cards.find(c => c.id === id);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        error: '卡片不存在',
        message: `找不到 ID 為 ${id} 的卡片`
      });
    }
    
    res.json({
      success: true,
      data: card.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '獲取卡片失敗',
      message: error.message
    });
  }
});

// 建立新卡片
router.post('/', (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '參數錯誤',
        message: '卡片標題不能為空'
      });
    }
    
    const newCard = new Card(title.trim(), description || '', status || CARD_STATUS.TODO);
    newCard.validate();
    
    cards.push(newCard);
    
    res.status(201).json({
      success: true,
      data: newCard.toJSON(),
      message: '卡片建立成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: '建立卡片失敗',
      message: error.message
    });
  }
});

// 更新卡片
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const cardIndex = cards.findIndex(c => c.id === id);
    
    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '卡片不存在',
        message: `找不到 ID 為 ${id} 的卡片`
      });
    }
    
    const card = cards[cardIndex];
    card.update(updates);
    card.validate();
    
    cards[cardIndex] = card;
    
    res.json({
      success: true,
      data: card.toJSON(),
      message: '卡片更新成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: '更新卡片失敗',
      message: error.message
    });
  }
});

// 刪除卡片
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const cardIndex = cards.findIndex(c => c.id === id);
    
    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '卡片不存在',
        message: `找不到 ID 為 ${id} 的卡片`
      });
    }
    
    const deletedCard = cards.splice(cardIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedCard.toJSON(),
      message: '卡片刪除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '刪除卡片失敗',
      message: error.message
    });
  }
});

// 批量更新卡片狀態（用於拖拽功能）
router.patch('/batch-update-status', (req, res) => {
  try {
    const { updates } = req.body; // [{ id, status }, ...]
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        error: '參數錯誤',
        message: 'updates 必須是陣列'
      });
    }
    
    const updatedCards = [];
    
    for (const update of updates) {
      const { id, status } = update;
      const cardIndex = cards.findIndex(c => c.id === id);
      
      if (cardIndex !== -1 && Object.values(CARD_STATUS).includes(status)) {
        cards[cardIndex].update({ status });
        updatedCards.push(cards[cardIndex].toJSON());
      }
    }
    
    res.json({
      success: true,
      data: updatedCards,
      message: `成功更新 ${updatedCards.length} 張卡片`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '批量更新失敗',
      message: error.message
    });
  }
});

module.exports = router;