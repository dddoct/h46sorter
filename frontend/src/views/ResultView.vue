<template>
  <div class="result-view">
    <!-- 加载状�?-->
    <div v-if="!isReady" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- 无结果状�?-->
    <div v-else-if="!hasResult" class="no-result-state">
      <h2>{{ $t('result.noResult') }}</h2>
      <p>{{ $t('result.pleaseComplete') }}</p>
      <router-link to="/battle" class="primary-btn">
        {{ $t('result.startSorting') }}
      </router-link>
    </div>

    <!-- 结果展示 -->
    <template v-else>
      <!-- 结果标题 -->
      <div class="result-header">
        <h1 class="result-title">{{ $t('result.title') }}</h1>
        <p class="result-subtitle">{{ $t('result.subtitle') }}</p>
      </div>

      <!-- 排名展示区域 -->
      <div class="ranking-section" ref="rankingContainer">
        <div class="ranking-header">
          <span class="rank-label">#</span>
          <span class="member-label">{{ $t('result.member') }}</span>
        </div>
        <div class="ranking-list">
          <div 
            v-for="(member, index) in rankingList" 
            :key="member.id"
            class="rank-item"
            :class="{ 'top3': member.rank <= 3, 'tied': member.tied }"
            :style="{ animationDelay: index * 0.05 + 's' }"
          >
            <span class="rank-number" :class="'rank-' + member.rank">{{ member.rank }}</span>
            <div class="member-info">
              <img :src="member.img" :alt="getDisplayName(member)" class="member-avatar" />
              <div class="member-details">
                <span class="member-name">{{ getDisplayName(member) }}</span>
                <span class="member-gen">{{ member.gen }}</span>
              </div>
            </div>
            <div v-if="member.rank <= 3" class="rank-medal">{{ ['🥇', '🥈', '🥉'][member.rank - 1] }}</div>
            <div v-if="member.tied" class="tie-badge">=</div>
          </div>
        </div>
      </div>

      <!-- 阵型切换 -->
      <div class="formation-section">
        <h3 class="section-title">{{ $t('result.formation.title') }}</h3>
        <div class="formation-tabs">
          <button 
            v-for="tab in formationTabs" 
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="formation-preview">
          <div class="formation-grid" :class="'formation-' + activeTab">
            <div 
              v-for="n in formationCount" 
              :key="n"
              class="formation-slot"
              :class="{ filled: n <= formationMembers.length }"
            >
              <img 
                v-if="n <= formationMembers.length" 
                :src="formationMembers[n-1]?.img" 
                :alt="getDisplayName(formationMembers[n-1])"
              />
              <span v-else class="slot-number">{{ n }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分享操作 -->
      <div class="share-section">
        <h3 class="section-title">{{ $t('result.share.title') }}</h3>
        <div class="share-buttons">
          <button class="share-btn primary" @click="downloadImage">
            <span class="btn-icon">💾</span>
            <span>{{ $t('result.share.download') }}</span>
          </button>
          <button class="share-btn secondary" @click="copyLink">
            <span class="btn-icon">🔗</span>
            <span>{{ $t('result.share.copy') }}</span>
          </button>
        </div>
      </div>

      <!-- 重新开�?-->
      <div class="restart-section">
        <button @click="restart" class="restart-btn">
          <span class="btn-icon">🔄</span>
          <span>{{ $t('result.restart') }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ResultView',
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const currentLocale = inject('currentLocale')
    
    const isReady = ref(false)
    const hasResult = ref(false)
    const rankingList = ref([])
    const activeTab = ref('senbatsu')

    const formationTabs = computed(() => [
      { key: 'senbatsu', label: t('result.formation.senbatsu') },
      { key: 'under', label: t('result.formation.under') },
      { key: 'all', label: t('result.formation.all') }
    ])

    const formationCount = computed(() => {
      const counts = { senbatsu: 16, under: 21, all: rankingList.value.length }
      return counts[activeTab.value] || 16
    })

    const formationMembers = computed(() => {
      return rankingList.value.slice(0, formationCount.value)
    })

    // 获取显示名称：英文用nameEn，中日用name
    function getDisplayName(member) {
      if (!member) return ''
      if (currentLocale.value === 'en' && member.nameEn) {
        return member.nameEn
      }
      return member.name
    }

    onMounted(() => {
      // �?sessionStorage 获取排序结果
      const savedResult = sessionStorage.getItem('h46_final_ranking')
      if (savedResult) {
        try {
          rankingList.value = JSON.parse(savedResult)
          hasResult.value = true
        } catch (e) {
          console.error('Failed to parse ranking result:', e)
        }
      }
      isReady.value = true
    })

    function downloadImage() {
      // 使用 html2canvas 生成图片
      console.log('Downloading image...')
      alert('图片下载功能开发中...')
    }

    function copyLink() {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert(t('result.linkCopied')))
        .catch(() => alert(t('result.copyFailed')))
    }

    function restart() {
      // 清除进度和结�?
      localStorage.removeItem('h46_sort_progress')
      sessionStorage.removeItem('h46_final_ranking')
      router.push('/battle')
    }

    return {
      isReady,
      hasResult,
      rankingList,
      activeTab,
      formationTabs,
      formationCount,
      formationMembers,
      getDisplayName,
      downloadImage,
      copyLink,
      restart
    }
  }
}
</script>

