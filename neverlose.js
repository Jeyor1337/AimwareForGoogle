// ==UserScript==
// @name         Aimware for google
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  免疫碰撞死亡、10倍加速、手动结束
// @author       Jeyor1337
// @license      MIT
// @match        *://*.*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // gameOver引用
    let originalGameOver = null;
    
    // 等待加载
    let checkInterval = setInterval(() => {
        if (window.Runner && window.Runner.instance_) {
            clearInterval(checkInterval);
            modifyGame();
        }
    }, 1000);
    
    function modifyGame() {
        const gameInstance = Runner.instance_;
        
        // 保存原版gameOver
        originalGameOver = gameInstance.gameOver;
        
        // 重写gameOver方法为空函数
        gameInstance.gameOver = function() {
            console.log("碰撞发生，但已免死");
            // 实现免死
        };
        
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
