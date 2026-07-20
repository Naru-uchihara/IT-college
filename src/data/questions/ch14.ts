import type { Question } from "@/types";

/** 第14章 ネットワーク の確認問題(すべて独自作成) */
export const ch14Questions: Question[] = [
  // ---- 14-01 LANとWAN ----
  {
    id: "q-14-01-1",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-01",
    type: "multiple_choice",
    difficulty: "beginner",
    prompt: "LANの説明として、最も適切なものはどれか。",
    choices: [
      {
        id: "a",
        text: "オフィスや家庭など、限られた範囲の中でコンピュータ同士を結ぶネットワーク",
      },
      {
        id: "b",
        text: "通信事業者の回線を利用して、離れた拠点同士を結ぶネットワーク",
      },
      { id: "c", text: "テレビ放送を受信するためのアンテナ設備" },
      { id: "d", text: "1台のコンピュータの内部で部品同士を結ぶ配線" },
    ],
    correctAnswer: "a",
    explanation:
      "LAN(Local Area Network)は、建物内やフロア内など限られた範囲に構築するネットワークです。自分たちで機器を設置して運用できます。",
    incorrectExplanations: {
      b: "離れた拠点同士を通信事業者の回線で結ぶのはWANの説明です。",
      c: "放送受信のアンテナ設備はコンピュータネットワークではありません。",
      d: "コンピュータ内部の配線はバスと呼ばれ、LANとは別のものです。",
    },
    relatedTerms: ["LAN", "ネットワーク"],
    isRequired: true,
    sourceType: "original",
    published: true,
  },
  {
    id: "q-14-01-2",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-01",
    type: "multiple_choice",
    difficulty: "beginner",
    prompt:
      "東京本社と大阪支社のように、地理的に離れた拠点のLAN同士を通信事業者の回線で結ぶネットワークを何と呼ぶか。",
    choices: [
      { id: "a", text: "WAN" },
      { id: "b", text: "LAN" },
      { id: "c", text: "USB" },
      { id: "d", text: "Bluetooth" },
    ],
    correctAnswer: "a",
    explanation:
      "WAN(Wide Area Network)は、通信事業者が提供する回線を利用して、離れた場所にあるLAN同士を接続する広域ネットワークです。",
    incorrectExplanations: {
      b: "LANは建物内など限られた範囲のネットワークです。",
      c: "USBはコンピュータと周辺機器をつなぐインタフェース規格です。",
      d: "Bluetoothは近距離の機器同士を無線でつなぐ規格です。",
    },
    relatedTerms: ["WAN", "通信事業者", "拠点間接続"],
    isRequired: true,
    sourceType: "original",
    published: true,
  },
  {
    id: "q-14-01-3",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-01",
    type: "multiple_choice",
    difficulty: "basic",
    prompt: "ISP(インターネットサービスプロバイダ)の役割はどれか。",
    choices: [
      { id: "a", text: "利用者にインターネットへの接続サービスを提供する" },
      { id: "b", text: "パソコンの修理を専門に請け負う" },
      { id: "c", text: "Webサイトのデザインを制作する" },
      { id: "d", text: "コンピュータウイルスを作成する" },
    ],
    correctAnswer: "a",
    explanation:
      "ISPは、家庭や企業のネットワークをインターネットへ接続するサービスを提供する事業者です。インターネットを利用するにはISPとの契約が必要です。",
    incorrectExplanations: {
      b: "パソコンの修理は修理業者のサービスで、ISPの本来の役割ではありません。",
      c: "Webデザインは制作会社の業務です。",
      d: "ウイルス作成は犯罪であり、事業者の役割ではありません。",
    },
    relatedTerms: ["ISP", "プロバイダ", "インターネット接続"],
    isRequired: true,
    sourceType: "original",
    published: true,
  },
  {
    id: "q-14-01-4",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-01",
    type: "multiple_choice",
    difficulty: "basic",
    prompt: "無線LANの説明として、適切なものはどれか。",
    choices: [
      {
        id: "a",
        text: "ケーブルの代わりに電波を使って、限られた範囲でコンピュータをネットワークに接続する仕組み",
      },
      { id: "b", text: "電話回線を使って音声通話だけを行う仕組み" },
      { id: "c", text: "人工衛星を利用してテレビ番組を放送する仕組み" },
      { id: "d", text: "光ファイバで大陸間を結ぶ海底ケーブルのこと" },
    ],
    correctAnswer: "a",
    explanation:
      "無線LANは、LANケーブルの代わりに電波で機器を接続するLANです。Wi-Fiという名称は、無線LANの相互接続性の認証に由来する呼び方です。",
    incorrectExplanations: {
      b: "音声通話専用の仕組みは電話網であり、無線LANとは異なります。",
      c: "衛星放送はテレビ放送の仕組みです。",
      d: "海底ケーブルは大陸間を結ぶ有線の基幹回線です。",
    },
    relatedTerms: ["無線LAN", "Wi-Fi", "電波"],
    isRequired: false,
    sourceType: "original",
    published: true,
  },
  {
    id: "q-14-01-5",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-01",
    type: "multiple_choice",
    difficulty: "applied",
    prompt:
      "ある会社が「本社ビル内のパソコンとプリンタの接続」と「本社と海外支社の接続」を計画している。それぞれに使うネットワークの組み合わせとして適切なものはどれか。",
    choices: [
      { id: "a", text: "ビル内はLAN、本社と海外支社の間はWAN" },
      { id: "b", text: "ビル内はWAN、本社と海外支社の間はLAN" },
      { id: "c", text: "どちらもLANだけで実現する" },
      { id: "d", text: "どちらもBluetoothだけで実現する" },
    ],
    correctAnswer: "a",
    explanation:
      "建物内の機器接続は自分たちで構築できるLAN、遠隔地の拠点間は通信事業者の回線を利用するWANが適切です。範囲でLANとWANを使い分けます。",
    incorrectExplanations: {
      b: "LANとWANの適用範囲が逆になっています。",
      c: "海外支社との接続のような長距離は、自前のLANだけでは構築できません。",
      d: "Bluetoothは数メートル程度の近距離通信であり、どちらの用途にも不十分です。",
    },
    relatedTerms: ["LAN", "WAN", "拠点間接続"],
    isRequired: false,
    sourceType: "original",
    published: true,
  },

  // ---- 14-02 ネットワーク機器 ----
  {
    id: "q-14-02-1",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-02",
    type: "multiple_choice",
    difficulty: "basic",
    prompt:
      "異なるネットワーク同士を接続し、データの宛先に応じて最適な経路を選んで転送する機器はどれか。",
    choices: [
      { id: "a", text: "ルータ" },
      { id: "b", text: "ハブ" },
      { id: "c", text: "プリンタ" },
      { id: "d", text: "Webカメラ" },
    ],
    correctAnswer: "a",
    explanation:
      "ルータはネットワークとネットワークの境界に置かれ、宛先のIPアドレスを見て最適な経路へデータを転送(ルーティング)する機器です。",
    incorrectExplanations: {
      b: "ハブは同じLANの中で複数の機器をまとめて接続する機器で、経路選択は行いません。",
      c: "プリンタは印刷用の出力装置です。",
      d: "Webカメラは映像を取り込む入力装置です。",
    },
    relatedTerms: ["ルータ", "ルーティング", "IPアドレス"],
    isRequired: true,
    sourceType: "original",
    published: true,
  },
  {
    id: "q-14-02-2",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-02",
    type: "multiple_choice",
    difficulty: "basic",
    prompt:
      "LANの中で複数の機器をケーブルで集約して接続し、宛先の機器がつながっているポートだけへデータを送る機器はどれか。",
    choices: [
      { id: "a", text: "スイッチングハブ" },
      { id: "b", text: "スピーカ" },
      { id: "c", text: "スキャナ" },
      { id: "d", text: "ヘッドセット" },
    ],
    correctAnswer: "a",
    explanation:
      "スイッチングハブ(LANスイッチ)は、宛先のMACアドレスを学習して、必要なポートだけへデータを転送します。すべてのポートへ送るリピータハブより効率的です。",
    incorrectExplanations: {
      b: "スピーカは音声の出力装置で、ネットワーク機器ではありません。",
      c: "スキャナは画像の入力装置です。",
      d: "ヘッドセットは音声の入出力装置です。",
    },
    relatedTerms: ["スイッチングハブ", "MACアドレス", "LAN"],
    isRequired: true,
    sourceType: "original",
    published: true,
  },
  {
    id: "q-14-02-3",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-02",
    type: "multiple_choice",
    difficulty: "basic",
    prompt:
      "ノートパソコンやスマートフォンを電波で LAN に接続するための中継機器はどれか。",
    choices: [
      { id: "a", text: "無線LANアクセスポイント" },
      { id: "b", text: "LANケーブル" },
      { id: "c", text: "ハードディスク" },
      { id: "d", text: "CPU" },
    ],
    correctAnswer: "a",
    explanation:
      "無線LANアクセスポイントは、無線の端末とネットワークの間を電波で中継する機器です。家庭用Wi-Fiルータにはこの機能が内蔵されています。",
    incorrectExplanations: {
      b: "LANケーブルは有線接続に使う配線で、無線接続の中継はできません。",
      c: "ハードディスクは記憶装置です。",
      d: "CPUは演算・制御を行う装置です。",
    },
    relatedTerms: ["アクセスポイント", "無線LAN", "Wi-Fi"],
    isRequired: true,
    sourceType: "original",
    published: true,
  },
  {
    id: "q-14-02-4",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-02",
    type: "multiple_choice",
    difficulty: "applied",
    prompt:
      "LAN内のパソコンがインターネットなど外部のネットワークと通信するときに、出入口として指定しておく機器を何と呼ぶか。",
    choices: [
      { id: "a", text: "デフォルトゲートウェイ" },
      { id: "b", text: "ファイルサーバ" },
      { id: "c", text: "プロジェクタ" },
      { id: "d", text: "UPS(無停電電源装置)" },
    ],
    correctAnswer: "a",
    explanation:
      "デフォルトゲートウェイは、LANの外へ通信するときの出入口となる機器(通常はルータ)です。パソコンのネットワーク設定で指定します。",
    incorrectExplanations: {
      b: "ファイルサーバはファイルを共有するためのサーバです。",
      c: "プロジェクタは映像を投影する出力装置です。",
      d: "UPSは停電時に電力を供給する装置で、通信の出入口ではありません。",
    },
    relatedTerms: ["デフォルトゲートウェイ", "ルータ", "ネットワーク設定"],
    isRequired: false,
    sourceType: "original",
    published: true,
  },
  {
    id: "q-14-02-5",
    courseId: "technology",
    chapterId: "ch14",
    lessonId: "14-02",
    type: "multiple_choice",
    difficulty: "applied",
    prompt:
      "自宅に光回線を引き、パソコン2台を無線で、プリンタ1台を有線でインターネットにつなぎたい。1台で済ませる場合に最も適切な機器はどれか。",
    choices: [
      {
        id: "a",
        text: "無線LANアクセスポイントと有線ポートを備えたルータ(Wi-Fiルータ)",
      },
      { id: "b", text: "リピータハブ単体" },
      { id: "c", text: "LANケーブル1本" },
      { id: "d", text: "外付けハードディスク" },
    ],
    correctAnswer: "a",
    explanation:
      "家庭用のWi-Fiルータは、ルータ機能・無線LANアクセスポイント機能・有線LANポートを1台にまとめた機器で、この要件を1台で満たせます。",
    incorrectExplanations: {
      b: "リピータハブは有線の集線装置で、無線接続やインターネットへの経路選択はできません。",
      c: "ケーブル1本では複数台の接続も無線接続もできません。",
      d: "外付けハードディスクは記憶装置であり、ネットワーク接続機能はありません。",
    },
    relatedTerms: ["Wi-Fiルータ", "アクセスポイント", "ルータ"],
    isRequired: false,
    sourceType: "original",
    published: true,
  },
];
