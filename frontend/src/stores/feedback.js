import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFeedbackStore = defineStore('feedback', () => {
  const feedbacks = ref([
    {
      id: 'fb_001',
      qrCodeId: 'qr_001',
      qrCodeName: 'Main Entrance',
      locationName: 'Downtown Branch',
      sentiment: 'okay',
      message: 'The service was decent but the wait time was a bit long. Would be nice if there were more staff during peak hours.',
      rating: 3,
      contactEmail: 'customer1@email.com',
      createdAt: '2026-03-10T14:25:00Z',
      status: 'unread',
      replied: false
    },
    {
      id: 'fb_002',
      qrCodeId: 'qr_001',
      qrCodeName: 'Main Entrance',
      locationName: 'Downtown Branch',
      sentiment: 'bad',
      message: 'My order was wrong twice and nobody apologized. Very disappointed with the experience.',
      rating: 1,
      contactEmail: '',
      createdAt: '2026-03-09T11:10:00Z',
      status: 'unread',
      replied: false
    },
    {
      id: 'fb_003',
      qrCodeId: 'qr_002',
      qrCodeName: 'Table Sticker',
      locationName: 'Downtown Branch',
      sentiment: 'okay',
      message: 'Food was great but the music was too loud to have a conversation.',
      rating: 3,
      contactEmail: 'jane.doe@example.com',
      createdAt: '2026-03-08T19:40:00Z',
      status: 'read',
      replied: true
    },
    {
      id: 'fb_004',
      qrCodeId: 'qr_003',
      qrCodeName: 'Receipt QR',
      locationName: 'Westside Location',
      sentiment: 'bad',
      message: 'Parking situation is a nightmare. Spent 20 minutes finding a spot. This needs to be addressed.',
      rating: 2,
      contactEmail: 'parking_frustrated@gmail.com',
      createdAt: '2026-03-07T13:00:00Z',
      status: 'read',
      replied: false
    },
    {
      id: 'fb_005',
      qrCodeId: 'qr_001',
      qrCodeName: 'Main Entrance',
      locationName: 'Downtown Branch',
      sentiment: 'okay',
      message: 'Pretty good overall. Just a few minor things that could be improved.',
      rating: 3,
      contactEmail: '',
      createdAt: '2026-03-06T10:15:00Z',
      status: 'read',
      replied: false
    }
  ])

  function markAsRead(id) {
    const fb = feedbacks.value.find(f => f.id === id)
    if (fb) fb.status = 'read'
  }

  function markAsReplied(id) {
    const fb = feedbacks.value.find(f => f.id === id)
    if (fb) fb.replied = true
  }

  function addFeedback(data) {
    feedbacks.value.unshift({
      id: 'fb_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'unread',
      replied: false
    })
  }

  const unreadCount = () => feedbacks.value.filter(f => f.status === 'unread').length

  return { feedbacks, markAsRead, markAsReplied, addFeedback, unreadCount }
})
