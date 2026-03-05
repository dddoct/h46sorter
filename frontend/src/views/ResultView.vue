<template>
  <div class="result-view">
    <!-- 加载状态 -->
    <div v-if="!isReady" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- 无结果状态 -->
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
            :class="{ 'top3': member.rank <= 3, 'tied': member.tied, 'in-formation': isInFormation(member) }"
            :style="{ animationDelay: index * 0.05 + 's' }"
          >
            <span class="rank-number" :class="'rank-' + member.rank">{{ member.rank }}</span>
            <div class="member-info">
              <img :src="member.img" :alt="getDisplayName(member)" class="member-avatar" />
              <div class="member-details">
                <span class="member-name">{{ getDisplayName(member) }}</span>
                <span class="member-gen">{{ getGenDisplay(member.gen) }}</span>
              </div>
            </div>
            <div v-if="member.rank <= 3" class="rank-medal">{{ ['🥇', '🥈', '🥉'][member.rank - 1] }}</div>
            <span class="member-score">{{ calculateScore(member.rank) }} pts</span>
          </div>
        </div>
      </div>

      <!-- 阵型区域 -->
      <div class="formation-section">
        <h3 class="section-title">{{ $t('result.formation.title') }}</h3>
        <div class="formation-selector">
          <label for="formation-size">{{ $t('result.formation.selectSize') }}</label>
          <select id="formation-size" v-model.number="formationSize" class="formation-select">
            <option v-for="size in formationSizes" :key="size" :value="size">
              {{ size }}{{ $t('result.formation.members') }}
            </option>
          </select>
        </div>
        <p class="formation-hint">点击成员可替换，拖拽可交换位置</p>
        <div class="formation-preview">
          <div class="formation-stage" :class="'formation-' + formationSize">
            <div 
              v-for="(row, rowIndex) in formationRows" 
              :key="rowIndex"
              class="formation-row"
              :class="'row-' + (rowIndex + 1)"
            >
              <div 
                v-for="(member, slotIndex) in row" 
                :key="slotIndex"
                class="formation-slot"
                :class="{ 
                  filled: member, 
                  selected: selectedSlot && selectedSlot.row === rowIndex && selectedSlot.slot === slotIndex,
                  dragging: draggedSlot && draggedSlot.row === rowIndex && draggedSlot.slot === slotIndex,
                  'drag-over': dragOverSlot && dragOverSlot.row === rowIndex && dragOverSlot.slot === slotIndex
                }"
                draggable="true"
                @click="handleSlotClick(rowIndex, slotIndex, member)"
                @dragstart="handleDragStart(rowIndex, slotIndex, member)"
                @dragover.prevent="handleDragOver(rowIndex, slotIndex)"
                @drop="handleDrop(rowIndex, slotIndex)"
                @dragend="handleDragEnd"
                @dragenter.prevent
              >
                <img 
                  v-if="member" 
                  :src="member.img" 
                  :alt="getDisplayName(member)"
                  :title="getDisplayName(member)"
                />
                <span v-else class="slot-number">{{ getSlotNumber(rowIndex, slotIndex) }}</span>
              </div>
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

      <!-- 重新开始 -->
      <div class="restart-section">
        <button @click="restart" class="restart-btn">
          <span class="btn-icon">🔄</span>
          <span>{{ $t('result.restart') }}</span>
        </button>
      </div>
    </template>

    <!-- 替换弹窗 -->
    <div v-if="showReplaceModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>选择替换成员</h3>
        <p class="modal-subtitle">点击成员进行替换</p>
        <div class="modal-members">
          <div 
            v-for="member in notInFormationMembers" 
            :key="member.id"
            class="modal-member"
            @click="replaceMember(member)"
          >
            <img :src="member.img" :alt="getDisplayName(member)" />
            <span>{{ getDisplayName(member) }}</span>
          </div>
        </div>
        <button class="modal-close" @click="closeModal">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import html2canvas from 'html2canvas'

