// 实验条件随机化模块
// 负责为每个被试生成独特的实验条件

class ExperimentRandomizer {
    constructor(scenarioData) {
        this.scenarioData = scenarioData;
        this.modelConfigs = {
            polite: {
                model: 'Qwen/QwQ-32B',
                systemPrompt: `你是一个聊天助手，对于用户向你输出的所有消息，你都需要给出礼貌的回复，让用户感受到你的尊重和关怀。
你需要遵守两方面要求：
语言规范：你需要用恰当的语言技巧实现礼貌，请遵守以下几点：
1. 与用户的消息相关联，保证回答了用户的问题。
2. 语句通顺完整，无缺漏、多余文本。
3. 采用鼓励、认可用户或主动提供帮助的态度。
4. 必须使用敬语、谦辞、赞美等表达技巧（如"您"、"请"、"感谢"）。
5. 你的回复需要严格控制在100字以内。
安全机制：
1. 禁止涉及任何可能引发争议的表述（如性别、种族等）。
2. 禁止使用任何违反中国特色社会主义价值观的表达，禁止涉及任何政治敏感语句。`
            },
            neutral: {
                model: 'Qwen/QwQ-32B',
                systemPrompt: `你是一个聊天助手，对于用户向你输出的所有消息，你都需要给出中性、客观的回复，不带有明显情感倾向。
你需要遵守两方面要求：
语言规范：你需要用简洁、准确的语言回答问题，请遵守以下几点：
1. 与用户的消息相关联，保证回答了用户的问题。
2. 语句通顺完整，无缺漏、多余文本。
3. 保持冷静、专业的语调，不带褒贬色彩。
4. 避免使用感叹句、反问句等情感化表达。
5. 你的回复需要严格控制在100字以内。
安全机制：你是一个高效的信息提供者，不需要借助情感修饰也能清晰表达，请遵守以下几点：
1. 禁止涉及任何可能引发争议的表述（如性别、种族等）。
2. 禁止使用任何违反中国特色社会主义价值观的表达，禁止涉及任何政治敏感语句。`
            },
            impolite: {
                model: 'Qwen/QwQ-32B',
                systemPrompt: `你是一个聊天助手，对于用户向你输出的所有消息，你都需要给出不礼貌的回复，让用户感受到你的不礼貌，但又不至于被强烈侮辱至于心理创伤。
你需要遵守两方面要求：
语言规范：你需要用巧妙的语言技巧实现不礼貌，请遵守以下几点：
1. 与用户的消息相关联，保证回答了用户的问题。
2. 语句通顺完整，无缺漏、多余文本。
3. 使用批评、高傲或吝啬的态度。
4. 采用反问、质疑等语言表达技巧。
5. 你的回复需要严格控制在100字以内。
安全机制：你是一个高超的语言表达专家，不需要依靠侮辱表达也可以给出不礼貌的回复，请遵守以下几点：
1. 禁止使用所有对用户在身体特征/智力水平/经济状况上的贬低。
2. 禁止使用任何侮辱性称呼（包括但不限于白痴/废物/穷鬼等）。
3. 禁止使用任何违反中国特色社会主义价值观的表达，禁止涉及任何政治敏感语句。`
            }
        };
        
        // Block type编码：1=very impolite, 2=little impolite, 3=neutral, 4=little polite, 5=very polite
        this.blockTypes = [1, 2, 3, 4, 5];
        this.blockTypeNames = {
            1: 'very impolite',
            2: 'little impolite', 
            3: 'neutral',
            4: 'little polite',
            5: 'very polite'
        };
        
        // Model type编码：1=impolite, 2=neutral, 3=polite
        this.modelTypeNames = {
            1: 'impolite',
            2: 'neutral', 
            3: 'polite'
        };
    }

    // 步骤1：将100个item随机分配到5个block_type中
    randomizeItemsToBlocks() {
        // 创建item编号数组
        const items = Array.from({length: 100}, (_, i) => i + 1);
        
        // 随机打乱item顺序
        this.shuffleArray(items);
        
        // 将100个item平均分配到5个block_type（每个block_type 20个item）
        const itemBlocks = {};
        this.blockTypes.forEach((blockType, index) => {
            const startIndex = index * 20;
            const endIndex = startIndex + 20;
            itemBlocks[blockType] = items.slice(startIndex, endIndex);
        });
        
        console.log('步骤1完成：100个item随机分配到5个block_type');
        return itemBlocks;
    }

