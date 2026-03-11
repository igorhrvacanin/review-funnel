<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold" style="color:#1A1A2E">
          Feedback Inbox
          <v-chip v-if="unread > 0" color="error" size="small" class="ml-2">{{ unread }} new</v-chip>
        </h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Private feedback captured before it became a public review</p>
      </div>
      <div class="d-flex gap-2" style="gap:8px">
        <v-btn-toggle v-model="filter" density="compact" rounded="lg" variant="tonal" color="primary" mandatory>
          <v-btn value="all" size="small">All</v-btn>
          <v-btn value="unread" size="small">Unread</v-btn>
          <v-btn value="bad" size="small">🙁 Bad</v-btn>
          <v-btn value="okay" size="small">😐 Okay</v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <!-- Summary -->
    <v-row class="mb-5">
      <v-col cols="6" sm="3" v-for="s in summaryStats" :key="s.label">
        <v-card rounded="xl" elevation="0" style="border:1px solid #f0f0ff">
          <v-card-text class="pa-4 text-center">
            <div class="text-h5 font-weight-black mb-1" :style="{ color: s.color }">{{ s.value }}</div>
            <div class="text-caption text-medium-emphasis font-weight-medium">{{ s.label }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty state -->
    <div v-if="!filteredFeedbacks.length" class="text-center py-12">
      <v-icon size="64" color="success" style="opacity:0.3" class="mb-3">mdi-check-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold mb-1">No feedback here!</h3>
      <p class="text-medium-emphasis text-body-2">{{ filter === 'unread' ? 'All feedback has been read.' : 'No feedback matching this filter.' }}</p>
    </div>

    <!-- Feedback List -->
    <div v-else>
      <v-card
        v-for="fb in filteredFeedbacks"
        :key="fb.id"
        rounded="xl"
        elevation="0"
        class="mb-3 feedback-card"
        :style="{
          border: fb.status === 'unread' ? '2px solid #6C63FF30' : '1px solid #f0f0ff',
          background: fb.status === 'unread' ? '#fafaff' : 'white'
        }"
        @click="openDetail(fb)"
      >
        <v-card-text class="pa-5">
          <div class="d-flex align-start gap-4" style="gap:16px">
            <!-- Sentiment icon -->
            <div
              style="width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0"
              :style="{ background: sentimentBg(fb.sentiment) }"
            >
              {{ sentimentEmoji(fb.sentiment) }}
            </div>

            <!-- Content -->
            <div style="flex:1; min-width:0">
              <div class="d-flex align-center gap-2 mb-1" style="flex-wrap:wrap; gap:8px">
                <v-chip :color="sentimentColor(fb.sentiment)" size="x-small" variant="tonal" label>
                  {{ fb.sentiment.toUpperCase() }}
                </v-chip>
                <v-chip v-if="fb.status === 'unread'" color="primary" size="x-small" variant="flat">
                  NEW
                </v-chip>
                <v-chip v-if="fb.replied" color="success" size="x-small" variant="tonal">
                  <v-icon start size="10">mdi-check</v-icon>
                  Replied
                </v-chip>
                <span class="text-caption text-medium-emphasis ml-auto">{{ formatDate(fb.createdAt) }}</span>
              </div>

              <p class="text-body-2 mb-2" style="color:#1A1A2E; line-height:1.6">
                "{{ fb.message }}"
              </p>

              <!-- Stars -->
              <div class="d-flex align-center gap-2" style="flex-wrap:wrap; gap:8px">
                <div>
                  <span v-for="s in 5" :key="s" style="font-size:0.85rem">{{ s <= fb.rating ? '⭐' : '☆' }}</span>
                </div>
                <v-divider vertical />
                <span class="text-caption text-medium-emphasis">
                  <v-icon size="12">mdi-qrcode</v-icon>
                  {{ fb.qrCodeName }} · {{ fb.locationName }}
                </span>
                <v-divider v-if="fb.contactEmail" vertical />
                <span v-if="fb.contactEmail" class="text-caption text-medium-emphasis">
                  <v-icon size="12">mdi-email-outline</v-icon>
                  {{ fb.contactEmail }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex flex-column gap-2" style="gap:8px; flex-shrink:0">
              <v-btn
                v-if="fb.contactEmail && !fb.replied"
                size="small"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-reply"
                @click.stop="openReply(fb)"
              >
                Reply
              </v-btn>
              <v-btn
                v-if="fb.status === 'unread'"
                size="small"
                variant="text"
                color="medium-emphasis"
                @click.stop="feedbackStore.markAsRead(fb.id)"
              >
                Mark read
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Reply Dialog -->
    <v-dialog v-model="replyDialog" max-width="520">
      <v-card rounded="xl" v-if="replyTarget">
        <v-card-text class="pa-6">
          <h3 class="font-weight-bold mb-1">Reply to Feedback</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Replying to: <strong>{{ replyTarget.contactEmail }}</strong>
          </p>
          <div style="background:#f8f9ff; border-radius:12px; padding:12px; margin-bottom:16px">
            <p class="text-body-2 text-medium-emphasis" style="font-style:italic">
              "{{ replyTarget.message }}"
            </p>
          </div>
          <v-textarea
            v-model="replyMessage"
            label="Your reply"
            variant="outlined"
            rows="4"
            placeholder="Thank you for your feedback. We sincerely apologize and would like to make this right..."
            class="mb-3"
          />
          <div class="d-flex gap-3" style="gap:12px">
            <v-btn variant="tonal" @click="replyDialog=false" style="flex:1">Cancel</v-btn>
            <v-btn
              color="primary"
              :loading="replying"
              style="flex:2"
              prepend-icon="mdi-send"
              @click="sendReply"
            >
              Send Reply
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Success snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" color="success" rounded="lg">
      <v-icon start>mdi-check-circle</v-icon>
      {{ snackbarMsg }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFeedbackStore } from '@/stores/feedback'

const feedbackStore = useFeedbackStore()
const filter = ref('all')
const replyDialog = ref(false)
const replyTarget = ref(null)
const replyMessage = ref('')
const replying = ref(false)
const snackbar = ref(false)
const snackbarMsg = ref('')

const unread = computed(() => feedbackStore.feedbacks.filter(f => f.status === 'unread').length)

const filteredFeedbacks = computed(() => {
  let list = [...feedbackStore.feedbacks]
  if (filter.value === 'unread') list = list.filter(f => f.status === 'unread')
  if (filter.value === 'bad') list = list.filter(f => f.sentiment === 'bad')
  if (filter.value === 'okay') list = list.filter(f => f.sentiment === 'okay')
  return list
})

const summaryStats = computed(() => [
  { label: 'Total Feedback', value: feedbackStore.feedbacks.length, color: '#6C63FF' },
  { label: 'Unread', value: unread.value, color: '#FF5252' },
  { label: 'With Email', value: feedbackStore.feedbacks.filter(f => f.contactEmail).length, color: '#4CAF50' },
  { label: 'Replied', value: feedbackStore.feedbacks.filter(f => f.replied).length, color: '#f5a623' },
])

function sentimentEmoji(s) { return { great: '🙂', okay: '😐', bad: '🙁' }[s] || '❓' }
function sentimentColor(s) { return { great: 'success', okay: 'warning', bad: 'error' }[s] || 'grey' }
function sentimentBg(s) { return { great: '#e8f5e9', okay: '#fff8e1', bad: '#ffebee' }[s] || '#f5f5f5' }

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function openDetail(fb) {
  feedbackStore.markAsRead(fb.id)
}

function openReply(fb) {
  replyTarget.value = fb
  replyMessage.value = `Dear customer,\n\nThank you for your feedback. We sincerely apologize for your experience and would love the opportunity to make things right.\n\nPlease reach out to us directly so we can resolve this for you.\n\nBest regards,\nThe ${fb.locationName} Team`
  replyDialog.value = true
}

async function sendReply() {
  replying.value = true
  await new Promise(r => setTimeout(r, 1000))
  feedbackStore.markAsReplied(replyTarget.value.id)
  feedbackStore.markAsRead(replyTarget.value.id)
  replying.value = false
  replyDialog.value = false
  snackbarMsg.value = `Reply sent to ${replyTarget.value.contactEmail}!`
  snackbar.value = true
}
</script>

<style scoped>
.feedback-card { cursor: pointer; transition: all 0.2s; }
.feedback-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(108,99,255,0.1) !important; }
</style>
