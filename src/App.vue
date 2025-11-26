<template>
  <div id="app">
    <!-- Cesium 地图显示容器 -->
    <div id="cesiumContainer" style="width: 100%; height: 100vh;"></div>

    <!-- 固定在左下角的聊天窗口 -->
    <div class="chat-window">
      <!-- 聊天标题栏 -->
      <div class="chat-header">
        <h3>AI 地图助手</h3>
      </div>

      <!-- 消息显示区域（可滚动） -->
      <div class="messages-container">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message" 
          :class="msg.role"
        >
          <div class="message-content">
            <strong>{{ msg.role === 'user' ? '你' : 'AI' }}:</strong> {{ msg.content }}
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <input 
          v-model="userMessage" 
          placeholder="输入消息" 
          @keyup.enter="sendMessage"
          class="chat-input"
        />
        <button 
          @click="sendMessage" 
          :disabled="loading"
          class="send-btn"
        >
          {{ loading ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
    return {
      userMessage: '',  // 用户输入的消息
      aiReply: '',      // AI 回复的消息
      messages: [],     // 对话历史
      loading: false    // 加载状态
    };
  },
  mounted() {
    // 等待 Cesium 加载完成
    setTimeout(() => {
      if (typeof Cesium !== 'undefined') {
        this.initCesium();
      } else {
        console.error('Cesium 未加载');
      }
    }, 100);
  },
  methods: {
    initCesium() {
      try {
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YjdiN2Y0Yy1iY2M2LTRiZDctODg3MC0yOTQ2ZDRlYWIzNDYiLCJpZCI6MzYxNTI0LCJpYXQiOjE3NjM0ODA5NTR9.XUOoqj_LHCYJufnLoxqDVQSOhYJ37cXLJDexPwOPU6s';

        const viewer = new Cesium.Viewer('cesiumContainer', {
          baseLayerPicker: true,
          animation: false,
          timeline: false
        });

        viewer.camera.setView({
          destination: Cesium.Cartesian3.fromDegrees(116.3974, 39.9093, 10000000)
        });

        console.log('Cesium 地图创建成功');
      } catch (error) {
        console.error('Cesium 初始化失败:', error);
      }
    },

    async sendMessage() {
      if (!this.userMessage.trim() || this.loading) return;
      
      const userMessage = this.userMessage.trim();
      this.userMessage = '';
      this.loading = true;
      
      // 添加到消息历史
      this.messages.push({ role: 'user', content: userMessage });
      
      try {
        const response = await axios.post('/api/chat', {
          messages: this.messages  // 发送完整的对话历史
        });

        console.log('API响应:', response.data);
        
        // 从正确的位置获取AI回复
        if (response.data.choices && response.data.choices.length > 0) {
          const aiReply = response.data.choices[0].message.content;
          this.aiReply = aiReply;
          // 添加到消息历史
          this.messages.push({ role: 'assistant', content: aiReply });
        } else {
          this.aiReply = '没有得到有效的回复。';
          this.messages.push({ role: 'assistant', content: '没有得到有效的回复。' });
        }
      } catch (error) {
        console.error('Error:', error);
        this.aiReply = '发生错误，请稍后再试。';
        this.messages.push({ role: 'assistant', content: '发生错误，请稍后再试。' });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: "SimSun", "宋体", serif; /* 使用宋体 */
}

#cesiumContainer {
  width: 100%;
  height: 100%;
}

/* 聊天窗口样式 - 固定在左下角 */
.chat-window {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 380px;
  height: 480px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 聊天标题栏 */
.chat-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
}

.chat-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

/* 消息容器（可滚动） */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* 消息样式 */
.message {
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease-in;
}

.message-content {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 13px;
  line-height: 1.4;
  word-wrap: break-word;
  max-width: 100%;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
  margin-left: 40px;
  text-align: right;
}

.message.assistant .message-content {
  background: #f7fafc;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
  margin-right: 40px;
}

/* 输入区域 */
.input-area {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: #fafafa;
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #cbd5e0;
  border-radius: 20px;
  font-size: 13px;
  font-family: "SimSun", "宋体", serif;
  outline: none;
  transition: border-color 0.3s;
}

.chat-input:focus {
  border-color: #667eea;
}

.send-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 60px;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-window {
    width: calc(100% - 40px);
    left: 20px;
    right: 20px;
  }
}
</style>