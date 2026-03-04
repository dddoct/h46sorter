<template>
  <div class="battle-view">
    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-info">
        <span class="progress-label">{{ $t('battle.progress') }}</span>
        <span class="progress-text">{{ $t('battle.round', { current: currentRound, total: totalRounds }) }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- 对战标题 -->
    <h2 class="battle-title">{{ $t('battle.title') }}</h2>

    <!-- 对战卡片区域 -->
    <div class="battle-arena">
      <div class="card-wrapper left" @click="selectLeft">
        <BattleCard 
          :name="leftMember.name" 
          :img="leftMember.img"
          class="battle-card"
        />
        <div class="select-hint">{{ $t('battle.select') }}</div>
      </div>

      <div class="vs-container">
        <div class="vs-circle">VS</div>
      </div>

      <div class="card-wrapper right" @click="selectRight">
        <BattleCard 
          :name="rightMember.name" 
          :img="rightMember.img"
          class="battle-card"
        />
        <div class="select-hint">{{ $t('battle.select') }}</div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <button class="action-btn skip" @click="skip">
        <span class="btn-icon">⏭</span>
        <span>{{ $t('battle.skip') }}</span>
      </button>
      <button class="action-btn draw" @click="draw">
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
  </div>
</template>

<script>
import BattleCard from "../components/BattleCard.vue"
import { members } from "../data/members.js"

export default {
  name: 'BattleView',
  components: { BattleCard },
  data() {
    return {
      currentRound: 1,
      totalRounds: 100,
      leftMember: {
        name: "Member A",
        img: "https://via.placeholder.com/300x400/7e1083/ffffff?text=Member+A"
      },
      rightMember: {
        name: "Member B", 
        img: "https://via.placeholder.com/300x400/16213e/ffffff?text=Member+B"
      }
    }
  },
  computed: {
    progressPercent() {
      return (this.currentRound / this.totalRounds) * 100
    }
  },
  mounted() {
    // 添加键盘事件监听
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    selectLeft() {
      this.nextRound()
    },
    selectRight() {
      this.nextRound()
    },
    skip() {
      this.nextRound()
    },
    draw() {
      this.nextRound()
    },
    nextRound() {
      if (this.currentRound < this.totalRounds) {
        this.currentRound++
        // 这里应该更新成员数据
      } else {
        // 完成所有轮次，跳转到结果页
        this.$router.push('/result')
      }
    },
    handleKeydown(e) {
      if (e.key === 'ArrowLeft') {
        this.selectLeft()
      } else if (e.key === 'ArrowRight') {
        this.selectRight()
      } else if (e.key === ' ' || e.key === 'Enter') {
        this.draw()
      }
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
  color: rgba(255, 255, 255, 0.6);
}

.progress-text {
  font-size: 0.9rem;
  color: #fff;
  font-weight: 600;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7e1083, #9c27b0);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 对战标题 */
.battle-title {
  text-align: center;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
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
  box-shadow: 0 25px 50px rgba(126, 16, 131, 0.4);
}

.select-hint {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
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
  background: linear-gradient(135deg, #7e1083 0%, #9c27b0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 10px 30px rgba(126, 16, 131, 0.4);
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
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
  color: rgba(255, 255, 255, 0.4);
  padding: 0.4rem 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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