<template>
  <div id="app">
    <!-- Cesium 地图显示容器 -->
    <div id="cesiumContainer" style="width: 100%; height: 100vh;"></div>

    <!-- 聊天窗口 - 固定在左下角 -->
    <div class="chat-window">
      <!-- 聊天标题栏 -->
      <div class="chat-header">
        <h3>尾矿库溃坝影响大语言模型</h3>
        <button class="toggle-btn" @click="toggleChatWindow">
          {{ chatWindowOpen ? '−' : '+' }}
        </button>
      </div>

      <!-- 聊天内容区域（可折叠） -->
      <div v-if="chatWindowOpen" class="chat-content">
        <!-- 消息显示区域（可滚动） -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            class="message" 
            :class="msg.role"
          >
            <div class="message-avatar">
              {{ msg.role === 'user' ? '你' : 'AI' }}
            </div>
            <div class="message-content">
              {{ msg.content }}
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-group">
            <input 
              v-model="userMessage" 
              placeholder="询问关于地图的问题..." 
              @keyup.enter="sendMessage"
              class="chat-input"
            />
            <button 
              @click="sendMessage" 
              :disabled="loading" 
              class="send-btn"
            >
              {{ loading ? '...' : '发送' }}
            </button>
          </div>
        </div>
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
      userMessage: '',      // 用户输入的消息
      messages: [],         // 对话历史
      loading: false,       // 加载状态
      chatWindowOpen: true  // 聊天窗口展开状态
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
  watch: {
    // 当消息更新时自动滚动到底部
    messages: {
      handler() {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      deep: true
    }
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
        // 改回使用相对路径
        const response = await axios.post('/api/chat', {
          messages: this.messages
        });

        console.log('API响应:', response.data);
        
        if (response.data.choices && response.data.choices.length > 0) {
          const aiReply = response.data.choices[0].message.content;
          this.messages.push({ role: 'assistant', content: aiReply });
        } else {
          this.messages.push({ role: 'assistant', content: '没有得到有效的回复。' });
        }
      } catch (error) {
        console.error('Error:', error);
        this.messages.push({ role: 'assistant', content: '发生错误，请稍后再试。' });
      } finally {
        this.loading = false;
      }
    },

    // 滚动到消息容器底部
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    // 切换聊天窗口展开/收起
    toggleChatWindow() {
      this.chatWindowOpen = !this.chatWindowOpen;
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

/* 聊天窗口样式 */
.chat-window {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 380px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 1000;
  overflow: hidden;
}

/* 聊天标题栏 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 聊天内容区域 */
.chat-content {
  display: flex;
  flex-direction: column;
  height: 400px;
}

/* 消息容器（可滚动） */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  max-height: 320px;
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
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  margin: 0 8px;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.assistant .message-avatar {
  background: #e2e8f0;
  color: #4a5568;
}

.message-content {
  max-width: 260px;
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 13px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: #f7fafc;
  color: #2d3748;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

/* 输入区域 */
.input-area {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: #fafafa;
}

.input-group {
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
  
  .message-content {
    max-width: 200px;
  }
}
</style>