export default {
  name: 'ResultView',
  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const currentLocale = inject('currentLocale')
    
    const isReady = ref(false)
    const hasResult = ref(false)
    const rankingList = ref([])
    const formationSize = ref(16)
    
    // 拖放相关状态
    const draggedSlot = ref(null)
    const dragOverSlot = ref(null)
    const selectedSlot = ref(null)
    const showReplaceModal = ref(false)

    // 阵型数据（响应式）
    const formationData = ref([])

    // 阵型人数选项
    const formationSizes = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

    // 阵型配置
    const formationConfigs = {
      10: { rows: 2, layout: [3, 7] },
      11: { rows: 2, layout: [5, 6] },
      12: { rows: 2, layout: [5, 7] },
      13: { rows: 3, layout: [3, 4, 6] },
      14: { rows: 3, layout: [3, 5, 6] },
      15: { rows: 3, layout: [3, 6, 6] },
      16: { rows: 3, layout: [3, 6, 7] },
      17: { rows: 3, layout: [5, 6, 6] },
      18: { rows: 3, layout: [5, 6, 7] },
      19: { rows: 3, layout: [5, 6, 8] },
      20: { rows: 3, layout: [6, 7, 7] },
      21: { rows: 3, layout: [6, 7, 8] },
      22: { rows: 3, layout: [6, 8, 8] }
    }

    // 计算分数
    function calculateScore(rank) {
      const totalMembers = rankingList.value.length
      if (totalMembers <= 1) return 100
      const score = 100 - ((rank - 1) / (totalMembers - 1)) * 50
      return Math.round(score)
    }

    // 计算每排顺序
    function getRowOrder(rowSize) {
      const order = []
      const center = Math.floor((rowSize - 1) / 2)
      order.push(center)
      let left = center - 1
      let right = center + 1
      while (left >= 0 || right < rowSize) {
        if (right < rowSize) { order.push(right); right++ }
        if (left >= 0) { order.push(left); left-- }
      }
      return order
    }

    // 初始化阵型数据
    function initFormationData() {
      const config = formationConfigs[formationSize.value]
      if (!config) return
      
      const members = rankingList.value.slice(0, formationSize.value)
      const rows = []
      let memberIndex = 0
      
      for (let i = 0; i < config.layout.length; i++) {
        const rowSize = config.layout[i]
        const row = new Array(rowSize).fill(null)
        const order = getRowOrder(rowSize)
        for (const pos of order) {
          if (memberIndex < members.length) {
            row[pos] = members[memberIndex]
            memberIndex++
          }
        }
        rows.push(row)
      }
      formationData.value = rows.reverse()
    }

    // 阵型行数据
    const formationRows = computed(() => formationData.value)

    // 不在阵型中的成员
    const notInFormationMembers = computed(() => {
      const inFormationIds = new Set()
      for (const row of formationData.value) {
        for (const slot of row) {
          if (slot) inFormationIds.add(slot.id)
        }
      }
      return rankingList.value.filter(m => !inFormationIds.has(m.id))
    })

    // 监听阵型大小变化
    watch(formationSize, () => {
      initFormationData()
    })

    // 获取槽位编号
    function getSlotNumber(rowIndex, slotIndex) {
      const config = formationConfigs[formationSize.value]
      let num = 1
      for (let i = 0; i < rowIndex; i++) {
        num += config.layout[config.layout.length - 1 - i]
      }
      return num + slotIndex
    }

    // 获取显示名称
    function getDisplayName(member) {
      if (!member) return ''
      if (currentLocale.value === 'en' && member.nameEn) {
        return member.nameEn
      }
      return member.name
    }

    // 获取期生显示
    function getGenDisplay(gen) {
      if (!gen) return ''
      if (currentLocale.value === 'en') {
        const match = gen.match(/(\d+)/)
        if (match) {
          const num = parseInt(match[1])
          const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'
          return `${num}${suffix} Gen`
        }
      }
      return gen
    }

    // 检查成员是否在阵型中
    function isInFormation(member) {
      for (const row of formationData.value) {
        for (const slot of row) {
          if (slot && slot.id === member.id) return true
        }
      }
      return false
    }

    // 点击槽位
    function handleSlotClick(rowIndex, slotIndex, member) {
      if (!member) return
      selectedSlot.value = { row: rowIndex, slot: slotIndex, member }
      showReplaceModal.value = true
    }

    // 关闭弹窗
    function closeModal() {
      showReplaceModal.value = false
      selectedSlot.value = null
    }

    // 替换成员
    function replaceMember(newMember) {
      if (!selectedSlot.value) return
      
      const { row, slot } = selectedSlot.value
      
      // 找到新成员当前位置（如果在阵型中）
      for (let r = 0; r < formationData.value.length; r++) {
        for (let s = 0; s < formationData.value[r].length; s++) {
          if (formationData.value[r][s] && formationData.value[r][s].id === newMember.id) {
            // 交换
            const temp = formationData.value[r][s]
            formationData.value[r][s] = formationData.value[row][slot]
            formationData.value[row][slot] = temp
            formationData.value = [...formationData.value]
            closeModal()
            return
          }
        }
      }
      
      // 新成员不在阵型中，直接替换
      formationData.value[row][slot] = newMember
      formationData.value = [...formationData.value]
      closeModal()
    }

    // 拖放处理
    function handleDragStart(rowIndex, slotIndex, member) {
      if (!member) return
      draggedSlot.value = { row: rowIndex, slot: slotIndex, member }
    }

    function handleDragOver(rowIndex, slotIndex) {
      dragOverSlot.value = { row: rowIndex, slot: slotIndex }
    }

    function handleDrop(rowIndex, slotIndex) {
      if (!draggedSlot.value) return
      
      const fromRow = draggedSlot.value.row
      const fromSlot = draggedSlot.value.slot
      const toRow = rowIndex
      const toSlot = slotIndex
      
      // 交换成员
      const temp = formationData.value[toRow][toSlot]
      formationData.value[toRow][toSlot] = formationData.value[fromRow][fromSlot]
      formationData.value[fromRow][fromSlot] = temp
      
      formationData.value = [...formationData.value]
      
      dragOverSlot.value = null
      draggedSlot.value = null
    }

    function handleDragEnd() {
      draggedSlot.value = null
      dragOverSlot.value = null
    }

    onMounted(() => {
      const savedResult = sessionStorage.getItem('h46_final_ranking')
      if (savedResult) {
        try {
          rankingList.value = JSON.parse(savedResult)
          hasResult.value = true
          initFormationData()
        } catch (e) {
          console.error('Failed to parse ranking result:', e)
        }
      }
      isReady.value = true
    })

    async function downloadImage() {
      try {
        await downloadTop5Image()
        await downloadFormationImage()
      } catch (error) {
        console.error('下载图片失败:', error)
        alert('图片下载失败，请重试')
      }
    }

    async function downloadTop5Image() {
      const container = document.createElement('div')
      container.style.cssText = `
        width: 800px;
        padding: 40px;
        background: linear-gradient(135deg, #f5fcff 0%, #e8f8fc 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `

      const top5 = rankingList.value.slice(0, 5)
      const title = currentLocale.value === 'en' ? 'Hinatazaka46' : '日向坂46'
      const subtitle = currentLocale.value === 'en' ? 'Your TOP 5' : '你的TOP5'

      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 48px; color: #58bee4; margin: 0 0 10px 0; font-weight: 700;">${title}</h1>
          <h2 style="font-size: 36px; color: #1a1a2e; margin: 0; font-weight: 600;">${subtitle}</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 15px;">
          ${top5.map((member, index) => `
            <div style="
              display: flex;
              align-items: center;
              padding: 20px;
              background: rgba(255,255,255,0.9);
              border-radius: 16px;
              box-shadow: 0 4px 15px rgba(88,190,228,0.15);
            ">
              <span style="
                font-size: 32px;
                font-weight: 700;
                color: ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#58bee4'};
                width: 50px;
              ">${member.rank}</span>
              <img src="${member.img}" style="
                width: 70px;
                height: 70px;
                border-radius: 50%;
                object-fit: cover;
                margin: 0 20px;
                border: 3px solid #58bee4;
              ">
              <div style="flex: 1;">
                <div style="font-size: 28px; font-weight: 600; color: #1a1a2e;">${getDisplayName(member)}</div>
                <div style="font-size: 18px; color: rgba(26,26,46,0.6);">${getGenDisplay(member.gen)}</div>
              </div>
              <div style="
                font-size: 32px;
                font-weight: 700;
                color: #58bee4;
                background: rgba(88,190,228,0.1);
                padding: 10px 25px;
                border-radius: 30px;
              ">${calculateScore(member.rank)} pts</div>
            </div>
          `).join('')}
        </div>
        <div style="text-align: center; margin-top: 30px; color: rgba(26,26,46,0.4); font-size: 16px;">
          H46 Sorter © 2026
        </div>
      `

      document.body.appendChild(container)
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      })
      document.body.removeChild(container)

      const link = document.createElement('a')
      link.download = `H46-TOP5-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    async function downloadFormationImage() {
      const container = document.createElement('div')
      container.style.cssText = `
        width: 1000px;
        padding: 40px;
        background: linear-gradient(135deg, #f5fcff 0%, #e8f8fc 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `

      const title = currentLocale.value === 'en' ? 'Hinatazaka46' : '日向坂46'
      const subtitle = `${formationSize.value}${currentLocale.value === 'en' ? ' Members Formation' : '人选拔阵容'}`

      container.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 48px; color: #58bee4; margin: 0 0 10px 0; font-weight: 700;">${title}</h1>
          <h2 style="font-size: 36px; color: #1a1a2e; margin: 0; font-weight: 600;">${subtitle}</h2>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
          ${formationRows.value.map((row, rowIndex) => `
            <div style="display: flex; justify-content: center; gap: 15px;">
              ${row.map((member, slotIndex) => `
                <div style="
                  width: 90px;
                  height: 90px;
                  border-radius: 12px;
                  overflow: hidden;
                  ${member ? 'box-shadow: 0 4px 12px rgba(88,190,228,0.3);' : 'background: rgba(88,190,228,0.1); border: 2px dashed rgba(88,190,228,0.3);'}
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  ${member ? `
                    <img src="${member.img}" style="width: 100%; height: 100%; object-fit: cover;">
                  ` : `
                    <span style="color: rgba(88,190,228,0.5); font-size: 24px;">${getSlotNumber(rowIndex, slotIndex)}</span>
                  `}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
        <div style="text-align: center; margin-top: 30px; color: rgba(26,26,46,0.4); font-size: 16px;">
          H46 Sorter © 2026
        </div>
      `

      document.body.appendChild(container)
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      })
      document.body.removeChild(container)

      const link = document.createElement('a')
      link.download = `H46-Formation-${formationSize.value}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    function copyLink() {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert(t('result.linkCopied')))
        .catch(() => alert(t('result.copyFailed')))
    }

    function restart() {
      localStorage.removeItem('h46_sort_progress')
      sessionStorage.removeItem('h46_final_ranking')
      router.push('/battle')
    }

    return {
      isReady,
      hasResult,
      rankingList,
      formationSize,
      formationSizes,
      formationRows,
      draggedSlot,
      dragOverSlot,
      selectedSlot,
      showReplaceModal,
      notInFormationMembers,
      calculateScore,
      getSlotNumber,
      getDisplayName,
      getGenDisplay,
      isInFormation,
      handleSlotClick,
      closeModal,
      replaceMember,
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleDragEnd,
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

.ranking-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(88, 190, 228, 0.1);
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

.rank-item.in-formation {
  background: rgba(88, 190, 228, 0.12);
  border: 1px solid rgba(88, 190, 228, 0.3);
}

.rank-item.top3 {
  background: rgba(88, 190, 228, 0.08);
  border: 1px solid rgba(88, 190, 228, 0.2);
}

.rank-number {
  width: 50px;
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(26, 26, 46, 0.5);
}

.rank-number.rank-1 {
  color: #FFD700;
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
  font-size: 0.75rem;
  color: #58bee4;
  background: rgba(88, 190, 228, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  display: inline-block;
  margin-top: 0.2rem;
  font-weight: 500;
}

.member-score {
  font-size: 0.95rem;
  font-weight: 700;
  color: #58bee4;
  background: rgba(88, 190, 228, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  margin-right: 0.5rem;
}

.rank-medal {
  font-size: 1.5rem;
}

.formation-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 1rem;
  text-align: center;
}

.formation-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.formation-selector label {
  color: rgba(26, 26, 46, 0.7);
  font-weight: 500;
}

.formation-select {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(88, 190, 228, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  color: #1a1a2e;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.formation-select:focus {
  outline: none;
  border-color: #58bee4;
}

.formation-hint {
  text-align: center;
  color: rgba(26, 26, 46, 0.5);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.formation-preview {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(88, 190, 228, 0.1);
}

.formation-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.formation-row {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.formation-slot {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(88, 190, 228, 0.1);
  border: 2px dashed rgba(88, 190, 228, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.formation-slot.filled {
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(88, 190, 228, 0.3);
}

.formation-slot.selected {
  border-color: #58bee4;
  background: rgba(88, 190, 228, 0.2);
  transform: scale(1.05);
}

.formation-slot.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.formation-slot.drag-over {
  border-color: #58bee4;
  background: rgba(88, 190, 228, 0.2);
  transform: scale(1.05);
}

.formation-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slot-number {
  color: rgba(88, 190, 228, 0.5);
  font-size: 1.2rem;
  font-weight: 600;
}

.share-section {
  margin-bottom: 2rem;
}

.share-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 50px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn.primary {
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  color: #fff;
}

.share-btn.secondary {
  background: rgba(88, 190, 228, 0.1);
  color: #58bee4;
}

.share-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(88, 190, 228, 0.3);
}

.restart-section {
  text-align: center;
  padding-bottom: 2rem;
}

.restart-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: rgba(88, 190, 228, 0.1);
  border: 2px solid rgba(88, 190, 228, 0.2);
  border-radius: 50px;
  color: #58bee4;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.restart-btn:hover {
  background: rgba(88, 190, 228, 0.2);
  transform: translateY(-2px);
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 0.5rem 0;
  color: #1a1a2e;
  text-align: center;
}

.modal-subtitle {
  text-align: center;
  color: rgba(26, 26, 46, 0.5);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.modal-members {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.3s;
}

.modal-member:hover {
  background: rgba(88, 190, 228, 0.1);
  transform: scale(1.05);
}

.modal-member img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(88, 190, 228, 0.3);
}

.modal-member span {
  font-size: 0.75rem;
  color: #1a1a2e;
  text-align: center;
}

.modal-close {
  width: 100%;
  padding: 0.75rem;
  background: rgba(88, 190, 228, 0.1);
  border: none;
  border-radius: 10px;
  color: #58bee4;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.modal-close:hover {
  background: rgba(88, 190, 228, 0.2);
}

@media (max-width: 768px) {
  .result-view {
    padding: 1rem;
  }

  .formation-slot {
    width: 50px;
    height: 50px;
  }

  .formation-preview {
    padding: 1rem;
  }

  .rank-item {
    padding: 0.5rem;
  }

  .member-avatar {
    width: 35px;
    height: 35px;
  }

  .modal-members {
    grid-template-columns: repeat(3, 1fr);
  }

  .modal-member img {
    width: 50px;
    height: 50px;
  }
}
</style>
