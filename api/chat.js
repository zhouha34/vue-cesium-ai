// api/chat.js - 完整可用的版本
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export default async function handler(req, res) {
  // 在函数开头就设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // 立即处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return res.status(200).end();
  }

  // 只处理POST请求
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Processing POST request');
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log('Calling DeepSeek API with messages:', messages.length);
    
    // 调用DeepSeek API
    const deepseekResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        stream: false,
        max_tokens: 2048
      })
    });
    
    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', deepseekResponse.status, errorText);
      return res.status(deepseekResponse.status).json({ 
        error: 'DeepSeek API error',
        status: deepseekResponse.status,
        details: errorText 
      });
    }
    
    const data = await deepseekResponse.json();
    console.log('DeepSeek API success, response received');
    
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Error in chat API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}