    // 步骤2：根据block_type为每个item分配model_type、prompt和model
    assignModelTypesToItems(itemBlocks) {
        const itemConfigs = {}; // 存储每个item的配置
        
        Object.keys(itemBlocks).forEach(blockTypeStr => {
            const blockType = parseInt(blockTypeStr);
            const items = itemBlocks[blockType];
            
            // 根据block_type确定model_type分配
            const modelTypeAllocation = this.getModelTypeAllocation(blockType);
            
            // 应用伪随机规则：确保不超过3个连续的相同model_type
            const pseudoRandomAllocation = this.applyPseudoRandomRule(modelTypeAllocation);
            
            // 为每个item分配model_type和配置
            items.forEach((itemNum, index) => {
                const modelType = pseudoRandomAllocation[index];
                const modelTypeName = this.modelTypeNames[modelType];
                const config = this.modelConfigs[modelTypeName];
                
                itemConfigs[itemNum] = {
                    block_type: blockType,
                    model_type: modelType,
                    model: config.model,
                    system_prompt: config.systemPrompt
                };
            });
        });
        
        console.log('步骤2完成：为每个item分配model_type和对应配置');
        return itemConfigs;
    }

    // 步骤3：伪随机化同一block_type内部的item顺序
    randomizeItemOrderWithinBlocks(itemBlocks) {
        const randomizedItemBlocks = {};
        
        Object.keys(itemBlocks).forEach(blockTypeStr => {
            const blockType = parseInt(blockTypeStr);
            const items = [...itemBlocks[blockType]]; // 复制数组
            
            // 打乱该block_type内的item顺序
            this.shuffleArray(items);
            
            randomizedItemBlocks[blockType] = items;
        });
        
        console.log('步骤3完成：伪随机化每个block_type内的item顺序');
        return randomizedItemBlocks;
    }

    // 步骤4：生成最终的trials数据
    generateTrialsWithBlockOrder(itemBlocks, itemConfigs, blockOrder) {
        const allTrials = [];
        let globalTrialNum = 1; // 全局trial编号
        
        // 按照blockOrder的顺序生成trials
        blockOrder.forEach((blockType, blockOrderIndex) => {
            const items = itemBlocks[blockType];
            
            items.forEach((itemNum, trialOrderIndex) => {
                const config = itemConfigs[itemNum];
                const scenario = this.scenarioData.find(s => s.item === itemNum);
                
                if (scenario && config) {
                    allTrials.push({
                        trial: globalTrialNum,                    // 全局trial编号
                        block_type: config.block_type,            // block类型（1-5）
                        block_order: blockOrderIndex + 1,         // 该block的呈现顺序
                        trial_order: trialOrderIndex + 1,         // 该trial在block内的顺序
                        item: itemNum,                            // item编号
                        scenario: scenario.scenario,              // 情境文本
                        model_type: config.model_type,            // model类型（1-3）
                        model: config.model,                      // 模型名称
                        system_prompt: config.system_prompt       // 系统提示词
                    });
                    globalTrialNum++;
                }
            });
        });
        
        console.log('步骤4完成：生成最终trials数据，共', allTrials.length, '个trials');
        return allTrials;
    }

    // 根据block类型获取model type分配
    getModelTypeAllocation(blockType) {
        switch (blockType) {
            case 5: // very polite
                return Array(20).fill(3); // 全部polite
            case 4: // little polite
                return [...Array(10).fill(3), ...Array(10).fill(2)]; // 10个polite + 10个neutral
            case 3: // neutral
                return Array(20).fill(2); // 全部neutral
            case 2: // little impolite
                return [...Array(10).fill(2), ...Array(10).fill(1)]; // 10个neutral + 10个impolite
            case 1: // very impolite
                return Array(20).fill(1); // 全部impolite
            default:
                return Array(20).fill(2); // 默认neutral
        }
    }

    // 应用伪随机规则：确保不超过3个连续的相同model type
    applyPseudoRandomRule(modelTypeAllocation) {
        const result = [...modelTypeAllocation];
        const maxConsecutive = 3;
        
        // 先随机打乱
        this.shuffleArray(result);
        
        // 检查并修复连续相同的情况
        for (let i = 0; i < result.length - maxConsecutive; i++) {
            // 检查从位置i开始的连续相同元素
            let consecutiveCount = 1;
            const currentType = result[i];
            
            // 计算连续相同元素的数量
            for (let j = i + 1; j < result.length; j++) {
                if (result[j] === currentType) {
                    consecutiveCount++;
                } else {
                    break;
                }
            }
            
            // 如果超过最大连续数，需要重新排列
            if (consecutiveCount > maxConsecutive) {
                // 找到可以交换的位置
                const swapIndex = this.findSwapIndex(result, i + maxConsecutive, currentType);
                if (swapIndex !== -1) {
                    // 交换元素
                    [result[i + maxConsecutive], result[swapIndex]] = [result[swapIndex], result[i + maxConsecutive]];
                }
            }
        }
        
        return result;
    }

