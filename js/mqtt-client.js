// MQTT 客户端封装
// 支持多节点自动切换

const BROKERS = [
    { host: 'broker.emqx.io', port: 8084, path: '/mqtt' },
    { host: 'test.mosquitto.org', port: 8081, path: '/mqtt' },
    { host: 'public.mqtthq.com', port: 8084, path: '/mqtt' }
];

const BASE_CLIENT_ID = 'kelly_pool_' + Math.random().toString(16).substr(2, 8);

class GameClient {
    constructor() {
        this.client = null;
        this.callbacks = {};
        this.connected = false;
        this.connectionTimer = null;
        this.brokerIndex = 0;
    }

    connect(onConnect) {
        this.tryConnect(onConnect);
    }

    tryConnect(onConnect) {
        if (this.client) {
            try { this.client.end(); } catch(e){}
        }

        const broker = BROKERS[this.brokerIndex];
        this.updateStatus(`连接中: ${broker.host}...`, '#e67e22'); // Orange
        console.log(`Trying broker [${this.brokerIndex + 1}/${BROKERS.length}]: wss://${broker.host}:${broker.port}${broker.path}`);

        this.client = mqtt.connect(`wss://${broker.host}:${broker.port}${broker.path}`, {
            clientId: BASE_CLIENT_ID,
            keepalive: 60,
            reconnectPeriod: 0, // 禁用自动重连，由我们控制切换
            connectTimeout: 5000 // 5秒连不上就切
        });
        
        // 设置切换超时检测 (双重保险)
        if (this.connectionTimer) clearTimeout(this.connectionTimer);
        this.connectionTimer = setTimeout(() => {
            if (!this.connected) {
                console.error('Connection timed out, switching...');
                this.switchBroker(onConnect);
            }
        }, 6000);

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker:', broker.host);
            this.connected = true;
            this.updateStatus('✅ 已连接', '#2ecc71'); // Green
            clearTimeout(this.connectionTimer);
            if (onConnect) onConnect();
        });

        this.client.on('error', (err) => {
            console.error('MQTT Error:', err);
            // 错误通常会触发 close/offline，这里只记录
        });
        
        this.client.on('close', () => {
            if(!this.connected) {
                // 如果从未连接成功过就 close 了，说明连接失败
                this.switchBroker(onConnect);
            }
        });

        this.client.on('message', (topic, message) => {
            try {
                const payload = JSON.parse(message.toString());
                console.log('Received:', topic, payload);
                if (this.callbacks[payload.type]) {
                    this.callbacks[payload.type](payload);
                }
            } catch (e) {
                console.error('Message parse error:', e);
            }
        });
    }

    switchBroker(onConnect) {
        this.brokerIndex++;
        if (this.brokerIndex >= BROKERS.length) {
            this.brokerIndex = 0; // Loop back or stop? Loop back for now.
            this.updateStatus('❌ 所有节点均失败，重试中...', 'red');
        }
        
        // 延时 1 秒后重试，避免死循环太快
        setTimeout(() => {
            this.tryConnect(onConnect);
        }, 1000);
    }

    updateStatus(text, color) {
        const statusElem = document.getElementById('status-text');
        if (statusElem) {
            statusElem.innerText = text;
            statusElem.style.color = color;
        }
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
                sender: BASE_CLIENT_ID,
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