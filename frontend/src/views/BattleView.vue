<template>
  <div class="battle-view">
    <!-- 加载状态 -->
    <div v-if="!isReady" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ $t('battle.loading') }}</p>
    </div>

    <!-- 排序完成 -->
    <div v-else-if="isComplete" class="complete-state">
      <h2>{{ $t('battle.complete') }}</h2>
      <button class="primary-btn" @click="goToResult">
        {{ $t('battle.viewResult') }}
      </button>
    </div>

    <!-- 对战界面 -->
    <template v-else>
      <!-- 进度条 -->
      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-label">{{ $t('battle.progress') }}</span>
          <span class="progress-text">{{ $t('battle.round', { current: currentBattleNum, total: totalBattles }) }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </div>

      <!-- 对战标题 -->
      <h2 class="battle-title">{{ $t('battle.title') }}</h2>

      <!-- 对战卡片区域 -->
      <div class="battle-arena" v-if="currentBattle">
        <div class="card-wrapper left" @click="selectLeft">
          <BattleCard 
            :name="getDisplayName(currentBattle.left)" 
            :img="currentBattle.left.img"
            class="battle-card"
          />
          <div class="select-hint">{{ $t('battle.select') }}</div>
        </div>

        <div class="vs-container">
          <div class="vs-circle">VS</div>
        </div>

        <div class="card-wrapper right" @click="selectRight">
          <BattleCard 
            :name="getDisplayName(currentBattle.right)" 
            :img="currentBattle.right.img"
            class="battle-card"
          />
          <div class="select-hint">{{ $t('battle.select') }}</div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="action-btn undo" @click="handleUndo" :disabled="!canUndo">
          <span class="btn-icon">↩️</span>
          <span>{{ $t('battle.undo') }}</span>
        </button>
        <button class="action-btn draw" @click="handleDraw">
          <span class="btn-icon">⚖️</span>
          <span>{{ $t('battle.draw') }}</span>
        </button>
      </div>

      <!-- 键盘快捷键提示 -->
      <div class="keyboard-hints">
        <span class="hint">← {{ $t('battle.left') }}</span>
        <span class="hint">{{ $t('battle.drawKey') }} {{ $t('battle.draw') }}</span>
        <span class="hint">{{ $t('battle.right') }} →</span>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { useRouter } from 'vue-router'
import BattleCard from "../components/BattleCard.vue"
import { useSorter } from "../composables/useSorter.js"
import { members } from "../data/members.js"

export default {
  name: 'BattleView',
  components: { BattleCard },
  setup() {
    const router = useRouter()
    const currentLocale = inject('currentLocale')
    const {
      currentBattle,
      progress,
      currentBattleNum,
      totalBattles,
      isComplete,
      init,
      vote,
      undo,
      hasSavedProgress,
      restoreProgress,
      getFinalRanking
    } = useSorter()

    const isReady = ref(false)
    const canUndo = computed(() => currentBattleNum.value > 1)

    // 获取显示名称：英文用nameEn，中日用name
    function getDisplayName(member) {
      if (!member) return ''
      if (currentLocale.value === 'en' && member.nameEn) {
        return member.nameEn
      }
      return member.name
    }

    // 初始化
    onMounted(() => {
      // 检查是否有保存的进度
      if (hasSavedProgress()) {
        restoreProgress()
      } else {
        // 初始化新的排序，使用所有成员
        init(members)
      }
      isReady.value = true

      // 添加键盘事件监听
      window.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeydown)
    })

    // 监听排序完成
    watch(isComplete, (complete) => {
      if (complete) {
        // 将结果存储到 sessionStorage，供结果页使用
        const ranking = getFinalRanking()
        sessionStorage.setItem('h46_final_ranking', JSON.stringify(ranking))
      }
    })

    // 选择左边
    function selectLeft() {
      if (!currentBattle.value) return
      vote('left')
    }

    // 选择右边
    function selectRight() {
      if (!currentBattle.value) return
      vote('right')
    }

    // 平局
    function handleDraw() {
      if (!currentBattle.value) return
      vote('tie')
    }

    // 撤销
    function handleUndo() {
      undo()
    }

    // 跳转到结果页
    function goToResult() {
      router.push('/result')
    }

    // 键盘事件处理
    function handleKeydown(e) {
      if (!currentBattle.value || isComplete.value) return
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        selectLeft()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        selectRight()
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        handleDraw()
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleUndo()
      }
    }

    return {
      isReady,
      isComplete,
      currentBattle,
      progress,
      currentBattleNum,
      totalBattles,
      canUndo,
      getDisplayName,
      selectLeft,
      selectRight,
      handleDraw,
      handleUndo,
      goToResult
    }
  }
}
</script>

<style scoped>
.battle-view {
  min-height: calc(100vh - 70px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
}

/* 加载状态 */
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
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

/* 完成状态 */
.complete-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.complete-state h2 {
  font-size: 2rem;
  color: #1a1a2e;
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
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(88, 190, 228, 0.4);
}

/* 进度条 */
.progress-section {
  margin-bottom: 2rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-size: 0.9rem;
  color: rgba(26, 26, 46, 0.6);
}

.progress-text {
  font-size: 0.9rem;
  color: #1a1a2e;
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background: rgba(88, 190, 228, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #58bee4, #7dd3f0);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 对战标题 */
.battle-title {
  text-align: center;
  font-size: 1.5rem;
  color: rgba(26, 26, 46, 0.8);
  margin-bottom: 2rem;
  font-weight: 500;
}

/* 对战区域 */
.battle-arena {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.card-wrapper {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.card-wrapper:hover {
  transform: scale(1.02);
}

.card-wrapper:hover .battle-card {
  box-shadow: 0 25px 50px rgba(88, 190, 228, 0.4);
}

.select-hint {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.85rem;
  color: rgba(26, 26, 46, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;
}

.card-wrapper:hover .select-hint {
  opacity: 1;
}

.vs-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-circle {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #58bee4 0%, #7dd3f0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 10px 30px rgba(88, 190, 228, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 1px solid rgba(88, 190, 228, 0.2);
  background: rgba(255, 255, 255, 0.8);
  color: rgba(26, 26, 46, 0.8);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(88, 190, 228, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(88, 190, 228, 0.2);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.1rem;
}

/* 键盘快捷键提示 */
.keyboard-hints {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
}

.hint {
  font-size: 0.8rem;
  color: rgba(26, 26, 46, 0.4);
  padding: 0.4rem 0.8rem;
  background: rgba(88, 190, 228, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(88, 190, 228, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .battle-view {
    padding: 1rem;
  }

  .battle-arena {
    flex-direction: column;
    gap: 1.5rem;
  }

  .vs-container {
    order: -1;
  }

  .vs-circle {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }

  .battle-title {
    font-size: 1.2rem;
  }

  .select-hint {
    display: none;
  }

  .keyboard-hints {
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .hint {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
