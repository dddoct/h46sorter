import { ref, computed } from 'vue'

const PROGRESS_KEY = 'n46_sort_progress'

export function useSorter() {
  const members = ref([])
  const queue = ref([])
  const currentMerge = ref(null)
  const history = ref([])
  const battlesCount = ref(0)
  const maxBattles = ref(0)
  const isComplete = ref(false)
  const finalResult = ref([])

  // 当前对阵
  const currentBattle = computed(() => {
    if (!currentMerge.value) return null
    if (currentMerge.value.left.length === 0 || currentMerge.value.right.length === 0) return null
    
    const leftItem = currentMerge.value.left[0]
    const rightItem = currentMerge.value.right[0]
    
    return {
      left: members.value[leftItem.id],
      right: members.value[rightItem.id],
      leftId: leftItem.id,
      rightId: rightItem.id
    }
  })

  // 进度百分比
  const progress = computed(() => {
    const total = estimateTotalBattles()
    if (total === 0) return 0
    return Math.min(100, Math.floor((battlesCount.value / total) * 100))
  })

  // 当前战斗编号
  const currentBattleNum = computed(() => battlesCount.value + 1)

  // 预估总战斗数
  const totalBattles = computed(() => estimateTotalBattles())

  // 初始化排序
  function init(selectedMembers) {
    members.value = selectedMembers
    queue.value = selectedMembers.map((m, idx) => [{ id: idx, tiedWithId: null }])
    
    // 随机打乱
    for (let i = queue.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[queue.value[i], queue.value[j]] = [queue.value[j], queue.value[i]]
    }
    
    maxBattles.value = Math.ceil(selectedMembers.length * Math.log2(selectedMembers.length))
    battlesCount.value = 0
    history.value = []
    currentMerge.value = null
    isComplete.value = false
    finalResult.value = []
    
    nextBattle()
  }

  // 下一场战斗
  function nextBattle() {
    if (currentMerge.value === null) {
      if (queue.value.length <= 1) {
        // 排序完成
        finalResult.value = queue.value[0] || []
        isComplete.value = true
        clearProgress()
        return
      }
      const left = queue.value.shift()
      const right = queue.value.shift()
      currentMerge.value = { left, right, result: [] }
    }

    if (currentMerge.value.left.length > 0 && currentMerge.value.right.length > 0) {
      // 有对阵，保存进度
      saveProgress()
    } else {
      finishMerge()
      nextBattle()
    }
  }

  // 完成当前合并
  function finishMerge() {
    while (currentMerge.value.left.length > 0) {
      currentMerge.value.result.push(...pullTiedBlock(currentMerge.value.left))
    }
    while (currentMerge.value.right.length > 0) {
      currentMerge.value.result.push(...pullTiedBlock(currentMerge.value.right))
    }
    queue.value.push(currentMerge.value.result)
    currentMerge.value = null
  }

  // 拉取平局块
  function pullTiedBlock(arr) {
    if (arr.length === 0) return []
    const block = [arr.shift()]
    
    while (arr.length > 0) {
      const last = block[block.length - 1]
      const next = arr[0]
      if (last.tiedWithId === next.id) {
        block.push(arr.shift())
      } else {
        break
      }
    }
    
    return block
  }

  // 投票
  function vote(choice) {
    // 保存历史
    history.value.push({
      queue: JSON.parse(JSON.stringify(queue.value)),
      currentMerge: JSON.parse(JSON.stringify(currentMerge.value)),
      battlesCount: battlesCount.value
    })
    if (history.value.length > 30) history.value.shift()

    battlesCount.value++

    if (choice === 'left') {
      currentMerge.value.result.push(...pullTiedBlock(currentMerge.value.left))
    } else if (choice === 'right') {
      currentMerge.value.result.push(...pullTiedBlock(currentMerge.value.right))
    } else if (choice === 'tie') {
      const blockL = pullTiedBlock(currentMerge.value.left)
      const blockR = pullTiedBlock(currentMerge.value.right)
      
      if (blockL.length > 0 && blockR.length > 0) {
        blockL[blockL.length - 1].tiedWithId = blockR[0].id
      }
      
      currentMerge.value.result.push(...blockL)
      currentMerge.value.result.push(...blockR)
    }

    nextBattle()
  }

  // 撤销
  function undo() {
    if (history.value.length === 0) return false
    
    const state = history.value.pop()
    queue.value = state.queue
    currentMerge.value = state.currentMerge
    battlesCount.value = state.battlesCount
    isComplete.value = false
    finalResult.value = []
    
    saveProgress()
    return true
  }

  // 预估总战斗数
  function estimateTotalBattles() {
    let total = battlesCount.value

    if (currentMerge.value) {
      if (currentMerge.value.left.length > 0 && currentMerge.value.right.length > 0) {
        total += (currentMerge.value.left.length + currentMerge.value.right.length - 1)
      }
    }

    let tempQueue = queue.value.map(arr => arr.length)
    if (currentMerge.value) {
      tempQueue.push(
        currentMerge.value.result.length + 
        currentMerge.value.left.length + 
        currentMerge.value.right.length
      )
    }

    while (tempQueue.length > 1) {
      const a = tempQueue.shift()
      const b = tempQueue.shift()
      total += (a + b - 1)
      tempQueue.push(a + b)
    }

    return total
  }

  // 获取最终排名
  function getFinalRanking() {
    const ranking = []
    let currentRank = 1
    const result = finalResult.value

    for (let i = 0; i < result.length; i++) {
      const item = result[i]
      const member = members.value[item.id]
      
      ranking.push({
        rank: currentRank,
        id: item.id,
        name: member.name,
        nameJa: member.nameJa || member.name,
        img: member.img,
        gen: member.gen,
        tied: item.tiedWithId !== null,
        tiedWithId: item.tiedWithId
      })

      if (item.tiedWithId === null || 
          (i + 1 < result.length && result[i + 1].id !== item.tiedWithId)) {
        currentRank++
      }
    }

    return ranking
  }

  // 保存进度到 localStorage
  function saveProgress() {
    const state = {
      queue: queue.value,
      currentMerge: currentMerge.value,
      history: history.value,
      battlesCount: battlesCount.value,
      maxBattles: maxBattles.value,
      members: members.value
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state))
  }

  // 清除进度
  function clearProgress() {
    localStorage.removeItem(PROGRESS_KEY)
  }

  // 恢复进度
  function restoreProgress() {
    const saved = localStorage.getItem(PROGRESS_KEY)
    if (!saved) return false

    try {
      const state = JSON.parse(saved)
      queue.value = state.queue
      currentMerge.value = state.currentMerge
      history.value = state.history
      battlesCount.value = state.battlesCount
      maxBattles.value = state.maxBattles
      members.value = state.members
      isComplete.value = false
      finalResult.value = []
      return true
    } catch (e) {
      console.error('Failed to restore progress:', e)
      clearProgress()
      return false
    }
  }

  // 检查是否有保存的进度
  function hasSavedProgress() {
    return !!localStorage.getItem(PROGRESS_KEY)
  }

  return {
    members,
    currentBattle,
    progress,
    currentBattleNum,
    totalBattles,
    isComplete,
    finalResult,
    init,
    vote,
    undo,
    getFinalRanking,
    saveProgress,
    clearProgress,
    restoreProgress,
    hasSavedProgress
  }
}
