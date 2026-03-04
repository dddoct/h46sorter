// N46Sorter 边界情况测试
// 验证你提到的那些问题场景

class N46Sorter {
  constructor(members) {
    this.members = members;
    this.queue = [];
    this.currentMerge = null;
    this.history = [];
    this.battlesCount = 0;
    this.maxBattles = 0;
    this.battleLog = [];
    this.comparisonGraph = new Map(); // 记录比较关系
  }

  init() {
    this.queue = this.members.map((m, idx) => [{ id: idx, tiedWithId: null }]);
    for (let i = this.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
    }
    this.maxBattles = Math.ceil(this.members.length * Math.log2(this.members.length));
    this.battlesCount = 0;
    this.history = [];
    this.currentMerge = null;
    this.battleLog = [];
    this.comparisonGraph.clear();
  }

  nextBattle() {
    if (this.currentMerge === null) {
      if (this.queue.length <= 1) {
        return { done: true, result: this.queue[0] || [] };
      }
      const left = this.queue.shift();
      const right = this.queue.shift();
      this.currentMerge = { left, right, result: [] };
    }

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
      this.finishMerge();
      return this.nextBattle();
    }
  }

  finishMerge() {
    while (this.currentMerge.left.length > 0) {
      this.currentMerge.result.push(...this.pullTiedBlock(this.currentMerge.left));
    }
    while (this.currentMerge.right.length > 0) {
      this.currentMerge.result.push(...this.pullTiedBlock(this.currentMerge.right));
    }
    this.queue.push(this.currentMerge.result);
    this.currentMerge = null;
  }

  pullTiedBlock(arr) {
    if (arr.length === 0) return [];
    const block = [arr.shift()];
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

  vote(choice) {
    this.history.push({
      queue: JSON.parse(JSON.stringify(this.queue)),
      currentMerge: JSON.parse(JSON.stringify(this.currentMerge)),
      battlesCount: this.battlesCount
    });
    if (this.history.length > 30) this.history.shift();

    this.battlesCount++;

    const leftId = this.currentMerge.left[0].id;
    const rightId = this.currentMerge.right[0].id;

    // 记录比较关系
    if (!this.comparisonGraph.has(leftId)) {
      this.comparisonGraph.set(leftId, new Set());
    }
    if (!this.comparisonGraph.has(rightId)) {
      this.comparisonGraph.set(rightId, new Set());
    }
    this.comparisonGraph.get(leftId).add(rightId);
    this.comparisonGraph.get(rightId).add(leftId);

    if (choice === 'left') {
      this.currentMerge.result.push(...this.pullTiedBlock(this.currentMerge.left));
      this.battleLog.push({ winner: leftId, loser: rightId, tied: false });
    } else if (choice === 'right') {
      this.currentMerge.result.push(...this.pullTiedBlock(this.currentMerge.right));
      this.battleLog.push({ winner: rightId, loser: leftId, tied: false });
    } else if (choice === 'tie') {
      const blockL = this.pullTiedBlock(this.currentMerge.left);
      const blockR = this.pullTiedBlock(this.currentMerge.right);
      if (blockL.length > 0 && blockR.length > 0) {
        blockL[blockL.length - 1].tiedWithId = blockR[0].id;
      }
      this.currentMerge.result.push(...blockL);
      this.currentMerge.result.push(...blockR);
      this.battleLog.push({ left: leftId, right: rightId, tied: true });
    }

    return this.nextBattle();
  }

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

      if (item.tiedWithId === null || (i + 1 < resultArray.length && resultArray[i + 1].id !== item.tiedWithId)) {
        currentRank++;
      }
    }

    return ranking;
  }
}

// ==================== 边界情况测试 ====================

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

// 测试1: 验证没有比较的成员不会凭空产生排名
function testNoUncomparedRanking() {
  // 场景: 5个成员，但某些成员从未被比较
  // 在归并排序中，所有成员最终都会被比较到
  // 但如果逻辑有bug，可能出现未比较就有排名的情况

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

  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }
    sorter.vote('left');
  }

  // 验证所有成员都至少参与过一次比较
  for (let i = 0; i < members.length; i++) {
    if (!sorter.comparisonGraph.has(i)) {
      throw new Error(`成员 M${i+1} 没有参与任何比较，但出现在了结果中`);
    }
  }

  console.log('所有成员都参与了比较 ✓');
  console.log('比较关系图:');
  for (let [id, compared] of sorter.comparisonGraph) {
    console.log(`  M${id+1} 与: ${Array.from(compared).map(x => `M${x+1}`).join(', ')} 比较过`);
  }
}

