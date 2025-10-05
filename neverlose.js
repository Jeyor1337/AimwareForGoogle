// ==UserScript==
// @name         Aimware for google
// @namespace   http://tampermonkey.net/
// @version       3.0
// @description   Aimware更新了谷歌小恐龙？
// @author       Jeyor1337
// @license       MIT
// @match       *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // GUI CSS
    const style = document.createElement('style');
    style.textContent = `
        .aimware-gui {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            position: fixed;
            bottom: 60px;
            left: 20px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 10px;
            min-width: 200px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            z-index: 10000;
            display: none;
        }
        
        .aimware-header {
            background: #2a2a2a;
            color: #fff;
            padding: 8px;
            margin: -10px -10px 10px -10px;
            border-radius: 4px 4px 0 0;
            font-weight: bold;
            font-size: 12px;
            text-align: center;
            border-bottom: 1px solid #333;
        }
        
        .aimware-control {
            margin: 8px 0;
        }
        
        .aimware-label {
            color: #ccc;
            font-size: 11px;
            margin-bottom: 4px;
            display: block;
        }
        
        .aimware-toggle {
            position: relative;
            display: inline-block;
            width: 40px;
            height: 20px;
        }
        
        .aimware-toggle input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .aimware-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #333;
            transition: .4s;
            border-radius: 20px;
        }
        
        .aimware-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 2px;
            bottom: 2px;
            background-color: #666;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .aimware-slider {
            background-color: #4CAF50;
        }
        
        input:checked + .aimware-slider:before {
            transform: translateX(20px);
            background-color: #fff;
        }
        
        .aimware-slider-value {
            color: #4CAF50;
            font-size: 11px;
            margin-left: 10px;
        }
        
        .aimware-button {
            background: #d32f2f;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
            width: 100%;
            margin-top: 5px;
        }
        
        .aimware-button:hover {
            background: #f44336;
        }
        
        .toggle-icon {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            cursor: pointer;
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #4CAF50;
            font-size: 20px;
            font-weight: bold;
        }
        
        .toggle-icon:hover {
            background: #2a2a2a;
        }
        
        input[type="range"] {
            width: 100%;
            height: 4px;
            background: #333;
            outline: none;
            border-radius: 2px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 12px;
            height: 12px;
            background: #4CAF50;
            cursor: pointer;
            border-radius: 50%;
        }
    `;
    document.head.appendChild(style);
    
    // 创建GUI
    const gui = document.createElement('div');
    gui.className = 'aimware-gui';
    gui.innerHTML = `
        <div class="aimware-header">Aimware Menu</div>
        <div class="aimware-control">
            <span class="aimware-label">无敌模式</span>
            <label class="aimware-toggle">
                <input type="checkbox" id="godModeToggle">
                <span class="aimware-slider"></span>
            </label>
            <span class="aimware-slider-value" id="godModeStatus">关闭</span>
        </div>
        <div class="aimware-control">
            <span class="aimware-label">加速倍数: <span id="speedValue">1</span>x</span>
            <input type="range" id="speedSlider" min="1" max="20" value="1">
        </div>
        <button class="aimware-button" id="endGameBtn">结束游戏</button>
    `;
    
    // 创建图标
    const toggleIcon = document.createElement('div');
    toggleIcon.className = 'toggle-icon';
    toggleIcon.textContent = 'G';
    toggleIcon.title = 'CLICKGUI';
    
    document.body.appendChild(gui);
    document.body.appendChild(toggleIcon);
    
    // 模块状态
    let gameState = {
        godMode: false,
        speedMultiplier: 1,
        originalGameOver: null,
        originalSpeed: 1
    };
    
    // 等待游戏加载
    let gameCheckInterval = setInterval(() => {
        if (window.Runner && window.Runner.instance_) {
            clearInterval(gameCheckInterval);
            initializeGameMod();
        }
    }, 1000);
    
    function initializeGameMod() {
        const gameInstance = Runner.instance_;
        
        gameState.originalGameOver = gameInstance.gameOver;
        gameState.originalSpeed = gameInstance.currentSpeed;
        
        updateGodMode();
        updateGameSpeed();
        
        console.log("GUI已加载");
    }
    
    function updateGodMode() {
        const gameInstance = Runner.instance_;
        if (!gameInstance) return;
        
        if (gameState.godMode) {
            // 启用无敌
            gameInstance.gameOver = function() {
                console.log("无敌模式启用");
            };
            document.getElementById('godModeStatus').textContent = '开启';
            document.getElementById('godModeStatus').style.color = '#4CAF50';
        } else {
            // 禁用无敌
            if (gameState.originalGameOver) {
                gameInstance.gameOver = gameState.originalGameOver;
            }
            document.getElementById('godModeStatus').textContent = '关闭';
            document.getElementById('godModeStatus').style.color = '#ccc';
        }
    }
    
    function updateGameSpeed() {
        const gameInstance = Runner.instance_;
        if (!gameInstance) return;
        
        gameInstance.currentSpeed = gameState.originalSpeed * gameState.speedMultiplier;
        
        if (gameInstance.config) {
            const multiplier = gameState.speedMultiplier;
            gameInstance.config.SPEED = (gameInstance.config.originalSpeed || 6) * multiplier;
            gameInstance.config.ACCELERATION = 0.001 * multiplier;
            gameInstance.config.MAX_SPEED = (gameInstance.config.originalMaxSpeed || 13) * multiplier;
            if (gameInstance.config.BG_CLOUD_SPEED) {
                gameInstance.config.BG_CLOUD_SPEED = 0.2 * multiplier;
            }
        }
        
        document.getElementById('speedValue').textContent = gameState.speedMultiplier;
    }
    
    // GUI事件处理
    toggleIcon.addEventListener('click', function() {
        gui.style.display = gui.style.display === 'none' ? 'block' : 'none';
    });
    
    document.getElementById('godModeToggle').addEventListener('change', function(e) {
        gameState.godMode = e.target.checked;
        updateGodMode();
    });
    
    document.getElementById('speedSlider').addEventListener('input', function(e) {
        gameState.speedMultiplier = parseInt(e.target.value);
        updateGameSpeed();
    });
    
    document.getElementById('endGameBtn').addEventListener('click', function() {
        const gameInstance = Runner.instance_;
        if (gameInstance && gameState.originalGameOver) {
            // 使用原版gameOver函数显示游戏结束界面
            gameState.originalGameOver.call(gameInstance);
            // 关闭GUI
            gui.style.display = 'none';
        }
    });
    
    // 点击页面其他区域关闭GUI
    document.addEventListener('click', function(e) {
        if (!gui.contains(e.target) && !toggleIcon.contains(e.target)) {
            gui.style.display = 'none';
        }
    });
})();
        
        // 10倍加速
        if (gameInstance.currentSpeed) {
            gameInstance.currentSpeed *= 10;
        }
        
        if (gameInstance.config) {
            if (gameInstance.config.SPEED) gameInstance.config.SPEED *= 10;
            if (gameInstance.config.ACCELERATION) gameInstance.config.ACCELERATION *= 10;
            if (gameInstance.config.MAX_SPEED) gameInstance.config.MAX_SPEED *= 10;
            if (gameInstance.config.BG_CLOUD_SPEED) gameInstance.config.BG_CLOUD_SPEED *= 10;
        }
        
        // 手动结束游戏（调用原版gameOver）
        addGameOverButton(gameInstance);
        
        console.log("AimWare：免疫碰撞、10倍加速");
    }
    
    function addGameOverButton(gameInstance) {
        const button = document.createElement('button');
        button.innerHTML = '结束游戏';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.left = '20px';
        button.style.zIndex = '9999';
        button.style.padding = '10px 15px';
        button.style.backgroundColor = '#ff4444';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '16px';
        button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        
        button.addEventListener('click', function() {
            if (originalGameOver && typeof originalGameOver === 'function') {
                // 弹出gameover页面
                originalGameOver.call(gameInstance);
            }
        });
        
        document.body.appendChild(button);
    }
})();