<style scoped>
.result-view {
  min-height: calc(100vh - 70px);
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

/* 加载状�?*/
.loading-state,
.no-result-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(88, 190, 228, 0.2);
  border-top-color: #58bee4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-result-state h2 {
  font-size: 1.8rem;
  color: #1a1a2e;
}

.no-result-state p {
  color: rgba(26, 26, 46, 0.6);
}

.primary-btn {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  border: none;
  border-radius: 50px;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(88, 190, 228, 0.4);
}

/* 结果标题 */
.result-header {
  text-align: center;
  margin-bottom: 2rem;
}

.result-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1a1a2e 0%, #58bee4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.result-subtitle {
  font-size: 1.1rem;
  color: rgba(26, 26, 46, 0.6);
}

/* 排名区域 */
.ranking-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(88, 190, 228, 0.1);
  box-shadow: 0 4px 20px rgba(88, 190, 228, 0.05);
}

.ranking-header {
  display: flex;
  padding: 0 1rem 0.75rem;
  border-bottom: 1px solid rgba(88, 190, 228, 0.1);
  margin-bottom: 0.75rem;
  color: rgba(26, 26, 46, 0.5);
  font-size: 0.85rem;
  font-weight: 600;
}

.rank-label {
  width: 50px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(88, 190, 228, 0.03);
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease forwards;
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes slideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.rank-item:hover {
  background: rgba(88, 190, 228, 0.08);
  transform: translateX(5px);
}

.rank-item.top3 {
  background: rgba(88, 190, 228, 0.08);
  border: 1px solid rgba(88, 190, 228, 0.2);
}

.rank-item.tied {
  border-left: 3px solid rgba(255, 215, 0, 0.5);
}

.rank-number {
  width: 50px;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(26, 26, 46, 0.5);
}

.rank-number.rank-1 {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.rank-number.rank-2 {
  color: #C0C0C0;
}

.rank-number.rank-3 {
  color: #CD7F32;
}

.member-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.member-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(88, 190, 228, 0.3);
}

.member-details {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
}

.member-gen {
  font-size: 0.8rem;
  color: rgba(26, 26, 46, 0.5);
}

.rank-medal {
  font-size: 1.5rem;
}

.tie-badge {
  font-size: 1rem;
  color: rgba(255, 215, 0, 0.8);
  font-weight: 700;
  margin-left: 0.5rem;
}

/* 阵型区域 */
.formation-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #1a1a2e;
}

.formation-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.6rem 1.5rem;
  border: 1px solid rgba(88, 190, 228, 0.2);
  background: rgba(255, 255, 255, 0.8);
  color: rgba(26, 26, 46, 0.7);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.tab-btn:hover,
.tab-btn.active {
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  border-color: transparent;
  color: #fff;
}

.formation-preview {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(88, 190, 228, 0.1);
}

.formation-grid {
  display: grid;
  gap: 0.75rem;
  justify-content: center;
}

.formation-senbatsu {
  grid-template-columns: repeat(4, 1fr);
  max-width: 400px;
  margin: 0 auto;
}

.formation-under {
  grid-template-columns: repeat(5, 1fr);
  max-width: 500px;
  margin: 0 auto;
}

.formation-all {
  grid-template-columns: repeat(6, 1fr);
}

.formation-slot {
  aspect-ratio: 1;
  background: rgba(88, 190, 228, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(88, 190, 228, 0.1);
}

.formation-slot.filled {
  border-color: rgba(88, 190, 228, 0.3);
}

.formation-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slot-number {
  font-size: 0.9rem;
  color: rgba(26, 26, 46, 0.3);
}

/* 分享区域 */
.share-section {
  margin-bottom: 2rem;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 2rem;
  border-radius: 50px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn.primary {
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  color: #fff;
}

.share-btn.secondary {
  background: rgba(255, 255, 255, 0.8);
  color: #1a1a2e;
  border: 1px solid rgba(88, 190, 228, 0.2);
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(88, 190, 228, 0.3);
}

/* 重新开�?*/
.restart-section {
  text-align: center;
}

.restart-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2.5rem;
  background: rgba(255, 255, 255, 0.8);
  color: rgba(26, 26, 46, 0.8);
  text-decoration: none;
  border-radius: 50px;
  border: 1px solid rgba(88, 190, 228, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
}

.restart-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(88, 190, 228, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(88, 190, 228, 0.2);
}

/* 响应式设�?*/
@media (max-width: 768px) {
  .result-view {
    padding: 1rem;
  }

  .result-title {
    font-size: 1.5rem;
  }

  .ranking-section {
    padding: 1rem;
  }

  .member-avatar {
    width: 40px;
    height: 40px;
  }

  .formation-senbatsu {
    grid-template-columns: repeat(4, 1fr);
  }

  .formation-under {
    grid-template-columns: repeat(4, 1fr);
  }

  .formation-all {
    grid-template-columns: repeat(4, 1fr);
  }

  .share-buttons {
    flex-direction: column;
    align-items: center;
  }

  .share-btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
}
</style>