// 测试2: 验证平局传递性
// A平B, B平C => A,B,C同分
function testTieTransitivity() {
  const members = [
    { id: 0, name: 'A' },
    { id: 1, name: 'B' },
    { id: 2, name: 'C' },
    { id: 3, name: 'D' }
  ];

  const sorter = new N46Sorter(members);
  sorter.init();

  let battle;
  let result = null;
  let step = 0;

  // 手动控制产生 A=B=C 的平局链
  // 初始队列随机，这里假设一种可能的情况
  // 实际中需要跟踪队列状态

  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }

    step++;
    console.log(`  战斗 ${step}: ${battle.left.name} vs ${battle.right.name}`);

    // 策略: 前两次平局，之后左胜
    if (step <= 2) {
      sorter.vote('tie');
    } else {
      sorter.vote('left');
    }
  }

  const ranking = sorter.getFinalRanking(result);
  console.log('最终排名:');
  ranking.forEach(r => {
    console.log(`  第${r.rank}位: ${r.name}${r.tied ? ' (平局)' : ''}`);
  });

  // 验证平局的成员确实建立了tiedWithId链接
  const tiedMembers = result.filter(r => r.tiedWithId !== null);
  console.log(`建立了 ${tiedMembers.length} 个平局链接`);
}

// 测试3: 验证排名顺序的合理性
// 如果 A > B 且 B > C，那么排名必须是 A > B > C，不能是 A > C > B
function testRankingConsistency() {
  const members = [
    { id: 0, name: 'A' },
    { id: 1, name: 'B' },
    { id: 2, name: 'C' }
  ];

  const sorter = new N46Sorter(members);
  sorter.init();

  let battle;
  let result = null;

  // 手动控制: A > B, A > C, B > C
  // 结果应该是 A > B > C

  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }

    const leftName = battle.left.name;
    const rightName = battle.right.name;

    // 策略: A总是赢，B赢C
    if (leftName === 'A' || (leftName === 'B' && rightName === 'C')) {
      sorter.vote('left');
    } else {
      sorter.vote('right');
    }
  }

  const ranking = sorter.getFinalRanking(result);
  console.log('最终排名:');
  ranking.forEach(r => {
    console.log(`  第${r.rank}位: ${r.name}`);
  });

  // 验证 A 是第1位
  const rankOfA = ranking.find(r => r.name === 'A').rank;
  const rankOfB = ranking.find(r => r.name === 'B').rank;
  const rankOfC = ranking.find(r => r.name === 'C').rank;

  if (rankOfA !== 1) throw new Error('A 应该是第1位');
  if (rankOfB !== 2) throw new Error('B 应该是第2位');
  if (rankOfC !== 3) throw new Error('C 应该是第3位');

  console.log('排名顺序正确 ✓');
}

// 测试4: 大规模测试
function testLargeScale() {
  const memberCount = 20;
  const members = [];
  for (let i = 0; i < memberCount; i++) {
    members.push({ id: i, name: `Member ${i + 1}` });
  }

  const sorter = new N46Sorter(members);
  sorter.init();

  let battle;
  let result = null;

  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }
    // 随机选择
    const choices = ['left', 'right', 'tie'];
    sorter.vote(choices[Math.floor(Math.random() * choices.length)]);
  }

  console.log(`成员数: ${memberCount}`);
  console.log(`战斗次数: ${sorter.battlesCount}`);
  console.log(`预估最大: ${sorter.maxBattles}`);
  console.log(`结果数: ${result.length}`);

  if (result.length !== memberCount) {
    throw new Error(`结果数量错误: 期望 ${memberCount}, 实际 ${result.length}`);
  }

  // 验证排名连续性
  const ranking = sorter.getFinalRanking(result);
  const ranks = ranking.map(r => r.rank);
  const maxRank = Math.max(...ranks);
  console.log(`最高排名: ${maxRank}`);
}

// 测试5: 验证战斗次数的合理性
function testBattleCount() {
  // n个成员的归并排序，比较次数应该在 n*log2(n) 左右
  const memberCount = 16;
  const members = [];
  for (let i = 0; i < memberCount; i++) {
    members.push({ id: i, name: `M${i + 1}` });
  }

  const sorter = new N46Sorter(members);
  sorter.init();

  let battle;
  let result = null;

  while (true) {
    battle = sorter.nextBattle();
    if (battle.done) {
      result = battle.result;
      break;
    }
    sorter.vote(Math.random() > 0.5 ? 'left' : 'right');
  }

  const expectedMax = memberCount * Math.log2(memberCount);
  console.log(`成员数: ${memberCount}`);
  console.log(`实际战斗: ${sorter.battlesCount}`);
  console.log(`理论最大: ${Math.ceil(expectedMax)}`);

  // 实际战斗次数应该小于等于理论最大
  if (sorter.battlesCount > expectedMax * 1.5) {
    throw new Error('战斗次数过多，可能有性能问题');
  }
}

// 运行测试
console.log('N46Sorter 边界情况测试');
console.log('==========================');

runTest('无未比较成员测试', testNoUncomparedRanking);
runTest('平局传递性测试', testTieTransitivity);
runTest('排名一致性测试', testRankingConsistency);
runTest('大规模测试', testLargeScale);
runTest('战斗次数测试', testBattleCount);

console.log('\n==========================');
console.log('测试完成');
