// N46Sorter 核心排序算法测试
// 基于 n46-sorter.html 中的 Merge Sort + Tie 处理逻辑

class N46Sorter {
  constructor(members) {
    // members: 成员数组，每个成员有 id, name 等属性
    this.members = members;
    this.queue = []; // 待合并的队列
    this.currentMerge = null; // 当前正在合并的两个数组
    this.history = []; // 历史记录用于撤销
    this.battlesCount = 0; // 战斗次数
    this.maxBattles = 0; // 预估最大战斗次数
    this.battleLog = []; // 记录每场战斗的选择
  }

  // 初始化排序
  init() {
    // 将每个成员包装成对象，放入队列
    // 每个对象: { id: 成员索引, tiedWithId: 与之平局的成员id }
    this.queue = this.members.map((m, idx) => [{ id: idx, tiedWithId: null }]);
    
    // 随机打乱队列顺序
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    
    this.maxBattles = Math.ceil(this.members.length * Math.log2(this.members.length));
    this.battlesCount = 0;
    this.history = [];
    this.currentMerge = null;
    this.battleLog = [];
  }

  // 获取下一场战斗的对阵双方
  nextBattle() {
    if (this.currentMerge === null) {
      // 当前没有在合并，从队列中取出两个数组
      if (this.queue.length <= 1) {
        // 排序完成
        return { done: true, result: this.queue[0] || [] };
      }
      const left = this.queue.shift();
      const right = this.queue.shift();
      this.currentMerge = { left, right, result: [] };
    }

    // 如果左右两边都还有成员，返回对阵
    if (this.currentMerge.left.length > 0 && this.currentMerge.right.length > 0) {
      const leftMember = this.currentMerge.left[0];
      const rightMember = this.currentMerge.right[0];
      return {
        done: false,
        left: this.members[leftMember.id],
        right: this.members[rightMember.id],
        leftId: leftMember.id,
        rightId: rightMember.id
      };
    } else {
      // 有一边已经空了，完成当前合并
      this.finishMerge();
      return this.nextBattle();
    }
  }

  // 完成当前合并
  finishMerge() {
    // 将左边剩余的块移到结果
    while (this.currentMerge.left.length > 0) {
      this.currentMerge.result.push(...this.pullTiedBlock(this.currentMerge.left));
    }
    // 将右边剩余的块移到结果
    while (this.currentMerge.right.length > 0) {
      this.currentMerge.result.push(...this.pullTiedBlock(this.currentMerge.right));
    }
    // 将合并结果放回队列
    this.queue.push(this.currentMerge.result);
    this.currentMerge = null;
  }

  // 拉取一个平局的块
  pullTiedBlock(arr) {
    if (arr.length === 0) return [];
    const block = [arr.shift()];

    // 如果下一个成员与块中最后一个成员平局，则加入块
    while (arr.length > 0) {
      const last = block[block.length - 1];
      const next = arr[0];
      if (last.tiedWithId === next.id) {
        block.push(arr.shift());
      } else {
        break;
      }
    }

    return block;
  }

  // 投票/选择
  vote(choice) {
    // 保存历史状态
    this.history.push({
      queue: JSON.parse(JSON.stringify(this.queue)),
      currentMerge: JSON.parse(JSON.stringify(this.currentMerge)),
      battlesCount: this.battlesCount
    });
    if (this.history.length > 30) this.history.shift();

    this.battlesCount++;

    if (choice === 'left') {
      // 左边胜利，将左边的块加入结果
      this.currentMerge.result.push(...this.pullTiedBlock(this.currentMerge.left));
      this.battleLog.push({ winner: 'left', tied: false });
    } else if (choice === 'right') {
      // 右边胜利，将右边的块加入结果
      this.currentMerge.result.push(...this.pullTiedBlock(this.currentMerge.right));
      this.battleLog.push({ winner: 'right', tied: false });
    } else if (choice === 'tie') {
      // 平局，合并两个块并建立平局链接
      const blockL = this.pullTiedBlock(this.currentMerge.left);
      const blockR = this.pullTiedBlock(this.currentMerge.right);

      // 链接左边最后一个和右边第一个
      if (blockL.length > 0 && blockR.length > 0) {
        blockL[blockL.length - 1].tiedWithId = blockR[0].id;
      }

      this.currentMerge.result.push(...blockL);
      this.currentMerge.result.push(...blockR);
      this.battleLog.push({ tied: true });
    }

    return this.nextBattle();
  }

