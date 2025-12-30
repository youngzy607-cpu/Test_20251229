// MQTT 客户端封装
// 使用 broker.emqx.io 公共服务器

const MQTT_CONFIG = {
    // 使用 Secure WebSocket (WSS) 以支持 HTTPS 页面
    host: 'broker.emqx.io',
    port: 8084, // WSS 端口
    path: '/mqtt',
    // 加上随机 ID 避免冲突
    clientId: 'kelly_pool_' + Math.random().toString(16).substr(2, 8)
};

class GameClient {
    constructor() {
        this.client = null;
        this.callbacks = {};
        this.connected = false;
        this.connectionTimer = null;
    }

    connect(onConnect) {
        console.log('Connecting to MQTT broker (WSS)...');
        // 显式使用 wss:// 协议
        this.client = mqtt.connect(`wss://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`, {
            clientId: MQTT_CONFIG.clientId,
            keepalive: 60,
            reconnectPeriod: 5000
        });
        
        // 设置连接超时检测
        this.connectionTimer = setTimeout(() => {
            if (!this.connected) {
                console.error('Connection timed out');
                const statusElem = document.getElementById('status-text');
                if (statusElem) {
                    statusElem.innerText = '❌ 连接超时 (请刷新)';
                    statusElem.style.color = 'red';
                }
            }
        }, 10000);

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            this.connected = true;
            clearTimeout(this.connectionTimer);
            if (onConnect) onConnect();
        });

        this.client.on('message', (topic, message) => {
            try {
                const payload = JSON.parse(message.toString());
                console.log('Received:', topic, payload);
                
                // 触发对应类型的回调
                if (this.callbacks[payload.type]) {
                    this.callbacks[payload.type](payload);
                }
            } catch (e) {
                console.error('Message parse error:', e);
            }
        });

        this.client.on('error', (err) => {
            console.error('MQTT Error:', err);
            this.connected = false;
        });
        
        this.client.on('offline', () => {
            console.log('MQTT Offline');
            this.connected = false;
        });
    }

    subscribe(topic) {
        if (this.client) {
            this.client.subscribe(topic);
            console.log('Subscribed to:', topic);
        }
    }

    publish(topic, type, data = {}) {
        if (this.client && this.connected) {
            const payload = JSON.stringify({
                type,
                timestamp: Date.now(),
                sender: MQTT_CONFIG.clientId,
                ...data
            });
            this.client.publish(topic, payload);
            console.log('Published:', topic, payload);
        }
    }

    on(type, callback) {
        this.callbacks[type] = callback;
    }
}

// 导出单例
window.gameClient = new GameClient();