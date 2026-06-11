export interface Item {
  id: string;
  name: string;
  nameJp: string;
  description: string;
  type: 'consumable' | 'equipment' | 'key' | 'collectible';
  effect?: {
    stat: string;
    value: number;
  };
  price: number;
  icon: string;
}

export const ITEMS: Record<string, Item> = {
  onigiri: {
    id: 'onigiri',
    name: 'Rice Ball',
    nameJp: 'おにぎり',
    description: 'ユキの定食屋のおにぎり。食べるとHPが回復する。',
    type: 'consumable',
    effect: { stat: 'hp', value: 30 },
    price: 50,
    icon: '🍙',
  },
  energy_drink: {
    id: 'energy_drink',
    name: 'Energy Drink',
    nameJp: 'エナジードリンク',
    description: '怪しい成分のエナジードリンク。SPが回復する。',
    type: 'consumable',
    effect: { stat: 'sp', value: 40 },
    price: 80,
    icon: '🥤',
  },
  first_aid: {
    id: 'first_aid',
    name: 'First Aid Kit',
    nameJp: '救急箱',
    description: '基本的な救急箱。HPが大きく回復する。',
    type: 'consumable',
    effect: { stat: 'hp', value: 80 },
    price: 200,
    icon: '🩹',
  },
  yakisoba_pan: {
    id: 'yakisoba_pan',
    name: 'Yakisoba Bread',
    nameJp: '焼きそばパン',
    description: '購買の定番。HP・SP両方回復。',
    type: 'consumable',
    effect: { stat: 'both', value: 25 },
    price: 120,
    icon: '🍞',
  },
  harbor_bandana: {
    id: 'harbor_bandana',
    name: 'Waterfront Bandana',
    nameJp: '港湾バンダナ',
    description: '荒波鉄のバンダナ。港湾区の証。防御+3。',
    type: 'equipment',
    effect: { stat: 'defense', value: 3 },
    price: 0,
    icon: '🏴',
  },
  akabane_emblem: {
    id: 'akabane_emblem',
    name: 'Akabane Emblem',
    nameJp: '赤羽の紋章',
    description: '赤羽学園の紋章。栗原誠から奪った。攻撃+5。',
    type: 'equipment',
    effect: { stat: 'attack', value: 5 },
    price: 0,
    icon: '⚜️',
  },
  akaoni_jacket: {
    id: 'akaoni_jacket',
    name: "Akaoni's Jacket",
    nameJp: '赤鬼のスカジャン',
    description: '赤木鬼太のスカジャン。全ステータス+3。',
    type: 'equipment',
    effect: { stat: 'all', value: 3 },
    price: 0,
    icon: '🧥',
  },
  legend_jacket: {
    id: 'legend_jacket',
    name: 'Legend Banchou Jacket',
    nameJp: '伝説番長の学ラン',
    description: '影山剛臂の学ラン。着ると魂が燃える。全ステータス+8。',
    type: 'equipment',
    effect: { stat: 'all', value: 8 },
    price: 0,
    icon: '👘',
  },
  iron_fist_emblem: {
    id: 'iron_fist_emblem',
    name: 'Iron Fist Emblem',
    nameJp: '鉄拳の紋章',
    description: '鉄義市最強の証。持っているだけで尊敬される。コレクタブル。',
    type: 'collectible',
    price: 0,
    icon: '✊',
  },
  old_photo: {
    id: 'old_photo',
    name: 'Old Photo',
    nameJp: '古い写真',
    description: '若い頃の影山剛臂と仲間たちの写真。何かを語りかける。',
    type: 'collectible',
    price: 0,
    icon: '📷',
  },
};

export const FASHION_OPTIONS = {
  uniform: [
    { id: 'standard', name: '標準学ラン', nameJp: '標準学ラン', stats: {}, color: '#1a1a3a' },
    { id: 'long', name: '長ランスタイル', nameJp: '長ランスタイル', stats: { defense: 2 }, color: '#0a0a2a' },
    { id: 'open', name: 'はだけスタイル', nameJp: 'はだけスタイル', stats: { attack: 1 }, color: '#2a1a1a' },
    { id: 'ripped', name: '破れ学ラン', nameJp: '破れ学ラン', stats: { attack: 3, defense: -1 }, color: '#3a1a0a' },
  ],
  jacket: [
    { id: 'none', name: 'なし', nameJp: 'なし', stats: {}, color: 'transparent' },
    { id: 'sukajan', name: 'スカジャン', nameJp: 'スカジャン', stats: { attack: 2 }, color: '#8B0000' },
    { id: 'jersey', name: 'ジャージ', nameJp: 'ジャージ', stats: { speed: 2 }, color: '#003366' },
    { id: 'bomber', name: 'ボンバー', nameJp: 'ボンバージャケット', stats: { defense: 3 }, color: '#2a2a2a' },
  ],
  hair: [
    { id: 'short', name: '短髪', nameJp: '短髪', stats: {} },
    { id: 'regent', name: 'リーゼント', nameJp: 'リーゼント', stats: { attack: 1 } },
    { id: 'mohawk', name: 'モヒカン', nameJp: 'モヒカン', stats: { attack: 2, defense: -1 } },
    { id: 'two_block', name: 'ツーブロック', nameJp: 'ツーブロック', stats: { speed: 1 } },
    { id: 'buzz', name: 'スキンヘッド', nameJp: 'スキンヘッド', stats: { defense: 1 } },
  ],
  accessory: [
    { id: 'none', name: 'なし', nameJp: 'なし', stats: {} },
    { id: 'chain', name: 'チェーン', nameJp: 'チェーン', stats: { attack: 1 } },
    { id: 'bandana', name: 'バンダナ', nameJp: 'バンダナ', stats: { defense: 1 } },
    { id: 'ring', name: '指輪', nameJp: '指輪', stats: {} },
    { id: 'bracelet', name: 'ブレスレット', nameJp: 'ブレスレット', stats: {} },
  ],
};
