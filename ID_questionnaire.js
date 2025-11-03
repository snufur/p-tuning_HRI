// ========== 独立个体差异问卷模块 ==========
// 此模块包含被试个人信息收集和个体差异问卷功能
// 2025-10-27：考虑增加Anthropomorphism Quotient (AQ)量表。

// ========== 配置 ==========
const ID_CONFIG = {
    TEXT_CONFIG: {
        font: 'SimHei, Arial, sans-serif',
        mainTextHeight: '2.5vh',
        titleHeight: '3vh',
        smallTextHeight: '2vh',
        mainColor: '#000000',
        highlightColor: '#FF8C00',
        tipColor: '#808080'
    }
};

// ========== UI界面管理 ==========
class IndividualDifferenceUI {
    constructor() {
        this.setupStyles();
    }

    // 设置CSS样式
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .experiment-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                font-family: ${ID_CONFIG.TEXT_CONFIG.font};
                z-index: 1000;
            }
            .text-display {
                max-width: 80vw;
                text-align: center;
                line-height: 1.6;
                margin: 20px;
                white-space: pre-wrap;
                font-size: ${ID_CONFIG.TEXT_CONFIG.mainTextHeight};
                color: ${ID_CONFIG.TEXT_CONFIG.mainColor};
            }
            .score-container {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 15px;
                margin: 20px 0 10px 0;
            }
            .score-labels-container {
                display: flex;
                justify-content: center;
                align-items: flex-start;
                gap: 15px;
                margin: 0 0 30px 0;
            }
            .score-label {
                width: 60px;
                text-align: center;
                font-size: 1.6vh;
                color: #666;
                line-height: 1.3;
                word-wrap: break-word;
            }
            .score-option {
                width: 60px;
                height: 60px;
                border: 2px solid black;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.2s;
                user-select: none;
            }
            .score-option.selected {
                background: red;
                color: white;
                border-color: red;
                transform: scale(1.1);
            }
            .score-option.disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }
            .score-option:not(.disabled):hover {
                background: #f0f0f0;
                transform: scale(1.05);
            }
            .countdown-text {
                font-size: ${ID_CONFIG.TEXT_CONFIG.mainTextHeight};
                color: ${ID_CONFIG.TEXT_CONFIG.highlightColor};
                font-weight: bold;
                margin: 20px 0;
            }
            .button-group {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 20px;
            }
            .btn {
                padding: 12px 24px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 20px;
                font-family: ${ID_CONFIG.TEXT_CONFIG.font};
                transition: background 0.3s;
            }
            .btn-primary { 
                background: #4CAF50; 
                color: white; 
            }
            .btn-primary:hover { background: #45a049; }
            .btn-secondary { 
                background: #f44336; 
                color: white; 
            }
            .btn-secondary:hover { background: #da190b; }
            .btn-default { 
                background: #2196F3; 
                color: white; 
            }
            .btn-default:hover { background: #0b7dda; }
        `;
        document.head.appendChild(style);
    }

    // 显示文本屏幕
    showScreen(content, options = {}) {
        return new Promise((resolve) => {
            const screen = document.createElement('div');
            screen.className = 'experiment-screen';
            
            const textDiv = document.createElement('div');
            textDiv.className = 'text-display';
            textDiv.style.cssText = `
                white-space: pre-line;
                line-height: 1.6;
                font-size: 20px;
                text-align: left;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
            `;
            textDiv.textContent = content;
            screen.appendChild(textDiv);
            
            if (options.showContinue) {
                const continueText = document.createElement('div');
                continueText.className = 'text-display';
                continueText.textContent = '按回车键继续...';
                continueText.style.cssText = `
                    color: ${ID_CONFIG.TEXT_CONFIG.tipColor};
                    text-align: center;
                    margin-top: 20px;
                `;
                screen.appendChild(continueText);
            }
            
            document.body.appendChild(screen);
            
            const handleKeyPress = (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    document.removeEventListener('keydown', handleKeyPress);
                    document.body.removeChild(screen);
                    resolve();
                } else if (event.key === 'Escape') {
                    document.removeEventListener('keydown', handleKeyPress);
                    document.body.removeChild(screen);
                    resolve('escape');
                }
            };
            
            document.addEventListener('keydown', handleKeyPress);
        });
    }

    // 显示评分选择界面（带2秒倒计时，鼠标点击选择）
    showScoreSelection(prompt, minScore = 1, maxScore = 7) {
        return new Promise((resolve) => {
            const screen = document.createElement('div');
            screen.className = 'experiment-screen';
            
            const promptDiv = document.createElement('div');
            promptDiv.className = 'text-display';
            promptDiv.textContent = prompt;
            screen.appendChild(promptDiv);
            
            const scoreContainer = document.createElement('div');
            scoreContainer.className = 'score-container';
            
            const scores = [];
            let selectedIndex = Math.floor((maxScore - minScore) / 2);
            let canSelect = false;
            
            for (let i = minScore; i <= maxScore; i++) {
                scores.push(i);
                const scoreOption = document.createElement('div');
                scoreOption.className = 'score-option disabled';
                scoreOption.textContent = i;
                scoreOption.dataset.index = scores.length - 1;
                
                if (scores.length - 1 === selectedIndex) {
                    scoreOption.classList.add('selected');
                }
                
                scoreContainer.appendChild(scoreOption);
            }
            
            screen.appendChild(scoreContainer);
            
            const instructionDiv = document.createElement('div');
            instructionDiv.className = 'text-display';
            instructionDiv.textContent = '请等待倒计时结束后用鼠标点击选择评分。';
            instructionDiv.style.color = ID_CONFIG.TEXT_CONFIG.tipColor;
            screen.appendChild(instructionDiv);
            
            const countdownDiv = document.createElement('div');
            countdownDiv.className = 'countdown-text';
            countdownDiv.textContent = '请仔细思考，2秒后开始选择...';
            screen.appendChild(countdownDiv);
            
            document.body.appendChild(screen);
            
            const updateSelection = () => {
                document.querySelectorAll('.score-option').forEach((option, index) => {
                    if (index === selectedIndex) {
                        option.classList.add('selected');
                    } else {
                        option.classList.remove('selected');
                    }
                });
            };
            
            // 2秒倒计时
            let countdown = 2;
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    countdownDiv.textContent = `请仔细思考，${countdown}秒后开始选择...`;
                } else {
                    clearInterval(countdownInterval);
                    countdownDiv.textContent = '请用鼠标点击选择评分，按回车确认。';
                    countdownDiv.style.color = ID_CONFIG.TEXT_CONFIG.mainColor;
                    
                    // 启用选择
                    canSelect = true;
                    document.querySelectorAll('.score-option').forEach(option => {
                        option.classList.remove('disabled');
                    });
                    updateSelection();
                }
            }, 1000);
            
            // 鼠标点击事件
            scoreContainer.addEventListener('click', (event) => {
                if (!canSelect) return;
                
                const scoreOption = event.target.closest('.score-option');
                if (scoreOption) {
                    selectedIndex = parseInt(scoreOption.dataset.index);
                    updateSelection();
                }
            });
            
            // 键盘事件
            const handleKeyPress = (event) => {
                if (event.key === 'ArrowLeft' && canSelect) {
                    selectedIndex = Math.max(0, selectedIndex - 1);
                    updateSelection();
                } else if (event.key === 'ArrowRight' && canSelect) {
                    selectedIndex = Math.min(scores.length - 1, selectedIndex + 1);
                    updateSelection();
                } else if (event.key === 'Enter' && canSelect) {
                    document.removeEventListener('keydown', handleKeyPress);
                    document.body.removeChild(screen);
                    resolve(scores[selectedIndex]);
                } else if (event.key === 'Escape') {
                    document.removeEventListener('keydown', handleKeyPress);
                    document.body.removeChild(screen);
                    resolve('escape');
                }
            };
            
            document.addEventListener('keydown', handleKeyPress);
        });
    }

    // 显示带选项的问题（用于AQ等量表，带2秒倒计时，鼠标点击选择，数字+标签形式）
    showQuestionWithOptions(prompt, options, countdownMs = 2000) {
        return new Promise((resolve) => {
            const screen = document.createElement('div');
            screen.className = 'experiment-screen';
            
            const promptDiv = document.createElement('div');
            promptDiv.className = 'text-display';
            promptDiv.textContent = prompt;
            screen.appendChild(promptDiv);
            
            // 创建数字选项容器（横向排列）
            const scoreContainer = document.createElement('div');
            scoreContainer.className = 'score-container';
            
            let selectedIndex = Math.floor(options.length / 2);
            let canSelect = false;
            
            // 创建数字选项（1, 2, 3, 4...）
            for (let i = 0; i < options.length; i++) {
                const scoreOption = document.createElement('div');
                scoreOption.className = 'score-option disabled';
                scoreOption.textContent = i + 1; // 显示数字 1, 2, 3, 4
                scoreOption.dataset.index = i;
                
                if (i === selectedIndex) {
                    scoreOption.classList.add('selected');
                }
                
                scoreContainer.appendChild(scoreOption);
            }
            
            screen.appendChild(scoreContainer);
            
            // 创建标签容器（显示文字说明）
            const labelsContainer = document.createElement('div');
            labelsContainer.className = 'score-labels-container';
            
            options.forEach(label => {
                const labelDiv = document.createElement('div');
                labelDiv.className = 'score-label';
                labelDiv.textContent = label;
                labelsContainer.appendChild(labelDiv);
            });
            
            screen.appendChild(labelsContainer);
            
            const instructionDiv = document.createElement('div');
            instructionDiv.className = 'text-display';
            instructionDiv.textContent = '请等待倒计时结束后用鼠标点击选择评分。';
            instructionDiv.style.color = ID_CONFIG.TEXT_CONFIG.tipColor;
            screen.appendChild(instructionDiv);
            
            const countdownDiv = document.createElement('div');
            countdownDiv.className = 'countdown-text';
            const countdownSeconds = Math.floor(countdownMs / 1000);
            countdownDiv.textContent = `请仔细思考，${countdownSeconds}秒后开始选择...`;
            screen.appendChild(countdownDiv);
            
            document.body.appendChild(screen);
            
            const updateSelection = () => {
                document.querySelectorAll('.score-option').forEach((option, index) => {
                    if (index === selectedIndex) {
                        option.classList.add('selected');
                    } else {
                        option.classList.remove('selected');
                    }
                });
            };
            
            // 倒计时
            let countdown = countdownSeconds;
            const countdownInterval = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    countdownDiv.textContent = `请仔细思考，${countdown}秒后开始选择...`;
                } else {
                    clearInterval(countdownInterval);
                    countdownDiv.textContent = '请用鼠标点击选择评分，按回车确认。';
                    countdownDiv.style.color = ID_CONFIG.TEXT_CONFIG.mainColor;
                    
                    // 启用选择
                    canSelect = true;
                    document.querySelectorAll('.score-option').forEach(option => {
                        option.classList.remove('disabled');
                    });
                    updateSelection();
                }
            }, 1000);
            
            // 鼠标点击事件
            scoreContainer.addEventListener('click', (event) => {
                if (!canSelect) return;
                
                const optionDiv = event.target.closest('.score-option');
                if (optionDiv) {
                    selectedIndex = parseInt(optionDiv.dataset.index);
                    updateSelection();
                }
            });
            
            // 键盘事件（改为左右箭头）
            const handleKeyPress = (event) => {
                if (event.key === 'ArrowLeft' && canSelect) {
                    selectedIndex = Math.max(0, selectedIndex - 1);
                    updateSelection();
                } else if (event.key === 'ArrowRight' && canSelect) {
                    selectedIndex = Math.min(options.length - 1, selectedIndex + 1);
                    updateSelection();
                } else if (event.key === 'Enter' && canSelect) {
                    clearInterval(countdownInterval);
                    document.removeEventListener('keydown', handleKeyPress);
                    document.body.removeChild(screen);
                    resolve(selectedIndex + 1); // 返回1-based的索引（1-4对应选项1-4）
                } else if (event.key === 'Escape') {
                    clearInterval(countdownInterval);
                    document.removeEventListener('keydown', handleKeyPress);
                    document.body.removeChild(screen);
                    resolve('escape');
                }
            };
            
            document.addEventListener('keydown', handleKeyPress);
        });
    }

    // 显示参与者信息收集界面
    showParticipantInfoForm() {
        return new Promise((resolve) => {
            const screen = document.createElement('div');
            screen.className = 'experiment-screen';
            
            const title = document.createElement('h2');
            title.textContent = '参与者基本信息';
            title.style.cssText = `
                text-align: center;
                margin-bottom: 30px;
                margin-top: 50px;
                color: #333;
                font-size: 24px;
            `;
            screen.appendChild(title);
            
            const form = document.createElement('div');
            form.style.cssText = `
                max-width: 900px;
                max-height: 60vh;
                overflow-y: auto;
                margin: 0 auto;
                padding: 30px;
                background-color: #f9f9f9;
                border-radius: 10px;
            `;
            
            // 姓名输入
            const nameSection = this.createFormSection('姓名', 'text', '请输入您的姓名');
            form.appendChild(nameSection);
            
            // 手机号输入
            const phoneSection = this.createFormSection('手机号', 'tel', '请输入您的手机号');
            form.appendChild(phoneSection);
            
            // 提交按钮
            const submitBtn = document.createElement('button');
            submitBtn.textContent = '提交信息';
            submitBtn.style.cssText = `
                display: block;
                width: 600px;
                margin: 30px auto 0;
                padding: 12px 24px;
                font-size: 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                opacity: 0.5;
                pointer-events: none;
            `;
            
            form.appendChild(submitBtn);
            screen.appendChild(form);
            document.body.appendChild(screen);
            
            // 验证表单完整性
            const validateForm = () => {
                const name = document.getElementById('name').value.trim();
                const phone = document.getElementById('phone').value.trim();
                
                const isValid = name && phone;
                
                if (isValid) {
                    submitBtn.style.opacity = '1';
                    submitBtn.style.pointerEvents = 'auto';
                } else {
                    submitBtn.style.opacity = '0.5';
                    submitBtn.style.pointerEvents = 'none';
                }
            };
            
            // 添加事件监听器
            document.getElementById('name').addEventListener('input', validateForm);
            document.getElementById('phone').addEventListener('input', validateForm);
            
            // 提交处理
            submitBtn.onclick = () => {
                const participantInfo = {
                    name: document.getElementById('name').value.trim(),
                    phone: document.getElementById('phone').value.trim(),
                    participant: `${document.getElementById('name').value.trim()}_${document.getElementById('phone').value.trim()}`
                };
                
                document.body.removeChild(screen);
                resolve(participantInfo);
            };
            
            // 初始验证
            validateForm();
        });
    }
    
    // 创建表单字段
    createFormSection(label, type, placeholder, min = '', max = '') {
        const section = document.createElement('div');
        section.style.cssText = `margin-bottom: 30px;`;
        
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            display: block;
            margin-bottom: 12px;
            font-weight: bold;
            color: #333;
            font-size: 18px;
        `;
        
        const input = document.createElement('input');
        input.type = type;
        input.id = label === '姓名' ? 'name' : label === '年龄' ? 'age' : 'phone';
        input.placeholder = placeholder;
        if (min) input.min = min;
        if (max) input.max = max;
        input.style.cssText = `
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        `;
        
        section.appendChild(labelElement);
        section.appendChild(input);
        return section;
    }
    
    // 创建单选按钮组
    createRadioSection(label, options, name) {
        const section = document.createElement('div');
        section.style.cssText = `margin-bottom: 30px;`;
        
        const labelElement = document.createElement('label');
        labelElement.textContent = label;
        labelElement.style.cssText = `
            display: block;
            margin-bottom: 12px;
            font-weight: bold;
            color: #333;
            font-size: 18px;
        `;
        
        const radioGroup = document.createElement('div');
        radioGroup.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;
        
        options.forEach((option, index) => {
            const radioContainer = document.createElement('div');
            radioContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = name;
            radio.value = option;
            radio.id = `${name}_${index}`;
            radio.style.cssText = `
                width: 20px;
                height: 20px;
                cursor: pointer;
            `;
            
            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = `${name}_${index}`;
            radioLabel.textContent = option;
            radioLabel.style.cssText = `
                cursor: pointer;
                user-select: none;
                font-size: 16px;
            `;
            
            radioContainer.appendChild(radio);
            radioContainer.appendChild(radioLabel);
            radioGroup.appendChild(radioContainer);
        });
        
        section.appendChild(labelElement);
        section.appendChild(radioGroup);
        return section;
    }

    // 显示恢复选择界面
    showResumeChoiceScreen(message) {
        return new Promise((resolve) => {
            const screen = document.createElement('div');
            screen.className = 'experiment-screen';
            
            const messageDiv = document.createElement('div');
            messageDiv.className = 'text-display';
            messageDiv.textContent = message;
            screen.appendChild(messageDiv);
            
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'button-group';
            
            const resumeBtn = document.createElement('button');
            resumeBtn.className = 'btn btn-primary';
            resumeBtn.textContent = '继续问卷';
            resumeBtn.onclick = () => {
                document.body.removeChild(screen);
                resolve('resume');
            };
            
            const restartBtn = document.createElement('button');
            restartBtn.className = 'btn btn-default';
            restartBtn.textContent = '重新开始';
            restartBtn.onclick = () => {
                document.body.removeChild(screen);
                resolve('restart');
            };
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = '取消';
            cancelBtn.onclick = () => {
                document.body.removeChild(screen);
                resolve('cancel');
            };
            
            buttonGroup.appendChild(resumeBtn);
            buttonGroup.appendChild(restartBtn);
            buttonGroup.appendChild(cancelBtn);
            screen.appendChild(buttonGroup);
            
            document.body.appendChild(screen);
        });
    }
}

// ========== 个体差异测量管理 ==========
class IndividualDifferenceManager {
    constructor() {
        this.ui = new IndividualDifferenceUI();
        this.data = null;
    }

    // 获取参与者信息
    async getParticipantInfo() {
        const participantInfo = await this.ui.showParticipantInfoForm();
        if (participantInfo === null) return null;
        return participantInfo;
    }

    // 检查是否有未完成的数据
    static checkExistingData(participantId) {
        try {
            const storageKey = `individual_difference_data_${participantId}`;
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                return {
                    exists: true,
                    participantInfo: parsed.participantInfo || null,
                    individualDifferenceData: parsed.individualDifferenceData || {}
                };
            }
            return { exists: false };
        } catch (error) {
            console.error('检查现有数据失败:', error);
            return { exists: false };
        }
    }

    // 检查已完成的问卷进度
    checkProgress() {
        if (!this.data || !this.data.individualDifferenceData) return null;
        
        const progress = {};
        
        // 检查EQ量表完成情况（40题）
        if (this.data.individualDifferenceData.EQ) {
            const eqData = this.data.individualDifferenceData.EQ;
            let completedCount = 0;
            for (let i = 1; i <= 40; i++) {
                if (eqData[`Q${i}`] !== undefined) completedCount++;
            }
            if (completedCount === 40) progress.EQ = true;
        }
        
        // 检查AQ量表完成情况（50题）
        if (this.data.individualDifferenceData.AQ) {
            const aqData = this.data.individualDifferenceData.AQ;
            let completedCount = 0;
            for (let i = 1; i <= 50; i++) {
                if (aqData[`Q${i}`] !== undefined) completedCount++;
            }
            if (completedCount === 50) progress.AQ = true;
        }
        
        // 检查GAAIS量表完成情况（20题）
        if (this.data.individualDifferenceData.GAAIS) {
            const GAAISData = this.data.individualDifferenceData.GAAIS;
            let completedCount = 0;
            for (let i = 1; i <= 20; i++) {
                if (GAAISData[`Q${i}`] !== undefined) completedCount++;
            }
            if (completedCount === 20) progress.GAAIS = true;
        }
        
        // 检查IDAQ量表完成情况（15题）
        if (this.data.individualDifferenceData.IDAQ) {
            const idaqData = this.data.individualDifferenceData.IDAQ;
            let completedCount = 0;
            for (let i = 1; i <= 15; i++) {
                if (idaqData[`Q${i}`] !== undefined) completedCount++;
            }
            if (completedCount === 15) progress.IDAQ = true;
        }
        
        return progress;
    }

    // 同理心量表（EQ）
    async runEQQuestionnaire(resumeFromQuestion = 0) {
        const instruction = `接下来是同理心量表（EQ）。

请您仔细阅读每一道题目，并根据您的实际情况选择最符合的选项。

每个问题有四个选项：
• 非常不同意
• 有点不同意  
• 有点同意
• 非常同意

请根据您的真实感受作答，没有对错之分。

每个问题将有 2 秒思考时间
倒计时结束后可以选择答案。`;
        
        await this.ui.showScreen(instruction, { showContinue: true });
        
        const questions = [
            "第1题\n我可以轻易判断别人是否想要加入谈话",
            "第2题\n有些我觉得很简单的事，别人却无法立刻了解，可是我不知道该怎么向别人说明这些事",
            "第3题\n我非常乐于照顾别人",
            "第4题\n在社交场合中我会感觉手足无措",
            "第5题\n在讨论事情时，别人常会说我离题了",
            "第6题\n我不太在意与朋友聚会时是否会迟到",
            "第7题\n友情与爱情关系都很复杂，所以我尽量避免这些关系",
            "第8题\n我常无法判断自己的行为是礼貌还是不礼貌",
            "第9题\n与人交谈时，我往往只专注在自己的言谈思绪，而不会去顾虑对方怎么想",
            "第10题\n我小时候喜欢把昆虫剖开，看看会发生什么事",
            "第11题\n我可以很快的理解别人谈话中的言外之意",
            "第12题\n我无法理解为什么有些事会令别人如此沮丧",
            "第13题\n对我而言，设身处地为别人着想并不困难",
            "第14题\n我很能预测别人的感受",
            "第15题\n当团体中有人觉得不愉快或不舒服时，我可以很快觉察到",
            "第16题\n假如我的话冒犯到别人，我认为那是别人有问题，与我无关",
            "第17题\n假如有人问我是否喜欢他们的发型，即使不喜欢，我也会诚实回答",
            "第18题\n我常常无法理解为什么有些话会冒犯到别人",
            "第19题\n看到别人哭泣并不会令我感到难过",
            "第20题\n别人常觉得我的直率个性没有礼貌，即便我并不是有意的",
            "第21题\n社交场合的应对不会让我感到困扰",
            "第22题\n别人说我很善解人意",
            "第23题\n与别人交谈时，我比较倾向谈论他们的经历，而不是我自己的",
            "第24题\n看到动物受苦我会难过",
            "第25题\n我做决定时可以不顾他人的感受",
            "第26题\n我清楚知道别人对于我所说的话是否感到有兴趣或无聊",
            "第27题\n在新闻中看到别人遭受苦难，我会感到难过",
            "第28题\n朋友认为我很善解人意，因此他们常对我诉说心事",
            "第29题\n我能够意会到是否打扰到别人，即使别人并没有明说",
            "第30题\n有时候别人会认为我的玩笑开得太过头了",
            "第31题\n我不明白为什么别人总说我感觉迟钝",
            "第32题\n当我看到团体中有陌生人加入，我认为他们自己要够努力，才能融入团体",
            "第33题\n看电影时，我的情绪不会受电影情节影响",
            "第34题\n我可以很敏锐地体会别人的感受",
            "第35题\n我可以轻易猜出别人想要讲的话",
            "第36题\n我可以轻易看出别人是否在隐藏他们真实的情绪",
            "第37题\n我能轻松掌握一些社交场合的规范",
            "第38题\n我很能预知别人下一步会做什么事情",
            "第39题\n对于朋友遭遇到的困扰，我能感同身受",
            "第40题\n对于别人的想法，即使我并不赞同，往往还是会给予尊重"
        ];
        
        const options = ['非常不同意', '有点不同意', '有点同意', '非常同意'];
        const scores = [];
        
        // 如果是从中间恢复，先加载已保存的分数
        if (resumeFromQuestion > 0 && this.data && this.data.individualDifferenceData && this.data.individualDifferenceData.EQ) {
            // 加载已保存的分数
            const saved = this.data.individualDifferenceData.EQ;
            for (let i = 0; i < resumeFromQuestion; i++) {
                scores.push(saved[`Q${i + 1}`]);
            }
        }
        
        // 从指定题目开始或继续
        for (let i = resumeFromQuestion; i < questions.length; i++) {
            const score = await this.ui.showQuestionWithOptions(questions[i], options, 2000);
            if (score === 'escape') return 'escape';
            scores.push(score);
            
            // 实时保存
            this.savePartialData('EQ', scores);
        }
        
        return scores;
    }

    // 孤独症商数量表（AQ）
    async runAQQuestionnaire(resumeFromQuestion = 0) {
        const instruction = `接下来是孤独症商数量表（AQ）。

请您仔细阅读每一道题目，并根据您的实际情况选择最符合的选项。

每个问题有四个选项：
• 完全不同意
• 有点不同意  
• 有点同意
• 完全同意

请根据您的真实感受作答，没有对错之分。

每个问题将有 2 秒思考时间
倒计时结束后可以选择答案。`;
        
        await this.ui.showScreen(instruction, { showContinue: true });
        
        const questions = [
            "第1题\n比起独立完成事情，我比较喜欢跟别人一起合作",
            "第2题\n我比较喜欢一直沿用相同的方法来做事情",
            "第3题\n当我试着想象某事时，我脑中很容易就出现画面",
            "第4题\n我经常过分地投入于一件事，而忽略了其他的事情",
            "第5题\n我经常注意到别人没察觉到的微小声音",
            "第6题\n我常注意车子的车牌或类似的一连串的信息",
            "第7题\n虽然我认为我说的话是有礼貌的，但是别人还是经常告诉我我说了不礼貌的话",
            "第8题\n当我阅读故事时，我可以轻易地想象故事人物的样子",
            "第9题\n我对日期着迷（我喜爱与日期相关的事物）",
            "第10题\n在社交聚会中，我可以轻易地保持对不同的人的谈话内容的注意力",
            "第11题\n参与社交场合对我而言很容易",
            "第12题\n我倾向于注意别人没察觉到的细节",
            "第13题\n比起去参加派对，我还是比较喜欢去图书馆",
            "第14题\n编故事对我而言很容易",
            "第15题\n我发现自己对人的兴趣远超过对事情的兴趣",
            "第16题\n我容易产生强烈的兴趣，而当我不能去做我感兴趣的事情时，我会生气",
            "第17题\n我喜爱社交闲谈",
            "第18题\n当我说话时，别人不是很容易能插得上话",
            "第19题\n我对数字着迷（我喜爱与数字有关的事物）",
            "第20题\n当我阅读故事时，去猜测故事中人物的意图对我而言很困难",
            "第21题\n我并不特别喜爱阅读小说",
            "第22题\n交新朋友对我而言很困难",
            "第23题\n我总是会注意各种事物的模式（例如：如何分类、是否有因果关系或可预测性等）",
            "第24题\n比起去博物馆，我还是比较喜欢去戏院",
            "第25题\n如果我每天的生活作息被打乱了，我也不会生气",
            "第26题\n我经常发现我不知如何使对话持续下去",
            "第27题\n与人谈话时，我能很轻易地察觉对方的言外之意",
            "第28题\n我通常比较专注于大局，而非小细节",
            "第29题\n我不擅长记住电话号码",
            "第30题\n我通常不会注意到环境中或是人的外表的细微改变",
            "第31题\n我知道如何辨别别人是否已厌倦听我说话",
            "第32题\n同时做两件以上的事情对我来说是容易的",
            "第33题\n当我讲电话时，我不太确定什么时候该我接话",
            "第34题\n我喜爱随性地做事情",
            "第35题\n我常常是最后一个理解笑话中笑点的人",
            "第36题\n我可以看别人的表情就轻易地猜出他们的想法或感觉",
            "第37题\n当被打扰后，我可以很快地转换回被打扰前在做的事",
            "第38题\n我擅长社交闲谈",
            "第39题\n别人常告诉我我总是重复地说同样的事",
            "第40题\n儿童时期我喜爱与玩伴玩假装性质的游戏（例如：过家家）",
            "第41题\n我喜欢收集事物类别的相关资讯（例如：有关车子类、鸟类、火车类或植物类的资讯）",
            "第42题\n我很难去想象成为另外一个人是什么样子",
            "第43题\n我喜欢仔细地计划我参与的任何一项活动",
            "第44题\n我喜爱社交场合",
            "第45题\n猜测别人的意图对我而言很困难",
            "第46题\n新的局势会让我焦虑",
            "第47题\n我喜爱认识新朋友",
            "第48题\n我是个善于交际的人",
            "第49题\n我不擅长记住别人的生日",
            "第50题\n跟儿童玩假装性质的游戏对我而言很容易"
        ];
        
        const options = ['完全不同意', '有点不同意', '有点同意', '完全同意'];
        const scores = [];
        
        // 如果是从中间恢复，先加载已保存的分数
        if (resumeFromQuestion > 0 && this.data && this.data.individualDifferenceData && this.data.individualDifferenceData.AQ) {
            // 加载已保存的分数
            const saved = this.data.individualDifferenceData.AQ;
            for (let i = 0; i < resumeFromQuestion; i++) {
                scores.push(saved[`Q${i + 1}`]);
            }
        }
        
        // 从指定题目开始或继续
        for (let i = resumeFromQuestion; i < questions.length; i++) {
            const score = await this.ui.showQuestionWithOptions(questions[i], options, 2000);
            if (score === 'escape') return 'escape';
            scores.push(score);
            
            // 实时保存
            this.savePartialData('AQ', scores);
        }
        
        return scores;
    }

    // 通用人工智能态度量表（GAAIS）
    async runGAAISQuestionnaire(resumeFromQuestion = 0) {
        const instruction = `接下来是通用人工智能态度量表（GAAIS）。

"人工智能"指的是能够执行通常需要人类智能的任务的设备。
请注意，这些设备可以是计算机、机器人或其他硬件设备，可能配备传感器或摄像头等。

请完成以下量表，对每个条目做出回答。
没有正确或错误答案，我们关注的是您的个人观点。

每个问题有五个选项：
• 非常不同意
• 不同意
• 中立
• 同意
• 非常同意

每个问题将有 2 秒思考时间
倒计时结束后可以选择答案。`;
        
        await this.ui.showScreen(instruction, { showContinue: true });
        
        const questions = [
            "第1题\n在处理日常事务时，我宁愿与人工智能系统互动，而不是与人类",
            "第2题\n人工智能可以为这个国家提供新的经济机会",
            "第3题\n组织会不道德地使用人工智能",
            "第4题\n人工智能系统可以帮助人们感到更快乐",
            "第5题\n我对人工智能所能做的事情印象深刻",
            "第6题\n我认为人工智能系统会犯很多错误",
            "第7题\n我有兴趣在日常生活中使用人工智能系统",
            "第8题\n我觉得人工智能令人不安",
            "第9题\n人工智能可能会控制人类",
            "第10题\n我认为人工智能是危险的",
            "第11题\n人工智能可以对人们的福祉产生积极影响",
            "第12题\n人工智能令人兴奋",
            "第13题\n在许多常规工作中，人工智能代理会比员工做得更好",
            "第14题\n人工智能有许多有益的应用",
            "第15题\n一想到人工智能的未来用途，我就感到不适并发抖",
            "第16题\n人工智能系统可以比人类表现得更好",
            "第17题\n大多数人将受益于充满人工智能的未来",
            "第18题\n我希望在自己的工作中使用人工智能",
            "第19题\n如果人工智能被越来越多地使用，像我这样的人将会受苦",
            "第20题\n人工智能被用来监视人们"
        ];
        
        const options = ['非常不同意', '不同意', '中立', '同意', '非常同意'];
        const scores = [];
        
        // 如果是从中间恢复，先加载已保存的分数
        if (resumeFromQuestion > 0 && this.data && this.data.individualDifferenceData && this.data.individualDifferenceData.GAAIS) {
            // 加载已保存的分数
            const saved = this.data.individualDifferenceData.GAAIS;
            for (let i = 0; i < resumeFromQuestion; i++) {
                scores.push(saved[`Q${i + 1}`]);
            }
        }
        
        // 从指定题目开始或继续
        for (let i = resumeFromQuestion; i < questions.length; i++) {
            const score = await this.ui.showQuestionWithOptions(questions[i], options, 2000);
            if (score === 'escape') return 'escape';
            scores.push(score);
            
            // 实时保存
            this.savePartialData('GAAIS', scores);
        }
        
        return scores;
    }

    // 拟人化个体差异量表（IDAQ）
    async runIDAQQuestionnaire(resumeFromQuestion = 0) {
        const instruction = `接下来是拟人化个体差异量表（IDAQ）。

我们会请您评估不同刺激具备某些能力的程度。
请根据 1 到 7 分的量表进行评估
1 = 完全沒有，7 = 非常高
请选择一个数字以表示您的回答。

每个问题将有 2 秒思考时间
倒计时结束后可以选择评分。`;
        
        await this.ui.showScreen(instruction, { showContinue: true });
        
        const questions = [
            "第一题\n科学技术（例如汽车、电脑等制造、生产设备和机器）在多大程度上有意图？\n\n\n请考虑：这些技术设备是否表现出明确的目标和计划？\n它们的行为是否为有目的性的，而不是随机的？\n\n1=完全没有意图，7=非常有意图",
            "第二题\n普通鱼类在多大程度上拥有自由意志？\n\n\n请考虑：普通鱼类是否能够自主选择如何行动？\n它们的行为是否为主动选择的，而不是被本能强制规定的？\n\n1=完全没有自由意志，7=完全拥有自由意志",
            "第三题\n普通山脉在多大程度上拥有自由意志？\n\n\n请考虑：普通山脉是否能够自主选择如何变化？\n它们的变化是否为主动选择的，而不是被自然规律强制规定的？\n\n1=完全没有自由意志，7=完全拥有自由意志",
            "第四题\n电视机在多大程度上能体验情感？\n\n\n请考虑：电视机是否表现出情感体验能力？\n它的状态是否带有情感色彩，像是能感受到喜怒哀乐？\n\n1=完全不能体验情感，7=完全能体验情感",
            "第五题\n普通机器人在多大程度上具有意识？\n\n\n请考虑：普通机器人是否表现出自我意识？\n它是否像是能够意识到自己的存在和状态？\n\n1=完全没有意识，7=完全有意识",
            "第六题\n牛在多大程度上有意图？\n\n\n请考虑：牛是否表现出明确的目标和计划？\n它的行为是否为有目的性的，而不是随机的？\n\n1=完全没有意图，7=非常有意图",
            "第七题\n汽车在多大程度上拥有自由意志？\n\n\n请考虑：汽车是否能够自主选择如何行动？\n它的行为是否为主动选择的，而不是被程序强制规定的？\n\n1=完全没有自由意志，7=完全拥有自由意志",
            "第八题\n海洋在多大程度上具有意识？\n\n\n请考虑：海洋是否表现出自我意识？\n它是否像是能够意识到自己的存在和状态？\n\n1=完全没有意识，7=完全有意识",
            "第九题\n普通电脑在多大程度上有自己的思想？\n\n\n请考虑：普通电脑是否表现出独立的思考能力？\n它的处理是否为经过自己思考后得出的，而不是简单的预设程序？\n\n1=完全没有自己的想法，7=完全有自己的想法",
            "第十题\n猎豹在多大程度上能体验情感？\n\n\n请考虑：猎豹是否表现出情感体验能力？\n它的行为是否带有情感色彩，像是能感受到喜怒哀乐？\n\n1=完全不能体验情感，7=完全能体验情感",
            "第十一题\n环境在多大程度上能体验情感？\n\n\n请考虑：环境是否表现出情感体验能力？\n它的变化是否带有情感色彩，像是能感受到喜怒哀乐？\n\n1=完全不能体验情感，7=完全能体验情感",
            "第十二题\n普通昆虫在多大程度上有自己的思想？\n\n\n请考虑：普通昆虫是否表现出独立的思考能力？\n它的行为是否为经过自己思考后得出的，而不是简单的本能反应？\n\n1=完全没有自己的想法，7=完全有自己的想法",
            "第十三题\n树在多大程度上有自己的思想？\n\n\n请考虑：树是否表现出独立的思考能力？\n它的生长是否为经过自己思考后得出的，而不是简单的生理反应？\n\n1=完全没有自己的想法，7=完全有自己的想法",
            "第十四题\n风在多大程度上有意图？\n\n\n请考虑：风是否表现出明确的目标和计划？\n它的运动是否为有目的性的，而不是随机的？\n\n1=完全没有意图，7=非常有意图",
            "第十五题\n普通爬行动物在多大程度上有意识？\n\n\n请考虑：普通爬行动物是否表现出自我意识？\n它是否像是能够意识到自己的存在和状态？\n\n1=完全没有意识，7=完全有意识"
        ];
        
        const scores = [];
        
        // 如果有已保存的数据，从上次中断的地方继续
        if (resumeFromQuestion > 0 && this.data && this.data.individualDifferenceData && this.data.individualDifferenceData.IDAQ) {
            // 加载已完成的答案
            const saved = this.data.individualDifferenceData.IDAQ;
            for (let i = 0; i < resumeFromQuestion; i++) {
                const key = `Q${i + 1}`;
                scores.push(saved[key]);
            }
            console.log(`从第${resumeFromQuestion + 1}题继续完成问卷`);
        }
        
        for (let i = resumeFromQuestion; i < questions.length; i++) {
            const question = questions[i];
            const score = await this.ui.showScoreSelection(question, 1, 7);
            if (score === 'escape') return 'escape';
            scores.push(score);
            
            // 每完成一题就保存一次（实现实时保存功能）
            this.savePartialData('IDAQ', scores);
        }
        
        return scores;
    }

    // 保存部分数据（实时保存）
    savePartialData(questionnaireType, scores) {
        if (!this.data || !this.data.individualDifferenceData) return;
        
        this.data.individualDifferenceData[questionnaireType] = {};
        scores.forEach((score, index) => {
            this.data.individualDifferenceData[questionnaireType][`Q${index + 1}`] = score;
        });
        
        this.saveToLocalStorage();
    }

    // 可以添加其他量表的方法
    // async runAQQuestionnaire() {
    //     // AQ量表内容
    // }

    // async runEQQuestionnaire() {
    //     // EQ量表内容
    // }

    // 计算需要恢复的问题数量
    getResumeQuestionNumber(questionnaireType) {
        if (!this.data || !this.data.individualDifferenceData) return 0;
        
        const savedData = this.data.individualDifferenceData[questionnaireType];
        if (!savedData) return 0;
        
        // 根据不同量表类型设定题目总数
        const questionCounts = {
            'EQ': 40,
            'AQ': 50,
            'GAAIS': 20,
            'IDAQ': 15
        };
        
        const totalQuestions = questionCounts[questionnaireType] || 15;
        
        // 统计已完成的题目数
        let count = 0;
        for (let i = 1; i <= totalQuestions; i++) {
            if (savedData[`Q${i}`] !== undefined) {
                count++;
            }
        }
        
        return count;
    }

    // 运行所有个体差异问卷
    async runAllQuestionnaires() {
        // 如果不是恢复模式，初始化数据
        if (!this.data.individualDifferenceData || Object.keys(this.data.individualDifferenceData).length === 0) {
            this.data.individualDifferenceData = {};
        }

        // 检查进度
        const progress = this.checkProgress();
        
        // 1. EQ量表（同理心量表）
        if (!progress || !progress.EQ) {
            const resumeEQNum = this.getResumeQuestionNumber('EQ');
            
            if (resumeEQNum === 0) {
                await this.ui.showScreen('接下来将开始第一部分问卷\n\n━━━━━━━━━━━━━━━━━━━━━━\n同理心量表（EQ）\n━━━━━━━━━━━━━━━━━━━━━━\n\n共40题\n请根据您的真实感受作答', { showContinue: true });
            } else {
                await this.ui.showScreen(`同理心量表（EQ）\n\n检测到未完成的问卷，从第${resumeEQNum + 1}题继续`, { showContinue: true });
            }
            
            const EQScores = await this.runEQQuestionnaire(resumeEQNum);
            if (EQScores === 'escape') return 'escape';
            
            // 保存EQ数据
            this.data.individualDifferenceData.EQ = {};
            EQScores.forEach((score, index) => {
                this.data.individualDifferenceData.EQ[`Q${index + 1}`] = score;
            });
            
            this.saveToLocalStorage();
            
            // 第一部分完成提示
            await this.ui.showScreen('✓ 第一部分问卷已完成！\n\n请稍作休息，准备进入第二部分。', { showContinue: true });
        }
        
        // 2. AQ量表（孤独症商数量表）
        if (!progress || !progress.AQ) {
            const resumeAQNum = this.getResumeQuestionNumber('AQ');
            
            if (resumeAQNum === 0) {
                await this.ui.showScreen('接下来将开始第二部分问卷\n\n━━━━━━━━━━━━━━━━━━━━━━\n孤独症商数量表（AQ）\n━━━━━━━━━━━━━━━━━━━━━━\n\n共50题\n请根据您的真实感受作答', { showContinue: true });
            } else {
                await this.ui.showScreen(`孤独症商数量表（AQ）\n\n检测到未完成的问卷，从第${resumeAQNum + 1}题继续`, { showContinue: true });
            }
            
            const AQScores = await this.runAQQuestionnaire(resumeAQNum);
            if (AQScores === 'escape') return 'escape';
            
            // 保存AQ数据
            this.data.individualDifferenceData.AQ = {};
            AQScores.forEach((score, index) => {
                this.data.individualDifferenceData.AQ[`Q${index + 1}`] = score;
            });
            
            this.saveToLocalStorage();
            
            // 第二部分完成提示
            await this.ui.showScreen('✓ 第二部分问卷已完成！\n\n请稍作休息，准备进入第三部分。', { showContinue: true });
        }
        
        // 3. GAAIS量表（通用人工智能态度量表）
        if (!progress || !progress.GAAIS) {
            const resumeGAAISNum = this.getResumeQuestionNumber('GAAIS');
            
            if (resumeGAAISNum === 0) {
                await this.ui.showScreen('接下来将开始第三部分问卷\n\n━━━━━━━━━━━━━━━━━━━━━━\n通用人工智能态度量表（GAAIS）\n━━━━━━━━━━━━━━━━━━━━━━\n\n共20题\n了解您对人工智能的态度', { showContinue: true });
            } else {
                await this.ui.showScreen(`通用人工智能态度量表（GAAIS）\n\n检测到未完成的问卷，从第${resumeGAAISNum + 1}题继续`, { showContinue: true });
            }
            
            const GAAISScores = await this.runGAAISQuestionnaire(resumeGAAISNum);
            if (GAAISScores === 'escape') return 'escape';
            
            // 保存GAAIS数据
            this.data.individualDifferenceData.GAAIS = {};
            GAAISScores.forEach((score, index) => {
                this.data.individualDifferenceData.GAAIS[`Q${index + 1}`] = score;
            });
            
            this.saveToLocalStorage();
            
            // 第三部分完成提示
            await this.ui.showScreen('✓ 第三部分问卷已完成！\n\n请稍作休息，准备进入第四部分。', { showContinue: true });
        }
        
        // 4. IDAQ量表（拟人化个体差异量表）
        if (!progress || !progress.IDAQ) {
            const resumeIDAQNum = this.getResumeQuestionNumber('IDAQ');
            
            if (resumeIDAQNum === 0) {
                await this.ui.showScreen('接下来将开始第四部分问卷\n\n━━━━━━━━━━━━━━━━━━━━━━\n拟人化个体差异量表（IDAQ）\n━━━━━━━━━━━━━━━━━━━━━━\n\n共15题\n请根据1-7分进行评估', { showContinue: true });
            } else {
                await this.ui.showScreen(`拟人化个体差异量表（IDAQ）\n\n检测到未完成的问卷，从第${resumeIDAQNum + 1}题继续`, { showContinue: true });
            }
            
            const IDAQScores = await this.runIDAQQuestionnaire(resumeIDAQNum);
            if (IDAQScores === 'escape') return 'escape';
            
            // 保存IDAQ数据
            this.data.individualDifferenceData.IDAQ = {};
            IDAQScores.forEach((score, index) => {
                this.data.individualDifferenceData.IDAQ[`Q${index + 1}`] = score;
            });
            
            this.saveToLocalStorage();
        }

        return this.data.individualDifferenceData;
    }

    // 保存数据到本地存储
    saveToLocalStorage() {
        try {
            const storageKey = `individual_difference_data_${this.data.participantInfo.participant}`;
            const payload = {
                participantInfo: this.data.participantInfo,
                individualDifferenceData: this.data.individualDifferenceData
            };
            localStorage.setItem(storageKey, JSON.stringify(payload));
            console.log('个体差异数据已保存到本地存储');
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    }

    // 下载数据为JSON文件
    downloadData() {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, 'h').replace('T', '_');
        const filename = `individual_difference_${this.data.participantInfo.participant}_${timestamp}.json`;
        
        const jsonPayload = {
            participantInfo: this.data.participantInfo,
            individualDifferenceData: this.data.individualDifferenceData
        };
        const jsonData = JSON.stringify(jsonPayload, null, 2);
        
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`数据保存完成！\n文件名: ${filename}\n请检查您的下载文件夹。`);
    }

    // 检查是否需要恢复数据
    async checkResumeData(participantInfo) {
        const existingData = IndividualDifferenceManager.checkExistingData(participantInfo.participant);
        
        if (existingData.exists) {
            // 检查已完成的问卷
            const individualDifferenceData = existingData.individualDifferenceData || {};
            let message = '检测到您有未完成的个体差异数据！\n\n';
            
            // 检查EQ量表
            if (!individualDifferenceData.EQ) {
                message += '您还未完成同理心量表（EQ）。\n';
            } else {
                const EQData = individualDifferenceData.EQ;
                let completedCount = 0;
                for (let i = 1; i <= 40; i++) {
                    if (EQData[`Q${i}`] !== undefined) completedCount++;
                }
                message += `您已完成同理心量表（EQ）${completedCount}/40 题。\n`;
            }
            
            // 检查AQ量表
            if (!individualDifferenceData.AQ) {
                message += '您还未完成孤独症商数量表（AQ）。\n';
            } else {
                const AQData = individualDifferenceData.AQ;
                let completedCount = 0;
                for (let i = 1; i <= 50; i++) {
                    if (AQData[`Q${i}`] !== undefined) completedCount++;
                }
                message += `您已完成孤独症商数量表（AQ）${completedCount}/50 题。\n`;
            }
            
            // 检查GAAIS量表
            if (!individualDifferenceData.GAAIS) {
                message += '您还未完成通用人工智能态度量表（GAAIS）。\n';
            } else {
                const GAAISData = individualDifferenceData.GAAIS;
                let completedCount = 0;
                for (let i = 1; i <= 20; i++) {
                    if (GAAISData[`Q${i}`] !== undefined) completedCount++;
                }
                message += `您已完成通用人工智能态度量表（GAAIS）${completedCount}/20 题。\n`;
            }
            
            // 检查IDAQ量表
            if (!individualDifferenceData.IDAQ) {
                message += '您还未完成拟人化个体差异量表（IDAQ）。\n';
            } else {
                const IDAQData = individualDifferenceData.IDAQ;
                let completedCount = 0;
                for (let i = 1; i <= 15; i++) {
                    if (IDAQData[`Q${i}`] !== undefined) completedCount++;
                }
                message += `您已完成拟人化个体差异量表（IDAQ）${completedCount}/15 题。\n`;
            }
            
            message += '\n是否继续之前的进度？\n选择"继续"将从上次中断的地方继续\n选择"重新开始"将清除之前的数据重新开始\n\n请选择：';
            
            const choice = await this.ui.showResumeChoiceScreen(message);
            return choice;
        }
        
        return 'new';
    }

    // 主运行函数
    async run() {
        try {
            // 获取参与者信息
            const participantInfo = await this.getParticipantInfo();
            if (!participantInfo) {
                console.log('用户取消了实验');
                return;
            }

            // 检查是否需要恢复
            const resumeChoice = await this.checkResumeData(participantInfo);
            if (resumeChoice === 'cancel') {
                console.log('用户取消了实验');
                return;
            }

            // 加载或初始化数据对象
            const existingData = IndividualDifferenceManager.checkExistingData(participantInfo.participant);
            
            if (resumeChoice === 'resume' && existingData.exists) {
                // 恢复模式：使用已保存的数据
                this.data = {
                    participantInfo: participantInfo,
                    individualDifferenceData: existingData.individualDifferenceData || {}
                };
                console.log('恢复未完成的问卷数据');
            } else if (resumeChoice === 'restart') {
                // 重新开始：清除旧数据
                this.data = {
                    participantInfo: participantInfo,
                    individualDifferenceData: {}
                };
                // 清除localStorage中的数据
                localStorage.removeItem(`individual_difference_data_${participantInfo.participant}`);
                console.log('清除旧数据，重新开始');
            } else {
                // 新实验
                this.data = {
                    participantInfo: participantInfo,
                    individualDifferenceData: {}
                };
            }

            // 运行所有个体差异问卷
            const individualDifferenceData = await this.runAllQuestionnaires();
            if (individualDifferenceData === 'escape') {
                console.log('个体差异问卷被取消');
                return;
            }

            // 保存到本地存储
            this.saveToLocalStorage();

            // 显示完成消息
            await this.ui.showScreen('个体差异问卷已完成！\n按回车查看数据或下载。', { showContinue: true });

            // 下载数据
            this.downloadData();

            // 显示结束消息
            await this.ui.showScreen('感谢您的参与！\n数据已保存并下载。\n按回车退出。', { showContinue: true });

        } catch (error) {
            console.error('个体差异问卷运行错误:', error);
            alert('个体差异问卷运行出现错误，请检查控制台获取详细信息。');
        }
    }
}

// ========== 主程序入口 ==========
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const manager = new IndividualDifferenceManager();
            manager.run();
        });
    } else {
        const manager = new IndividualDifferenceManager();
        manager.run();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IndividualDifferenceManager, IndividualDifferenceUI };
}
