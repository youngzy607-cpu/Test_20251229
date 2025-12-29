document.addEventListener('DOMContentLoaded', () => {
    const welcomeText = document.getElementById('welcome-text');
    const shareBtn = document.getElementById('share-btn');
    const qrContainer = document.getElementById('qrcode-container');

    // 初始化：检查 URL Hash 是否有内容
    function initFromHash() {
        if (window.location.hash) {
            try {
                // 解码 URL Hash (去掉 #)
                const text = decodeURIComponent(window.location.hash.substring(1));
                // 防止 XSS: 简单的文本设置，innerText 安全
                welcomeText.innerText = text;
            } catch (e) {
                console.error('Hash decode failed', e);
            }
        }
    }

    // 监听输入：更新 URL Hash
    welcomeText.addEventListener('input', () => {
        const text = welcomeText.innerText;
        // 使用 replaceState 避免产生大量历史记录
        // history.replaceState(null, null, '#' + encodeURIComponent(text));
        // 或者直接用 hash (会产生历史记录，可能更符合“撤销”直觉，但这里用 replace 更好体验)
        window.history.replaceState(null, null, '#' + encodeURIComponent(text));
        
        // 输入时清空旧的二维码，提示用户重新生成
        qrContainer.innerHTML = '';
    });

    // 监听 Hash 变化 (比如用户点击后退)
    window.addEventListener('hashchange', initFromHash);

    // 生成二维码
    shareBtn.addEventListener('click', () => {
        qrContainer.innerHTML = ''; // 清空
        const url = window.location.href;
        
        try {
            new QRCode(qrContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        } catch (e) {
            alert('生成二维码失败，请刷新重试');
            console.error(e);
        }
    });

    // 启动初始化
    initFromHash();
});