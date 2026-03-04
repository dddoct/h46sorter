<template>
  <div class="app">
    <h1>N46 Sorter</h1>

    <!-- 开始界面 -->
    <div v-if="!sorting && finalResult.length === 0" class="start-screen">
      <p>选择你喜欢的成员进行排序</p>
      <button @click="startSort" class="start-button">开始排序</button>
    </div>

    <!-- 战斗界面 -->
    <div v-if="sorting && battleInProgress" class="battle">
      <div class="battle-header">
        <div class="progress-info">
          已比较: {{ battlesCount }} 场 | 剩余待排: {{ remainingCount }} 人
        </div>
      </div>

      <div class="context-info" v-if="contextText">
        {{ contextText }}
      </div>

      <div class="battle-cards">
        <BattleCard
          :name="challengerName"
          :img="challengerImg"
          @click="vote('challenger')"
        />

        <div class="vs">VS</div>

        <BattleCard
          :name="defenderName"
          :img="defenderImg"
          @click="vote('defender')"
        />
      </div>

      <div class="battle-actions">
        <button @click="vote('tie')" class="tie-button">平局</button>
        <button @click="undo" :disabled="history.length === 0" class="undo-button">撤销</button>
      </div>
    </div>

    <!-- 完成结果 -->
    <div v-if="finalResult.length > 0" class="result">
      <h2>排序完成！最终排名：</h2>
      <div class="ranking-list">
        <div v-for="(item, index) in displayRanking" :key="index" class="rank-group">
          <div class="rank-number">{{ item.rank }}位</div>
          <div class="rank-members">
            <div v-for="member in item.members" :key="member.id" class="member-item">
              <img :src="member.img" class="member-img" />
              <div>{{ member.name }}</div>
            </div>
          </div>
        </div>
      </div>
      <button @click="restart" class="restart-button">重新排序</button>
    </div>
  </div>
</template>

<script>
import BattleCard from "./components/BattleCard.vue"
import { members } from "./data/members.js"

