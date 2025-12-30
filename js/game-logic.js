// 核心游戏逻辑
class KellyPoolGame {
    constructor() {
        this.cards = this.generateDeck();
    }

    generateDeck() {
        const suits = ['S', 'H', 'C', 'D']; // Spades, Hearts, Clubs, Diamonds
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];

        for (const suit of suits) {
            for (const value of values) {
                deck.push({
                    id: `${suit}-${value}`,
                    suit: suit,
                    value: value,
                    sortValue: this.getSortValue(value),
                    suitValue: this.getSuitValue(suit)
                });
            }
        }

        // Add Jokers
        deck.push({ id: 'J-S', suit: 'J', value: 'Small', sortValue: 100, suitValue: 1 });
        deck.push({ id: 'J-B', suit: 'J', value: 'Big', sortValue: 101, suitValue: 2 });

        return deck;
    }

    getSortValue(value) {
        const map = {
            '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15 // Usually 2 is high in Chinese games, or 2 is low?
            // User said "small to large". In standard non-game sorting, 2 is 2. 
            // In Poker (Texas Holdem), 2 is low. In Dou Dizhu, 2 is high.
            // Let's assume standard numerical order: A(1) or A(14)?
            // Let's use: 3-K, A, 2 (Common in China).
            // Actually, let's use standard Poker rank: 2 < 3 ... < K < A.
        };
        // Re-evaluating "Small to Large". 
        // If I have 3, 4, 5... it makes sense.
        // Let's do: 2=2, 3=3 ... 10=10, J=11, Q=12, K=13, A=14.
        const standardMap = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return standardMap[value];
    }

    getSuitValue(suit) {
        // Spades > Hearts > Clubs > Diamonds
        const map = { 'D': 1, 'C': 2, 'H': 3, 'S': 4 };
        return map[suit] || 0;
    }

    // 洗牌算法 (Fisher-Yates Shuffle)
    shuffle() {
        let currentIndex = this.cards.length, randomIndex;
        const deck = [...this.cards];

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
            while(dealIndex < deck.length) {
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
        
        // Sort hands
        for (const pid in hands) {
            hands[pid].sort((a, b) => {
                if (a.sortValue !== b.sortValue) {
                    return a.sortValue - b.sortValue; // Small to Large
                }
                return a.suitValue - b.suitValue;
            });
        }

        return hands;
    }
}

window.kellyLogic = new KellyPoolGame();