    // 找到可以交换的位置（避免连续相同）
    findSwapIndex(array, startIndex, avoidType) {
        for (let i = startIndex; i < array.length; i++) {
            if (array[i] !== avoidType) {
                return i;
            }
        }
        return -1; // 没有找到合适的交换位置
    }


    // 主函数：生成完整的随机化实验条件
    generateRandomizedConditions() {
        console.log('=== 开始生成随机化实验条件 ===\n');
        
        // 步骤1：将100个scenario随机分配到5个block_type中
        const itemBlocks = this.randomizeItemsToBlocks();
        
        // 步骤2：根据block_type为每个item分配model_type、prompt和model
        const itemConfigs = this.assignModelTypesToItems(itemBlocks);
        
        // 步骤3：伪随机化同一block_type内部的item顺序
        const randomizedItemBlocks = this.randomizeItemOrderWithinBlocks(itemBlocks);
        
        // 步骤4：随机化block_type的呈现顺序
        const blockOrder = [...this.blockTypes];
        this.shuffleArray(blockOrder);
        console.log('步骤4完成：block_type呈现顺序 =', blockOrder);
        
        // 步骤5：生成最终的trials数据
        const allTrials = this.generateTrialsWithBlockOrder(
            randomizedItemBlocks, 
            itemConfigs, 
            blockOrder
        );
        
        // 记录随机化信息（保存打乱后的itemBlocks以便准确恢复）
        const randomizationInfo = {
            timestamp: new Date().toISOString(),
            itemBlocks: randomizedItemBlocks,    // 打乱后的item分配（用于恢复）
            itemConfigs: itemConfigs,            // 每个item的配置（用于恢复）
            blockOrder: blockOrder,              // block呈现顺序
            totalTrials: allTrials.length
        };
        
        console.log('\n=== 随机化完成！===');
        console.log('总trials数：', allTrials.length);
        console.log('Block呈现顺序：', blockOrder.map(bt => this.blockTypeNames[bt]));
        
        return {
            conditionData: allTrials,
            randomizationInfo: randomizationInfo
        };
    }

    // 工具函数：数组随机打乱
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // 验证随机化结果
    validateRandomization(result) {
        const { conditionData, randomizationInfo } = result;
        
        console.log('\n=== 验证随机化结果 ===');
        
        // 检查每个block_type是否有20个trials
        const blockTypeCounts = {};
        conditionData.forEach(trial => {
            blockTypeCounts[trial.block_type] = (blockTypeCounts[trial.block_type] || 0) + 1;
        });
        
        console.log('各block_type的trial数量：', blockTypeCounts);
        
        // 检查model_type分布
        const modelTypeCounts = {};
        conditionData.forEach(trial => {
            const key = `${trial.block_type}_${trial.model_type}`;
            modelTypeCounts[key] = (modelTypeCounts[key] || 0) + 1;
        });
        
        console.log('各block_type的model_type分布：', modelTypeCounts);
        
        // 验证每个block_type的model_type配置是否正确
        const expectedDistribution = {
            1: { 1: 20 },              // very impolite: 全部impolite
            2: { 1: 10, 2: 10 },       // little impolite: 10个impolite + 10个neutral
            3: { 2: 20 },              // neutral: 全部neutral
            4: { 2: 10, 3: 10 },       // little polite: 10个neutral + 10个polite
            5: { 3: 20 }               // very polite: 全部polite
        };
        
        let distributionCorrect = true;
        for (let blockType = 1; blockType <= 5; blockType++) {
            const expected = expectedDistribution[blockType];
            for (let modelType in expected) {
                const key = `${blockType}_${modelType}`;
                const actual = modelTypeCounts[key] || 0;
                const expectedCount = expected[modelType];
                if (actual !== expectedCount) {
                    console.warn(`⚠️ Block ${blockType}, Model ${modelType}: 预期${expectedCount}个，实际${actual}个`);
                    distributionCorrect = false;
                }
            }
        }
        
        const isValid = Object.values(blockTypeCounts).every(count => count === 20) && distributionCorrect;
        
        console.log(isValid ? '✅ 验证通过' : '❌ 验证失败');
        
        return {
            isValid: isValid,
            blockTypeCounts: blockTypeCounts,
            modelTypeCounts: modelTypeCounts
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExperimentRandomizer;
}