export default {
  components: { BattleCard },
  data() {
    return {
      members: [],
      sorting: false,
      battleInProgress: false,
      battlesCount: 0,
      history: [],
      finalResult: [],
      
      // 核心状态
      unrankedList: [],    // 未排名的成员（等待加入）
      rankedList: [],      // 已排名的成员（按排名顺序）
      
      // 当前比较状态
      challenger: null,    // 当前挑战者（新成员）
      compareIndex: 0,     // 当前在和rankedList中的哪个位置比较
      
      // 当前对决双方
      defenderCandidate: null   // 当前防守者
    }
  },
  computed: {
    challengerName() {
      if (!this.challenger) return ''
      return this.members[this.challenger.id]?.name || ''
    },
    challengerImg() {
      if (!this.challenger) return ''
      return this.members[this.challenger.id]?.img || ''
    },
    defenderName() {
      if (!this.defenderCandidate) return ''
      return this.members[this.defenderCandidate.id]?.name || ''
    },
    defenderImg() {
      if (!this.defenderCandidate) return ''
      return this.members[this.defenderCandidate.id]?.img || ''
    },
    remainingCount() {
      return this.unrankedList.length
    },
    contextText() {
      if (this.rankedList.length === 0) return '首次比较，决定初始排名'
      const rankedNames = this.rankedList.map(m => this.members[m.id]?.name).join(' > ')
      return `当前排名: ${rankedNames}`
    },
    displayRanking() {
      if (this.finalResult.length === 0) return []

      const ranking = []
      let currentRank = 1
      let i = 0

      while (i < this.finalResult.length) {
        const tiedGroup = this.getTiedGroup(i)
        ranking.push({
          rank: currentRank,
          members: tiedGroup.map(m => ({
            ...this.members[m.id],
            id: m.id
          }))
        })
        currentRank += tiedGroup.length
        i += tiedGroup.length
      }

      return ranking
    }
  },
  methods: {
    startSort() {
      this.members = [...members]
      
      // 初始化所有成员
      const allMembers = this.members.map((_, index) => ({ 
        id: index, 
        tiedWithId: null 
      }))
      
      // 打乱顺序
      for (let i = allMembers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[allMembers[i], allMembers[j]] = [allMembers[j], allMembers[i]]
      }
      
      // 取第一个作为初始挑战者
      this.challenger = allMembers[0]
      this.unrankedList = allMembers.slice(1)
      this.rankedList = []
      this.compareIndex = 0
      this.battlesCount = 0
      this.history = []
      this.finalResult = []
      this.sorting = true
      
      // 开始处理
      this.processNextComparison()
    },

    processNextComparison() {
      // 如果没有挑战者了
      if (!this.challenger) {
        // 如果还有待排名的成员，取下一个
        if (this.unrankedList.length > 0) {
          this.challenger = this.unrankedList.shift()
          this.compareIndex = 0
        } else {
          // 全部完成
          this.finalResult = [...this.rankedList]
          this.battleInProgress = false
          this.sorting = false
          return
        }
      }
      
      // 如果rankedList为空，直接加入
      if (this.rankedList.length === 0) {
        this.rankedList.push(this.challenger)
        this.challenger = null
        this.processNextComparison()
        return
      }
      
      // 如果已经比较到rankedList末尾
      if (this.compareIndex >= this.rankedList.length) {
        // 挑战者排到最后
        this.rankedList.push(this.challenger)
        this.challenger = null
        this.processNextComparison()
        return
      }
      
      // 设置对决：挑战者 vs 当前防守者
      this.defenderCandidate = this.rankedList[this.compareIndex]
      this.battleInProgress = true
    },

    vote(choice) {
      // 保存历史
      this.history.push({
        unrankedList: JSON.parse(JSON.stringify(this.unrankedList)),
        rankedList: JSON.parse(JSON.stringify(this.rankedList)),
        challenger: JSON.parse(JSON.stringify(this.challenger)),
        compareIndex: this.compareIndex,
        battlesCount: this.battlesCount
      })
      if (this.history.length > 30) {
        this.history.shift()
      }
      
      this.battlesCount++
      
      if (choice === 'challenger') {
        // 挑战者胜：挑战者成为新的最高位，原防守者降级
        // 将挑战者插入到当前位置
        this.rankedList.splice(this.compareIndex, 0, this.challenger)
        // 挑战者处理完成，取下一个
        this.challenger = null
        this.processNextComparison()
      } else if (choice === 'defender') {
        // 防守者胜：挑战者需要继续向后比较
        this.compareIndex++
        this.processNextComparison()
      } else if (choice === 'tie') {
        // 平局：挑战者和防守者并列
        // 找到防守者所在的平局组
        const tiedGroup = this.getTiedGroupInRanked(this.compareIndex)
        const lastInGroup = tiedGroup[tiedGroup.length - 1]
        
        // 链接挑战者到平局组
        lastInGroup.tiedWithId = this.challenger.id
        
        // 将挑战者插入到平局组后面
        const insertPos = this.compareIndex + tiedGroup.length
        this.rankedList.splice(insertPos, 0, this.challenger)
        
        // 平局处理完成，挑战者不再继续比较，取下一个
        this.challenger = null
        this.processNextComparison()
      }
    },

    // 获取rankedList中的平局组
    getTiedGroupInRanked(startIndex) {
      const group = [this.rankedList[startIndex]]
      let i = startIndex

      while (i < this.rankedList.length - 1) {
        const current = this.rankedList[i]
        const next = this.rankedList[i + 1]
        if (current.tiedWithId === next.id) {
          group.push(next)
          i++
        } else {
          break
        }
      }

      return group
    },

    undo() {
      if (this.history.length === 0) return
      
      const state = this.history.pop()
      this.unrankedList = state.unrankedList
      this.rankedList = state.rankedList
      this.challenger = state.challenger
      this.compareIndex = state.compareIndex
      this.battlesCount = state.battlesCount
      
      this.processNextComparison()
    },

    restart() {
      this.sorting = false
      this.finalResult = []
      this.startSort()
    },

    getTiedGroup(startIndex) {
      const group = [this.finalResult[startIndex]]
      let i = startIndex

      while (i < this.finalResult.length - 1) {
        const current = this.finalResult[i]
        const next = this.finalResult[i + 1]
        if (current.tiedWithId === next.id) {
          group.push(next)
          i++
        } else {
          break
        }
      }

      return group
    }
  }
}
</script>

<style>
.app {
  text-align: center;
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.start-screen {
  margin-top: 100px;
}

.start-screen p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.start-button {
  background: linear-gradient(135deg, #7e1083 0%, #9c27b0 100%);
  color: white;
  border: none;
  padding: 16px 40px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(126, 16, 131, 0.3);
  transition: all 0.3s ease;
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(126, 16, 131, 0.4);
}

.battle {
  margin-top: 40px;
}

.battle-header {
  margin-bottom: 15px;
}

.progress-info {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.context-info {
  font-size: 14px;
  color: #7e1083;
  margin-bottom: 20px;
  font-weight: 600;
  background: rgba(126, 16, 131, 0.05);
  padding: 10px 20px;
  border-radius: 20px;
  display: inline-block;
}

.battle-cards {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin: 40px 0;
  flex-wrap: wrap;
}

.vs {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.battle-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 500;
}

.tie-button {
  background-color: #FF9800;
  color: white;
}

.tie-button:hover {
  background-color: #F57C00;
}

.undo-button {
  background-color: #9E9E9E;
  color: white;
}

.undo-button:hover:not(:disabled) {
  background-color: #757575;
}

.undo-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.restart-button {
  background: linear-gradient(135deg, #7e1083 0%, #9c27b0 100%);
  color: white;
  margin-top: 20px;
  padding: 16px 40px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(126, 16, 131, 0.3);
  transition: all 0.3s ease;
}

.restart-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(126, 16, 131, 0.4);
}

.result {
  margin-top: 40px;
}

.ranking-list {
  max-width: 800px;
  margin: 30px auto;
}

.rank-group {
  display: flex;
  align-items: flex-start;
  margin: 15px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.rank-number {
  font-size: 28px;
  font-weight: bold;
  min-width: 90px;
  color: #333;
  display: flex;
  align-items: center;
}

.rank-members {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start;
}

.member-item {
  text-align: center;
}

.member-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
</style>