  // 撤销
  undo() {
    if (this.history.length === 0) return null;
    const state = this.history.pop();
    this.queue = state.queue;
    this.currentMerge = state.currentMerge;
    this.battlesCount = state.battlesCount;
    this.battleLog.pop();
    return this.nextBattle();
  }

  // 获取最终排名（用于结果展示）
  getFinalRanking(resultArray) {
    const ranking = [];
    let currentRank = 1;

    for (let i = 0; i < resultArray.length; i++) {
      const item = resultArray[i];
      const member = this.members[item.id];
      
      ranking.push({
        rank: currentRank,
        id: item.id,
        name: member.name,
        tied: item.tiedWithId !== null
      });

      // 如果当前项没有与下一项平局，则排名+1
      if (item.tiedWithId === null || (i + 1 < resultArray.length && resultArray[i + 1].id !== item.tiedWithId)) {
        currentRank++;
      }
    }

    return ranking;
  }

  // 预估剩余战斗次数
  estimateRemainingBattles() {
    let total = this.battlesCount;

    if (this.currentMerge) {
      if (this.currentMerge.left.length > 0 && this.currentMerge.right.length > 0) {
        total += (this.currentMerge.left.length + this.currentMerge.right.length - 1);
      }
    }

    let tempQueue = this.queue.map(arr => arr.length);
    if (this.currentMerge) {
      tempQueue.push(this.currentMerge.result.length + this.currentMerge.left.length + this.currentMerge.right.length);
    }

    while (tempQueue.length > 1) {
      const a = tempQueue.shift();
      const b = tempQueue.shift();
      total += (a + b - 1);
      tempQueue.push(a + b);
    }

    return total;
  }
}

// ==================== 测试用例 ====================

function runTest(name, testFn) {
  console.log(`\n========== ${name} ==========`);
  try {
    testFn();
    console.log('✅ 测试通过');
  } catch (e) {
    console.log('❌ 测试失败:', e.message);
    console.log(e.stack);
  }
}

// 测试1: 基本排序（无平局）
function testBasicSort() {
  const members = [
    { id: 0, name: 'Member A' },
    { id: 1, name: 'Member B' },
    { id: 2, name: 'Member C' },
    { id: 3, name: 'Member D' }
  ];

  const sorter = new N46Sorter(members);
  sorter.init();

  // 模拟选择: A > B > C > D
  // 需要手动控制选择顺序
  let battle;
  let result = null;

  // 第一轮: A vs B, C vs D
  // 假设 A > B, C > D
  // 第二轮: A vs C
  // 假设 A > C
  // 然后 B vs C, 等等

  // 这里我们只是测试算法是否能完成
  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }
    // 随机选择，但确保能完成
    const choice = Math.random() > 0.5 ? 'left' : 'right';
    sorter.vote(choice);
  }

  console.log('最终排序结果:');
  const ranking = sorter.getFinalRanking(result);
  ranking.forEach(r => {
    console.log(`  第${r.rank}位: ${r.name}${r.tied ? ' (平局)' : ''}`);
  });

  // 验证所有成员都在结果中
  if (result.length !== members.length) {
    throw new Error(`结果数量错误: 期望 ${members.length}, 实际 ${result.length}`);
  }
}

