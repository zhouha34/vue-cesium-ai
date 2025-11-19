<template>
  <div id="app">
    <!-- Cesium 地图显示容器 -->
    <div id="cesiumContainer" style="width: 100%; height: 100vh;"></div>

    <!-- 用户输入区域 -->
    <div class="chat-container">
      <input v-model="userMessage" placeholder="输入消息" />
      <button @click="sendMessage">发送消息</button>
    </div>

    <!-- 显示 AI 回复 -->
    <div v-if="aiReply" class="chat-reply">
      <h3>AI 回复：</h3>
      <p>{{ aiReply }}</p>
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
      aiReply: ''       // AI 回复的消息
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
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YjdiN2Y0Yy1iY2M2LTRiZDctODg3MC0yOTQ2ZDRlYWIzNDYiLCJpZCI6MzYxNTI0LCJpYXQiOjE3NjM0ODA5NTR9.XUOoqj_LHCYJufnLoxqDVQSOhYJ37cXLJDexPwOPU6s';  // 替换为你的 token

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
      try {
        // 调用 Vercel 上的云函数，并发送用户输入的消息
        const response = await axios.post('https://vuecesium-5scs0pb4z-ha-zhous-projects.vercel.app/api/chat', {
          message: this.userMessage
        });

        // 获取 AI 回复并显示
        if (response.data.reply) {
          this.aiReply = response.data.reply;  // 根据返回的数据结构调整
        } else {
          this.aiReply = '没有得到回复。';
        }
      } catch (error) {
        console.error('Error:', error);
        this.aiReply = '发生错误，请稍后再试。';
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
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.chat-container input {
  padding: 10px;
  font-size: 16px;
  width: 250px;
}

.chat-container button {
  padding: 10px;
  font-size: 16px;
  margin-left: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 5px;
}

.chat-reply {
  position: absolute;
  bottom: 100px;
  left: 20px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.chat-reply h3 {
  margin-bottom: 10px;
}

.chat-reply p {
  margin: 0;
}
</style>
