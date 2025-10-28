import axios from 'axios'

// 創建 axios 實例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
api.interceptors.request.use(
  config => {
    console.log('發送請求:', config.method?.toUpperCase(), config.url)
    return config
  },
  error => {
    console.error('請求錯誤:', error)
    return Promise.reject(error)
  }
)

// 回應攔截器
api.interceptors.response.use(
  response => {
    console.log('收到回應:', response.status, response.config.url)
    return response.data
  },
  error => {
    console.error('回應錯誤:', error)
    
    if (error.response) {
      // 伺服器返回錯誤狀態碼
      const { status, data } = error.response
      console.error(`HTTP ${status}:`, data.message || data.error)
      
      // 可以在這裡處理特定的錯誤狀態碼
      switch (status) {
        case 400:
          throw new Error(data.message || '請求參數錯誤')
        case 404:
          throw new Error(data.message || '資源不存在')
        case 500:
          throw new Error(data.message || '伺服器內部錯誤')
        default:
          throw new Error(data.message || `HTTP ${status} 錯誤`)
      }
    } else if (error.request) {
      // 網路錯誤或請求逾時
      console.error('網路錯誤:', error.request)
      throw new Error('網路連線失敗，請檢查網路設定')
    } else {
      // 其他錯誤
      console.error('未知錯誤:', error.message)
      throw new Error(error.message || '未知錯誤')
    }
  }
)

// 卡片服務
export const cardService = {
  // 取得所有卡片
  async getAllCards() {
    return await api.get('/cards')
  },

  // 根據 ID 取得單個卡片
  async getCard(id) {
    return await api.get(`/cards/${id}`)
  },

  // 建立新卡片
  async createCard(cardData) {
    return await api.post('/cards', cardData)
  },

  // 更新卡片
  async updateCard(id, updates) {
    return await api.put(`/cards/${id}`, updates)
  },

  // 刪除卡片
  async deleteCard(id) {
    return await api.delete(`/cards/${id}`)
  },

  // 批次更新卡片狀態（用於拖曳）
  async batchUpdateStatus(updates) {
    return await api.patch('/cards/batch-update-status', { updates })
  }
}

export default api