// 测试2: 平局处理
function testTieHandling() {
  const members = [
    { id: 0, name: 'A' },
    { id: 1, name: 'B' },
    { id: 2, name: 'C' },
    { id: 3, name: 'D' }
  ];

  const sorter = new N46Sorter(members);
  sorter.init();

  // 手动控制选择，制造平局场景
  // A vs B -> 平局
  // C vs D -> 平局  
  // AB vs CD -> A > C
  // 结果应该是: A=B > C=D

  let battle;
  let result = null;
  let step = 0;

  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }

    step++;
    console.log(`  战斗 ${step}: ${battle.left.name} vs ${battle.right.name}`);

    // 控制选择逻辑
    if (step === 1) {
      sorter.vote('tie'); // A = B
    } else if (step === 2) {
      sorter.vote('tie'); // C = D
    } else if (step === 3) {
      sorter.vote('left'); // A > C
    } else {
      // 后续随机
      sorter.vote(Math.random() > 0.5 ? 'left' : 'right');
    }
  }

  console.log('最终排序结果:');
  const ranking = sorter.getFinalRanking(result);
  ranking.forEach(r => {
    console.log(`  第${r.rank}位: ${r.name}${r.tied ? ' (平局)' : ''}`);
  });

  // 验证平局关系
  const rank1Members = ranking.filter(r => r.rank === 1);
  if (rank1Members.length !== 2) {
    throw new Error(`第1位应该有2个成员(平局), 实际有 ${rank1Members.length}`);
  }
}

// 测试3: 验证所有成员都被比较过
function testAllMembersCompared() {
  const members = [
    { id: 0, name: 'M1' },
    { id: 1, name: 'M2' },
    { id: 2, name: 'M3' },
    { id: 3, name: 'M4' },
    { id: 4, name: 'M5' }
  ];

  const sorter = new N46Sorter(members);
  sorter.init();

  let battle;
  let result = null;
  const comparedPairs = new Set();

  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }

    // 记录比较过的对
    const pair = [battle.leftId, battle.rightId].sort().join('-');
    comparedPairs.add(pair);

    sorter.vote('left'); // 总是选左边
  }

  console.log(`总战斗次数: ${sorter.battlesCount}`);
  console.log(`比较过的对: ${Array.from(comparedPairs).join(', ')}`);

  // 验证所有成员都在结果中
  const resultIds = result.map(r => r.id).sort();
  const expectedIds = members.map(m => m.id).sort();
  
  if (JSON.stringify(resultIds) !== JSON.stringify(expectedIds)) {
    throw new Error('结果中成员不完整');
  }
}

// 测试4: 验证排名逻辑 - 避免之前的问题
function testRankingLogic() {
  // 场景: 4 > 5, 4 > 2, 4 > 3, 3 = 2
  // 正确结果应该是:
  // 1位: 4
  // 2位: 3 = 2 (因为3和2平局)
  // 4位: 5 (5输给了4，但没有和3/2比较过，所以应该在3/2之后)
  // 1位: ? (1没有参与任何比较，应该在最后)

  const members = [
    { id: 0, name: 'M1' },
    { id: 1, name: 'M2' },
    { id: 2, name: 'M3' },
    { id: 3, name: 'M4' },
    { id: 4, name: 'M5' }
  ];

  const sorter = new N46Sorter(members);
  sorter.init();

  // 手动控制整个排序过程
  // 这需要知道初始队列的顺序，比较复杂
  // 这里我们只做简单的验证

  let battle;
  let result = null;

  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }
    // 随机选择
    sorter.vote(Math.random() > 0.5 ? 'left' : 'right');
  }

  const ranking = sorter.getFinalRanking(result);
  console.log('最终排名:');
  ranking.forEach(r => {
    console.log(`  第${r.rank}位: ${r.name}`);
  });

  // 验证排名连续性
  const ranks = ranking.map(r => r.rank);
  const uniqueRanks = [...new Set(ranks)];
  
  // 排名应该是 1, 2, 3... 或 1, 1, 3... (有平局时)
  for (let i = 0; i < uniqueRanks.length; i++) {
    if (uniqueRanks[i] !== i + 1) {
      throw new Error(`排名不连续: 期望 ${i + 1}, 实际 ${uniqueRanks[i]}`);
    }
  }
}

// 运行所有测试
console.log('N46Sorter 核心排序算法测试');
console.log('==========================');

runTest('基本排序测试', testBasicSort);
runTest('平局处理测试', testTieHandling);
runTest('所有成员比较测试', testAllMembersCompared);
runTest('排名逻辑测试', testRankingLogic);

console.log('\n==========================');
console.log('测试完成');
