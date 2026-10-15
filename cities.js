/* 世界地圖的城市小卡：旅遊英文、對話、標示、單字、小測驗（由 AI 撰寫，並經第二位老師逐項查證） */
window.CITY_CARDS = [
 {
  "id": "taipei",
  "name": "Taipei",
  "name_zh": "台北",
  "country": "Taiwan",
  "country_zh": "台灣",
  "lat": 25.03,
  "lon": 121.56,
  "tz": "Asia/Taipei",
  "lang": "en-US",
  "landmark": "Taipei 101",
  "landmark_zh": "台北 101",
  "intro": "Taipei is the capital of Taiwan and a city you can proudly show to visitors. Its most famous landmark, Taipei 101, is 508 meters tall and was the tallest building in the world from 2004 to 2010. Visitors love the clean MRT, busy night markets, old temples such as Longshan Temple, and bubble tea, which was invented in Taiwan in the 1980s. With a little English, you can be a great guide for them.",
  "intro_zh": "台北是台灣的首都，也是你可以驕傲地介紹給外國朋友的城市。最有名的地標台北 101 高 508 公尺，在 2004 年到 2010 年間是世界最高的大樓。遊客很喜歡這裡乾淨的捷運、熱鬧的夜市、像龍山寺這樣的古老廟宇，還有 1980 年代在台灣發明的珍珠奶茶。只要會一點英文，你就能當他們的好導遊。",
  "english_note": {
   "en": "The 機車 that fill Taipei's streets are called scooters in English (motorbike is also fine). A motorcycle is usually a bigger, heavier bike, and a locomotive is a train engine, so never use that word here. Example: \"My mom takes me to school on her scooter.\"",
   "zh": "台灣路上隨處可見的「機車」，英文通常叫 scooter（也可以說 motorbike）。motorcycle 多半指比較大台的重型機車；locomotive 則是「火車頭」，千萬別拿來指機車。例句：My mom takes me to school on her scooter.（我媽媽騎機車載我上學。）"
  },
  "phrases": [
   {
    "scene": "transport",
    "en": "You can top up your EasyCard at any MRT station or convenience store.",
    "zh": "你可以在任何捷運站或便利商店幫悠遊卡加值。",
    "tip": "「加值」英文常說 top up 或 add value。悠遊卡也能搭公車、租 YouBike。"
   },
   {
    "scene": "signs",
    "en": "Sorry, no eating or drinking past the yellow line, not even water.",
    "zh": "不好意思，黃線以內不能吃東西或喝飲料，連喝水都不行。",
    "tip": "依《大眾捷運法》，在禁止飲食區飲食可處新台幣 1,500 元以上、7,500 元以下罰鍰。"
   },
   {
    "scene": "food",
    "en": "This is stinky tofu. It smells strong, but it tastes great!",
    "zh": "這是臭豆腐，聞起來很臭，但吃起來很棒！"
   },
   {
    "scene": "food",
    "en": "You can choose the sugar level, like half sugar or no sugar.",
    "zh": "你可以選甜度，例如半糖或無糖。",
    "tip": "冰塊也能選：regular ice（正常冰）、less ice（少冰）、no ice（去冰）。"
   },
   {
    "scene": "directions",
    "en": "Get off at Taipei 101/World Trade Center Station on the Red Line.",
    "zh": "在紅線的台北 101／世貿站下車。"
   },
   {
    "scene": "sightseeing",
    "en": "Please step over the threshold when you enter the temple. Don't step on it.",
    "zh": "進廟時請跨過門檻，不要踩在上面。",
    "tip": "threshold 是「門檻」。跨過門檻、不踩門檻，是對神明的尊重。"
   }
  ],
  "dialogue": {
   "title": "Bubble tea before the MRT",
   "title_zh": "搭捷運前先買珍奶",
   "lines": [
    {
     "who": "Emma",
     "en": "There are so many drink shops in Taipei! What should I order?",
     "zh": "台北的飲料店好多喔！我該點什麼？"
    },
    {
     "who": "You",
     "en": "Try brown sugar bubble milk tea. It's one of the most popular drinks here.",
     "zh": "試試黑糖珍珠奶茶，這是這裡最受歡迎的飲料之一。"
    },
    {
     "who": "Emma",
     "en": "OK! The clerk is asking me something. What does she want to know?",
     "zh": "好！店員在問我問題，她想知道什麼？"
    },
    {
     "who": "You",
     "en": "She's asking about sugar and ice. Half sugar and less ice is a good choice.",
     "zh": "她在問甜度和冰塊。半糖少冰是不錯的選擇。"
    },
    {
     "who": "Emma",
     "en": "Half sugar, less ice. Got it! Can I drink it on the MRT later?",
     "zh": "半糖少冰，了解！等一下可以在捷運上喝嗎？"
    },
    {
     "who": "You",
     "en": "No, you can't. Eating and drinking aren't allowed inside the yellow line.",
     "zh": "不行。黃線以內禁止飲食。"
    },
    {
     "who": "Emma",
     "en": "Really? What happens if I do?",
     "zh": "真的嗎？如果喝了會怎樣？"
    },
    {
     "who": "You",
     "en": "You could be fined up to 7,500 Taiwan dollars, so let's finish our drinks before we go in.",
     "zh": "最高可能被罰新台幣 7,500 元，所以我們進站前先把飲料喝完吧。"
    }
   ]
  },
  "sign": {
   "en": "PRIORITY SEAT",
   "zh": "優先席",
   "note": "台北捷運車廂內優先座位上的標示。priority 是「優先（權）」，seat 是「座位」。2025 年立法院修正《身心障礙者權益保障法》後，中文名稱由「博愛座」改為「優先席」，強調讓給「有實際需要的人」，例如孕婦、長者、身心障礙者、受傷或帶著小孩的乘客。想讓座時可以說：Would you like to sit here?（您要坐這裡嗎？）",
   "style": "underground"
  },
  "words": [
   {
    "word": "scooter",
    "pos": "n.",
    "zh": "機車；速克達",
    "example": "Thousands of scooters wait at the traffic lights in Taipei every morning."
   },
   {
    "word": "vendor",
    "pos": "n.",
    "zh": "小販；攤販",
    "example": "The vendor grilled our sausages right in front of us."
   },
   {
    "word": "temple",
    "pos": "n.",
    "zh": "廟宇；寺廟",
    "example": "Longshan Temple in Taipei was first built in 1738."
   },
   {
    "word": "transfer",
    "pos": "v./n.",
    "zh": "轉乘；轉車",
    "example": "Transfer to the Blue Line at Taipei Main Station."
   },
   {
    "word": "humid",
    "pos": "adj.",
    "zh": "潮濕的",
    "example": "Summer in Taipei is hot and humid, so carry an umbrella for the afternoon rain."
   },
   {
    "word": "souvenir",
    "pos": "n.",
    "zh": "紀念品",
    "example": "Pineapple cakes are a popular souvenir from Taiwan."
   }
  ],
  "quiz": [
   {
    "q": "You see a sign that says \"PRIORITY SEAT\" on the Taipei MRT. Who should be offered the seat first?",
    "options": [
     "Whoever gets on the train first",
     "Passengers who paid extra for their tickets",
     "People who really need it, such as pregnant women",
     "Students on their way to school"
    ],
    "answer": 2,
    "explain": "priority 是「優先」，PRIORITY SEAT 就是「優先席」，應優先讓給有實際需要的人，例如孕婦、長者、受傷或身心障礙的乘客。(A) 先上車的人不一定有需要；(B) 搭捷運不必為座位另外付費；(D) 學生並不是特別需要優先的對象。故選 (C)"
   },
   {
    "q": "In the dialogue, why does the student suggest finishing the drinks before going into the station?",
    "options": [
     "Because drinks are not sold inside the station",
     "Because the train is too crowded to hold a cup",
     "Because the tea will get cold on the train",
     "Because eating and drinking are not allowed inside the yellow line"
    ],
    "answer": 3,
    "explain": "對話中學生說 Eating and drinking aren't allowed inside the yellow line，違者最高可罰 7,500 元，所以建議進站前先喝完。(A) 對話沒提到站內有沒有賣飲料；(B) 沒提到車廂擁擠；(C) 沒提到飲料會變冷。故選 (D)"
   },
   {
    "q": "Emma: \"Full-sugar tea is too sweet for me.\" You: \"Next time, ask for ______.\"",
    "options": [
     "half sugar",
     "extra pearls",
     "a large cup",
     "more syrup"
    ],
    "answer": 0,
    "explain": "Emma 覺得全糖太甜，應該建議她點 half sugar（半糖）。(B) extra pearls 是加珍珠，跟甜度無關；(C) a large cup 是大杯，只會喝到更多糖；(D) more syrup 是加更多糖漿，會更甜。故選 (A)"
   }
  ],
  "keywords": [
   "Taipei",
   "Taiwan",
   "Taiwanese",
   "Taipei 101",
   "night market",
   "bubble tea",
   "Longshan Temple",
   "EasyCard"
  ],
  "related": [
   "a2",
   "a23",
   "a125"
  ]
 },
 {
  "id": "tokyo",
  "name": "Tokyo",
  "name_zh": "東京",
  "country": "Japan",
  "country_zh": "日本",
  "lat": 35.68,
  "lon": 139.69,
  "tz": "Asia/Tokyo",
  "lang": "en-US",
  "landmark": "Tokyo Tower",
  "landmark_zh": "東京鐵塔",
  "intro": "Tokyo, the capital of Japan, is home to about 14 million people. Its trains are famous for being clean, quiet and on time, and Shinjuku Station is often called the busiest station in the world. The orange-and-white Tokyo Tower, opened in 1958, is 333 meters tall. Many people do not speak much English, but station signs and many announcements are in English too, so a few polite phrases will take you far.",
  "intro_zh": "東京是日本的首都，大約有 1,400 萬人住在這裡。東京的電車以乾淨、安靜、準時聞名，新宿車站常被稱為世界上最繁忙的車站。橘白相間的東京鐵塔在 1958 年啟用，高 333 公尺。雖然很多人英文說得不多，但車站標示和許多廣播都有英文，只要學會幾句有禮貌的說法，就能暢遊東京。",
  "english_note": {
   "en": "Japanese uses many words borrowed from English, but some are shortened or have new meanings. Konbini is short for convenience store, manner mode means silent mode, and konsento means a power outlet. Staff may use these words, so it helps to know them, but use standard English yourself. Example: \"Is there an outlet where I can charge my phone?\"",
   "zh": "日文有很多從英文借來的外來語，但有些被縮短，有些意思變了（意思變了的叫「和製英語」）。例如 konbini 是 convenience store（便利商店）的縮寫，manner mode 指手機的靜音模式，konsento 則是「插座」（一般認為來自 concentric plug，跟 consent 無關）。店員可能會這樣說，聽得懂很有幫助，但自己說英文時要用標準說法。例句：Is there an outlet where I can charge my phone?（有可以幫手機充電的插座嗎？）"
  },
  "phrases": [
   {
    "scene": "transport",
    "en": "Does this train stop at Akihabara?",
    "zh": "這班電車有停秋葉原嗎？",
    "tip": "東京的電車分 Local（各站停車）、Rapid（快速）、Express（急行）等車種，快車不一定每站都停，上車前先確認。"
   },
   {
    "scene": "transport",
    "en": "Which platform is for the Yamanote Line?",
    "zh": "山手線要在哪個月台搭？",
    "tip": "山手線是繞行東京市中心的環狀線，東京站、新宿、澀谷、上野都在這條線上。"
   },
   {
    "scene": "food",
    "en": "How do I use this ticket machine?",
    "zh": "這台售票機要怎麼用？",
    "tip": "很多拉麵店要先在門口的售票機（食券機）買餐券，再把餐券交給店員。"
   },
   {
    "scene": "directions",
    "en": "Which exit is closest to Tokyo Tower?",
    "zh": "哪個出口離東京鐵塔最近？",
    "tip": "大車站的出口非常多，跟著寫有 Exit 的出口指標走，通常是黃色的。"
   },
   {
    "scene": "sightseeing",
    "en": "Is it OK to take pictures inside the shrine?",
    "zh": "神社裡面可以拍照嗎？",
    "tip": "有些神社、寺廟的室內禁止拍照，看到 No photography 的標示就不要拍。"
   },
   {
    "scene": "emergency",
    "en": "Excuse me, where is the nearest police box?",
    "zh": "不好意思，最近的派出所在哪裡？",
    "tip": "日本街頭的「交番」英文叫 police box（koban）。迷路或東西不見了，都可以去找警察幫忙。"
   }
  ],
  "dialogue": {
   "title": "At a convenience store",
   "title_zh": "在便利商店結帳",
   "lines": [
    {
     "who": "Clerk",
     "en": "Hello. Would you like your bento heated up?",
     "zh": "您好，便當需要幫您加熱嗎？"
    },
    {
     "who": "You",
     "en": "Yes, please. And could I have some chopsticks?",
     "zh": "好，麻煩了。可以給我一雙筷子嗎？"
    },
    {
     "who": "Clerk",
     "en": "Sure. Do you need a bag? There's a small charge.",
     "zh": "好的。需要袋子嗎？要另外付一點錢。"
    },
    {
     "who": "You",
     "en": "No, thanks. I have my own bag. Can I pay with Suica?",
     "zh": "不用，謝謝，我有自己的袋子。可以用 Suica 付款嗎？"
    },
    {
     "who": "Clerk",
     "en": "Yes. Please tap your card on the reader here.",
     "zh": "可以，請把卡片放在這裡的感應器上。"
    },
    {
     "who": "You",
     "en": "OK... Did it work?",
     "zh": "好……這樣可以了嗎？"
    },
    {
     "who": "Clerk",
     "en": "Yes, it did. Here's your receipt and your bento.",
     "zh": "可以了。這是您的收據和便當。"
    },
    {
     "who": "You",
     "en": "Thank you very much!",
     "zh": "非常謝謝您！"
    }
   ]
  },
  "sign": {
   "en": "Please set your mobile phone\nto silent mode and refrain\nfrom talking on the phone.",
   "zh": "請將手機設為靜音模式，並避免講電話。",
   "note": "在東京搭電車時常聽到的英文廣播。silent mode 是「靜音模式」（日本人常說和製英語 manner mode）；refrain from + V-ing 是「請勿、避免做某事」，比 Don't 客氣得多，是日本告示和廣播常見的正式用語。在日本，電車上講手機被認為很不禮貌，有事可以改傳訊息。",
   "style": "underground"
  },
  "words": [
   {
    "word": "platform",
    "pos": "n.",
    "zh": "月台",
    "example": "Many platforms in Tokyo now have safety gates along the edge."
   },
   {
    "word": "refrain",
    "pos": "v.",
    "zh": "克制；避免（常用 refrain from + V-ing）",
    "example": "Please refrain from eating on crowded trains."
   },
   {
    "word": "vending machine",
    "pos": "n.",
    "zh": "自動販賣機",
    "example": "You can buy hot or cold drinks from vending machines all over Tokyo."
   },
   {
    "word": "shrine",
    "pos": "n.",
    "zh": "神社；神殿",
    "example": "Meiji Shrine sits in a quiet forest in the middle of busy Tokyo."
   },
   {
    "word": "toilet",
    "pos": "n.",
    "zh": "廁所",
    "us": "restroom",
    "example": "The toilets in Tokyo's train stations are free and usually very clean."
   },
   {
    "word": "rush hour",
    "pos": "n.",
    "zh": "尖峰時段",
    "example": "Trains in Tokyo are very crowded during the morning rush hour."
   }
  ],
  "quiz": [
   {
    "q": "On a Tokyo train, you hear: \"Please set your mobile phone to silent mode and refrain from talking on the phone.\" What should you do?",
    "options": [
     "Call your friend but speak quietly",
     "Play music from your phone's speaker",
     "Turn off the ringtone and send a message instead of calling",
     "Ask the staff to repeat the announcement in Chinese"
    ],
    "answer": 2,
    "explain": "廣播要求把手機設成靜音（silent mode），並避免（refrain from）講電話，所以應關掉鈴聲、改用傳訊息。(A) 小聲講電話仍然是 talking on the phone；(B) 用喇叭放音樂違反靜音的要求；(D) 廣播內容很清楚，不需要請站務人員重播。故選 (C)"
   },
   {
    "q": "In the dialogue, what does the clerk mean by \"Would you like your bento heated up?\"",
    "options": [
     "Do you want me to warm your bento?",
     "Do you want a bigger bento?",
     "Do you want to eat your bento here?",
     "Do you want to pay for your bento now?"
    ],
    "answer": 0,
    "explain": "heat up 是「加熱」，店員是在問要不要幫忙把便當微波加熱。(B) 是問要不要大一點的便當；(C) 是問要不要內用；(D) 是問要不要現在付錢，都和 heat up 無關。故選 (A)"
   },
   {
    "q": "The sign in the museum said, \"Please ______ from touching the paintings.\"",
    "options": [
     "remain",
     "remind",
     "relax",
     "refrain"
    ],
    "answer": 3,
    "explain": "refrain from + V-ing 表示「請勿、避免」，是告示常見的客氣說法。(A) remain 是「保持、留下」；(B) remind 是「提醒」，常用 remind sb. of/to，不能說 remind from；(C) relax 是「放鬆」，都不合句意。故選 (D)"
   }
  ],
  "keywords": [
   "Tokyo",
   "Japan",
   "Japanese",
   "Shinjuku",
   "Shibuya",
   "Tokyo Tower",
   "Skytree",
   "Yamanote",
   "Shinkansen",
   "Suica"
  ],
  "related": [
   "a70",
   "a142"
  ]
 },
 {
  "id": "singapore",
  "name": "Singapore",
  "name_zh": "新加坡",
  "country": "Singapore",
  "country_zh": "新加坡",
  "lat": 1.29,
  "lon": 103.85,
  "tz": "Asia/Singapore",
  "lang": "en-SG",
  "landmark": "Marina Bay Sands",
  "landmark_zh": "濱海灣金沙酒店",
  "intro": "Singapore is a small island country just south of the Malay Peninsula, with about six million people. It has four official languages: English, Malay, Mandarin and Tamil. English is used in schools, in offices and on almost every sign. In 2020, Singapore's hawker culture was added to UNESCO's list of intangible cultural heritage. Visitors enjoy cheap local food, the Merlion, Marina Bay Sands, and a clean MRT system with strict rules.",
  "intro_zh": "新加坡是位在馬來半島南端外的小島國家，人口大約 600 萬。新加坡有四種官方語言：英語、馬來語、華語和淡米爾語，學校、辦公室和幾乎所有的標示都使用英語。2020 年，新加坡的小販文化被列入聯合國教科文組織的人類非物質文化遺產名錄。遊客可以享受便宜的在地美食、參觀魚尾獅和濱海灣金沙，並搭乘乾淨但規定嚴格的地鐵。",
  "english_note": {
   "en": "Many Singaporeans switch between Standard English and Singlish, a friendly, informal style with words from Malay, Hokkien, Cantonese and Tamil. One common feature is \"can\" used as a full answer meaning \"yes, that's possible\": \"Can I pay by card?\" \"Can!\" Little words like \"lah\" add feeling: \"Don't worry lah.\" Use Standard English yourself; knowing Singlish simply helps you understand people.",
   "zh": "許多新加坡人會在標準英語和 Singlish（新加坡式英語）之間切換。Singlish 是親切、非正式的說法，混合了馬來語、福建話、粵語和淡米爾語的詞彙。常見特色之一是用 can 單獨回答，表示「可以」，例如：Can I pay by card?（可以刷卡嗎？）Can!（可以！）句尾的 lah 用來加強語氣，例如 Don't worry lah.（別擔心啦。）自己說的時候用標準英語就好，聽得懂 Singlish 能幫助你和當地人溝通。"
  },
  "phrases": [
   {
    "scene": "food",
    "en": "Here or takeaway?",
    "zh": "內用還是外帶？",
    "tip": "小販中心的攤販常這樣問。Singlish 也常用 tapau 表示「外帶」，來自粵語的「打包」。"
   },
   {
    "scene": "food",
    "en": "One kopi-O kosong, please.",
    "zh": "一杯不加糖的黑咖啡，謝謝。",
    "tip": "kopi 是加煉乳的咖啡；kopi-O 是黑咖啡（預設加糖）；kosong 來自馬來語，意思是「零、空的」，表示不加糖。"
   },
   {
    "scene": "food",
    "en": "Excuse me, is this seat taken?",
    "zh": "不好意思，這個位子有人坐嗎？",
    "tip": "如果桌上放著一包面紙，代表有人「chope」（佔位）了，別坐那裡。"
   },
   {
    "scene": "transport",
    "en": "Can I pay for the MRT with my bank card?",
    "zh": "我可以用信用卡或金融卡搭地鐵嗎？",
    "tip": "可以。新加坡的地鐵和公車接受感應式的 Visa 或 Mastercard，直接在閘門感應就能進站。"
   },
   {
    "scene": "directions",
    "en": "For the Merlion, alight at Raffles Place. It's a short walk from there.",
    "zh": "要去魚尾獅的話，在萊佛士坊站下車，再走一小段路就到了。",
    "tip": "alight 是 get off（下車）的正式說法，新加坡的地鐵、公車廣播和標示很常用。從萊佛士坊站走到魚尾獅公園大約 5 到 10 分鐘。"
   },
   {
    "scene": "sightseeing",
    "en": "What time does the light show at Marina Bay start?",
    "zh": "濱海灣的燈光秀幾點開始？",
    "tip": "濱海灣金沙前的水岸通常每晚都有免費的燈光水舞秀 Spectra，出發前可上官網確認場次。"
   }
  ],
  "dialogue": {
   "title": "Ordering chicken rice at a hawker centre",
   "title_zh": "在小販中心點雞飯",
   "lines": [
    {
     "who": "Hawker",
     "en": "Hi! What would you like?",
     "zh": "嗨！要點什麼？"
    },
    {
     "who": "You",
     "en": "One chicken rice, please. Roasted chicken, not steamed.",
     "zh": "一份雞飯，謝謝。我要烤雞，不要白斬雞。"
    },
    {
     "who": "Hawker",
     "en": "Here or takeaway?",
     "zh": "內用還是外帶？"
    },
    {
     "who": "You",
     "en": "Here, please. How much is it?",
     "zh": "內用。請問多少錢？"
    },
    {
     "who": "Hawker",
     "en": "Five dollars. Cash or QR code also can.",
     "zh": "五塊錢。付現金或掃 QR Code 都可以。"
    },
    {
     "who": "You",
     "en": "I'll pay cash. Where should I put my tray after eating?",
     "zh": "我付現金。吃完以後托盤要放在哪裡？"
    },
    {
     "who": "Hawker",
     "en": "The tray return point is over there, next to the drinks stall.",
     "zh": "托盤回收處在那邊，就在飲料攤旁邊。"
    },
    {
     "who": "You",
     "en": "Got it. Thank you! It smells really good.",
     "zh": "知道了，謝謝！聞起來好香。"
    }
   ]
  },
  "sign": {
   "en": "NO SMOKING  Fine $1000\nNO EATING & DRINKING  Fine $500\nNO FLAMMABLE GOODS  Fine $5000\nNO DURIANS",
   "zh": "禁止吸菸　罰款 1,000 新幣\n禁止飲食　罰款 500 新幣\n禁止攜帶易燃物品　罰款 5,000 新幣\n禁止攜帶榴槤",
   "note": "新加坡地鐵站入口和車廂常見的禁止告示，用圖示加上罰款金額提醒乘客（單位是新加坡幣，標示的是最高罰款金額）。fine 當名詞是「罰款」；flammable 是「易燃的」；goods 是「物品、貨物」。連喝水也算 drinking。榴槤因為氣味強烈也禁止帶上車，不過標誌上沒有寫罰款金額。",
   "style": "underground"
  },
  "words": [
   {
    "word": "alight",
    "pos": "v.",
    "zh": "（從車上）下來；下車",
    "us": "get off",
    "example": "Alight at Bayfront station for Marina Bay Sands."
   },
   {
    "word": "queue",
    "pos": "n./v.",
    "zh": "隊伍；排隊",
    "us": "line",
    "example": "People often queue for a long time at the most famous chicken rice stalls."
   },
   {
    "word": "fine",
    "pos": "n./v.",
    "zh": "罰款；處以罰款",
    "example": "You can get a fine for eating or drinking on the MRT."
   },
   {
    "word": "lift",
    "pos": "n.",
    "zh": "電梯",
    "us": "elevator",
    "example": "Take the lift down to the MRT station."
   },
   {
    "word": "takeaway",
    "pos": "n.",
    "zh": "外帶（的食物）",
    "us": "takeout",
    "example": "We bought takeaway from the hawker centre and ate it at home."
   },
   {
    "word": "tray",
    "pos": "n.",
    "zh": "托盤",
    "example": "In Singapore, you must return your tray after eating at a hawker centre."
   }
  ],
  "quiz": [
   {
    "q": "According to the MRT sign, which of these could get you the biggest fine?",
    "options": [
     "Smoking on the train",
     "Drinking water on the platform",
     "Bringing a durian",
     "Carrying flammable goods"
    ],
    "answer": 3,
    "explain": "標誌上「禁止攜帶易燃物品」（flammable goods）罰款 5,000 新幣，金額最高。(A) 吸菸罰 1,000；(B) 喝水也算飲食，罰 500；(C) 榴槤禁止帶上車，但標誌上沒有寫罰款金額。故選 (D)"
   },
   {
    "q": "In the dialogue, the hawker asks, \"Here or takeaway?\" What does he want to know?",
    "options": [
     "Where the student comes from",
     "Whether the student will eat there or take the food away",
     "Whether the student wants roasted or steamed chicken",
     "How the student wants to pay"
    ],
    "answer": 1,
    "explain": "Here or takeaway? 是問「內用還是外帶」。(A) 問從哪裡來應該說 Where are you from?；(C) 要烤雞還是白斬雞，學生前一句已經說過了；(D) 付款方式是後面才談的 Cash or QR code。故選 (B)"
   },
   {
    "q": "You ask an MRT staff member how to get to the Merlion. She says, \"Alight at Raffles Place. It's a short walk from there.\" What does \"alight\" mean here?",
    "options": [
     "get off the train",
     "turn on the light",
     "wait in line",
     "pay the fare"
    ],
    "answer": 0,
    "explain": "alight 是較正式的用語，意思是「下車」（= get off），新加坡的地鐵和公車廣播很常用；站務人員是要你在萊佛士坊站下車，再走過去。(B) 是把 alight 誤看成 light；(C) 排隊是 queue；(D) 付車資是 pay the fare。故選 (A)"
   }
  ],
  "keywords": [
   "Singapore",
   "Singaporean",
   "Singlish",
   "Marina Bay Sands",
   "Merlion",
   "hawker centre",
   "Changi",
   "Sentosa"
  ],
  "related": []
 },
 {
  "id": "sydney",
  "name": "Sydney",
  "name_zh": "雪梨",
  "country": "Australia",
  "country_zh": "澳洲",
  "lat": -33.87,
  "lon": 151.21,
  "tz": "Australia/Sydney",
  "lang": "en-AU",
  "landmark": "Sydney Opera House",
  "landmark_zh": "雪梨歌劇院",
  "intro": "Sydney is the capital of New South Wales, but it is not the capital of Australia; that is Canberra. Its most famous building, the Sydney Opera House, opened in 1973 and became a UNESCO World Heritage Site in 2007. Next to it is the Harbour Bridge, opened in 1932 and nicknamed \"the Coathanger.\" Locals ride ferries across the harbour, swim at beaches like Bondi and Manly, and take sun safety seriously.",
  "intro_zh": "雪梨是新南威爾斯州的首府，但不是澳洲的首都，澳洲的首都是坎培拉。雪梨最有名的建築雪梨歌劇院在 1973 年啟用，2007 年被列為聯合國教科文組織世界遺產。歌劇院旁邊的雪梨港灣大橋在 1932 年通車，綽號叫「衣架」。當地人搭渡輪橫越港灣，到邦代、曼利等海灘游泳，而且非常重視防曬。",
  "english_note": {
   "en": "Australians often ask \"How are you going?\" It means \"How are you?\", not \"Where are you going?\", so just answer \"Good, thanks!\" Aussies also love short words: arvo (afternoon), brekkie (breakfast) and sunnies (sunglasses). \"No worries\" means \"You're welcome\" or \"No problem.\" Example: \"Let's go to the beach this arvo. Bring your sunnies!\"",
   "zh": "澳洲人常問 How are you going?，意思是「你好嗎？」，不是問「你要去哪裡」，回答 Good, thanks! 就可以了。澳洲人也很愛把字縮短，例如 arvo（下午）、brekkie（早餐）、sunnies（太陽眼鏡）。No worries 則表示「不客氣」或「沒問題」。例句：Let's go to the beach this arvo. Bring your sunnies!（今天下午去海邊吧，記得帶太陽眼鏡！）"
  },
  "phrases": [
   {
    "scene": "shopping",
    "en": "How are you going? Need a hand with anything?",
    "zh": "你好嗎？需要幫忙嗎？",
    "tip": "店員常這樣打招呼。How are you going? 就是 How are you?，回答 Good, thanks. 即可。"
   },
   {
    "scene": "transport",
    "en": "Is this the ferry to Manly?",
    "zh": "這是開往曼利的渡輪嗎？",
    "tip": "從環形碼頭（Circular Quay）搭 F1 渡輪到曼利大約 30 分鐘，一路可以欣賞歌劇院和港灣大橋。"
   },
   {
    "scene": "transport",
    "en": "Don't forget to tap off when you get off the train.",
    "zh": "下火車時別忘了刷卡出站。",
    "tip": "在雪梨搭車，上下車都要用 Opal 卡或感應式信用卡、金融卡刷卡（tap on / tap off）。忘了 tap off，會被收取 default fare，也就是該交通服務可能的最高票價（但不會超過每日上限）。"
   },
   {
    "scene": "food",
    "en": "Can I grab a flat white, please?",
    "zh": "請給我一杯馥列白，謝謝。",
    "tip": "flat white（馥列白）是澳洲咖啡館的招牌牛奶咖啡；grab 在口語中是「買、拿」的意思。"
   },
   {
    "scene": "sightseeing",
    "en": "Can we walk across the Harbour Bridge?",
    "zh": "我們可以走路過港灣大橋嗎？",
    "tip": "可以！大橋東側有免費的人行道；也可以付費參加 BridgeClimb，爬上拱頂。"
   },
   {
    "scene": "emergency",
    "en": "Call triple zero! Someone needs help in the water!",
    "zh": "快打 000！有人在水裡需要幫忙！",
    "tip": "澳洲的緊急電話是 000（念作 triple zero），可以叫警察、消防隊或救護車。"
   }
  ],
  "dialogue": {
   "title": "Catching the ferry to Manly",
   "title_zh": "搭渡輪去曼利",
   "lines": [
    {
     "who": "You",
     "en": "Excuse me, where does the ferry to Manly leave from?",
     "zh": "不好意思，去曼利的渡輪從哪裡出發？"
    },
    {
     "who": "Staff",
     "en": "G'day! It leaves from that wharf, just over there.",
     "zh": "你好！就是那邊那座碼頭。"
    },
    {
     "who": "You",
     "en": "Thanks. Do I need to buy a ticket first?",
     "zh": "謝謝。我需要先買票嗎？"
    },
    {
     "who": "Staff",
     "en": "No, just tap on with your Opal card or your bank card before you board.",
     "zh": "不用，上船前用 Opal 卡或你的信用卡、金融卡感應一下就好。"
    },
    {
     "who": "You",
     "en": "Great. How long does the trip take?",
     "zh": "太好了。船程要多久？"
    },
    {
     "who": "Staff",
     "en": "About thirty minutes. Going for a swim at Manly?",
     "zh": "大約三十分鐘。要去曼利游泳嗎？"
    },
    {
     "who": "You",
     "en": "Yes! Thanks for your help.",
     "zh": "對呀！謝謝你的幫忙。"
    },
    {
     "who": "Staff",
     "en": "No worries. Swim between the flags, and don't forget your sunscreen!",
     "zh": "不客氣。記得在旗子之間游泳，也別忘了擦防曬乳！"
    }
   ]
  },
  "sign": {
   "en": "SWIM BETWEEN\nTHE FLAGS",
   "zh": "請在旗子之間游泳",
   "note": "雪梨邦代、曼利等海灘常見的安全標語。有救生員巡守時，海灘上會插兩面紅黃色的旗子，兩旗之間就是有人看守、最安全的游泳區。between 是「在……之間」，flags 是「旗子」。海灘可能有危險的離岸流（rip current），看不到旗子就代表沒有人巡守，最好不要下水。",
   "style": "notice"
  },
  "words": [
   {
    "word": "harbour",
    "pos": "n.",
    "zh": "港灣；海港",
    "us": "harbor",
    "example": "Ferries cross Sydney Harbour all day long."
   },
   {
    "word": "ferry",
    "pos": "n.",
    "zh": "渡輪",
    "example": "We took the ferry from Circular Quay to Manly."
   },
   {
    "word": "footpath",
    "pos": "n.",
    "zh": "人行道",
    "us": "sidewalk",
    "example": "Cafés put tables out on the footpath when the weather is nice."
   },
   {
    "word": "sunscreen",
    "pos": "n.",
    "zh": "防曬乳",
    "example": "Australians are told to \"slip, slop, slap\": slip on a shirt, slop on sunscreen and slap on a hat."
   },
   {
    "word": "current",
    "pos": "n.",
    "zh": "水流；電流",
    "example": "A strong current can pull swimmers away from the beach."
   },
   {
    "word": "lifeguard",
    "pos": "n.",
    "zh": "救生員",
    "example": "Lifeguards watch the area between the red and yellow flags."
   }
  ],
  "quiz": [
   {
    "q": "A shop assistant in Sydney says, \"How are you going?\" What is the BEST reply?",
    "options": [
     "By ferry, I think.",
     "Good, thanks. And you?",
     "I'm going to Bondi Beach.",
     "At three this arvo."
    ],
    "answer": 1,
    "explain": "How are you going? 是澳洲人「你好嗎？」的問候，等於 How are you?，所以回答 Good, thanks. And you? 最恰當。(A) 回答交通方式；(C) 回答要去哪裡；(D) 回答時間（arvo 是下午），都是把 going 誤解成「去」。故選 (B)"
   },
   {
    "q": "What does the beach sign \"SWIM BETWEEN THE FLAGS\" tell you to do?",
    "options": [
     "Swim out to the flags as fast as you can",
     "Put up your own flag before you swim",
     "Swim only in the area marked by the red and yellow flags",
     "Swim only after the flags are taken down"
    ],
    "answer": 2,
    "explain": "between 是「在……之間」。紅黃旗之間是救生員看守的安全區，應該只在那裡游泳。(A) 不是要游向旗子；(B) 不需要自己插旗；(D) 旗子收起來代表沒有人巡守，反而不該下水。故選 (C)"
   },
   {
    "q": "In Sydney, what happens if you forget to tap off with your Opal card at the end of a train trip?",
    "options": [
     "Nothing. The trip becomes free.",
     "Your card stops working forever.",
     "You get a discount on your next trip.",
     "You are charged a default fare, the highest possible fare for that service."
    ],
    "answer": 3,
    "explain": "依新南威爾斯州交通局（Transport for NSW）的規定，沒有 tap off，系統無法算出實際車程，會收取 default fare，也就是該交通服務可能的最高票價。(A) 不會變成免費；(B) 卡片不會因此永久失效；(C) 不會有折扣，反而要多付錢。故選 (D)"
   }
  ],
  "keywords": [
   "Sydney",
   "Australia",
   "Australian",
   "Aussie",
   "Sydney Opera House",
   "Harbour Bridge",
   "Bondi",
   "Manly",
   "Opal card",
   "New South Wales"
  ],
  "related": [
   "a82"
  ]
 },
 {
  "id": "london",
  "name": "London",
  "name_zh": "倫敦",
  "country": "United Kingdom",
  "country_zh": "英國",
  "lat": 51.51,
  "lon": -0.13,
  "tz": "Europe/London",
  "lang": "en-GB",
  "landmark": "the Elizabeth Tower (Big Ben)",
  "landmark_zh": "伊莉莎白塔（大笨鐘）",
  "intro": "London is the capital of the United Kingdom and one of the most visited cities in the world. The River Thames flows past the Houses of Parliament and the Elizabeth Tower, whose great bell is called Big Ben. London's Underground, known as \"the Tube,\" opened in 1863 and is the oldest underground railway in the world. Many big museums, such as the British Museum, are free to enter, so you can see world treasures without spending much money.",
  "intro_zh": "倫敦是英國的首都，也是全世界最多遊客造訪的城市之一。泰晤士河流過國會大廈和伊莉莎白塔，塔中那口大鐘就叫做「大笨鐘」（Big Ben）。倫敦的地下鐵路俗稱「the Tube」，1863 年通車，是全世界最古老的地下鐵路。許多大型博物館（例如大英博物館）都可以免費參觀，不必花很多錢就能看到世界級的珍寶。",
  "english_note": {
   "en": "Londoners call their metro \"the Tube\" or \"the Underground,\" not \"the subway.\" In British English, a subway is a tunnel for people to walk under a busy road. So \"Take the Tube to Westminster\" means ride the train, but \"Use the subway to cross the road\" means walk through the tunnel.",
   "zh": "倫敦人把地鐵叫做 the Tube 或 the Underground，不說 the subway。在英式英語中，subway 指的是讓行人穿越大馬路的地下道。所以 Take the Tube to Westminster 是「搭地鐵到西敏」，而 Use the subway to cross the road 則是「走地下道過馬路」。"
  },
  "phrases": [
   {
    "scene": "transport",
    "en": "Can I pay with my contactless card here?",
    "zh": "這裡可以用感應式信用卡付款嗎？",
    "tip": "可以。倫敦地鐵和公車都能用感應式（contactless）信用卡、簽帳金融卡或手機付款。搭地鐵進站、出站都要在黃色讀卡機上感應一次（touch in / touch out），而且要用同一張卡；搭公車只要上車時感應。"
   },
   {
    "scene": "food",
    "en": "Is that to eat in or take away?",
    "zh": "請問要內用還是外帶？",
    "tip": "這是店員常問的英式說法；美式說法是 For here or to go?。外帶餐點英國叫 takeaway，美國叫 takeout。"
   },
   {
    "scene": "shopping",
    "en": "Sorry, are you in the queue?",
    "zh": "不好意思，請問你在排隊嗎？",
    "tip": "英國人很重視排隊，插隊（jump the queue）會讓人很不高興。英國人也常用 Sorry 開頭，客氣地發問。"
   },
   {
    "scene": "hotel",
    "en": "Excuse me, where's the lift?",
    "zh": "不好意思，請問電梯在哪裡？",
    "tip": "英式 lift = 美式 elevator。另外，英國的 ground floor（按鈕常寫 G）是台灣的一樓，first floor 是台灣的二樓。"
   },
   {
    "scene": "sightseeing",
    "en": "Is the museum free to get in?",
    "zh": "這間博物館可以免費入場嗎？",
    "tip": "大英博物館、國家藝廊、自然史博物館等國立博物館的常設展都免費，特展通常要另外買票。"
   },
   {
    "scene": "directions",
    "en": "Is it quicker to walk or take the Tube?",
    "zh": "用走的比較快，還是搭地鐵比較快？",
    "tip": "倫敦市中心有些地鐵站其實很近，例如萊斯特廣場站到柯芬園站不到 300 公尺，走路往往比搭車快。"
   }
  ],
  "dialogue": {
   "title": "Asking the way at Bond Street station",
   "title_zh": "在龐德街地鐵站問路",
   "lines": [
    {
     "who": "Staff",
     "en": "Morning! Are you all right there?",
     "zh": "早安！需要幫忙嗎？"
    },
    {
     "who": "You",
     "en": "Yes, thanks. How do I get to the British Museum from here?",
     "zh": "是的，謝謝。請問從這裡要怎麼去大英博物館？"
    },
    {
     "who": "Staff",
     "en": "Take the Central line eastbound. That's the red line. Get off at Tottenham Court Road. It's just two stops.",
     "zh": "搭往東行駛的中央線，就是紅色那條線，在托特納姆宮路站下車，只要兩站。"
    },
    {
     "who": "You",
     "en": "Do I need to buy a ticket from the machine?",
     "zh": "我需要在售票機買票嗎？"
    },
    {
     "who": "Staff",
     "en": "No need. Just touch your contactless card on the yellow reader, and touch out again at the other end.",
     "zh": "不用。直接把感應式信用卡放在黃色讀卡機上感應，到站出站時再感應一次就好。"
    },
    {
     "who": "You",
     "en": "Brilliant. Is the museum far from the station?",
     "zh": "太好了。博物館離車站遠嗎？"
    },
    {
     "who": "Staff",
     "en": "Not at all. It's about a five-minute walk. Just follow the signs.",
     "zh": "一點也不遠，走路大約五分鐘，跟著指標走就行了。"
    },
    {
     "who": "You",
     "en": "Cheers! Thanks for your help.",
     "zh": "謝啦！謝謝你的幫忙。"
    }
   ]
  },
  "sign": {
   "en": "LOOK RIGHT →",
   "zh": "往右看（注意右方來車）",
   "note": "倫敦許多行人穿越道（斑馬線）和路口前的路面上，都漆著 LOOK RIGHT 或 LOOK LEFT，旁邊的箭頭指出來車方向。英國車輛靠左行駛，和台灣相反，所以踏出人行道時，最靠近你的車道上的車通常從右邊來。關鍵字：look right＝往右看，look left＝往左看；看到這幾個字，先照方向確認來車再過馬路。",
   "style": "road"
  },
  "words": [
   {
    "word": "queue",
    "pos": "n./v.",
    "zh": "（排成的）隊伍；排隊",
    "us": "line",
    "example": "There was a long queue outside the bakery, so we joined the end of it."
   },
   {
    "word": "lift",
    "pos": "n.",
    "zh": "電梯",
    "us": "elevator",
    "example": "The lift is out of order, so we'll have to take the stairs."
   },
   {
    "word": "flat",
    "pos": "n.",
    "zh": "公寓",
    "us": "apartment",
    "example": "My cousin shares a small flat with two friends in north London."
   },
   {
    "word": "underground",
    "pos": "n.",
    "zh": "地下鐵路；地鐵",
    "us": "subway",
    "example": "In central London, the Underground is often faster than a taxi."
   },
   {
    "word": "return",
    "pos": "n.",
    "zh": "來回票",
    "us": "round-trip ticket",
    "example": "A return to Oxford, please. I'm coming back this evening."
   },
   {
    "word": "rubbish",
    "pos": "n.",
    "zh": "垃圾",
    "us": "trash / garbage",
    "example": "Please put your rubbish in the bin before you leave the park."
   }
  ],
  "quiz": [
   {
    "q": "At a London hotel, you want to go up to your room on the fifth floor. What should you look for?",
    "options": [
     "A queue",
     "A lift",
     "A flat",
     "A return"
    ],
    "answer": 1,
    "explain": "lift 是英式英語的「電梯」（美式說 elevator），要上樓就要找電梯。(A) queue 是「隊伍」；(C) flat 是「公寓」；(D) return 是「來回票」，都不能帶你上樓。故選 (B)"
   },
   {
    "q": "According to the dialogue, how should \"You\" pay for the ride to Tottenham Court Road?",
    "options": [
     "By buying a paper ticket from the machine",
     "By paying the staff member in cash",
     "By touching a contactless card on the yellow reader",
     "By showing a student ID card"
    ],
    "answer": 2,
    "explain": "站務人員說 No need. Just touch your contactless card on the yellow reader，表示不用買票，用感應式信用卡感應即可。(A) 他明確說不需要在售票機買票；(B) 對話沒有提到付現金給站務人員；(D) 對話沒有提到學生證。故選 (C)"
   },
   {
    "q": "You are about to cross a street in London and see \"LOOK RIGHT →\" painted on the road. What does it tell you?",
    "options": [
     "Check for traffic coming from your right before you cross.",
     "Turn right to find the nearest Tube station.",
     "Only cars turning right may use this lane.",
     "Look at the shop on your right for a map."
    ],
    "answer": 0,
    "explain": "英國車輛靠左行駛，路面上的 LOOK RIGHT 是提醒行人過馬路前先往右看，確認有沒有來車。(B) 標示和地鐵站無關；(C) 這是寫給行人看的提醒，不是車道指示；(D) 和商店、地圖無關。故選 (A)"
   }
  ],
  "keywords": [
   "London",
   "Londoner",
   "United Kingdom",
   "Britain",
   "British",
   "England",
   "Thames",
   "Big Ben",
   "Westminster"
  ],
  "related": [
   "a76",
   "a113"
  ]
 },
 {
  "id": "newyork",
  "name": "New York City",
  "name_zh": "紐約市",
  "country": "United States",
  "country_zh": "美國",
  "lat": 40.71,
  "lon": -74.01,
  "tz": "America/New_York",
  "lang": "en-US",
  "landmark": "the Statue of Liberty",
  "landmark_zh": "自由女神像",
  "intro": "New York City is the largest city in the United States. More than eight million people live in its five boroughs, such as Manhattan and Brooklyn. The Statue of Liberty, a gift from France, has stood in New York Harbor since 1886. New York is often called \"the city that never sleeps,\" and its subway runs 24 hours a day. Visitors walk through Central Park, look up at the Empire State Building and see shows on Broadway.",
  "intro_zh": "紐約市是美國人口最多的城市，有超過 800 萬人住在曼哈頓、布魯克林等五個行政區。自由女神像是法國送給美國的禮物，從 1886 年起就矗立在紐約港。紐約常被稱為「不夜城」，地鐵也是 24 小時營運。遊客可以漫步中央公園、抬頭仰望帝國大廈，還能在百老匯欣賞表演。",
  "english_note": {
   "en": "In Manhattan, people often say \"uptown\" (north) and \"downtown\" (south) instead of north and south. Most streets run east to west and avenues run north to south, so people name places by the corner: \"It's on 42nd and Fifth\" means near 42nd Street and Fifth Avenue.",
   "zh": "在曼哈頓，大家常用 uptown（往北、上城）和 downtown（往南、下城）代替 north 和 south。曼哈頓大部分的 street 是東西向，avenue 是南北向，所以人們習慣用路口來說地點：It's on 42nd and Fifth 就是「在 42 街和第五大道的路口附近」。"
  },
  "phrases": [
   {
    "scene": "transport",
    "en": "Is this the uptown or downtown platform?",
    "zh": "這是往上城（北）還是往下城（南）的月台？",
    "tip": "有些地鐵站的上城和下城月台各有獨立入口，進站後不能直接走到對面，所以進站前先看清楚入口寫的是 Uptown 還是 Downtown。"
   },
   {
    "scene": "transport",
    "en": "Can I tap my phone to pay for the subway?",
    "zh": "我可以用手機感應付地鐵車資嗎？",
    "tip": "可以。紐約地鐵和公車使用 OMNY 感應付款，手機、感應式信用卡或簽帳金融卡都能直接在閘門感應；舊的 MetroCard 已在 2025 年底停售，正逐步淘汰。"
   },
   {
    "scene": "food",
    "en": "Could we get the check, please?",
    "zh": "可以幫我們結帳嗎？",
    "tip": "美式英語說 check，英式英語說 bill。在紐約的餐廳坐下來用餐，小費通常是餐費的 18% 到 20%。"
   },
   {
    "scene": "directions",
    "en": "How many blocks is it to Times Square?",
    "zh": "到時代廣場還要走幾個街區？",
    "tip": "紐約人常用 block（街區）來說距離。在曼哈頓沿著大道南北向走，一個街區（從一條 street 到下一條）大約 80 公尺，走路一分鐘左右；東西向在兩條大道之間的街區就長得多。"
   },
   {
    "scene": "shopping",
    "en": "Does the price include tax?",
    "zh": "這個價格含稅嗎？",
    "tip": "美國的標價通常不含銷售稅，結帳時才會加上。紐約市的銷售稅是 8.875%。"
   },
   {
    "scene": "sightseeing",
    "en": "Where do I get the ferry to the Statue of Liberty?",
    "zh": "請問去自由女神像的渡輪在哪裡搭？",
    "tip": "上島參觀的渡輪從曼哈頓南端的砲台公園（Battery Park）出發。免費的史泰登島渡輪不停靠自由女神像，但會從附近經過，也能看得很清楚。"
   }
  ],
  "dialogue": {
   "title": "Paying the check at a diner",
   "title_zh": "在美式餐館結帳",
   "lines": [
    {
     "who": "Server",
     "en": "How was everything? Can I get you anything else?",
     "zh": "餐點還可以嗎？還需要什麼嗎？"
    },
    {
     "who": "You",
     "en": "Everything was great, thanks. Could we get the check, please?",
     "zh": "都很好吃，謝謝。可以幫我們結帳嗎？"
    },
    {
     "who": "Server",
     "en": "Sure, here you go. I'll take it whenever you're ready.",
     "zh": "好的，帳單在這裡。你們準備好了我再來收。"
    },
    {
     "who": "You",
     "en": "Is the tip included?",
     "zh": "請問小費有包含在裡面嗎？"
    },
    {
     "who": "Server",
     "en": "No, it isn't. You can add it on the card reader.",
     "zh": "沒有喔。你可以在刷卡機上加小費。"
    },
    {
     "who": "You",
     "en": "OK. I'll add twenty percent. The service was really good.",
     "zh": "好的，我加 20%。你們的服務真的很好。"
    },
    {
     "who": "Server",
     "en": "Thank you so much! Have a great day.",
     "zh": "非常感謝！祝你有美好的一天。"
    },
    {
     "who": "You",
     "en": "You too!",
     "zh": "你也是！"
    }
   ]
  },
  "sign": {
   "en": "Stand clear of the closing doors, please.",
   "zh": "車門即將關閉，請遠離車門。",
   "note": "這是紐約地鐵列車關門前常播放的廣播，幾乎每個搭過地鐵的人都聽過。stand clear of 是「離……遠一點、不要靠近」，closing doors 是「正在關上的車門」。聽到這句話就不要再衝上車或用手擋門，等下一班車比較安全。",
   "style": "underground"
  },
  "words": [
   {
    "word": "block",
    "pos": "n.",
    "zh": "街區",
    "example": "The museum is just three blocks from our hotel."
   },
   {
    "word": "downtown",
    "pos": "adv./adj./n.",
    "zh": "往市中心（的）；市中心；（曼哈頓）往南、下城",
    "example": "Take the downtown train if you want to go to Wall Street."
   },
   {
    "word": "subway",
    "pos": "n.",
    "zh": "地鐵",
    "example": "The subway is the fastest way to get around New York."
   },
   {
    "word": "check",
    "pos": "n.",
    "zh": "（餐廳的）帳單",
    "example": "After dinner, my dad asked the server for the check."
   },
   {
    "word": "tip",
    "pos": "n./v.",
    "zh": "小費；給小費",
    "example": "In New York, people usually tip 18 to 20 percent at restaurants."
   },
   {
    "word": "sidewalk",
    "pos": "n.",
    "zh": "人行道",
    "example": "The sidewalks in Midtown are always crowded at lunchtime."
   }
  ],
  "quiz": [
   {
    "q": "A New Yorker tells you, \"The café is on 23rd and Sixth.\" Where is the café?",
    "options": [
     "On the 23rd floor of a building on Sixth Avenue",
     "At a bus stop that opens at 6:23",
     "Near the corner of 23rd Street and Sixth Avenue",
     "Six blocks away from 23rd Avenue"
    ],
    "answer": 2,
    "explain": "紐約人習慣用路口說地點，23rd and Sixth 指的是 23 街（23rd Street）和第六大道（Sixth Avenue）交叉口附近。(A) 句子沒有提到樓層；(B) 這不是時間；(D) 23rd 指的是街，不是大道，也沒說相隔六個街區。故選 (C)"
   },
   {
    "q": "In the dialogue, how will \"You\" leave the tip?",
    "options": [
     "By leaving cash on the table",
     "By paying the server at the door",
     "By asking the manager to add it later",
     "By adding it on the card reader"
    ],
    "answer": 3,
    "explain": "服務生說 You can add it on the card reader，你也回答 I'll add twenty percent，所以是在刷卡機上加小費。(A) 對話沒提到把現金留在桌上；(B) 沒提到在門口付給服務生；(C) 對話中沒有經理。故選 (D)"
   },
   {
    "q": "On the New York subway, you hear \"Stand clear of the closing doors, please.\" What should you do?",
    "options": [
     "Hold the doors open for your friend",
     "Move away from the doors because they are closing",
     "Stand next to the doors and get ready to get off",
     "Help the staff close the doors"
    ],
    "answer": 1,
    "explain": "stand clear of 意思是「遠離、不要靠近」，廣播提醒乘客車門正在關閉，要離開車門。(A) 用手擋門正是廣播要避免的行為；(C) 站在門邊與「遠離車門」相反；(D) 乘客不需要幫忙關門。故選 (B)"
   }
  ],
  "keywords": [
   "New York",
   "New Yorker",
   "Manhattan",
   "Brooklyn",
   "Bronx",
   "Statue of Liberty",
   "Times Square",
   "Central Park",
   "Broadway",
   "Empire State Building"
  ],
  "related": [
   "a31",
   "a92"
  ]
 },
 {
  "id": "toronto",
  "name": "Toronto",
  "name_zh": "多倫多",
  "country": "Canada",
  "country_zh": "加拿大",
  "lat": 43.65,
  "lon": -79.38,
  "tz": "America/Toronto",
  "lang": "en-CA",
  "landmark": "the CN Tower",
  "landmark_zh": "加拿大國家電視塔（CN 塔）",
  "intro": "Toronto is the largest city in Canada and the capital of the province of Ontario. It lies on the north shore of Lake Ontario. Its famous CN Tower is 553 metres tall and opened in 1976. For more than 30 years, it was the tallest free-standing structure in the world. Toronto is also one of the most multicultural cities on Earth, so you can hear many languages on its streetcars. Summers are warm, but winters are long, cold and snowy.",
  "intro_zh": "多倫多是加拿大最大的城市，也是安大略省的首府，位在安大略湖的北岸。著名的加拿大國家電視塔（CN 塔）高 553 公尺，1976 年開放，曾經保持「世界最高的獨立式結構物」紀錄超過 30 年。多倫多也是全世界文化最多元的城市之一，在路面電車上可以聽到各種語言。這裡夏天溫暖，冬天卻又長又冷，而且常常下雪。",
  "english_note": {
   "en": "Canadian English mixes British spelling with American words. Signs use British spellings like \"centre,\" \"colour\" and \"neighbourhood,\" but people say \"elevator,\" \"apartment\" and \"truck,\" just like Americans. Example: \"Take the elevator to the food court in the Eaton Centre.\"",
   "zh": "加拿大英語混合了英式拼字和美式用字：招牌上常看到英式拼法，例如 centre、colour、neighbourhood，但日常用字卻和美國人一樣說 elevator（電梯）、apartment（公寓）、truck（卡車）。例如：Take the elevator to the food court in the Eaton Centre.（搭電梯到伊頓中心的美食街。）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "Where do I catch the UP Express to Union Station?",
    "zh": "請問往聯合車站的 UP Express 機場快線要在哪裡搭？",
    "tip": "UP Express 從皮爾森機場第一航廈的車站發車，大約每 15 分鐘一班，不到半小時就能到市中心的聯合車站（Union Station）。"
   },
   {
    "scene": "transport",
    "en": "Can I tap my credit card to pay the fare?",
    "zh": "我可以用信用卡感應付車資嗎？",
    "tip": "可以。TTC 的地鐵、公車和路面電車都能用感應式信用卡、簽帳金融卡或手機在 PRESTO 讀卡機上感應付款，第一次感應後兩小時內轉乘不用再付費。"
   },
   {
    "scene": "food",
    "en": "Can I get a medium double-double, please?",
    "zh": "我要一杯中杯的 double-double，謝謝。",
    "tip": "double-double 是加拿大連鎖咖啡店 Tim Hortons 的經典點法，意思是咖啡加兩份鮮奶油（cream）和兩份糖。"
   },
   {
    "scene": "shopping",
    "en": "Is that price before or after tax?",
    "zh": "這個價格是稅前還是稅後？",
    "tip": "加拿大的標價通常不含稅。安大略省的統一銷售稅（HST）是 13%，結帳時才會加上。"
   },
   {
    "scene": "directions",
    "en": "Excuse me, where's the nearest washroom?",
    "zh": "不好意思，請問最近的洗手間在哪裡？",
    "tip": "加拿大人說 washroom，美國人多說 restroom 或 bathroom，英國人常說 toilet。"
   },
   {
    "scene": "sightseeing",
    "en": "How long is the wait to go up the CN Tower?",
    "zh": "上 CN 塔要排隊等多久？",
    "tip": "CN 塔有一層玻璃地板（Glass Floor），站在上面可以直接看到 342 公尺下方的地面。"
   }
  ],
  "dialogue": {
   "title": "Buying a toque on a cold day",
   "title_zh": "在寒冷的日子買毛線帽",
   "lines": [
    {
     "who": "Clerk",
     "en": "Hi there! Cold enough for you?",
     "zh": "嗨！今天夠冷了吧？"
    },
    {
     "who": "You",
     "en": "Yes! I didn't know Toronto could be this cold. I need a warm hat.",
     "zh": "對啊！我不知道多倫多會這麼冷。我需要一頂保暖的帽子。"
    },
    {
     "who": "Clerk",
     "en": "You mean a toque? These wool ones are on sale for twenty dollars.",
     "zh": "你是說毛線帽（toque）嗎？這些羊毛帽特價 20 加幣。"
    },
    {
     "who": "You",
     "en": "Great, I'll take the red one. Is that price before tax?",
     "zh": "太好了，我要紅色那頂。這個價格是稅前的嗎？"
    },
    {
     "who": "Clerk",
     "en": "Yes. With the thirteen percent HST, it comes to twenty-two sixty.",
     "zh": "是的。加上 13% 的統一銷售稅（HST），總共是 22.60 加幣。"
    },
    {
     "who": "You",
     "en": "OK. Can I pay by card?",
     "zh": "好的。我可以刷卡嗎？"
    },
    {
     "who": "Clerk",
     "en": "Sure, just tap it here. Stay warm out there!",
     "zh": "當然，在這裡感應就好。出去要注意保暖喔！"
    },
    {
     "who": "You",
     "en": "Thanks, you too!",
     "zh": "謝謝，你也是！"
    }
   ]
  },
  "sign": {
   "en": "Arrivals / Arrivées\nDepartures / Départs",
   "zh": "抵達／出發",
   "note": "多倫多皮爾森國際機場依照加拿大《官方語言法》，標示都使用英文和法文這兩種官方語言。Arrivals 是「抵達」（下飛機、領行李、接機的地方），Departures 是「出發」（報到、搭機的地方）；斜線後面的法文 Arrivées、Départs 意思相同。在加拿大，政府機關的標示和商品包裝上的說明也常是英法雙語。",
   "style": "airport"
  },
  "words": [
   {
    "word": "colour",
    "pos": "n.",
    "zh": "顏色",
    "us": "color",
    "example": "What colour is your new winter jacket?"
   },
   {
    "word": "centre",
    "pos": "n.",
    "zh": "中心",
    "us": "center",
    "example": "The Eaton Centre is a huge shopping mall in downtown Toronto."
   },
   {
    "word": "washroom",
    "pos": "n.",
    "zh": "洗手間；廁所",
    "us": "restroom",
    "example": "Excuse me, is there a washroom in this station?"
   },
   {
    "word": "fare",
    "pos": "n.",
    "zh": "車資；票價",
    "example": "You can pay your TTC fare by tapping a credit card."
   },
   {
    "word": "bilingual",
    "pos": "adj.",
    "zh": "雙語的",
    "example": "The signs at Toronto Pearson Airport are bilingual, in English and French."
   },
   {
    "word": "freezing",
    "pos": "adj.",
    "zh": "極冷的；冰凍的",
    "example": "It's freezing outside, so don't forget your gloves and a warm hat."
   }
  ],
  "quiz": [
   {
    "q": "Your Canadian friend says, \"I'll wait for you outside the washroom.\" Where will your friend be?",
    "options": [
     "Outside the laundry room",
     "Outside the kitchen",
     "Outside the car wash",
     "Outside the toilets"
    ],
    "answer": 3,
    "explain": "washroom 是加拿大人對「洗手間、廁所」的說法（美國人多說 restroom）。(A) laundry room 是洗衣間；(B) kitchen 是廚房；(C) car wash 是洗車場，都不是 washroom 的意思。故選 (D)"
   },
   {
    "q": "In the dialogue, how much does \"You\" pay for the toque?",
    "options": [
     "$13.00",
     "$22.60",
     "$20.00",
     "$33.00"
    ],
    "answer": 1,
    "explain": "帽子標價 20 元，店員說加上 13% 的 HST 後 it comes to twenty-two sixty，也就是 22.60 元。(A) 13 是稅率，不是價錢；(C) 20 元是稅前價格；(D) 是把 20 和 13 直接相加，算法錯誤。故選 (B)"
   },
   {
    "q": "Why do the signs at Toronto Pearson Airport show both \"Arrivals\" and \"Arrivées\"?",
    "options": [
     "Because most people in Toronto speak only French",
     "Because the airport was built by a company from France",
     "Because English and French are Canada's two official languages",
     "Because \"Arrivées\" is the Canadian spelling of \"Arrivals\""
    ],
    "answer": 2,
    "explain": "英文和法文都是加拿大的官方語言，機場依法使用雙語標示，Arrivées 是法文的「抵達」。(A) 多倫多居民大多說英語，並非只說法語；(B) 雙語標示是法律規定，和由誰建造無關；(D) Arrivées 是法文，不是加拿大式的英文拼法。故選 (C)"
   }
  ],
  "keywords": [
   "Toronto",
   "Torontonian",
   "Canada",
   "Canadian",
   "Ontario",
   "Lake Ontario",
   "CN Tower",
   "TTC"
  ],
  "related": []
 },
 {
  "id": "losangeles",
  "name": "Los Angeles",
  "name_zh": "洛杉磯",
  "country": "United States",
  "country_zh": "美國",
  "lat": 34.05,
  "lon": -118.24,
  "tz": "America/Los_Angeles",
  "lang": "en-US",
  "landmark": "the Hollywood Sign",
  "landmark_zh": "好萊塢標誌",
  "intro": "Los Angeles, or L.A., is the second-largest city in the United States and the center of the American film industry. High on the hills above Hollywood stands the Hollywood Sign. It was built in 1923 to advertise new homes and first read \"HOLLYWOODLAND.\" L.A. is famous for its sunny weather, nearby beaches such as Santa Monica, and busy freeways full of cars. In 2028, the city will host the Summer Olympics for the third time, after 1932 and 1984.",
  "intro_zh": "洛杉磯（L.A.）是美國第二大城市，也是美國電影產業的中心。好萊塢上方的山坡上矗立著著名的好萊塢標誌，它在 1923 年設立，當初是為了替新建住宅打廣告，上面寫的是「HOLLYWOODLAND」。洛杉磯以陽光充足的天氣、鄰近的聖塔莫尼卡等海灘，以及車流不斷的高速公路聞名。2028 年，洛杉磯將第三度舉辦夏季奧運，前兩次是 1932 年和 1984 年。",
  "english_note": {
   "en": "In Southern California, people put \"the\" before freeway numbers. They don't say \"Take Interstate 10\"; they say \"Take the 10.\" For example: \"Take the 10 west all the way to Santa Monica.\" In many other parts of the U.S., people just say \"Take 10\" or \"Take I-10,\" so \"the 10\" sounds very L.A.",
   "zh": "南加州人習慣在高速公路編號前面加 the：不說 Take Interstate 10，而說 Take the 10（走 10 號高速公路）。例如：Take the 10 west all the way to Santa Monica.（走 10 號公路一路往西開到聖塔莫尼卡。）美國許多其他地方的人只說 Take 10 或 Take I-10，所以 the 10 聽起來就很有洛杉磯味。"
  },
  "phrases": [
   {
    "scene": "transport",
    "en": "Can I take the Metro to Santa Monica?",
    "zh": "我可以搭捷運（Metro）到聖塔莫尼卡嗎？",
    "tip": "可以。洛杉磯 Metro 的 E 線（輕軌）從市中心一路開到聖塔莫尼卡，從終點站走到海灘和碼頭大約 10 分鐘。可以用 TAP 卡（車站售票機有賣），2026 年起也能直接用感應式信用卡或手機在閘門感應付款。"
   },
   {
    "scene": "directions",
    "en": "Take the 405 north and get off at Sunset Boulevard.",
    "zh": "走 405 號高速公路往北，在日落大道下交流道。",
    "tip": "這是當地人報路的典型說法；get off 也可以說 exit。注意南加州人會在公路編號前加 the。"
   },
   {
    "scene": "food",
    "en": "For here or to go?",
    "zh": "內用還是外帶？",
    "tip": "這是美式說法，英國人則說 Eat in or take away?。要外帶就回答 To go, please.。"
   },
   {
    "scene": "sightseeing",
    "en": "Where's the best place to see the Hollywood Sign?",
    "zh": "哪裡是看好萊塢標誌最好的地方？",
    "tip": "遊客不能走到標誌旁邊（四周有圍欄，禁止進入）。免費入場的葛瑞菲斯天文台（Griffith Observatory）是很受歡迎的拍照地點。"
   },
   {
    "scene": "shopping",
    "en": "Do you have any sunscreen with SPF 50?",
    "zh": "請問有 SPF 50 的防曬乳嗎？",
    "tip": "洛杉磯一年中大部分時間陽光都很強，去海邊或爬山都要記得擦防曬、戴帽子、多喝水。"
   },
   {
    "scene": "emergency",
    "en": "Call 911! My friend fainted in the heat.",
    "zh": "快打 911！我朋友熱到昏倒了。",
    "tip": "美國的緊急電話（警察、消防、救護車）都是 911。"
   }
  ],
  "dialogue": {
   "title": "Ordering at a taco truck",
   "title_zh": "在塔可餐車點餐",
   "lines": [
    {
     "who": "Worker",
     "en": "Hi! What can I get you?",
     "zh": "嗨！你要點什麼？"
    },
    {
     "who": "You",
     "en": "Hi. Can I get two chicken tacos and a bottle of water, please?",
     "zh": "嗨，我要兩個雞肉塔可和一瓶水，謝謝。"
    },
    {
     "who": "Worker",
     "en": "Sure. Do you want everything on them? Onions, cilantro and salsa?",
     "zh": "好的。配料全部都要加嗎？洋蔥、香菜和莎莎醬？"
    },
    {
     "who": "You",
     "en": "Everything except onions, please. Is the salsa spicy?",
     "zh": "除了洋蔥以外都要，謝謝。莎莎醬會辣嗎？"
    },
    {
     "who": "Worker",
     "en": "The red one is pretty hot. The green one is milder.",
     "zh": "紅色的滿辣的，綠色的比較溫和。"
    },
    {
     "who": "You",
     "en": "I'll go with the green one, then. How much is that?",
     "zh": "那我選綠色的。總共多少錢？"
    },
    {
     "who": "Worker",
     "en": "That's ten dollars. Here you go. Napkins are on the side.",
     "zh": "總共 10 美元。這是你的餐點，紙巾在旁邊。"
    },
    {
     "who": "You",
     "en": "Thanks! It smells great.",
     "zh": "謝謝！聞起來好香。"
    }
   ]
  },
  "sign": {
   "en": "NO TURN\nON RED",
   "zh": "紅燈時禁止轉彎",
   "note": "在加州，紅燈時只要先完全停車、確認沒有來車和行人，一般就可以右轉，這點和台灣不同。但洛杉磯許多繁忙的路口會掛 NO TURN ON RED 的標誌，意思是紅燈時不准轉彎，一定要等綠燈。關鍵字：turn＝轉彎，on red＝紅燈時。",
   "style": "notice"
  },
  "words": [
   {
    "word": "freeway",
    "pos": "n.",
    "zh": "高速公路",
    "example": "We took the freeway to the beach, but it was full of cars."
   },
   {
    "word": "traffic",
    "pos": "n.",
    "zh": "交通；車流",
    "example": "We were stuck in traffic for an hour on the way to the airport."
   },
   {
    "word": "parking lot",
    "pos": "n.",
    "zh": "停車場",
    "example": "The parking lot at the beach was full by ten in the morning."
   },
   {
    "word": "sunscreen",
    "pos": "n.",
    "zh": "防曬乳",
    "example": "Put on sunscreen before you go to the beach, even on a cloudy day."
   },
   {
    "word": "lifeguard",
    "pos": "n.",
    "zh": "救生員",
    "example": "It's safest to swim near a lifeguard tower."
   },
   {
    "word": "celebrity",
    "pos": "n.",
    "zh": "名人",
    "example": "Some tourists walk around Hollywood hoping to see a celebrity."
   }
  ],
  "quiz": [
   {
    "q": "At a burger shop in Los Angeles, the cashier asks, \"For here or to go?\" What does the cashier want to know?",
    "options": [
     "Whether you will eat in the shop or take the food away",
     "Whether you came here by car or on foot",
     "Whether you want to pay now or later",
     "Whether you want a large or a small drink"
    ],
    "answer": 0,
    "explain": "For here or to go? 是美式說法，問你要「內用」還是「外帶」（英式說法是 Eat in or take away?）。(B) 問的不是交通方式；(C) 不是問付款時間；(D) 不是問飲料大小。故選 (A)"
   },
   {
    "q": "According to the dialogue, what does \"You\" NOT want on the tacos?",
    "options": [
     "Cilantro",
     "Green salsa",
     "Chicken",
     "Onions"
    ],
    "answer": 3,
    "explain": "你說 Everything except onions，表示除了洋蔥以外的配料都要。(A) 香菜和 (B) 綠色莎莎醬都有加；(C) 你點的就是雞肉塔可。故選 (D)"
   },
   {
    "q": "You are in a car in Los Angeles. The light is red, and you see a \"NO TURN ON RED\" sign. What should the driver do?",
    "options": [
     "Turn right after stopping, because it is always legal in California",
     "Wait for the green light before turning",
     "Turn quickly before any cars come",
     "Make a U-turn instead of a right turn"
    ],
    "answer": 1,
    "explain": "NO TURN ON RED 表示紅燈時禁止轉彎，必須等綠燈才能轉。(A) 加州一般允許紅燈停車後右轉，但有這個標誌的路口就不行；(C) 紅燈時趕快轉彎既違規又危險；(D) 迴轉也是轉彎，紅燈時同樣不可以。故選 (B)"
   }
  ],
  "keywords": [
   "Los Angeles",
   "Angeleno",
   "L.A.",
   "Hollywood",
   "Southern California",
   "Santa Monica",
   "Beverly Hills",
   "Griffith Observatory"
  ],
  "related": [
   "a74"
  ]
 }
];
