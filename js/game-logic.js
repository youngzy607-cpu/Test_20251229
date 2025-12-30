// 核心游戏逻辑

class KellyPoolGame {
    constructor() {
        this.balls = Array.from({length: 15}, (_, i) => i + 1); // 1-15号球
    }

    // 洗牌算法 (Fisher-Yates Shuffle)
    shuffle() {
        let currentIndex = this.balls.length, randomIndex;
        const deck = [...this.balls];

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [deck[currentIndex], deck[randomIndex]] = [deck[randomIndex], deck[currentIndex]];
        }
        return deck;
    }

    // 发牌逻辑
    deal(playerIds, cardCountPerPlayer = 0) {
        const deck = this.shuffle();
        const hands = {};
        let dealIndex = 0;

        // 如果未指定每人几张，则尽可能平均分
        if (cardCountPerPlayer === 0) {
            // 简单平均分发模式
            let playerIndex = 0;
            while(dealIndex < 15 && dealIndex < deck.length) {
                const pid = playerIds[playerIndex];
                if (!hands[pid]) hands[pid] = [];
                
                hands[pid].push(deck[dealIndex]);
                dealIndex++;
                playerIndex = (playerIndex + 1) % playerIds.length;
            }
        } else {
            // 指定数量模式
            for (const pid of playerIds) {
                hands[pid] = [];
                for (let i = 0; i < cardCountPerPlayer; i++) {
                    if (dealIndex < deck.length) {
                        hands[pid].push(deck[dealIndex]);
                        dealIndex++;
                    }
                }
            }
        }
        
        return hands;
    }
}

window.kellyLogic = new KellyPoolGame();