import axios from 'axios'

const API_BASE = 'http://localhost:8000'

// 获取抽卡结果
export const drawCards = async (count = 1) => {
  try {
    const response = await axios.get(`${API_BASE}/api/draw`, {
      params: { count }
    })
    return response.data
  } catch (error) {
    console.error('抽卡失败:', error)
    throw error
  }
}

// 获取十连抽结果
export const drawMultiple = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/draw10`)
    return response.data
  } catch (error) {
    console.error('十连抽失败:', error)
    throw error
  }
}

// 获取配置信息
export const getRatings = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/ratings`)
    return response.data
  } catch (error) {
    console.error('获取配置失败:', error)
    throw error
  }
}

// 获取选手统计
export const getPlayersCount = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/players/count`)
    return response.data
  } catch (error) {
    console.error('获取统计失败:', error)
    throw error
  }
}
