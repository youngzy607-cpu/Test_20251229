// MQTT 客户端封装
// 使用 broker.emqx.io 公共服务器

const MQTT_CONFIG = {
    // 使用 WebSocket 连接，更适合浏览器
    host: 'broker.emqx.io',
    port: 8083,
    path: '/mqtt',
    // 加上随机 ID 避免冲突
    clientId: 'kelly_pool_' + Math.random().toString(16).substr(2, 8)
};

class GameClient {
    constructor() {
        this.client = null;
        this.callbacks = {};
        this.connected = false;
    }

    connect(onConnect) {
        console.log('Connecting to MQTT broker...');
        this.client = mqtt.connect(`ws://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}${MQTT_CONFIG.path}`, {
            clientId: MQTT_CONFIG.clientId
        });

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker');
            this.connected = true;
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