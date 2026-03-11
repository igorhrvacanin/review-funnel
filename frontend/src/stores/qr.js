import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQRStore = defineStore('qr', () => {
  const qrCodes = ref([
    {
      id: 'qr_001',
      name: 'Main Entrance',
      locationId: 'loc_001',
      locationName: 'Downtown Branch',
      shortCode: 'abc123',
      googleReviewUrl: 'https://g.page/r/demo-business/review',
      status: 'active',
      createdAt: '2026-02-01T10:00:00Z',
      scans: 150,
      reviewClicks: 52,
      feedbackCount: 8,
    },
    {
      id: 'qr_002',
      name: 'Table Sticker',
      locationId: 'loc_001',
      locationName: 'Downtown Branch',
      shortCode: 'xyz789',
      googleReviewUrl: 'https://g.page/r/demo-business/review',
      status: 'active',
      createdAt: '2026-02-10T14:30:00Z',
      scans: 88,
      reviewClicks: 31,
      feedbackCount: 3,
    },
    {
      id: 'qr_003',
      name: 'Receipt QR',
      locationId: 'loc_002',
      locationName: 'Westside Location',
      shortCode: 'def456',
      googleReviewUrl: 'https://g.page/r/demo-business/review',
      status: 'active',
      createdAt: '2026-02-20T09:00:00Z',
      scans: 44,
      reviewClicks: 18,
      feedbackCount: 2,
    }
  ])

  const scanHistory = ref(generateMockScanHistory())

  function generateMockScanHistory() {
    const history = []
    const now = new Date('2026-03-11')
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      history.push({
        date: d.toISOString().split('T')[0],
        scans: Math.floor(Math.random() * 15) + 3,
        reviewClicks: Math.floor(Math.random() * 6) + 1,
        feedback: Math.random() > 0.8 ? 1 : 0
      })
    }
    return history
  }

  function addQRCode(qr) {
    qrCodes.value.unshift({
      ...qr,
      id: 'qr_' + Date.now(),
      shortCode: Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
      scans: 0,
      reviewClicks: 0,
      feedbackCount: 0,
    })
  }

  function deleteQRCode(id) {
    qrCodes.value = qrCodes.value.filter(q => q.id !== id)
  }

  return { qrCodes, scanHistory, addQRCode, deleteQRCode }
})
