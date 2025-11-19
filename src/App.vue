<template>
  <div id="app">
    <!-- Cesium 地图显示容器 -->
    <div id="cesiumContainer" style="width: 100%; height: 100vh;"></div>

    <!-- 用户输入区域 -->
    <div class="chat-container">
      <input v-model="userMessage" placeholder="输入消息" @keyup.enter="sendMessage" />
      <button @click="sendMessage" :disabled="loading">
        {{ loading ? '发送中...' : '发送消息' }}
      </button>
    </div>

    <!-- 显示 AI 回复 -->
    <div v-if="aiReply" class="chat-reply">
      <h3>AI 回复：</h3>
      <p>{{ aiReply }}</p>
    </div>

    <!-- 显示对话历史 -->
    <div v-if="messages.length > 0" class="chat-history">
      <h3>对话历史：</h3>
      <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
        <strong>{{ msg.role === 'user' ? '你' : 'AI' }}:</strong> {{ msg.content }}
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
        // 修改1: 使用当前项目的API地址（相对路径）
        // 修改2: 使用正确的消息格式
        const response = await axios.post('/api/chat', {
          messages: this.messages  // 发送完整的对话历史
        });

        console.log('API响应:', response.data);
        
        // 修改3: 从正确的位置获取AI回复
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
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#cesiumContainer {
  width: 100%;
  height: 100%;
}

.chat-container {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.chat-container input {
  padding: 10px;
  font-size: 16px;
  width: 250px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chat-container button {
  padding: 10px 15px;
  font-size: 16px;
  margin-left: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.chat-container button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.chat-reply {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  z-index: 1000;
}

.chat-history {
  position: absolute;
  top: 150px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.chat-history h3 {
  margin-bottom: 10px;
}

.message {
  margin-bottom: 8px;
  padding: 5px;
  border-radius: 4px;
}

.message.user {
  background-color: #e3f2fd;
  text-align: right;
}

.message.assistant {
  background-color: #f5f5f5;
}
</style>