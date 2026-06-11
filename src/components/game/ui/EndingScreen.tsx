'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/common/Button';
import type { EndingType } from '@/types/game';

const ENDINGS: Record<EndingType, { title: string; text: string; emoji: string }> = {
  true_banchou: {
    title: '真番長エンディング',
    emoji: '👑',
    text: `鉄義市の全ての学校と地区が一つになった。\n\n神崎烈は「真の番長」として、この街の新たな伝説となった。\n武藤剛は烈風高校の後輩たちに本物の強さを教え、黒木鷹は格闘の道を追い求めながらもこの街に根を張り、田中ユキの定食屋は今日も街の人々を温かく迎える。\n\n赤木鬼太は赤羽学園を立て直し、影山剛臂は静かにこの街を見守る存在となった。\n\n「番長とは何か」 ─ 烈はその答えを、自分の拳で証明した。\n\n俺たちの青春伝説は、まだ終わらない。`,
  },
  lone_fist: {
    title: '孤高の拳エンディング',
    emoji: '✊',
    text: `黒木鷹と二人で影山剛臂を打ち倒した。\n\n大きな勝利だったが、烈は何かが物足りないような気がした。\n\n「お前の拳は本物だ」と黒木は言った。「でも、一人で全部抱えるな。」\n\n二人の間に言葉はなかった。ただ夕日だけが、鉄義市を染めていた。\n\n誰かの隣にいることが、一番強い孤独への答えだと、この時初めて烈は気づいた。`,
  },
  jingi: {
    title: '仁義エンディング',
    emoji: '🤝',
    text: `赤木鬼太と肩を並べて影山剛臂に立ち向かった。\n\n昨日の敵が今日の戦友。それが義理と人情というものだ。\n\n「俺はお前に感謝してる」と赤鬼は言った。「俺の本当の仲間になってくれて。」\n\n烈は笑って言った。「最初に友達になろうぜって言えばよかったんだよ、バカ野郎。」\n\n二人は笑い合った。鉄義市の夜空に、二人の笑声が響き渡った。`,
  },
};

export function EndingScreen() {
  const { player, setPhase } = useGameStore();
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const endingType: EndingType = player?.flags['true_ending_unlocked']
    ? (player?.kizuna?.kuroki || 0) >= 4 && (player?.kizuna?.muto || 0) < 4
      ? 'lone_fist'
      : (player?.kizuna?.akaoni || 0) >= 4
        ? 'jingi'
        : 'true_banchou'
    : 'true_banchou';

  const ending = ENDINGS[endingType];

  useEffect(() => {
    let i = 0;
    const text = ending.text;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [ending.text]);

  return (
    <div className="fixed inset-0 z-60 bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-2">{ending.emoji}</div>
          <div className="text-yellow-400 font-black text-2xl">{ending.title}</div>
        </div>

        <div className="text-gray-300 text-base leading-loose whitespace-pre-line border-l-2 border-red-800 pl-4">
          {displayed}
          {isTyping && <span className="animate-pulse">▌</span>}
        </div>

        {!isTyping && (
          <div className="text-center space-y-4 pt-4">
            <div className="text-yellow-400 font-black text-xl">
              ─ END ─
            </div>
            <div className="text-gray-500 text-sm">
              プレイ時間: {player ? Math.floor(player.playtime / 60) : 0}分 / Lv.{player?.level}
            </div>
            <Button variant="banchou" size="lg" onClick={() => setPhase('title')}>
              タイトルに戻る
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
