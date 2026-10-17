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
   "Changi Airport",
   "Sentosa",
   "hawker center"
  ],
  "related": [
   "a135"
  ]
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
   "Bondi Beach",
   "Manly Beach",
   "Opal card",
   "New South Wales"
  ],
  "related": [
   "a82"
  ],
  "not": [
   "sydney sweeney",
   "sydney mclaughlin"
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
   "Westminster",
   "Heathrow"
  ],
  "related": [
   "a76",
   "a113"
  ],
  "not": [
   "new england",
   "westminster dog",
   "westminster kennel"
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
  ],
  "not": [
   "new york times"
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
 },
 {
  "id": "seoul",
  "name": "Seoul",
  "name_zh": "首爾",
  "country": "South Korea",
  "country_zh": "韓國",
  "lat": 37.57,
  "lon": 126.98,
  "tz": "Asia/Seoul",
  "lang": "en-US",
  "landmark": "Gyeongbokgung Palace",
  "landmark_zh": "景福宮",
  "intro": "Seoul, the capital of South Korea, is home to more than nine million people, and about half of the country's population lives in and around it. Here, old palaces stand between glass towers. Gyeongbokgung Palace was first built in 1395 for the kings of the Joseon dynasty, and N Seoul Tower watches over the city from Namsan mountain. Near the palace gate stands a statue of King Sejong, who created Hangul, the Korean alphabet. The subway is fast and clean, and its signs and announcements are in English too.",
  "intro_zh": "首爾是韓國的首都，有超過 900 萬人住在這裡，而全國大約一半的人口都住在首爾及周邊地區。在這座城市裡，古老的宮殿就矗立在玻璃帷幕大樓之間。景福宮在 1395 年首次建成，是朝鮮王朝國王居住的宮殿；N 首爾塔（南山塔）則從南山上俯瞰整座城市。宮殿前的光化門廣場上有一座世宗大王的銅像，韓文字母（Hangul）就是他創制的。首爾的地鐵快速又乾淨，標示和廣播也都有英文。",
  "english_note": {
   "en": "Koreans use some Konglish: English words with a special Korean meaning. \"Fighting!\" (hwaiting) is a cheer that means \"You can do it!\", not a call to fight. In 2021, the Oxford English Dictionary even added this meaning. In a restaurant, \"service\" means something free from the owner, like an extra dish. In standard English, say: \"Good luck on your test. You can do it!\" or \"Is this on the house?\"",
   "zh": "韓國人常說一些「韓式英語」（Konglish），外表是英文，意思卻是韓國人自己的用法。例如考試前朋友喊 Fighting!（韓文發音近似 hwaiting），意思是「加油！你做得到！」，不是要打架；2021 年《牛津英語詞典》還把這個用法收錄了進去。在餐廳裡，老闆說 service，是「免費招待」的意思，例如多送一道菜。和其他國家的人說英文時，要用標準說法：Good luck on your test. You can do it!（考試加油，你一定可以！）或 Is this on the house?（這是招待的嗎？）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "Where can I buy a T-money card?",
    "zh": "請問哪裡可以買 T-money 卡？",
    "tip": "T-money 是韓國的交通儲值卡，就像台灣的悠遊卡，搭地鐵、公車和計程車都能用。仁川機場和市區的便利商店都買得到，儲值時多半要付現金。從機場進市區，可以搭機場鐵路 AREX 到首爾站。"
   },
   {
    "scene": "transport",
    "en": "Do I need to tap my card when I get off the bus?",
    "zh": "下公車的時候也要刷卡嗎？",
    "tip": "要。在首爾搭公車，上車和下車都要刷卡（tap）。下車時沒有刷卡，接著轉乘別的公車或地鐵時就拿不到轉乘優惠，要重新付一次全額車資。"
   },
   {
    "scene": "food",
    "en": "Excuse me, could we have some more kimchi?",
    "zh": "不好意思，可以再給我們一些泡菜嗎？",
    "tip": "韓國餐廳附的小菜（banchan）大多可以免費續加；有些店寫著「셀프」（self），表示要自己去拿。吃飯時碗通常放在桌上不端起來，飯和湯用湯匙吃。在韓國用餐一般不用給小費。"
   },
   {
    "scene": "directions",
    "en": "Which exit is for Gyeongbokgung Palace?",
    "zh": "請問去景福宮要走哪個出口？",
    "tip": "首爾地鐵的出口都有編號，出口指標上會寫附近的景點。去景福宮可以搭 3 號線（橘色）到景福宮站，5 號出口離宮殿很近。韓國人約見面也常說「在幾號出口見」。"
   },
   {
    "scene": "sightseeing",
    "en": "Can I get in for free if I wear a hanbok?",
    "zh": "穿韓服可以免費入場嗎？",
    "tip": "通常可以。穿著韓服（hanbok）參觀景福宮等首爾的古宮，大多能免費入場，宮殿附近有很多韓服出租店。要注意景福宮每週二休館；光化門前還有守門將換崗儀式可以欣賞。"
   },
   {
    "scene": "emergency",
    "en": "Please call the police. Someone stole my bag.",
    "zh": "請幫我報警，有人偷了我的包包。",
    "tip": "在韓國報警要打 112（台灣是 110），救護車和消防是 119。需要翻譯或旅遊協助，可以打 1330 旅遊諮詢熱線，24 小時都有中文和英文服務。"
   }
  ],
  "dialogue": {
   "title": "Ordering at a Korean barbecue restaurant",
   "title_zh": "在韓式烤肉店點餐",
   "lines": [
    {
     "who": "Staff",
     "en": "Welcome! How many people?",
     "zh": "歡迎光臨！請問幾位？"
    },
    {
     "who": "You",
     "en": "Two, please. Do you have an English menu?",
     "zh": "兩位，謝謝。請問有英文菜單嗎？"
    },
    {
     "who": "Staff",
     "en": "Yes, here you are. Our most popular dish is samgyeopsal, grilled pork belly.",
     "zh": "有的，給您。我們最受歡迎的是烤五花肉（samgyeopsal）。"
    },
    {
     "who": "You",
     "en": "Sounds good. Two servings, please. Is it spicy?",
     "zh": "聽起來不錯，請給我們兩人份。會辣嗎？"
    },
    {
     "who": "Staff",
     "en": "The meat isn't spicy, but the kimchi is. And don't worry, I'll grill the meat for you.",
     "zh": "肉本身不辣，不過泡菜會辣。還有，別擔心，我會幫你們烤肉。"
    },
    {
     "who": "You",
     "en": "Thank you. What do we do with the lettuce?",
     "zh": "謝謝。這些生菜要怎麼吃呢？"
    },
    {
     "who": "Staff",
     "en": "Put some meat on a leaf, add garlic and sauce, then wrap it up and eat it in one bite. The side dishes are free, so just ask for more.",
     "zh": "把肉放在生菜上，加點蒜頭和醬料，包起來一口吃掉。小菜是免費的，不夠再跟我說。"
    },
    {
     "who": "You",
     "en": "Great! Then could we have some more lettuce, please?",
     "zh": "太好了！那可以再給我們一些生菜嗎？"
    }
   ]
  },
  "sign": {
   "en": "PRIORITY SEATS\nElderly · Disabled · Pregnant women · Passengers with infants",
   "zh": "優先席\n年長者・身心障礙者・孕婦・帶著嬰幼兒的乘客",
   "note": "首爾地鐵車廂兩端的座位是優先席，旁邊的標示畫有圖示，也常附上英文。priority 是「優先」，priority seat 就是台灣說的優先席（以前叫博愛座）；elderly 是「年長的」（the elderly 就是年長者），disabled 是「身心障礙的」，pregnant 是「懷孕的」，infant 是「嬰兒」。在韓國，年輕人就算看到優先席空著，通常也不會去坐。一般座位區還有粉紅色的孕婦優先座，沒有懷孕最好也把它空下來。",
   "style": "underground"
  },
  "words": [
   {
    "word": "palace",
    "pos": "n.",
    "zh": "宮殿",
    "example": "Gyeongbokgung is the biggest of the five old royal palaces in Seoul."
   },
   {
    "word": "guard",
    "pos": "n.",
    "zh": "衛兵；守衛",
    "example": "We watched the changing of the guard in front of Gwanghwamun Gate."
   },
   {
    "word": "transfer",
    "pos": "v./n.",
    "zh": "轉乘；轉車",
    "example": "Transfer to Line 2 at City Hall Station."
   },
   {
    "word": "side dish",
    "pos": "n.",
    "zh": "小菜；配菜",
    "example": "Korean meals usually come with several free side dishes, such as kimchi."
   },
   {
    "word": "spicy",
    "pos": "adj.",
    "zh": "辣的",
    "example": "Tteokbokki, a spicy rice cake dish, is a favorite street food in Seoul."
   },
   {
    "word": "wrap",
    "pos": "v.",
    "zh": "包；裹",
    "example": "Wrap the grilled meat in a lettuce leaf before you eat it."
   }
  ],
  "quiz": [
   {
    "q": "On the Seoul subway, you need to change from Line 3 to Line 2. Which word should you look for on the signs?",
    "options": [
     "Exit",
     "Guard",
     "Transfer",
     "Wrap"
    ],
    "answer": 2,
    "explain": "transfer 是「轉乘」，要從 3 號線換到 2 號線，就要找寫著 Transfer 的轉乘指標。(A) Exit 是「出口」，會帶你走出車站；(B) guard 是「衛兵、守衛」；(D) wrap 是「包、裹」，都和換線無關。故選 (C)"
   },
   {
    "q": "In the dialogue, why does the staff member say \"just ask for more\"?",
    "options": [
     "Because the meat is not spicy",
     "Because the side dishes are free",
     "Because the restaurant has an English menu",
     "Because the staff will grill the meat"
    ],
    "answer": 1,
    "explain": "店員說 The side dishes are free, so just ask for more，意思是小菜免費，不夠可以再要。(A) 肉不辣是在回答「會不會辣」；(C) 英文菜單是對話一開始的事；(D) 幫忙烤肉和續加小菜無關。故選 (B)"
   },
   {
    "q": "On a crowded Seoul subway, you see an empty seat under a \"PRIORITY SEATS\" sign. Who should usually sit there?",
    "options": [
     "A high school student with a heavy backpack",
     "A tourist who wants to look at a map",
     "An office worker who is tired after work",
     "An old woman walking with a cane"
    ],
    "answer": 3,
    "explain": "PRIORITY SEATS 是優先席，留給年長者、身心障礙者、孕婦和帶著嬰幼兒的乘客，拄著拐杖（cane）的老太太正是需要座位的人。(A) 背重書包的學生、(B) 想看地圖的遊客、(C) 下班很累的上班族，都不在標示列出的對象中；在韓國，年輕人通常也不會去坐優先席。故選 (D)"
   }
  ],
  "keywords": [
   "Seoul",
   "South Korea",
   "Gangnam",
   "Myeongdong",
   "Hongdae",
   "Gyeongbokgung",
   "Gwanghwamun",
   "Namsan",
   "Hangul",
   "T-money"
  ],
  "related": [
   "a126",
   "a102"
  ]
 },
 {
  "id": "bangkok",
  "name": "Bangkok",
  "name_zh": "曼谷",
  "country": "Thailand",
  "country_zh": "泰國",
  "lat": 13.76,
  "lon": 100.5,
  "tz": "Asia/Bangkok",
  "lang": "en-US",
  "landmark": "Wat Arun, the Temple of Dawn",
  "landmark_zh": "鄭王廟（黎明寺）",
  "intro": "Bangkok, the capital of Thailand, is one of the most visited cities on Earth. Thai people call it Krung Thep, the \"City of Angels,\" and its full ceremonial name is the longest city name in the world. Golden temples stand next to giant shopping malls. On the west bank of the Chao Phraya River rises Wat Arun, the Temple of Dawn, covered in colorful pieces of porcelain. Every day at 8 a.m. and 6 p.m., the national anthem plays in public places such as train stations, and people stop and stand still.",
  "intro_zh": "曼谷是泰國的首都，也是全世界最多遊客造訪的城市之一。泰國人稱它為「Krung Thep」，意思是「天使之城」；它完整的正式名稱非常長，是全世界最長的城市名稱。金碧輝煌的寺廟就座落在大型購物中心旁邊。昭披耶河（湄南河）西岸矗立著鄭王廟，也叫「黎明寺」，塔身鑲滿了五顏六色的瓷片。每天早上 8 點和傍晚 6 點，車站等公共場所會播放泰國國歌，這時大家都會停下腳步、靜靜站好。",
  "english_note": {
   "en": "In Bangkok, English signs and addresses often use a few Thai words. A soi is a small side street off a main road, so \"Sukhumvit Soi 11\" means side street number 11 off Sukhumvit Road. Wat means temple, and tha means pier, as in Tha Tien. Knowing these words makes maps and taxi rides much easier: \"Could you take me to Sukhumvit Soi 11, please?\"",
   "zh": "在曼谷，英文標示和地址常夾雜幾個泰文字。soi 是從大馬路分出去的「巷子」，所以 Sukhumvit Soi 11 就是「素坤逸路第 11 巷」；wat 是「寺廟」（Wat Arun 就是鄭王廟）；tha 是「碼頭」，例如臥佛寺旁的 Tha Tien 碼頭。要注意，素坤逸路的單號巷和雙號巷分在大路兩側，兩邊的號碼也不會對齊。例句：Could you take me to Sukhumvit Soi 11, please?（可以載我到素坤逸路第 11 巷嗎？）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "How do I get to the city center by train?",
    "zh": "請問要怎麼搭列車去市中心？",
    "tip": "曼谷有兩座機場：蘇凡納布機場（BKK）和廊曼機場（DMK，以廉價航空為主），訂機票和叫車時要看清楚是哪一座。從蘇凡納布機場可以搭機場快線（Airport Rail Link）到帕亞泰站（Phaya Thai），再轉搭 BTS 空鐵。"
   },
   {
    "scene": "transport",
    "en": "Which boat goes to Wat Arun?",
    "zh": "請問哪一班船會到鄭王廟？",
    "tip": "昭披耶河上的快船（Chao Phraya Express Boat）用船上的旗子顏色區分路線，例如橘旗是最常見的一般路線，另外也有專門載觀光客的觀光船。也可以從臥佛寺旁的 Tha Tien 碼頭搭渡輪過河，幾分鐘就到鄭王廟。"
   },
   {
    "scene": "food",
    "en": "Not too spicy, please.",
    "zh": "請不要太辣。",
    "tip": "泰國菜可以要求調整辣度，泰文「不辣」是 mai phet。泰國人吃飯多用湯匙和叉子：右手拿湯匙把食物送進嘴裡，左手的叉子只用來把食物撥到湯匙上；吃麵的時候才用筷子。"
   },
   {
    "scene": "sightseeing",
    "en": "Can I go in wearing shorts?",
    "zh": "我穿短褲可以進去嗎？",
    "tip": "通常不行。參觀寺廟和大皇宮要穿著得體，不能露肩，也不能穿短褲或短裙。進入佛殿前要脫鞋，坐下時別把腳底朝向佛像；女性也不可以碰觸僧侶，東西要交給僧侶時，可以先放在桌上或布上。"
   },
   {
    "scene": "shopping",
    "en": "Can you give me a better price?",
    "zh": "可以算便宜一點嗎？",
    "tip": "在市集和路邊攤可以面帶微笑地殺價，百貨公司和便利商店則是不二價。泰國的鈔票和硬幣上都有國王的肖像，錢掉在地上時千萬不要用腳去踩，這會被視為對王室不敬。"
   },
   {
    "scene": "emergency",
    "en": "I lost my passport. Could you call the tourist police?",
    "zh": "我的護照不見了，可以幫我聯絡觀光警察嗎？",
    "tip": "泰國的觀光警察專線是 1155，有英語服務，遊客遇到麻煩時最好打這支電話；一般緊急報案是 191。護照遺失除了報案，也要聯絡駐泰國台北經濟文化辦事處申請補發。"
   }
  ],
  "dialogue": {
   "title": "Taking a taxi to Wat Arun",
   "title_zh": "搭計程車去鄭王廟",
   "lines": [
    {
     "who": "Driver",
     "en": "Hello! Where are you going?",
     "zh": "你好！要去哪裡？"
    },
    {
     "who": "You",
     "en": "Wat Arun, please. Can you use the meter?",
     "zh": "麻煩到鄭王廟。可以跳表嗎？"
    },
    {
     "who": "Driver",
     "en": "The traffic is terrible right now. How about a fixed price instead?",
     "zh": "現在塞車塞得很嚴重，不跳表，算你一口價好不好？"
    },
    {
     "who": "You",
     "en": "No, thank you. I'd prefer to use the meter, please.",
     "zh": "不用了，謝謝。我還是想要跳表。"
    },
    {
     "who": "Driver",
     "en": "OK, the meter. Do you want to take the expressway? It's faster, but you pay the toll.",
     "zh": "好吧，那就跳表。要不要走快速道路？比較快，不過過路費要你自己付。"
    },
    {
     "who": "You",
     "en": "How much longer will it take without the expressway?",
     "zh": "不走快速道路的話，要多花多少時間？"
    },
    {
     "who": "Driver",
     "en": "Maybe thirty minutes more. It's rush hour now.",
     "zh": "大概多三十分鐘吧，現在是尖峰時段。"
    },
    {
     "who": "You",
     "en": "Then let's take the expressway. Thanks for asking.",
     "zh": "那就走快速道路吧。謝謝你先問我。"
    }
   ]
  },
  "sign": {
   "en": "DRESS CODE\nShoulders and knees must be covered.\nPlease remove your shoes before entering the hall.",
   "zh": "服裝規定\n肩膀和膝蓋必須遮住。\n進入殿內前請脫鞋。",
   "note": "大皇宮和鄭王廟、臥佛寺等大寺廟的入口，常看得到這類告示，通常還會配上圖示，畫出哪些衣服不能穿。dress code 是「服裝規定」；must be covered 是「必須遮住」，也就是不能穿無袖上衣、短褲或短裙；remove your shoes 是「脫鞋」；hall 指供奉佛像的殿堂。有些寺廟門口可以借或租紗籠（sarong，一種圍在腰間的布），穿短褲的遊客可以圍上再進去。",
   "style": "notice"
  },
  "words": [
   {
    "word": "monk",
    "pos": "n.",
    "zh": "僧侶；和尚",
    "example": "Early in the morning, monks in orange robes walk through the streets to receive food."
   },
   {
    "word": "dress code",
    "pos": "n.",
    "zh": "服裝規定",
    "example": "The Grand Palace has a strict dress code, so don't wear shorts."
   },
   {
    "word": "bargain",
    "pos": "v./n.",
    "zh": "討價還價；便宜貨",
    "example": "You can bargain at Chatuchak Weekend Market, but not in department stores."
   },
   {
    "word": "meter",
    "pos": "n.",
    "zh": "（計程車的）計費表",
    "example": "Ask the driver to turn on the meter before the taxi starts moving."
   },
   {
    "word": "toll",
    "pos": "n.",
    "zh": "通行費；過路費",
    "example": "In Bangkok, the passenger usually pays the toll when a taxi takes the expressway."
   },
   {
    "word": "pier",
    "pos": "n.",
    "zh": "碼頭",
    "example": "Take the ferry from Tha Tien Pier to cross the river to Wat Arun."
   }
  ],
  "quiz": [
   {
    "q": "At a street market in Bangkok, you ask the seller, \"Can you give me a better price?\" What are you doing?",
    "options": [
     "Paying a toll",
     "Following a dress code",
     "Reading a meter",
     "Bargaining"
    ],
    "answer": 3,
    "explain": "bargain 是「討價還價」，向攤販要求 a better price（更好的價錢）就是在殺價。(A) toll 是「過路費」；(B) dress code 是「服裝規定」；(C) meter 是計程車的「計費表」，都和買東西殺價無關。故選 (D)"
   },
   {
    "q": "In the dialogue, why does \"You\" decide to take the expressway?",
    "options": [
     "Because it is much faster during rush hour",
     "Because the driver will pay the toll",
     "Because the meter does not work on the expressway",
     "Because Wat Arun is right next to the expressway"
    ],
    "answer": 0,
    "explain": "司機說不走快速道路大概要多花三十分鐘，而且現在是尖峰時段（rush hour），所以「你」決定走比較快的快速道路。(B) 司機說的是 you pay the toll，過路費由乘客付；(C) 司機已經同意跳表，對話沒有說快速道路上不能跳表；(D) 對話沒有提到鄭王廟在快速道路旁。故選 (A)"
   },
   {
    "q": "At a temple in Bangkok, a sign says, \"Shoulders and knees must be covered.\" Which outfit is OK?",
    "options": [
     "A tank top and shorts",
     "A T-shirt and long pants",
     "A sleeveless top and a long skirt",
     "A shirt and a short skirt"
    ],
    "answer": 1,
    "explain": "告示說肩膀和膝蓋必須遮住（must be covered），T 恤遮得住肩膀，長褲遮得住膝蓋，符合規定。(A) 背心會露肩，短褲會露出膝蓋；(C) 無袖上衣會露出肩膀；(D) 短裙會露出膝蓋，都不能進入。故選 (B)"
   }
  ],
  "keywords": [
   "Bangkok",
   "Thailand",
   "Thai",
   "Chao Phraya",
   "Wat Arun",
   "Wat Pho",
   "Grand Palace",
   "Khao San",
   "Sukhumvit",
   "Suvarnabhumi",
   "Chatuchak",
   "Songkran"
  ],
  "related": []
 },
 {
  "id": "manila",
  "name": "Manila",
  "name_zh": "馬尼拉",
  "country": "Philippines",
  "country_zh": "菲律賓",
  "lat": 14.6,
  "lon": 120.98,
  "tz": "Asia/Manila",
  "lang": "en-PH",
  "landmark": "Intramuros, the old walled city",
  "landmark_zh": "王城區（城牆古城）",
  "intro": "Manila is the capital of the Philippines, a country of more than 7,000 islands. The city itself has about 1.9 million people, but over 13 million live in Metro Manila, the larger area around it. Filipino and English are both official languages, so most signs and menus are in English. Inside Intramuros, the old walled city built by the Spanish, you can walk along stone walls and visit San Agustin Church, a UNESCO World Heritage Site. Outside, colorful jeepneys fill the busy streets.",
  "intro_zh": "馬尼拉是菲律賓的首都，菲律賓由 7,000 多座島嶼組成。馬尼拉市本身大約有 190 萬人，但周圍更大的「大馬尼拉地區」住了超過 1,300 萬人。菲律賓語和英語都是官方語言，所以大部分的標示和菜單都有英文。走進西班牙人建造的城牆古城「王城區」，可以沿著石砌城牆散步，參觀列入聯合國教科文組織世界遺產的聖奧古斯丁教堂。走出城外，色彩繽紛的吉普尼擠滿了熱鬧的街道。",
  "english_note": {
   "en": "In the Philippines, a public toilet is usually called a comfort room, or CR for short. You will see \"CR\" on signs in malls, restaurants and bus terminals, and people say it in everyday conversation, too. The term is rarely used in other English-speaking countries. Filipinos also understand \"restroom\" and \"toilet,\" but knowing CR helps you find one quickly. Example: \"Excuse me, where's the CR?\"",
   "zh": "在菲律賓，公共廁所通常叫做 comfort room，簡稱 CR。商場、餐廳和客運站的標示上常看到 CR，日常對話也這樣說，但其他英語國家很少用這個說法。菲律賓人也聽得懂 restroom 和 toilet，不過認得 CR，能讓你更快找到廁所。例句：Excuse me, where's the CR?（不好意思，請問廁所在哪裡？）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "Here's my passport and my eTravel QR code.",
    "zh": "這是我的護照和 eTravel 的 QR code。",
    "tip": "入境菲律賓前，要先到官方網站 etravel.gov.ph 免費填寫電子旅行申報，完成後會拿到一組 QR code，入境時出示即可。官方登記不收費，看到要收費的網站要小心，很可能是假網站。"
   },
   {
    "scene": "transport",
    "en": "Can I use a beep card on the LRT and the MRT?",
    "zh": "搭 LRT 和 MRT 可以用 beep 卡嗎？",
    "tip": "可以。馬尼拉的輕軌 LRT-1、LRT-2 和捷運 MRT-3 都能用儲值的 beep 卡，在車站就能買卡和加值，部分路線也陸續開放用感應式信用卡付款（以車站公告為準）。進站前保全會檢查包包，記得先把包包打開。"
   },
   {
    "scene": "food",
    "en": "Could I have a spoon and fork, please?",
    "zh": "可以給我一副湯匙和叉子嗎？",
    "tip": "菲律賓人吃飯習慣右手拿湯匙、左手拿叉子，用叉子把飯菜撥到湯匙上再吃，很少用刀子。不少餐廳有 unli rice（白飯無限供應），unli 是 unlimited 的簡稱，在菲律賓的廣告和菜單上很常見。"
   },
   {
    "scene": "shopping",
    "en": "Is that your last price?",
    "zh": "這是最低價了嗎？",
    "tip": "Last price? 是菲律賓人殺價時常說的話。在 Divisoria 這類傳統市場可以客氣地殺價，百貨商場和超市則是不二價。很多商場入口有保全檢查包包，配合打開就好。"
   },
   {
    "scene": "sightseeing",
    "en": "Is it OK to go inside the church in shorts?",
    "zh": "穿短褲可以進教堂嗎？",
    "tip": "菲律賓大多數人信天主教。參觀聖奧古斯丁教堂、馬尼拉主教座堂等教堂時，最好穿遮住肩膀和膝蓋的衣服，避免短褲和無袖上衣；有人在望彌撒時，請保持安靜，不要隨意走動拍照。"
   },
   {
    "scene": "emergency",
    "en": "Please call 911. My friend is hurt.",
    "zh": "請打 911，我朋友受傷了。",
    "tip": "菲律賓全國的緊急求助電話是 911，可以聯絡警察、消防隊和救護車，撥打免費。迷路或東西被偷時，也可以找附近的警察或商場保全幫忙。"
   }
  ],
  "dialogue": {
   "title": "Riding a jeepney to Intramuros",
   "title_zh": "搭吉普尼去王城區",
   "lines": [
    {
     "who": "Liza",
     "en": "Hi! Are you looking for something? You look a little lost.",
     "zh": "嗨！你在找什麼嗎？你看起來有點迷路。"
    },
    {
     "who": "You",
     "en": "Yes. I want to go to Intramuros. Does this jeepney go there?",
     "zh": "對，我想去王城區。這台吉普尼有到那裡嗎？"
    },
    {
     "who": "Liza",
     "en": "Yes, it does. I'm going that way, too. Just get on at the back and sit down.",
     "zh": "有喔，我也要往那邊。從後面上車坐下就好。"
    },
    {
     "who": "You",
     "en": "Thanks. How do I pay? I can't reach the driver from here.",
     "zh": "謝謝。要怎麼付錢？我在這裡碰不到司機。"
    },
    {
     "who": "Liza",
     "en": "Pass your fare to the person next to you and say \"Bayad po.\" People will hand it to the driver.",
     "zh": "把車資交給旁邊的人，說一聲 Bayad po（這是我的車資），大家會幫你傳給司機。"
    },
    {
     "who": "You",
     "en": "That's nice. And how do I tell the driver to stop?",
     "zh": "真不錯。那我要怎麼請司機停車？"
    },
    {
     "who": "Liza",
     "en": "Just call out \"Para po!\" Don't worry, I'll tell you when we're near the walls.",
     "zh": "喊一聲 Para po!（請停車）就可以了。別擔心，快到城牆附近時我會告訴你。"
    },
    {
     "who": "You",
     "en": "Thank you so much! You're very kind.",
     "zh": "太感謝你了！你人真好。"
    }
   ]
  },
  "sign": {
   "en": "PRIORITY LANE\nSenior Citizens · PWDs · Pregnant Women",
   "zh": "優先通道：年長者、身心障礙者、孕婦",
   "note": "馬尼拉的商場收銀台、超市、銀行、速食店和車站售票口常見的標示。依菲律賓法律，年長者和身心障礙者可以享有優先服務，很多地方也讓孕婦使用這條通道。關鍵字：priority 是「優先」；lane 原本是「車道」，這裡指「專用的隊伍」；senior citizen 是「年長者」，在菲律賓指 60 歲以上的人；PWD 是 person with disability（身心障礙者）的縮寫，在菲律賓非常常見；pregnant 是「懷孕的」。不屬於這些對象，就請排一般隊伍。",
   "style": "shop"
  },
  "words": [
   {
    "word": "jeepney",
    "pos": "n.",
    "zh": "吉普尼（菲律賓的彩繪小型公車）",
    "example": "The jeepney was painted with bright flowers and the name of the driver's daughter."
   },
   {
    "word": "comfort room",
    "pos": "n.",
    "zh": "廁所（常簡稱 CR）",
    "us": "restroom",
    "example": "The comfort room is on the second floor, next to the food court."
   },
   {
    "word": "fare",
    "pos": "n.",
    "zh": "車資",
    "example": "Jeepney fares are cheap, so many students ride them to school."
   },
   {
    "word": "viand",
    "pos": "n.",
    "zh": "配飯吃的菜",
    "us": "dish",
    "example": "At the small eatery, I had rice with two viands: chicken adobo and grilled fish."
   },
   {
    "word": "brownout",
    "pos": "n.",
    "zh": "停電",
    "us": "power outage",
    "example": "There was a brownout last night, so we ate dinner by candlelight."
   },
   {
    "word": "load",
    "pos": "n./v.",
    "zh": "（手機的）預付儲值額度；儲值",
    "us": "prepaid phone credit",
    "example": "I need to buy load for my phone before I call the hotel."
   }
  ],
  "quiz": [
   {
    "q": "At your hotel in Manila, the staff says, \"Sorry, there's a brownout in this area, but it should be back soon.\" What has happened?",
    "options": [
     "The water has been turned off.",
     "The electricity has gone out.",
     "The roads are full of traffic.",
     "The restaurant has run out of rice."
    ],
    "answer": 1,
    "explain": "brownout 是菲律賓英語的「停電」（美式英語多說 power outage），it should be back soon 是說電很快就會恢復。(A) 停水通常說 The water is off；(C) 塞車是 traffic jam；(D) 白飯賣完是 run out of rice，都和停電無關。故選 (B)"
   },
   {
    "q": "According to the dialogue, how does \"You\" pay the jeepney fare?",
    "options": [
     "By tapping a card on a reader at the door",
     "By paying the driver after getting off",
     "By passing the money to other passengers, who hand it to the driver",
     "By buying a ticket at a station before getting on"
    ],
    "answer": 2,
    "explain": "Liza 說 Pass your fare to the person next to you and say \"Bayad po.\" People will hand it to the driver，意思是把車資交給旁邊的乘客，一個傳一個交到司機手上。(A) 對話沒有提到刷卡；(B) 對話沒有說下車後才付錢；(D) 搭吉普尼不用先到車站買票。故選 (C)"
   },
   {
    "q": "At a supermarket in Manila, one checkout has the sign \"PRIORITY LANE: Senior Citizens · PWDs · Pregnant Women.\" Who should use this lane?",
    "options": [
     "A woman who is expecting a baby",
     "A tourist with a large suitcase",
     "A student who is in a hurry",
     "Anyone who is paying in cash"
    ],
    "answer": 0,
    "explain": "pregnant women 是「孕婦」，expecting a baby 就是「懷孕、快要生寶寶」的意思，所以可以使用優先通道。(B) 帶大行李的遊客、(C) 趕時間的學生、(D) 付現金的人，都不是標示列出的對象（年長者、身心障礙者、孕婦）。故選 (A)"
   }
  ],
  "keywords": [
   "Manila",
   "Philippine",
   "Filipino",
   "Intramuros",
   "Quezon City",
   "Makati",
   "Luzon",
   "Malacañang",
   "Malacanang",
   "Jeepney"
  ],
  "related": [
   "a77"
  ]
 },
 {
  "id": "mumbai",
  "name": "Mumbai",
  "name_zh": "孟買",
  "country": "India",
  "country_zh": "印度",
  "lat": 19.08,
  "lon": 72.88,
  "tz": "Asia/Kolkata",
  "lang": "en-IN",
  "landmark": "the Gateway of India",
  "landmark_zh": "印度門",
  "intro": "Mumbai, once called Bombay, is India's financial capital and biggest business centre, and the home of Bollywood, the Hindi film industry. More than 20 million people live in the wider city area. On the harbour stands the Gateway of India, a huge stone arch finished in 1924 to celebrate a visit by a British king and queen. Every day, millions of people ride the crowded local trains, and street snacks like vada pav are sold everywhere. Marathi, Hindi and English are all widely used.",
  "intro_zh": "孟買舊稱 Bombay，是印度最重要的金融和商業中心，也是寶萊塢（印地語電影產業）的大本營。大孟買地區住了超過 2,000 萬人。港邊矗立著印度門，這座巨大的石造拱門在 1924 年完工，是為了紀念英國國王喬治五世夫婦來訪而建。每天有數百萬人搭乘擁擠的市郊火車，vada pav 等街頭小吃到處都買得到。馬拉地語、印地語和英語在這裡都很通行。",
  "english_note": {
   "en": "Indian English has a handy word that most other English speakers don't use: prepone, the opposite of postpone. If something is preponed, it happens earlier than planned. A tour guide in Mumbai might say, \"Our tour has been preponed to 8 a.m., so please be in the lobby early.\" Most people in India will understand the word, but in other countries, say \"move up\" or \"bring forward\" instead.",
   "zh": "印度英語有個很好用、但其他英語地區很少用的字：prepone（提前），也就是 postpone（延後）的相反詞。pre- 是「之前」，post- 是「之後」，所以某件事 is preponed，就是比原定時間提早。孟買的導遊可能會說：Our tour has been preponed to 8 a.m., so please be in the lobby early.（我們的行程提前到早上八點，請早點到大廳集合。）在印度大多數人都聽得懂；到其他國家則要改說 move up 或 bring forward。"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "Excuse me, where's the prepaid taxi counter?",
    "zh": "不好意思，請問預付計程車的櫃台在哪裡？",
    "tip": "孟買機場的入境大廳設有預付計程車（prepaid taxi）櫃台，先付錢、拿收據再上車，比較不用擔心被多收錢；也可以用叫車 App，到機場指定的上車處搭車。有人主動上前拉客時，客氣拒絕就好。"
   },
   {
    "scene": "transport",
    "en": "Is this a fast train or a slow train?",
    "zh": "這班是快車還是慢車？",
    "tip": "孟買的市郊火車叫做 local，分成只停大站的 fast 和每站都停的 slow。每列車都有女性專用車廂（ladies compartment），男性不能進入；車票也分一等和二等，坐錯車廂可能會被罰款。上下班尖峰時段非常擁擠，最好避開。"
   },
   {
    "scene": "transport",
    "en": "Could you go by the meter, please?",
    "zh": "可以請你照跳表收費嗎？",
    "tip": "孟買南部的舊城區沒有嘟嘟車（auto），要改搭計程車（傳統的孟買計程車漆成黑黃兩色）或用叫車 App；到了郊區才有嘟嘟車。搭計程車或嘟嘟車前，先確認司機會跳表；用叫車 App 則車資比較清楚。"
   },
   {
    "scene": "food",
    "en": "Is this dish veg or non-veg?",
    "zh": "這道菜是素的還是葷的？",
    "tip": "印度很多人吃素，菜單常分成 veg（素食）和 non-veg（葷食），蛋通常也算 non-veg。包裝食品上，綠色圓點標誌代表素食，棕色三角形標誌代表葷食。印度人習慣用右手吃東西和遞東西，用手吃飯時也只用右手。"
   },
   {
    "scene": "sightseeing",
    "en": "What time is the last ferry back from Elephanta Island?",
    "zh": "從象島回來的最後一班渡輪是幾點？",
    "tip": "前往象島石窟（聯合國世界遺產）的渡輪從印度門一帶的碼頭出發，單程大約一小時。石窟每週一休館，雨季時渡輪也可能因為風浪停駛，出發前最好先確認。"
   },
   {
    "scene": "shopping",
    "en": "That's a bit expensive. What's your best price?",
    "zh": "有點貴耶，最低可以算多少？",
    "tip": "在印度門附近的 Colaba Causeway 等街頭市集買衣服、飾品，可以先問價再慢慢還價；百貨商場和標價清楚的店通常不議價。"
   }
  ],
  "dialogue": {
   "title": "Ordering street food",
   "title_zh": "在路邊攤點孟買小吃",
   "lines": [
    {
     "who": "Vendor",
     "en": "Hello! What can I get you?",
     "zh": "哈囉！要點什麼？"
    },
    {
     "who": "You",
     "en": "What's that? Everyone seems to be eating it.",
     "zh": "那是什麼？好像大家都在吃。"
    },
    {
     "who": "Vendor",
     "en": "That's vada pav, Mumbai's favourite snack. It's a fried potato ball inside a soft bun, with chutney.",
     "zh": "那是 vada pav，孟買人最愛的小吃，就是把炸馬鈴薯球夾在鬆軟的小麵包裡，再加上印度醬料（chutney）。"
    },
    {
     "who": "You",
     "en": "Sounds good. Is it very spicy? I can't eat very hot food.",
     "zh": "聽起來不錯。會很辣嗎？我不太能吃辣。"
    },
    {
     "who": "Vendor",
     "en": "A little. No problem, I'll put in less chilli chutney. Do you want a cutting chai, too?",
     "zh": "有一點。沒問題，我幫你少放一點辣醬。要不要也來一杯 cutting chai？"
    },
    {
     "who": "You",
     "en": "What's a cutting chai?",
     "zh": "什麼是 cutting chai？"
    },
    {
     "who": "Vendor",
     "en": "It's half a glass of strong, sweet tea with milk. Small, cheap and very popular in Mumbai!",
     "zh": "就是半杯又濃又甜的奶茶，份量小又便宜，在孟買很受歡迎！"
    },
    {
     "who": "You",
     "en": "Great! One vada pav and one cutting chai, please.",
     "zh": "太好了！請給我一份 vada pav 和一杯 cutting chai。"
    }
   ]
  },
  "sign": {
   "en": "FOOTWEAR NOT ALLOWED\nBEYOND THIS POINT",
   "zh": "過了此處禁止穿鞋進入",
   "note": "在孟買參觀印度教寺廟、清真寺等宗教場所時，入口常有這種告示。footwear 是「鞋類」的總稱，鞋子、拖鞋、涼鞋都算，是不可數名詞；not allowed 是「不准、禁止」；beyond this point 是「過了這裡再往前」。看到這個標示就要把鞋脫下，放在入口旁的寄鞋處（shoe stand）。參觀這類地方最好穿遮住肩膀和膝蓋的衣服，有些地方還會請訪客用布把頭髮遮起來。",
   "style": "notice"
  },
  "words": [
   {
    "word": "local",
    "pos": "n.",
    "zh": "（孟買的）市郊通勤火車",
    "us": "commuter train",
    "example": "Every morning, I take the 8:15 local from Andheri to Churchgate."
   },
   {
    "word": "auto",
    "pos": "n.",
    "zh": "嘟嘟車（三輪計程車 auto-rickshaw 的簡稱；美式英語的 auto 則是「汽車」）",
    "example": "In the suburbs, an auto is a quick and cheap way to get to the station."
   },
   {
    "word": "veg",
    "pos": "adj.",
    "zh": "素食的（non-veg 是「葷食的」）",
    "us": "vegetarian",
    "example": "This café serves only veg food, so you won't find meat or eggs on the menu."
   },
   {
    "word": "lakh",
    "pos": "n.",
    "zh": "十萬（印度的數字單位；1 crore = 1,000 萬）",
    "us": "a hundred thousand",
    "example": "In India, one lakh rupees is written as 1,00,000."
   },
   {
    "word": "monsoon",
    "pos": "n.",
    "zh": "季風；雨季",
    "example": "During the monsoon, from about June to September, heavy rain often floods some streets in Mumbai."
   },
   {
    "word": "arch",
    "pos": "n.",
    "zh": "拱門",
    "example": "The Gateway of India is a huge stone arch that faces the sea."
   }
  ],
  "quiz": [
   {
    "q": "A Mumbai newspaper says, \"About 70 lakh people ride the local trains every day.\" How many people is that?",
    "options": [
     "About 70,000",
     "About 700,000",
     "About 7 million",
     "About 70 million"
    ],
    "answer": 2,
    "explain": "1 lakh = 100,000（十萬），所以 70 lakh = 70 × 100,000 = 7,000,000，也就是大約 700 萬人。(A) 7 萬是 0.7 lakh；(B) 70 萬是 7 lakh；(D) 7,000 萬是 7 crore（1 crore = 1,000 萬）。故選 (C)"
   },
   {
    "q": "In the dialogue, what is a \"cutting chai\"?",
    "options": [
     "A cup of tea served with a slice of cake",
     "A large glass of iced tea",
     "A fried potato snack in a soft bun",
     "Half a glass of strong, sweet tea with milk"
    ],
    "answer": 3,
    "explain": "攤販說 It's half a glass of strong, sweet tea with milk，cutting chai 就是「半杯」又濃又甜的奶茶（cutting 有「切成一半」的意思）。(A) 對話沒有提到蛋糕；(B) 大杯和「半杯」不符；(C) 夾在麵包裡的炸馬鈴薯球是 vada pav。故選 (D)"
   },
   {
    "q": "At a temple in Mumbai, you see a sign: \"FOOTWEAR NOT ALLOWED BEYOND THIS POINT.\" What should you do?",
    "options": [
     "Take off your shoes before you go any farther.",
     "Put on the special shoes the temple gives you.",
     "Stop walking and wait for a guide.",
     "Leave your bag and camera outside."
    ],
    "answer": 0,
    "explain": "footwear 是「鞋類」，not allowed beyond this point 是「過了這裡就不准（穿鞋）」，所以要先把鞋脫掉再往前走。(B) 標示沒有說寺廟會提供鞋子；(C) 標示沒有要你停下來等導遊；(D) 標示只提到鞋子，沒有提到包包和相機。故選 (A)"
   }
  ],
  "keywords": [
   "Mumbai",
   "Bombay",
   "India's",
   "Maharashtra",
   "Bollywood",
   "Gateway of India",
   "Chhatrapati Shivaji",
   "Elephanta",
   "Colaba",
   "Bandra",
   "Dharavi",
   "India’s",
   "India ",
   "India,",
   "India."
  ],
  "related": [
   "a283"
  ]
 },
 {
  "id": "dubai",
  "name": "Dubai",
  "name_zh": "杜拜",
  "country": "United Arab Emirates",
  "country_zh": "阿拉伯聯合大公國",
  "lat": 25.2,
  "lon": 55.27,
  "tz": "Asia/Dubai",
  "lang": "en-GB",
  "landmark": "the Burj Khalifa",
  "landmark_zh": "哈里發塔",
  "intro": "Dubai is one of the seven emirates that make up the United Arab Emirates. About a hundred years ago, it was a small town of fishermen, traders and pearl divers beside a creek. Today, more than four million people live here, and most of them come from other countries. Arabic is the official language, but English is used everywhere, and most signs are in both languages. The Burj Khalifa, opened in 2010, is 828 metres tall, making it the tallest building in the world.",
  "intro_zh": "杜拜是組成阿拉伯聯合大公國的七個酋長國之一。大約一百年前，這裡還只是杜拜河畔一個住著漁民、商人和採珍珠潛水夫的小鎮；如今住了超過 400 萬人，而且大多數居民來自其他國家。阿拉伯語是官方語言，但英語到處通用，大部分標示也都同時有阿拉伯文和英文。2010 年啟用的哈里發塔高 828 公尺，是全世界最高的建築。",
  "english_note": {
   "en": "Dubai's residents come from all over the world, and English is the language they share. They often mix in a few Arabic words. Yalla means \"come on\" or \"let's go,\" khalas means \"finished\" or \"that's enough,\" and inshallah means \"God willing\" and is used a bit like \"hopefully.\" You don't need to use these words yourself, but understanding them helps. Example: \"Yalla, the taxi is here!\" \"OK, khalas, I'm ready.\"",
   "zh": "杜拜的居民來自世界各地，彼此溝通的共同語言是英語，而且常常夾雜幾個阿拉伯語詞。yalla 是「快點、走吧」，khalas 是「好了、結束了、夠了」，inshallah 是「如果真主允許」，用法有點像英文的 hopefully（希望如此）。自己不一定要用，但聽得懂很有幫助。例句：Yalla, the taxi is here!（快點，計程車來了！）OK, khalas, I'm ready.（好，搞定，我準備好了。）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "Excuse me, where's the metro? I need to buy a Nol card.",
    "zh": "不好意思，請問地鐵站在哪裡？我要買一張 Nol 卡。",
    "tip": "杜拜國際機場第 1 和第 3 航廈都有地鐵紅線車站。地鐵、公車和路面電車都用 Nol 卡付費，可在車站的售票機或售票處購買、儲值；搭地鐵進站、出站都要感應。地鐵車廂和站內付費區禁止飲食，違者會被罰款。"
   },
   {
    "scene": "transport",
    "en": "Does this abra go across to the Spice Souk?",
    "zh": "這艘渡船有到對岸的香料市集嗎？",
    "tip": "abra 是杜拜河（Dubai Creek）上傳統的木造渡船，從 Bur Dubai 這一側到對岸的 Deira 只要幾分鐘，船資很便宜，通常是付現金給船夫，記得準備零錢。香料市集和黃金市集都在 Deira，下船後走路就到。"
   },
   {
    "scene": "food",
    "en": "Which Emirati dish would you recommend?",
    "zh": "你推薦哪一道阿聯的傳統菜？",
    "tip": "可以試試 machboos（用香料和肉或魚一起燜煮的米飯），甜點則有 luqaimat（外酥內軟的小炸麵球，淋上椰棗糖漿）。阿拉伯咖啡常和椰棗一起招待客人，喝夠了就拿著小杯子輕輕左右搖一搖，表示不用再倒。"
   },
   {
    "scene": "shopping",
    "en": "That's a bit expensive. Can you give me a better price?",
    "zh": "這有點貴，可以算便宜一點嗎？",
    "tip": "在香料市集、布料市集等傳統市集（souk）殺價是很正常的事，但購物中心大多不二價。黃金市集的金飾依當天金價和重量計價，能談的通常是工錢（making charge）。"
   },
   {
    "scene": "sightseeing",
    "en": "Can visitors go inside the mosque?",
    "zh": "遊客可以進清真寺參觀嗎？",
    "tip": "杜拜有些清真寺開放非穆斯林參加導覽，例如朱美拉清真寺（Jumeirah Mosque），但開放時間可能變動，出發前最好先上網確認；週五通常沒有導覽。進清真寺要脫鞋，男女都要穿著端莊、不露肩也不露膝，女性還要包頭巾（現場通常可以借）。拍照時不要拍正在禱告的人。"
   },
   {
    "scene": "emergency",
    "en": "My friend feels dizzy. I think it's the heat. Please call an ambulance!",
    "zh": "我朋友覺得頭暈，應該是太熱了。請叫救護車！",
    "tip": "阿聯的緊急電話：救護車 998、警察 999。杜拜夏天（大約 6 到 9 月）白天氣溫常超過攝氏 40 度，中午最好待在有冷氣的室內，隨身帶水、多補充水分。"
   }
  ],
  "dialogue": {
   "title": "Bargaining at the Spice Souk",
   "title_zh": "在香料市集殺價",
   "lines": [
    {
     "who": "Seller",
     "en": "Hello, my friend! Come and smell this saffron. Best quality!",
     "zh": "哈囉，朋友！來聞聞看這個番紅花，品質最好的！"
    },
    {
     "who": "You",
     "en": "It smells great. How much is one box?",
     "zh": "聞起來好香。一盒多少錢？"
    },
    {
     "who": "Seller",
     "en": "Only sixty dirhams. A very good price.",
     "zh": "只要 60 迪拉姆，價格很划算。"
    },
    {
     "who": "You",
     "en": "Hmm, that's a bit expensive. Can you do forty?",
     "zh": "嗯，有點貴。40 可以嗎？"
    },
    {
     "who": "Seller",
     "en": "Forty? No, no, my friend. Fifty is my last price.",
     "zh": "40？不行不行，朋友。50 是最低價了。"
    },
    {
     "who": "You",
     "en": "What if I buy two boxes? Ninety for both?",
     "zh": "如果我買兩盒呢？兩盒 90 可以嗎？"
    },
    {
     "who": "Seller",
     "en": "Yalla, OK, khalas! Two boxes for ninety.",
     "zh": "好啦好啦，就這樣！兩盒 90。"
    },
    {
     "who": "You",
     "en": "Deal! Here's a hundred. Do you have change?",
     "zh": "成交！這是 100，你有零錢可以找嗎？"
    }
   ]
  },
  "sign": {
   "en": "Women and Children Cabin\nReserved for women and children only",
   "zh": "婦女與兒童專用車廂（僅限婦女與兒童搭乘）",
   "note": "杜拜地鐵每班列車都有婦女與兒童專用車廂，還有票價較高的 Gold Class 車廂，其餘是一般車廂。月台和車廂上都有標示 Women and Children Cabin 的位置；除了兒童以外，男性乘客都不可以進入，被查到會被罰款；女性也可以選擇搭一般車廂。關鍵字：cabin＝車廂，reserved for＝保留給、專供……使用，only＝只限。",
   "style": "station"
  },
  "words": [
   {
    "word": "skyscraper",
    "pos": "n.",
    "zh": "摩天大樓",
    "example": "From the observation deck of the Burj Khalifa, the other skyscrapers look like toys."
   },
   {
    "word": "expat",
    "pos": "n.",
    "zh": "外籍人士；旅居國外的人（expatriate 的縮寫）",
    "example": "Most people in Dubai are expats from countries such as India, Pakistan and the Philippines."
   },
   {
    "word": "souk",
    "pos": "n.",
    "zh": "（阿拉伯國家的）傳統市集",
    "example": "The Spice Souk is full of the smells of cinnamon, saffron and dried limes."
   },
   {
    "word": "bargain",
    "pos": "v./n.",
    "zh": "討價還價；划算的東西",
    "example": "It's normal to bargain in the souk, but prices in the malls are fixed."
   },
   {
    "word": "cabin",
    "pos": "n.",
    "zh": "（火車的）車廂；（飛機的）客艙",
    "example": "The Gold Class cabin on the Dubai Metro is more comfortable, but the tickets cost more."
   },
   {
    "word": "fine",
    "pos": "n./v.",
    "zh": "罰款；處以罰款",
    "example": "You can get a fine for eating or drinking on the Dubai Metro."
   }
  ],
  "quiz": [
   {
    "q": "In Dubai, most of the people you meet are expats. What does this mean?",
    "options": [
     "They were born and grew up in Dubai.",
     "They work as tour guides in the city.",
     "They are tourists visiting for a few days.",
     "They have moved there from other countries to live and work."
    ],
    "answer": 3,
    "explain": "expat 是 expatriate 的縮寫，指離開自己的國家、到外國生活或工作的人，杜拜大多數居民都是外籍人士。(A) 在杜拜出生長大的人不是 expat；(B) expat 和從事什麼職業無關；(C) 只待幾天的是遊客（tourist），不是 expat。故選 (D)"
   },
   {
    "q": "In the dialogue, what price do the seller and \"You\" finally agree on?",
    "options": [
     "Sixty dirhams for one box",
     "Forty dirhams for one box",
     "Ninety dirhams for two boxes",
     "A hundred dirhams for two boxes"
    ],
    "answer": 2,
    "explain": "賣家最後說 Two boxes for ninety，雙方同意兩盒 90 迪拉姆。(A) 60 是賣家一開始對一盒的開價；(B) 40 是你一開始還的價，賣家沒有接受；(D) 100 是你拿出來付錢的鈔票，所以你才問 Do you have change?（有零錢可以找嗎？）。故選 (C)"
   },
   {
    "q": "On a Dubai Metro platform, you see a sign that says \"Women and Children Cabin.\" You are travelling with your father and your little sister. What should your father do?",
    "options": [
     "Ride in a different cabin, because men may not use this one.",
     "Buy a Gold Class ticket so that he can enter this cabin.",
     "Ride in this cabin, because he is travelling with a child.",
     "Show his Nol card to the staff before getting on."
    ],
    "answer": 0,
    "explain": "Women and Children Cabin 是婦女與兒童專用車廂，男性乘客不能進入，所以爸爸要搭別的車廂。(B) Gold Class 是另一種車廂，買 Gold Class 票也不能進婦孺車廂；(C) 就算帶著小孩，男性也不能進入；(D) 出示 Nol 卡也不會讓男性可以搭這節車廂。故選 (A)"
   }
  ],
  "keywords": [
   "Dubai",
   "Emirati",
   "United Arab Emirates",
   "Burj Khalifa",
   "Burj Al Arab",
   "Palm Jumeirah",
   "UAE"
  ],
  "related": []
 },
 {
  "id": "cairo",
  "name": "Cairo",
  "name_zh": "開羅",
  "country": "Egypt",
  "country_zh": "埃及",
  "lat": 30.04,
  "lon": 31.24,
  "tz": "Africa/Cairo",
  "lang": "en-GB",
  "landmark": "the Pyramids of Giza and the Great Sphinx",
  "landmark_zh": "吉薩金字塔群與人面獅身像",
  "intro": "Cairo, the capital of Egypt, lies on the River Nile. More than 20 million people live in Greater Cairo, the largest urban area in the Arab world. Just outside the city stand the Pyramids of Giza. The Great Pyramid, built about 4,500 years ago, is the only one of the Seven Wonders of the Ancient World still standing. Nearby is the Great Sphinx, with the body of a lion and a human head. The new Grand Egyptian Museum, which fully opened in 2025, displays the treasures of King Tutankhamun.",
  "intro_zh": "開羅是埃及的首都，位於尼羅河畔。大開羅地區住了超過 2,000 萬人，是阿拉伯世界最大的都會區。城外不遠處就是吉薩金字塔群，其中的古夫金字塔（大金字塔）大約在 4,500 年前建成，是古代世界七大奇蹟中唯一留存至今的一座。附近的人面獅身像有獅子的身體和人的頭。2025 年全面開放的大埃及博物館，展出圖坦卡門法老的珍寶。",
  "english_note": {
   "en": "In Egypt you will often hear the word baksheesh, and you can find it in English dictionaries too. It comes from a Persian word for \"gift,\" and it means a small amount of money given as a tip for a service, such as carrying your bags, looking after your shoes at a mosque or showing you the way. Keep some small notes for it. If someone offers help you don't want, just smile and say \"No, thank you.\" Example: \"The man who looked after our shoes was happy with a little baksheesh.\"",
   "zh": "在埃及常會聽到 baksheesh 這個字，英文字典裡也查得到。它源自波斯語中表示「禮物」的字，指為了一項小服務而給的小費，例如幫你提行李、在清真寺門口幫你看鞋子，或幫你帶路，所以身上最好準備一些小鈔。如果有人主動幫忙但你並不需要，可以微笑說 No, thank you.（不用了，謝謝）。例句：The man who looked after our shoes was happy with a little baksheesh.（幫我們看鞋子的人收到一點小費就很開心。）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "Where can I get a local SIM card?",
    "zh": "請問哪裡可以辦當地的 SIM 卡？",
    "tip": "開羅國際機場的入境大廳就有電信公司櫃台可以辦 SIM 卡。有了網路就能用 Uber 等叫車 app，車資會事先顯示，不必跟司機討價還價。"
   },
   {
    "scene": "transport",
    "en": "One ticket to Sadat, please.",
    "zh": "請給我一張到沙達特站的票。",
    "tip": "沙達特站就在解放廣場（Tahrir Square）底下。開羅地鐵的票價依搭乘站數計算，在車站售票窗口買票；出站時閘門也要用到車票，下車前別弄丟。列車上設有女性專用車廂，月台和車廂上都有標示，男生不要搭錯。"
   },
   {
    "scene": "food",
    "en": "What's in koshari? Is it spicy?",
    "zh": "koshari 裡面有什麼？會辣嗎？",
    "tip": "koshari 是埃及的國民美食，把米飯、通心粉、扁豆和鷹嘴豆拌在一起，再淋上番茄醬汁和炸洋蔥，辣醬和蒜味醋通常另外加。開羅的自來水不建議生飲，最好喝瓶裝水。"
   },
   {
    "scene": "sightseeing",
    "en": "Do I need a separate ticket to go inside the Great Pyramid?",
    "zh": "進去大金字塔裡面需要另外買票嗎？",
    "tip": "要。進入古夫金字塔內部要另外買票，裡面的通道又窄又陡，而且很悶熱，怕密閉空間的人要考慮清楚。另外，攀爬金字塔是違法的，千萬不要爬上去拍照。"
   },
   {
    "scene": "shopping",
    "en": "No, thank you. I'm just looking.",
    "zh": "不用了，謝謝，我只是看看。",
    "tip": "汗哈利利市集（Khan el-Khalili）的店家很熱情，常會招呼你進店。不想買就微笑說 No, thank you，或用阿拉伯語說 La, shukran（不用，謝謝）。想買的話可以殺價，先問清楚價錢再慢慢談。"
   },
   {
    "scene": "emergency",
    "en": "Excuse me, I need help. Where can I find the tourist police?",
    "zh": "不好意思，我需要幫忙。請問哪裡可以找到觀光警察？",
    "tip": "埃及的主要景點都有觀光警察（Tourist Police），遇到麻煩可以找他們幫忙。緊急電話：觀光警察 126、警察 122、救護車 123。"
   }
  ],
  "dialogue": {
   "title": "A ride to the pyramids",
   "title_zh": "搭車去金字塔",
   "lines": [
    {
     "who": "Driver",
     "en": "Hello! You're going to the Pyramids of Giza, right?",
     "zh": "你好！你是要去吉薩金字塔，對吧？"
    },
    {
     "who": "You",
     "en": "Yes, that's right. How long will it take?",
     "zh": "對，沒錯。大概要多久？"
    },
    {
     "who": "Driver",
     "en": "Maybe forty minutes. It depends on the traffic. Welcome to Egypt, by the way!",
     "zh": "大概四十分鐘，要看路況。對了，歡迎來到埃及！"
    },
    {
     "who": "You",
     "en": "Thank you! Is the morning a good time to visit?",
     "zh": "謝謝！早上去參觀是好時機嗎？"
    },
    {
     "who": "Driver",
     "en": "Yes, very good. By noon it gets really hot, so bring water and a hat.",
     "zh": "很好啊。到了中午會非常熱，記得帶水和帽子。"
    },
    {
     "who": "You",
     "en": "OK. Is the Grand Egyptian Museum near the pyramids?",
     "zh": "好。大埃及博物館離金字塔近嗎？"
    },
    {
     "who": "Driver",
     "en": "Very near, just a few minutes by car. You can see Tutankhamun's treasures there.",
     "zh": "很近，開車只要幾分鐘。你可以在那裡看到圖坦卡門的珍寶。"
    },
    {
     "who": "You",
     "en": "Great! I'll go there this afternoon.",
     "zh": "太好了！我下午就去那裡。"
    }
   ]
  },
  "sign": {
   "en": "PLEASE REMOVE YOUR SHOES\nModest dress required · Women, please cover your hair",
   "zh": "請脫鞋（須穿著端莊；女性請包住頭髮）",
   "note": "開羅的清真寺（例如薩拉丁城堡裡的穆罕默德阿里清真寺）門口常見這類告示。進去前要脫鞋，有些地方會提供鞋套；衣著要遮住肩膀和膝蓋，女性要用頭巾包住頭髮，現場常可以借到。禮拜時間（尤其是週五中午）最好避開。關鍵字：remove＝脫下、移除；modest＝（衣著）端莊、不暴露的；required＝必須的；cover＝遮蓋。",
   "style": "notice"
  },
  "words": [
   {
    "word": "pyramid",
    "pos": "n.",
    "zh": "金字塔",
    "example": "You need a separate ticket to go inside the Great Pyramid."
   },
   {
    "word": "pharaoh",
    "pos": "n.",
    "zh": "法老（古埃及的國王）",
    "example": "Tutankhamun became pharaoh when he was only about nine years old."
   },
   {
    "word": "tomb",
    "pos": "n.",
    "zh": "墳墓；陵墓",
    "example": "The walls of the tomb were covered with colourful paintings."
   },
   {
    "word": "felucca",
    "pos": "n.",
    "zh": "（尼羅河上的）傳統三角帆船",
    "example": "At sunset, we took a felucca ride on the Nile."
   },
   {
    "word": "bazaar",
    "pos": "n.",
    "zh": "市集；市場",
    "example": "Khan el-Khalili is a busy bazaar full of lamps, spices and souvenirs."
   },
   {
    "word": "modest",
    "pos": "adj.",
    "zh": "（衣著）端莊的、不暴露的；謙虛的",
    "example": "Wear modest clothes that cover your shoulders and knees when you visit a mosque."
   }
  ],
  "quiz": [
   {
    "q": "You want to sail on the Nile in a traditional wooden boat with a large white sail. What should you look for?",
    "options": [
     "A bazaar",
     "A felucca",
     "A tomb",
     "A pharaoh"
    ],
    "answer": 1,
    "explain": "felucca 是尼羅河上傳統的木造三角帆船，想坐帆船遊尼羅河就要找它。(A) bazaar 是「市集」；(C) tomb 是「墳墓、陵墓」；(D) pharaoh 是「法老」，都不能載你遊河。故選 (B)"
   },
   {
    "q": "According to the driver, why is the morning a good time to visit the pyramids?",
    "options": [
     "Tickets are cheaper in the morning.",
     "The museum closes in the afternoon.",
     "There is never any traffic in the morning.",
     "It gets very hot by noon."
    ],
    "answer": 3,
    "explain": "司機說 By noon it gets really hot, so bring water and a hat，表示中午會非常熱，所以早上去比較好。(A) 對話沒有提到早上票價比較便宜；(B) 對話沒有說博物館下午休館，你還打算下午去；(C) 司機說車程要看路況（It depends on the traffic），並沒有說早上都不塞車。故選 (D)"
   },
   {
    "q": "At the door of a mosque in Cairo, a sign says \"Modest dress required.\" Which of these is the best choice?",
    "options": [
     "Shorts and a sleeveless T-shirt",
     "A short dress with a scarf over your hair",
     "Long pants and a top that covers your shoulders",
     "Any clothes, as long as they are clean"
    ],
    "answer": 2,
    "explain": "Modest dress required 表示必須穿著端莊、不暴露，進清真寺要遮住肩膀和膝蓋，所以長褲加上能遮住肩膀的上衣最合適。(A) 短褲和無袖上衣太暴露；(B) 雖然包了頭髮，但短洋裝會露出膝蓋；(D) 告示要求的是端莊，不只是乾淨。故選 (C)"
   }
  ],
  "keywords": [
   "Cairo",
   "Cairene",
   "Egypt ",
   "Egypt’s",
   "Egypt's",
   "Egypt,",
   "Egypt.",
   "Egyptian",
   "Giza",
   "Great Pyramid",
   "Sphinx",
   "Tutankhamun",
   "Tahrir Square"
  ],
  "related": [
   "a140",
   "a150"
  ]
 },
 {
  "id": "nairobi",
  "name": "Nairobi",
  "name_zh": "奈洛比",
  "country": "Kenya",
  "country_zh": "肯亞",
  "lat": -1.29,
  "lon": 36.82,
  "tz": "Africa/Nairobi",
  "lang": "en-KE",
  "landmark": "Nairobi National Park",
  "landmark_zh": "奈洛比國家公園",
  "intro": "Nairobi is the capital and largest city of Kenya, with more than four million people. Its name comes from a Maasai phrase meaning \"cool water.\" Just a few kilometres from the city centre is Nairobi National Park, Kenya's first national park, set up in 1946. There, giraffes, zebras, lions and rhinos live on the grassland, with the city's tall office buildings in the background. Kenya has two official languages, English and Swahili, so you will see English on most signs and often hear \"Karibu!\" (Welcome!).",
  "intro_zh": "奈洛比是肯亞的首都和最大城市，人口超過 400 萬。它的名字來自馬賽語，意思是「涼爽的水」。離市中心只有幾公里的地方，就是奈洛比國家公園，它在 1946 年設立，是肯亞第一座國家公園。在那裡，長頸鹿、斑馬、獅子和犀牛生活在草原上，背後就是城市的辦公大樓。肯亞有英語和史瓦希里語兩種官方語言，所以大部分的標示都看得到英文，也常會聽到當地人說「Karibu!」（歡迎！）。",
  "english_note": {
   "en": "The English word \"safari\" comes from Swahili, where it simply means \"journey\" (Swahili took it from Arabic). In English, a safari is a trip to see wild animals, but in Kenya any trip can be a safari, and people say \"Safari njema!\" (Have a good trip!). On a safari, the drive to look for animals is called a \"game drive.\" Here, \"game\" means wild animals, not something you play. Example: \"Our game drive starts at 6 a.m., when many animals are most active.\"",
   "zh": "英文的 safari 來自史瓦希里語（Swahili），在史瓦希里語中只是「旅行、旅程」的意思（這個字最早又是從阿拉伯語借來的）。在英文裡，safari 指「到野外觀賞野生動物的旅行」，但在肯亞，任何旅行都可以叫 safari，例如 Safari njema! 就是「旅途愉快！」。參加 safari 時，開車去找動物的行程叫做 game drive，這裡的 game 指的是「野生動物」，不是「遊戲」。例句：Our game drive starts at 6 a.m., when many animals are most active.（我們看動物的行程早上 6 點出發，那時很多動物最活躍。）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "I'm here on holiday for ten days. Here's my eTA.",
    "zh": "我來這裡度假十天。這是我的電子旅行許可。",
    "tip": "來自非洲以外國家的旅客，入境肯亞前大多要先上網申請電子旅行許可（eTA），記得提早申請，並把核准文件存在手機裡或印出來。肯亞也禁用一次性塑膠袋，免稅店的塑膠袋可能會在機場被收走，最好事先拿掉。"
   },
   {
    "scene": "transport",
    "en": "Excuse me, does this matatu go to the city centre?",
    "zh": "不好意思，這輛小巴有到市中心嗎？",
    "tip": "matatu 是奈洛比最常見的共乘小巴，車身常有鮮豔的彩繪，車上還常大聲放音樂。車資交給車上的車掌（conductor），可以付現金（最好準備零錢），許多車也能用 M-Pesa 付款。晚上或帶著大件行李時，用叫車 App 比較方便。"
   },
   {
    "scene": "food",
    "en": "I'd like the nyama choma with ugali, please.",
    "zh": "我要一份烤肉配玉米糕，謝謝。",
    "tip": "nyama choma 在史瓦希里語是「烤肉」的意思，通常是烤羊肉或牛肉，是肯亞人聚餐的最愛。ugali 是用玉米粉煮成的主食，當地人習慣用右手把它捏成小團，再沾配菜吃。有些餐廳上菜前會端水讓客人洗手。"
   },
   {
    "scene": "shopping",
    "en": "Can I pay with M-Pesa, or is it cash only?",
    "zh": "可以用 M-Pesa 付款嗎？還是只收現金？",
    "tip": "M-Pesa 是肯亞非常普及的手機支付，商店、市場甚至路邊攤都能用。外國旅客可以帶護照到 Safaricom 門市辦當地 SIM 卡並開通 M-Pesa。在馬賽市集（Maasai Market）買手工藝品可以殺價，記得面帶微笑、客氣地講價。"
   },
   {
    "scene": "sightseeing",
    "en": "Excuse me, may I take a photo of you?",
    "zh": "不好意思，我可以拍一張你的照片嗎？",
    "tip": "拍當地人之前一定要先徵求同意，有些人可能會希望你給一點小費。也最好不要拍攝警察、軍人、軍事設施和政府建築，以免惹上麻煩；不確定能不能拍時，先問導遊。"
   },
   {
    "scene": "hotel",
    "en": "Do you have an adapter I could borrow for my charger?",
    "zh": "請問有轉接頭可以借我接充電器嗎？",
    "tip": "肯亞的插座和英國一樣是三個方形插腳（G 型），電壓約 240 伏特，和台灣不同。出發前記得準備轉接頭，並確認充電器上標示支援 100–240V。"
   }
  ],
  "dialogue": {
   "title": "On a game drive in Nairobi National Park",
   "title_zh": "在奈洛比國家公園搭車看動物",
   "lines": [
    {
     "who": "Guide",
     "en": "Karibu! Welcome to Nairobi National Park. Is this your first safari?",
     "zh": "Karibu！歡迎來到奈洛比國家公園。這是你第一次參加野生動物之旅嗎？"
    },
    {
     "who": "You",
     "en": "Yes, it is! I can't believe the city is so close. I can still see the tall buildings.",
     "zh": "是啊！真不敢相信城市就在旁邊，我還看得到那些高樓。"
    },
    {
     "who": "Guide",
     "en": "That's right. The city centre is just a few kilometres away. Now look over there, on your left. Giraffes!",
     "zh": "沒錯，市中心就在幾公里外。現在看那邊，你的左手邊。是長頸鹿！"
    },
    {
     "who": "You",
     "en": "Wow, there are four of them! Can I get out and take a closer photo?",
     "zh": "哇，有四隻耶！我可以下車靠近一點拍照嗎？"
    },
    {
     "who": "Guide",
     "en": "Sorry, you need to stay in the vehicle. But you can stand up and take photos through the open roof.",
     "zh": "抱歉，你必須待在車上。不過你可以站起來，從打開的車頂拍照。"
    },
    {
     "who": "You",
     "en": "OK, no problem. Will we see any elephants today?",
     "zh": "好，沒問題。我們今天會看到大象嗎？"
    },
    {
     "who": "Guide",
     "en": "Not in this park, I'm afraid. There are no wild elephants here, but we have rhinos, lions and lots of zebras.",
     "zh": "在這座公園恐怕看不到。這裡沒有野生大象，不過有犀牛、獅子和很多斑馬。"
    },
    {
     "who": "You",
     "en": "Rhinos would be amazing! Asante sana!",
     "zh": "能看到犀牛就太棒了！Asante sana（非常謝謝）！"
    }
   ]
  },
  "sign": {
   "en": "PLEASE REMAIN IN YOUR VEHICLE\nexcept at designated picnic sites",
   "zh": "請留在車內（指定野餐區除外）",
   "note": "奈洛比國家公園等肯亞野生動物保護區常見的告示。公園裡有獅子、水牛等危險動物，牠們可能就躲在草叢裡，所以遊客只能在野餐區等指定地點下車，其他時候都要待在車上。remain 是「保持、留在」（= stay）；vehicle 是「車輛」；designated 是「指定的」，designated picnic sites 就是「指定的野餐區」。另外，公園裡也禁止餵食動物，連野餐區附近的狒狒也不能餵。",
   "style": "park"
  },
  "words": [
   {
    "word": "safari",
    "pos": "n.",
    "zh": "野生動物之旅；（史瓦希里語原意）旅行",
    "example": "Many visitors start their safari in Nairobi before flying to the Maasai Mara."
   },
   {
    "word": "game drive",
    "pos": "n.",
    "zh": "（在保護區）開車看野生動物的行程",
    "example": "On our first game drive, we saw zebras, buffaloes and two lions."
   },
   {
    "word": "matatu",
    "pos": "n.",
    "zh": "（肯亞的）共乘小巴",
    "example": "We took a colourful matatu into the city centre, and the music was really loud!"
   },
   {
    "word": "ranger",
    "pos": "n.",
    "zh": "（國家公園的）巡守員",
    "example": "A ranger explained how the park keeps its rhinos safe."
   },
   {
    "word": "endangered",
    "pos": "adj.",
    "zh": "瀕臨絕種的",
    "example": "The black rhino is critically endangered, so rangers watch over it day and night."
   },
   {
    "word": "vehicle",
    "pos": "n.",
    "zh": "車輛",
    "example": "Keep your arms inside the vehicle when lions are nearby."
   }
  ],
  "quiz": [
   {
    "q": "On safari in Kenya, your guide says, \"Our game drive starts at 6 a.m.\" What is a game drive?",
    "options": [
     "A car race inside the national park",
     "A trip to watch a football game",
     "A video game about wild animals",
     "A drive to look for wild animals"
    ],
    "answer": 3,
    "explain": "game drive 是在野生動物保護區裡開車尋找、觀賞野生動物的行程，這裡的 game 指「野生動物」，不是「遊戲、比賽」。(A) 國家公園裡不能飆車比賽；(B) 和觀看球賽無關；(C) 和電玩遊戲無關。故選 (D)"
   },
   {
    "q": "According to the guide in the dialogue, which animal does NOT live in the wild in Nairobi National Park?",
    "options": [
     "Giraffes",
     "Elephants",
     "Rhinos",
     "Zebras"
    ],
    "answer": 1,
    "explain": "導遊說 There are no wild elephants here，表示這座公園裡沒有野生大象。(A) 他們剛剛就看到了四隻長頸鹿；(C)(D) 導遊說 we have rhinos, lions and lots of zebras，公園裡有犀牛和斑馬。故選 (B)"
   },
   {
    "q": "In Nairobi National Park, you see a sign: \"PLEASE REMAIN IN YOUR VEHICLE except at designated picnic sites.\" What should you do?",
    "options": [
     "Leave your car at the gate and walk around the park",
     "Have a picnic anywhere you like",
     "Stay in your car unless you are at a picnic site marked for visitors",
     "Drive past the picnic sites without stopping"
    ],
    "answer": 2,
    "explain": "remain in your vehicle 是「留在車內」，except at designated picnic sites 是「指定的野餐區除外」，所以只有在指定的野餐區才能下車。(A) 告示要你留在車上，不是下車走路；(B) 只能在指定的地點野餐，不是隨處都可以；(D) 告示沒有說不能在野餐區停車。故選 (C)"
   }
  ],
  "keywords": [
   "Nairobi",
   "Nairobian",
   "Kenya",
   "Kenyan",
   "Nairobi National Park",
   "Maasai Mara",
   "Masai Mara",
   "Kenyatta",
   "Safaricom"
  ],
  "related": []
 },
 {
  "id": "capetown",
  "name": "Cape Town",
  "name_zh": "開普敦",
  "country": "South Africa",
  "country_zh": "南非",
  "lat": -33.92,
  "lon": 18.42,
  "tz": "Africa/Johannesburg",
  "lang": "en-ZA",
  "landmark": "Table Mountain",
  "landmark_zh": "桌山",
  "intro": "Cape Town lies between the Atlantic Ocean and Table Mountain, whose flat top is more than 1,000 metres high. When white clouds pour over the top, locals say the mountain has its \"tablecloth\" on. South Africa has three capital cities, and Cape Town is home to the country's Parliament. From the harbour, ferries take visitors to Robben Island, where Nelson Mandela spent 18 of his 27 years in prison. English is widely spoken here, along with Afrikaans and isiXhosa.",
  "intro_zh": "開普敦位在大西洋和桌山之間，桌山的山頂平坦，高度超過 1,000 公尺。當白雲從山頂往下傾瀉時，當地人會說桌山「鋪上桌巾」了。南非有三個首都，開普敦是國會的所在地。從港口可以搭渡輪到羅本島，曼德拉坐牢的 27 年中，有 18 年就是被關在這座島上。這裡通行英語，也有很多人說南非語（Afrikaans）和科薩語（isiXhosa）。",
  "english_note": {
   "en": "South African English has some words that surprise visitors. A \"robot\" is a traffic light, so \"Turn left at the second robot\" means turn at the second set of traffic lights. Time words can be tricky too: \"just now\" usually means \"in a little while,\" not \"a moment ago,\" and \"now now\" means \"very soon.\" Example: \"Wait for me at the robot. I'll be there just now.\"",
   "zh": "南非英語有些字會讓遊客嚇一跳。robot 在南非是「紅綠燈」，所以 Turn left at the second robot 是「在第二個紅綠燈左轉」，不是要你去找機器人。時間的說法也要注意：just now 在南非通常是「等一下、待會兒」，不是一般英文的「剛剛」；now now 則是「馬上、很快」。例句：Wait for me at the robot. I'll be there just now.（在紅綠燈那裡等我，我待會兒就到。）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "Where can I buy a local SIM card?",
    "zh": "請問哪裡可以買當地的 SIM 卡？",
    "tip": "開普敦國際機場有電信公司的門市。依照南非的 RICA 法規，買 SIM 卡一定要出示護照登記，有時還要提供住宿地址，記得把護照和訂房資料準備好。"
   },
   {
    "scene": "transport",
    "en": "Is it better to take an Uber back to my hotel tonight?",
    "zh": "今晚搭 Uber 回旅館會比較好嗎？",
    "tip": "開普敦的大眾運輸路線有限，很多遊客會用 Uber、Bolt 等叫車 app 移動，叫車時就能看到車資，晚上移動也比較安心。上車前記得先核對車牌號碼和司機姓名。"
   },
   {
    "scene": "food",
    "en": "Is service included, or should I leave a tip?",
    "zh": "帳單有含服務費嗎？還是要另外給小費？",
    "tip": "南非的餐廳通常不含服務費，一般會給帳單金額 10% 到 15% 的小費。服務生常會把刷卡機拿到桌邊，可以直接在機器上加上小費。人數多的團體有時會被自動加收服務費，付錢前先看清楚帳單。"
   },
   {
    "scene": "directions",
    "en": "Sorry, do I turn left at the robot?",
    "zh": "不好意思，是在紅綠燈那裡左轉嗎？",
    "tip": "南非人說的 robot 就是紅綠燈（traffic light）。南非和台灣不同，車輛靠左行駛，過馬路時要先看右邊有沒有來車。"
   },
   {
    "scene": "sightseeing",
    "en": "Is the cable car running today? It looks very windy.",
    "zh": "今天纜車有開嗎？看起來風很大。",
    "tip": "桌山纜車遇到強風或濃霧會臨時停駛，每年也會停駛一段時間做保養，出發前先上官方網站查看即時狀態。山頂比市區冷、風也大，記得帶件外套。"
   },
   {
    "scene": "emergency",
    "en": "Please call the police! Someone has stolen my phone.",
    "zh": "請幫我報警！有人偷了我的手機。",
    "tip": "南非的報警電話是 10111，用手機撥 112 也能轉接緊急服務。走在路上不要把手機、相機一直拿在手上，天黑後也避免獨自走在人少的街道。"
   }
  ],
  "dialogue": {
   "title": "Asking the way to the Bo-Kaap",
   "title_zh": "問路去馬來區（Bo-Kaap）",
   "lines": [
    {
     "who": "Thandi",
     "en": "Hi there! You look a bit lost. Can I help?",
     "zh": "嗨！你看起來好像迷路了，需要幫忙嗎？"
    },
    {
     "who": "You",
     "en": "Yes, please. How do I get to the Bo-Kaap? I want to see the colourful houses.",
     "zh": "是的，麻煩你了。請問要怎麼去馬來區（Bo-Kaap）？我想去看那些色彩繽紛的房子。"
    },
    {
     "who": "Thandi",
     "en": "It's not far. Go straight up this road and turn left at the second robot.",
     "zh": "不遠喔。沿著這條路直直往上走，在第二個紅綠燈左轉。"
    },
    {
     "who": "You",
     "en": "Sorry, the second robot?",
     "zh": "不好意思，第二個 robot？"
    },
    {
     "who": "Thandi",
     "en": "Ja, the traffic lights! Then walk up the hill for about five minutes.",
     "zh": "對（Ja），就是紅綠燈啦！然後再往上坡走大約五分鐘就到了。"
    },
    {
     "who": "You",
     "en": "Got it. Is it OK to take photos there?",
     "zh": "了解。那裡可以拍照嗎？"
    },
    {
     "who": "Thandi",
     "en": "Sure, but people live in those houses. Don't block their doors, and ask before you take a photo of anyone.",
     "zh": "可以，不過那些房子裡都有人住。不要擋住人家的門口，要拍別人之前也先問一聲。"
    },
    {
     "who": "You",
     "en": "That's good to know. Thanks for your help!",
     "zh": "這個提醒很有用。謝謝你的幫忙！"
    }
   ]
  },
  "sign": {
   "en": "BABOONS ARE DANGEROUS\nDo not feed them. Keep car windows closed.",
   "zh": "狒狒很危險：請勿餵食，車窗要關好。",
   "note": "在開普敦南邊的開普半島，尤其是好望角和開普角（Cape Point）一帶，常看到這類警告標示。野生狒狒很聰明，會搶遊客手上的食物，甚至打開車門找東西吃。關鍵字：dangerous＝危險的，feed＝餵食，keep ... closed＝保持關閉。餵食會讓狒狒越來越常靠近人類，對人和狒狒都不好，在當地也是違法的，可能會被罰款。食物要收在包包裡，不要在狒狒附近拿出來吃，也不要靠近牠們拍照。",
   "style": "park"
  },
  "words": [
   {
    "word": "robot",
    "pos": "n.",
    "zh": "紅綠燈；交通號誌",
    "us": "traffic light",
    "example": "Turn right at the next robot, and the hotel is on your left."
   },
   {
    "word": "braai",
    "pos": "n./v.",
    "zh": "（南非式）烤肉；烤肉聚會",
    "us": "barbecue",
    "example": "Our neighbours invited us to a braai on Saturday afternoon."
   },
   {
    "word": "bakkie",
    "pos": "n.",
    "zh": "小貨卡",
    "us": "pickup truck",
    "example": "He put the surfboards in the back of his bakkie and drove to the beach."
   },
   {
    "word": "cable car",
    "pos": "n.",
    "zh": "纜車",
    "example": "The cable car takes only a few minutes to reach the top of Table Mountain."
   },
   {
    "word": "baboon",
    "pos": "n.",
    "zh": "狒狒",
    "example": "A baboon jumped onto our car and tried to open the door."
   },
   {
    "word": "penguin",
    "pos": "n.",
    "zh": "企鵝",
    "example": "You can watch African penguins at Boulders Beach, near Simon's Town."
   }
  ],
  "quiz": [
   {
    "q": "Your friend in Cape Town says, \"Come over for a braai on Sunday!\" What will you most likely do there?",
    "options": [
     "Eat meat cooked over a fire outdoors",
     "Ride a cable car up the mountain",
     "Help your friend buy a pickup truck",
     "Watch penguins on the beach"
    ],
    "answer": 0,
    "explain": "braai 是南非英語的「烤肉（聚會）」，美式英語說 barbecue，所以去朋友家多半是在戶外烤肉、聊天。(B) 搭纜車是 cable car；(C) 小貨卡南非叫 bakkie，和 braai 無關；(D) 看企鵝也和烤肉聚會無關。故選 (A)"
   },
   {
    "q": "In the dialogue, Thandi says, \"Turn left at the second robot.\" What should \"You\" look for?",
    "options": [
     "A machine that gives directions",
     "A shop that sells toy robots",
     "The second set of traffic lights",
     "A police officer standing at the corner"
    ],
    "answer": 2,
    "explain": "Thandi 接著說 Ja, the traffic lights!，可見南非英語的 robot 指的是「紅綠燈」，要找的是第二個紅綠燈。(A)(B) 都把 robot 誤解成機器人；(D) 對話中沒有提到警察。故選 (C)"
   },
   {
    "q": "At Cape Point, you see a sign: \"BABOONS ARE DANGEROUS. Do not feed them. Keep car windows closed.\" What should you do?",
    "options": [
     "Give the baboons a little bread so they stay calm",
     "Open the car window to take better photos",
     "Walk up close to the baboons for a selfie",
     "Keep your food out of sight and stay away from the baboons"
    ],
    "answer": 3,
    "explain": "dangerous 是「危險的」，feed 是「餵食」，標示要你別餵狒狒、車窗要關好，所以應該把食物收好，和狒狒保持距離。(A) 餵麵包正是 Do not feed 禁止的事；(B) 標示要你 Keep car windows closed，不能打開車窗；(C) 靠近狒狒自拍很危險。故選 (D)"
   }
  ],
  "keywords": [
   "Cape Town",
   "Capetonian",
   "South Africa",
   "Table Mountain",
   "Robben Island",
   "Western Cape",
   "Cape of Good Hope",
   "Springbok",
   "Nelson Mandela",
   "Afrikaans"
  ],
  "related": []
 },
 {
  "id": "rome",
  "name": "Rome",
  "name_zh": "羅馬",
  "country": "Italy",
  "country_zh": "義大利",
  "lat": 41.9,
  "lon": 12.5,
  "tz": "Europe/Rome",
  "lang": "en-GB",
  "landmark": "the Colosseum",
  "landmark_zh": "羅馬競技場",
  "intro": "Rome, the capital of Italy, is known as \"the Eternal City,\" and its history goes back almost 3,000 years. Its most famous ancient building, the Colosseum, opened in AD 80 and could hold around 50,000 people, who came to watch gladiators fight. Vatican City, the smallest country in the world, lies completely inside Rome. Many visitors throw a coin into the Trevi Fountain, because a legend says that anyone who does so will return to Rome one day. The old centre is best explored on foot.",
  "intro_zh": "羅馬是義大利的首都，被稱為「永恆之城」，歷史可以追溯到將近 3,000 年前。最有名的古代建築羅馬競技場在西元 80 年啟用，可以容納大約 5 萬名觀眾，人們在這裡觀看角鬥士格鬥。世界上最小的國家梵蒂岡，整個位在羅馬城內。很多遊客會在特雷維噴泉（許願池）投一枚硬幣，因為傳說這麼做的人，有一天一定會再回到羅馬。羅馬的古城中心最適合用走的慢慢逛。",
  "english_note": {
   "en": "English has borrowed many coffee words from Italian, such as espresso and cappuccino. But be careful with latte. In English, a latte is coffee with lots of hot milk, but in Italian latte simply means \"milk.\" If you ask for \"a latte\" in a Roman café, you may get a glass of milk! Ask for a caffè latte instead. Example: \"Could I have a caffè latte, please?\"",
   "zh": "英文從義大利文借了很多咖啡用語，例如 espresso（濃縮咖啡）和 cappuccino（卡布奇諾）。但 latte 這個字要特別小心：在英文裡，latte 是加了很多熱牛奶的咖啡（拿鐵），但在義大利文裡，latte 就只是「牛奶」。在羅馬的咖啡館只說 a latte，可能會拿到一杯牛奶！想喝拿鐵要說 caffè latte。例句：Could I have a caffè latte, please?（請給我一杯拿鐵咖啡好嗎？）"
  },
  "phrases": [
   {
    "scene": "transport",
    "en": "Can I just tap my bank card to take the metro?",
    "zh": "我可以直接用信用卡或金融卡感應搭地鐵嗎？",
    "tip": "可以。羅馬的地鐵閘門和公車、電車上的驗票機，大多能用感應式信用卡、簽帳金融卡或手機感應付款（ATAC 稱為 Tap&Go），每次進站或上車都要感應一次。如果買的是紙本車票，第一次使用時一定要在驗票機上打票（validate），沒打票被查到會被罰款。"
   },
   {
    "scene": "food",
    "en": "Do I pay first or order first?",
    "zh": "請問要先付錢，還是先點餐？",
    "tip": "在義大利，bar 指的是賣咖啡和點心的咖啡吧。羅馬很多 bar 要先到收銀台（cassa）付錢、拿收據，再把收據交給吧台人員點餐。站在吧台喝，通常比坐在桌邊便宜。"
   },
   {
    "scene": "sightseeing",
    "en": "Can I go into St. Peter's Basilica in shorts?",
    "zh": "我可以穿短褲進聖彼得大教堂嗎？",
    "tip": "最好不要。梵蒂岡的聖彼得大教堂和羅馬許多教堂都要求服裝遮住肩膀和膝蓋，穿無袖上衣、短褲或短裙可能會被擋在門外。夏天可以帶一條薄圍巾或披肩備用。"
   },
   {
    "scene": "directions",
    "en": "Is it far to walk to the Pantheon from here?",
    "zh": "從這裡走路到萬神殿會很遠嗎？",
    "tip": "羅馬古城中心的地鐵站很少，萬神殿、納沃納廣場和特雷維噴泉彼此走路多半不到 20 分鐘，用走的最方便。路面多是凹凸不平的石板路，記得穿好走的鞋。另外，羅馬已開始向走下台階到特雷維噴泉池邊的遊客收費，周圍的廣場仍可免費參觀；收費時段和規定可能調整，出發前最好先查清楚。"
   },
   {
    "scene": "hotel",
    "en": "Is the city tax included in the price?",
    "zh": "這個價格有包含城市稅嗎？",
    "tip": "羅馬的旅館和民宿會另外收城市稅（city tax），按每人每晚計算，通常在入住或退房時另外付。訂房網站上的價格不一定包含這筆錢，最好先問清楚。"
   },
   {
    "scene": "emergency",
    "en": "Help! Someone has stolen my wallet!",
    "zh": "救命！有人偷了我的錢包！",
    "tip": "羅馬的地鐵、擁擠的公車和熱門景點附近扒手很多，包包要背在身前、拉鍊拉好。義大利的緊急電話是 112；東西被偷要到警察局報案，拿一份報案證明，之後申請保險理賠會用到。"
   }
  ],
  "dialogue": {
   "title": "Ordering coffee at a Roman bar",
   "title_zh": "在羅馬的咖啡吧點咖啡",
   "lines": [
    {
     "who": "Barista",
     "en": "Buongiorno! What can I get you?",
     "zh": "早安！請問要點什麼？"
    },
    {
     "who": "You",
     "en": "Good morning! A latte and a cornetto, please.",
     "zh": "早安！請給我一杯 latte 和一個可頌（cornetto）。"
    },
    {
     "who": "Barista",
     "en": "A latte? Here, that's just a glass of milk. Do you mean a caffè latte?",
     "zh": "latte？在這裡，那只是一杯牛奶喔。你是說拿鐵咖啡（caffè latte）嗎？"
    },
    {
     "who": "You",
     "en": "Oh, I see! Yes, a caffè latte, please. Do I pay you?",
     "zh": "喔，原來如此！對，請給我一杯拿鐵咖啡。錢是付給你嗎？"
    },
    {
     "who": "Barista",
     "en": "No, please pay at the cash desk first, then bring me the receipt.",
     "zh": "不是，請先到收銀台付錢，再把收據拿給我。"
    },
    {
     "who": "You",
     "en": "OK. Is it cheaper to drink it here at the counter?",
     "zh": "好。在吧台這裡喝會比較便宜嗎？"
    },
    {
     "who": "Barista",
     "en": "Yes. Standing at the bar costs less than sitting at a table.",
     "zh": "對，站在吧台喝比坐在桌邊便宜。"
    },
    {
     "who": "You",
     "en": "Then I'll stand. Grazie!",
     "zh": "那我就站著喝。謝謝（Grazie）！"
    }
   ]
  },
  "sign": {
   "en": "ACQUA NON POTABILE\nNon-drinking water",
   "zh": "非飲用水（請勿飲用）",
   "note": "在羅馬和義大利各地，水龍頭、公園的出水口或火車上的洗手台旁，常看到這種義大利文加英文的標示。義大利文 potabile 是「可以喝的」，英文也有同源的正式用字 potable（可飲用的），例如 potable water＝飲用水；non-drinking water 就是「不能喝的水」，可以用來洗手，但不要喝。羅馬街頭那些一直流水的小飲水台（當地人叫 nasoni）水一般可以直接喝，但只要看到這個標示，就不要拿來裝水喝。",
   "style": "notice"
  },
  "words": [
   {
    "word": "gladiator",
    "pos": "n.",
    "zh": "（古羅馬的）角鬥士",
    "example": "Gladiators once fought in the Colosseum in front of huge crowds."
   },
   {
    "word": "ruins",
    "pos": "n.",
    "zh": "遺跡；廢墟",
    "example": "We spent the afternoon walking around the ruins of the Roman Forum."
   },
   {
    "word": "validate",
    "pos": "v.",
    "zh": "使（車票）生效；打票",
    "example": "Don't forget to validate your paper ticket when you get on the bus."
   },
   {
    "word": "pickpocket",
    "pos": "n.",
    "zh": "扒手",
    "example": "Keep your bag in front of you, because pickpockets often work on crowded buses."
   },
   {
    "word": "bill",
    "pos": "n.",
    "zh": "帳單",
    "us": "check",
    "example": "In Rome, waiters usually won't bring the bill until you ask for it."
   },
   {
    "word": "fountain",
    "pos": "n.",
    "zh": "噴泉；飲水台",
    "example": "You can fill your water bottle at the small fountains on Rome's streets."
   }
  ],
  "quiz": [
   {
    "q": "The tour guide warned us, \"Keep your phone in a front pocket. There are lots of ______ around the Trevi Fountain.\"",
    "options": [
     "gladiators",
     "fountains",
     "pickpockets",
     "ruins"
    ],
    "answer": 2,
    "explain": "導遊要大家把手機放在前面的口袋，是在提醒小心 pickpockets（扒手）。(A) gladiators 是古羅馬的「角鬥士」，現在已經沒有了；(B) fountains 是「噴泉」，不需要因此保護手機；(D) ruins 是「遺跡」，也不會偷東西。故選 (C)"
   },
   {
    "q": "According to the dialogue, what should \"You\" do before getting the coffee?",
    "options": [
     "Sit down at a table and wait for a waiter",
     "Pay at the cash desk and bring the receipt to the barista",
     "Order a glass of milk instead",
     "Pay the barista in cash at the counter"
    ],
    "answer": 1,
    "explain": "咖啡師說 please pay at the cash desk first, then bring me the receipt，也就是先到收銀台付錢，再把收據交給他。(A) 對話中 You 決定站在吧台喝，不是坐著等服務生；(C) You 要的是拿鐵咖啡（caffè latte），不是牛奶；(D) 咖啡師說不是付錢給他。故選 (B)"
   },
   {
    "q": "In a park in Rome, you see a sign above a tap: \"ACQUA NON POTABILE / Non-drinking water.\" What should you do?",
    "options": [
     "Drink the water, but only a little",
     "Pay at a machine before you use the water",
     "Wait until the water turns cold, then drink it",
     "Use the water to wash your hands, but don't drink it"
    ],
    "answer": 3,
    "explain": "non-drinking water 是「非飲用水」，義大利文 non potabile 也是「不能喝」的意思，所以只能拿來洗手。(A) 喝一點點也不行；(B) 標示和付費無關；(C) 水變冷了還是不能喝。故選 (D)"
   }
  ],
  "keywords": [
   "in Rome",
   "Eternal City",
   "Italy",
   "Italian",
   "Colosseum",
   "Vatican",
   "Trevi Fountain",
   "Sistine Chapel",
   "Roman Forum",
   "Lazio",
   "Fiumicino"
  ],
  "related": [
   "a268"
  ],
  "not": [
   "romeo",
   "romero"
  ]
 },
 {
  "id": "auckland",
  "name": "Auckland",
  "name_zh": "奧克蘭",
  "country": "New Zealand",
  "country_zh": "紐西蘭",
  "lat": -36.85,
  "lon": 174.76,
  "tz": "Pacific/Auckland",
  "lang": "en-NZ",
  "landmark": "the Sky Tower",
  "landmark_zh": "天空塔",
  "intro": "Auckland is the largest city in New Zealand. About a third of all New Zealanders live here, but the capital is Wellington. The city is built on a field of about 50 volcanoes, and many of them are now green hills with wide views. Sailing is so popular that Auckland is called the \"City of Sails.\" The Sky Tower, opened in 1997, is 328 metres tall, the tallest freestanding structure in the country. Many signs also show the city's Māori name, Tāmaki Makaurau.",
  "intro_zh": "奧克蘭是紐西蘭最大的城市，大約三分之一的紐西蘭人住在這裡，但紐西蘭的首都是威靈頓。這座城市建在一片大約有 50 座火山的火山區上，其中很多火山現在是綠油油的小山丘，可以眺望遼闊的景色。帆船運動在這裡非常盛行，所以奧克蘭有「帆船之都」（City of Sails）的稱號。1997 年啟用的天空塔高 328 公尺，是紐西蘭最高的獨立式建築。許多標示上也會看到奧克蘭的毛利語名稱 Tāmaki Makaurau。",
  "english_note": {
   "en": "In New Zealand, a \"dairy\" is a small corner shop that sells snacks, drinks, milk, bread and ice cream, a bit like a convenience store. So \"I'm going to the dairy\" does not mean you are visiting a farm! Kiwis also say \"Sweet as!\" to mean \"Great!\" or \"No problem.\" Example: \"Can you grab some milk from the dairy?\" \"Sweet as!\"",
   "zh": "一般英文的 dairy 是「乳製品」或「酪農場」，但在紐西蘭，dairy 指的是街角的小雜貨店，賣零食、飲料、牛奶、麵包和冰淇淋，有點像便利商店。所以 I'm going to the dairy 並不是要去參觀乳牛場！紐西蘭人（Kiwi）也常說 Sweet as!，意思是「太好了！」或「沒問題」。例句：Can you grab some milk from the dairy?（你可以去小雜貨店買點牛奶嗎？）Sweet as!（沒問題！）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "I have some dried fruit and snacks to declare.",
    "zh": "我有一些果乾和零食要申報。",
    "tip": "紐西蘭的生物安全（biosecurity）檢查非常嚴格。食物、植物和動物製品都要在入境申報（例如線上的 NZ Traveller Declaration）中如實申報，不確定的話就申報；也可以在接受檢查前丟進機場的棄置箱（amnesty bin）。沒申報被查到，可能會被當場罰款。"
   },
   {
    "scene": "transport",
    "en": "Can I just tap my bank card on the bus?",
    "zh": "搭公車可以直接用我的信用卡或金融卡感應付款嗎？",
    "tip": "可以。奧克蘭的公車、火車和大部分渡輪都能用 AT HOP 卡、感應式信用卡、金融卡或手機付款，上下車都要感應（tag on / tag off），而且要用同一張卡。下公車時，當地人常會跟司機說聲 Thanks!"
   },
   {
    "scene": "food",
    "en": "Do I order at the counter, or will someone come to the table?",
    "zh": "請問是在櫃台點餐，還是會有人到桌邊幫我點？",
    "tip": "紐西蘭很多咖啡館是先到櫃台點餐、付款，店員會給你一個號碼牌，再把餐點送到桌上。在紐西蘭給小費不是必要的，標價也已經含稅，服務特別好時再給就可以。"
   },
   {
    "scene": "shopping",
    "en": "Is there a dairy near here? I need to buy some water.",
    "zh": "這附近有小雜貨店嗎？我需要買水。",
    "tip": "dairy 是紐西蘭街角的小雜貨店，賣零食、飲料、牛奶和冰淇淋。紐西蘭的商店不提供一次性塑膠購物袋，記得自備購物袋。"
   },
   {
    "scene": "sightseeing",
    "en": "Can we walk up to the top of Mount Eden?",
    "zh": "我們可以走到伊甸山的山頂嗎？",
    "tip": "可以，從市中心搭公車就能到山腳。伊甸山的毛利語名稱是 Maungawhau，2016 年起一般車輛不能開上山頂。火山口被毛利人視為神聖（tapu）之地，請走在步道上，不要走進火山口。"
   },
   {
    "scene": "emergency",
    "en": "Please call 111! Someone has been hurt.",
    "zh": "請打 111！有人受傷了。",
    "tip": "紐西蘭的緊急電話是 111，可以叫警察、消防隊或救護車，和台灣的 110、119 不同。不緊急的事情，例如東西被偷了要報案，可以打警察的非緊急專線 105。"
   }
  ],
  "dialogue": {
   "title": "Buying a ticket at the Sky Tower",
   "title_zh": "在天空塔買門票",
   "lines": [
    {
     "who": "Staff",
     "en": "Kia ora! Welcome to the Sky Tower. How can I help?",
     "zh": "Kia ora（你好）！歡迎來到天空塔，有什麼需要幫忙的嗎？"
    },
    {
     "who": "You",
     "en": "Hi! One ticket to the observation deck, please. Is today a good day to go up?",
     "zh": "嗨！請給我一張觀景台的門票。今天適合上去嗎？"
    },
    {
     "who": "Staff",
     "en": "Sweet as. It's a clear day, so you'll be able to see a long way. Here's your ticket.",
     "zh": "沒問題。今天天氣晴朗，可以看得很遠。這是你的票。"
    },
    {
     "who": "You",
     "en": "Thanks. Is it true that part of the floor up there is made of glass?",
     "zh": "謝謝。聽說上面有一部分地板是玻璃做的，是真的嗎？"
    },
    {
     "who": "Staff",
     "en": "Yes, it is. The glass is very thick, so it's safe to stand on, but lots of people are scared at first!",
     "zh": "是真的。玻璃非常厚，站上去很安全，不過很多人一開始都會怕！"
    },
    {
     "who": "You",
     "en": "I'll give it a try! Can I see any volcanoes from up there?",
     "zh": "我會試試看！從上面看得到火山嗎？"
    },
    {
     "who": "Staff",
     "en": "You sure can. Look for Rangitoto Island in the harbour. It's Auckland's youngest volcano, only about 600 years old.",
     "zh": "當然看得到。找找港灣裡的朗伊托托島，它是奧克蘭最年輕的火山，大約只有 600 歲。"
    },
    {
     "who": "You",
     "en": "Awesome! Thanks for your help.",
     "zh": "太棒了！謝謝你的幫忙。"
    }
   ]
  },
  "sign": {
   "en": "DECLARE OR DISPOSE\nAll food, plants and animal products",
   "zh": "申報或丟棄：所有食物、植物及動物製品",
   "note": "抵達奧克蘭機場時，在生物安全（biosecurity）檢查區前常見的提醒。declare 是「申報」；dispose 是「丟棄、處理掉」（常說 dispose of sth.）。意思是：食物、植物、動物製品等可能帶進病蟲害的物品，要嘛在入境申報中如實申報，交給檢查人員檢查；要嘛在檢查前丟進旁邊的棄置箱（amnesty bin）。紐西蘭非常保護自己的農業和特有生態，沒申報被查到，可能會被當場罰款。",
   "style": "airport"
  },
  "words": [
   {
    "word": "dairy",
    "pos": "n.",
    "zh": "（紐西蘭的）街角小雜貨店",
    "us": "convenience store",
    "example": "The dairy on our street sells ice cream and stays open until late."
   },
   {
    "word": "jandals",
    "pos": "n.",
    "zh": "夾腳拖鞋",
    "us": "flip-flops",
    "example": "Don't forget your jandals and sunscreen for the beach."
   },
   {
    "word": "tramping",
    "pos": "n.",
    "zh": "健行；登山（多指在步道上走好幾小時或好幾天）",
    "us": "hiking",
    "example": "Tramping is a popular weekend activity for many New Zealanders."
   },
   {
    "word": "chilly bin",
    "pos": "n.",
    "zh": "保冷箱；冰桶",
    "us": "cooler",
    "example": "We packed sandwiches and cold drinks in the chilly bin for our picnic."
   },
   {
    "word": "volcano",
    "pos": "n.",
    "zh": "火山",
    "example": "Rangitoto Island is the youngest volcano in Auckland."
   },
   {
    "word": "declare",
    "pos": "v.",
    "zh": "（在海關、入境時）申報",
    "example": "You must declare all food when you arrive in New Zealand."
   }
  ],
  "quiz": [
   {
    "q": "In Auckland, your friend says, \"Let's grab an ice cream from the dairy.\" Where are you going?",
    "options": [
     "A farm with lots of cows",
     "A milk factory",
     "A small corner shop",
     "A cheese restaurant"
    ],
    "answer": 2,
    "explain": "在紐西蘭，dairy 是街角的小雜貨店，賣冰淇淋、零食和飲料，所以朋友是要去小雜貨店。(A) 養乳牛的酪農場英文是 dairy farm；(B) 牛奶工廠不是買冰淇淋的地方；(D) 起司餐廳也不是 dairy 在紐西蘭的意思。故選 (C)"
   },
   {
    "q": "In the dialogue, the staff member says \"Sweet as.\" What does this mean?",
    "options": [
     "Great, no problem.",
     "You should try some candy.",
     "Please wait a moment.",
     "The ticket is very expensive."
    ],
    "answer": 0,
    "explain": "Sweet as 是紐西蘭常見的口語，意思是「太好了、沒問題」。店員聽到你要買票，回答 Sweet as，接著就把票給你。(B) sweet 在這裡不是「甜的」，和糖果無關；(C) 店員沒有要你等待；(D) 對話沒有提到票價。故選 (A)"
   },
   {
    "q": "At Auckland Airport, you see a sign that says \"DECLARE OR DISPOSE.\" You have an apple in your bag. What should you do?",
    "options": [
     "Hide it at the bottom of your bag",
     "Declare it, or put it in the amnesty bin before the check",
     "Eat it after you pass the biosecurity check",
     "Leave it on a seat in the arrival hall"
    ],
    "answer": 1,
    "explain": "declare 是「申報」，dispose 是「丟棄」。告示的意思是食物要嘛申報，要嘛在檢查前丟進棄置箱，所以這顆蘋果應該申報，或丟進 amnesty bin。(A) 藏起來不申報，被查到可能會被罰款；(C) 要先申報或丟棄，不能等通過檢查再處理；(D) 隨便留在入境大廳也不對，應該丟進指定的棄置箱。故選 (B)"
   }
  ],
  "keywords": [
   "Auckland",
   "Aucklander",
   "New Zealand",
   "New Zealander",
   "Tāmaki Makaurau",
   "Waitemata",
   "Waitematā",
   "Rangitoto",
   "Waiheke",
   "Eden Park",
   "All Blacks",
   "Tamaki Makaurau"
  ],
  "related": [
   "a144"
  ]
 },
 {
  "id": "rio",
  "name": "Rio de Janeiro",
  "name_zh": "里約熱內盧",
  "country": "Brazil",
  "country_zh": "巴西",
  "lat": -22.91,
  "lon": -43.17,
  "tz": "America/Sao_Paulo",
  "lang": "en-US",
  "landmark": "Christ the Redeemer",
  "landmark_zh": "基督救世主像",
  "intro": "Rio de Janeiro is Brazil's second-largest city, and it was the country's capital until 1960. Its name means \"River of January\" in Portuguese, because sailors who arrived in January 1502 thought its bay was the mouth of a river. High on Corcovado mountain, the 30-meter statue of Christ the Redeemer has watched over the city since 1931. Below it are Sugarloaf Mountain and famous beaches such as Copacabana and Ipanema. People from Rio are called Cariocas, and every year their Carnival fills the streets with samba.",
  "intro_zh": "里約熱內盧是巴西第二大城市，1960 年以前一直是巴西的首都。它的名字在葡萄牙文裡是「一月的河」，因為 1502 年 1 月來到這裡的航海家，誤以為這片海灣是一條河的出海口。高 30 公尺的基督救世主像矗立在科科瓦多山頂，從 1931 年起就守望著這座城市；山下則有糖麵包山，以及科帕卡巴納、伊帕內瑪等著名海灘。里約人被稱為「Carioca」，每年的嘉年華都讓街頭充滿森巴音樂和舞蹈。",
  "english_note": {
   "en": "Brazilians use some English words in their own way. In Brazil, \"shopping\" is often a noun meaning a shopping mall, and many malls in Rio have it in their names, such as Shopping Leblon. So \"Let's meet at the shopping\" means \"Let's meet at the mall.\" A \"notebook\" is a laptop, and an \"outdoor\" is a billboard. Locals may use these words when they speak English with you, so it helps to know them, but use standard English yourself. Example: \"Is there a shopping mall near here?\"",
   "zh": "巴西人會用一些英文字，但用法和英文不太一樣。在巴西，shopping 常當名詞，指「購物中心」，里約的購物中心名稱也常有這個字（例如 Shopping Leblon），所以 Let's meet at the shopping 是「我們在購物中心碰面」。notebook 指「筆記型電腦」，不是筆記本；outdoor 則是「戶外廣告看板」。當地人跟你說英文時可能會這樣用，聽得懂很有幫助，但自己說英文時要用標準說法。例句：Is there a shopping mall near here?（這附近有購物中心嗎？）"
  },
  "phrases": [
   {
    "scene": "transport",
    "en": "Can I pay for the metro with my credit card?",
    "zh": "搭地鐵可以用信用卡付款嗎？",
    "tip": "可以。里約地鐵（MetrôRio）各站閘門都能直接用感應式信用卡、簽帳金融卡或手機感應付款。市區公車、BRT 快捷公車和輕軌（VLT）則使用市政府的 Jaé 系統，可以用 Jaé 卡或 App 付款；2026 年 6 月底起，市區公車上已經不收現金，信用卡感應付款也還在陸續開放中，搭車前最好先確認。"
   },
   {
    "scene": "food",
    "en": "Is the service charge included in the bill?",
    "zh": "帳單裡已經包含服務費了嗎？",
    "tip": "巴西餐廳的帳單通常會自動加上 10% 的服務費（serviço），一般不必再另外給小費。這筆服務費理論上可以不付，但除非服務真的很差，當地人幾乎都會付。"
   },
   {
    "scene": "directions",
    "en": "Let's meet at Posto 9 on Ipanema Beach.",
    "zh": "我們在伊帕內瑪海灘的 9 號救生站碰面吧。",
    "tip": "科帕卡巴納和伊帕內瑪海灘沿線，大約每隔一公里就有一座有編號的救生站（posto）。當地人常用這些編號說明自己在海灘的哪一段，也常約在那裡見面。"
   },
   {
    "scene": "signs",
    "en": "Excuse me, does \"PUXE\" mean push or pull?",
    "zh": "不好意思，PUXE 是推還是拉？",
    "tip": "PUXE 是葡萄牙文的「拉」（pull），EMPURRE 才是「推」（push）。PUXE 念起來很像英文的 push，很多遊客因此把門推錯方向。"
   },
   {
    "scene": "sightseeing",
    "en": "Is it too cloudy to see Christ the Redeemer today?",
    "zh": "今天雲會不會太多，看不到基督救世主像？",
    "tip": "基督像位在大約 700 公尺高的科科瓦多山頂，山頂常被雲遮住，出發前先看天氣。可以從 Cosme Velho 搭齒軌小火車上山，車票要選定搭乘時段；山頂近期進行整修工程，參觀人數可能受到限制，旺季更要提早上網購票。"
   },
   {
    "scene": "emergency",
    "en": "Help! Someone stole my phone! Where's the tourist police?",
    "zh": "救命！有人偷了我的手機！觀光警察在哪裡？",
    "tip": "巴西的報警電話是 190，救護車是 192，消防是 193。里約在 Leblon 區設有協助外國遊客的觀光警察局（DEAT）。在海灘、街頭等熱鬧的地方，手機不要一直拿在手上，也不要放在桌上。"
   }
  ],
  "dialogue": {
   "title": "Renting beach chairs at Copacabana",
   "title_zh": "在科帕卡巴納海灘租椅子",
   "lines": [
    {
     "who": "Vendor",
     "en": "Hi there! Do you want chairs and an umbrella?",
     "zh": "嗨！要租椅子和遮陽傘嗎？"
    },
    {
     "who": "You",
     "en": "Yes, please. Two chairs and one umbrella. Do I pay now?",
     "zh": "好，麻煩了。兩張椅子和一把遮陽傘。要現在付錢嗎？"
    },
    {
     "who": "Vendor",
     "en": "No, you can pay when you leave. Would you like something to drink?",
     "zh": "不用，離開的時候再付就好。要喝點什麼嗎？"
    },
    {
     "who": "You",
     "en": "A coconut water, please. Can I pay by card later?",
     "zh": "請給我一份椰子水。等一下可以刷卡嗎？"
    },
    {
     "who": "Vendor",
     "en": "Sure, card is fine. Here you go, nice and cold.",
     "zh": "當然，刷卡沒問題。來，你的椰子水，很冰喔。"
    },
    {
     "who": "You",
     "en": "Thanks! Is it safe to swim here today?",
     "zh": "謝謝！今天在這裡游泳安全嗎？"
    },
    {
     "who": "Vendor",
     "en": "The waves are big today, so stay near the lifeguard post. And don't leave your phone alone on the chair.",
     "zh": "今天浪很大，要在救生站附近游。還有，手機不要單獨留在椅子上。"
    },
    {
     "who": "You",
     "en": "Good idea. We'll take turns swimming. Thanks a lot!",
     "zh": "好主意，我們會輪流下水。非常感謝！"
    }
   ]
  },
  "sign": {
   "en": "SELF-SERVICE\nPOR QUILO",
   "zh": "自助餐（秤重計價）",
   "note": "里約街頭許多餐廳門口都掛著這樣的招牌，代表巴西很普遍的「秤重自助餐」：自己拿盤子夾菜，再把盤子放到櫃台的磅秤上，按重量計價（盤子的重量會扣掉）。self-service 是英文「自助式的」，巴西人直接拿來指自助餐廳；quilo 是葡萄牙文的「公斤」（kilo），por quilo 就是「按公斤計價」。招牌或價目表上寫的通常是每公斤的價格，夾得越多付得越多。有些店會發一張消費卡記錄金額，離開時再到櫃台結帳。",
   "style": "shop"
  },
  "words": [
   {
    "word": "statue",
    "pos": "n.",
    "zh": "雕像",
    "example": "The statue of Christ the Redeemer stands with its arms open wide above the city."
   },
   {
    "word": "cable car",
    "pos": "n.",
    "zh": "纜車",
    "example": "We took the cable car up Sugarloaf Mountain to watch the sunset."
   },
   {
    "word": "carnival",
    "pos": "n.",
    "zh": "嘉年華；狂歡節",
    "example": "During Carnival, people dance to samba music in the streets of Rio."
   },
   {
    "word": "buffet",
    "pos": "n.",
    "zh": "自助餐",
    "example": "At a por quilo buffet, you pay for the weight of the food on your plate."
   },
   {
    "word": "service charge",
    "pos": "n.",
    "zh": "服務費",
    "example": "The bill already included a 10% service charge, so we didn't leave an extra tip."
   },
   {
    "word": "pickpocket",
    "pos": "n.",
    "zh": "扒手",
    "example": "Watch out for pickpockets on crowded beaches and buses."
   }
  ],
  "quiz": [
   {
    "q": "Your bill at a restaurant in Rio includes an extra 10% for the waiters' work. What is this extra money called?",
    "options": [
     "A pickpocket",
     "A buffet",
     "A service charge",
     "A cable car"
    ],
    "answer": 2,
    "explain": "service charge 是「服務費」，巴西餐廳的帳單常會自動加上 10% 的服務費。(A) pickpocket 是「扒手」；(B) buffet 是「自助餐」；(D) cable car 是「纜車」，都不是帳單上加收的費用。故選 (C)"
   },
   {
    "q": "According to the dialogue, what does the vendor tell \"You\" to do?",
    "options": [
     "Stay near the lifeguard post and not leave the phone alone",
     "Pay for the chairs before sitting down",
     "Swim far out because the sea is calm today",
     "Pay for the coconut water in cash only"
    ],
    "answer": 0,
    "explain": "小販說 stay near the lifeguard post（待在救生站附近），又提醒 don't leave your phone alone on the chair（手機不要單獨留在椅子上）。(B) 小販說離開時再付錢就好；(C) 小販說今天浪很大，不是風平浪靜；(D) 小販說刷卡沒問題。故選 (A)"
   },
   {
    "q": "Outside a restaurant in Rio, you see a sign that says \"SELF-SERVICE / POR QUILO.\" How does this restaurant work?",
    "options": [
     "A waiter brings you a set meal at a fixed price.",
     "You serve yourself, and you pay by the weight of your food.",
     "You pay one price and eat as much as you like.",
     "You can only order food to take away."
    ],
    "answer": 1,
    "explain": "self-service 表示「自助式」，por quilo 是「按公斤計價」，也就是自己夾菜，再依食物的重量付錢（盤子的重量會扣掉）。(A) 由服務生送上固定價格的套餐，不是自助式；(C) 付一個價錢吃到飽，不是按重量計價；(D) 招牌沒有說只能外帶。故選 (B)"
   }
  ],
  "keywords": [
   "Rio de Janeiro",
   "Carioca",
   "Brazil",
   "Brazilian",
   "Copacabana",
   "Ipanema",
   "Christ the Redeemer",
   "Maracana",
   "Rio Carnival",
   "Guanabara",
   "Maracanã"
  ],
  "related": []
 },
 {
  "id": "mexicocity",
  "name": "Mexico City",
  "name_zh": "墨西哥城",
  "country": "Mexico",
  "country_zh": "墨西哥",
  "lat": 19.43,
  "lon": -99.13,
  "tz": "America/Mexico_City",
  "lang": "en-US",
  "landmark": "the Palacio de Bellas Artes (Palace of Fine Arts)",
  "landmark_zh": "藝術宮",
  "intro": "Mexico City, the capital of Mexico, is one of the largest cities in the Americas, with more than 20 million people in its metropolitan area. It was built on the ruins of Tenochtitlan, the capital of the Aztecs, which stood on an island in a lake. In the city center, the white marble Palacio de Bellas Artes, finished in 1934, is famous for its huge murals by artists such as Diego Rivera. The city is about 2,240 meters above sea level, so take it easy on your first day.",
  "intro_zh": "墨西哥城是墨西哥的首都，整個都會區住著超過 2,000 萬人，是美洲最大的城市之一。這座城市建在阿茲特克人的首都特諾奇提特蘭的遺址上，當年的特諾奇提特蘭位在湖中的一座島上。市中心的藝術宮（美術宮）外牆是白色大理石，1934 年完工，館內有迪亞哥．里維拉等藝術家繪製的巨幅壁畫。墨西哥城海拔大約 2,240 公尺，剛抵達的第一天最好放慢腳步，別太勞累。",
  "english_note": {
   "en": "Many English words for food and animals came from Nahuatl, the language of the Aztecs, through Spanish. \"Tomato\" comes from tomatl, \"avocado\" from ahuacatl, and \"chili\" from chilli. \"Chocolate\" and \"coyote\" also have Nahuatl roots, and so does the name \"Mexico\" itself. Nahuatl is still spoken by more than a million people in Mexico today. Example: \"This guacamole is made with fresh avocados, tomatoes and chili.\"",
   "zh": "英文裡不少食物和動物的名稱，其實來自阿茲特克人的語言「納瓦特爾語」（Nahuatl），再經由西班牙文傳進英文。例如 tomato（番茄）來自 tomatl，avocado（酪梨）來自 ahuacatl，chili（辣椒）來自 chilli；chocolate（巧克力）和 coyote（郊狼）也源自納瓦特爾語，連 Mexico 這個國名也是。今天墨西哥仍有一百多萬人說納瓦特爾語。例句：This guacamole is made with fresh avocados, tomatoes and chili.（這份酪梨醬是用新鮮的酪梨、番茄和辣椒做的。）"
  },
  "phrases": [
   {
    "scene": "airport",
    "en": "Where can I get an authorized taxi?",
    "zh": "請問哪裡可以搭官方授權的計程車？",
    "tip": "墨西哥城國際機場的行李提領區和入境大廳設有授權計程車（taxi autorizado）的售票櫃台：先告訴櫃台人員目的地，依目的地先付款拿票，再把票交給司機。不要搭主動上前拉客的人的車。"
   },
   {
    "scene": "transport",
    "en": "Is Chapultepec on the pink line?",
    "zh": "查普爾特佩克站在粉紅色那條線上嗎？",
    "tip": "是的，在 1 號線（粉紅色）。墨西哥城地鐵每一站除了站名，還有自己的小圖示，例如查普爾特佩克站是一隻蚱蜢，因為這個納瓦特爾語地名的意思就是「蚱蜢山」。看不懂西班牙文時，認圖示也能找到車站。另外，地鐵大部分路線現在也能直接用感應式信用卡或簽帳金融卡進站。"
   },
   {
    "scene": "food",
    "en": "Two tacos al pastor, please.",
    "zh": "請給我兩個 al pastor 塔可。",
    "tip": "al pastor 是墨西哥城最有代表性的塔可之一：醃過的豬肉一層層疊在直立的烤肉架（trompo）上慢慢烤，做法和黎巴嫩移民帶來的中東烤肉有關，烤肉架頂端常放著一塊鳳梨。"
   },
   {
    "scene": "shopping",
    "en": "Do you take cards, or is it cash only?",
    "zh": "可以刷卡嗎？還是只收現金？",
    "tip": "傳統市場和路邊攤多半只收現金（墨西哥披索），最好準備一些小額鈔票和硬幣；百貨公司、超市和大部分餐廳通常可以刷卡。"
   },
   {
    "scene": "sightseeing",
    "en": "Do I need to book tickets for the Frida Kahlo Museum?",
    "zh": "芙烈達．卡蘿博物館需要先訂票嗎？",
    "tip": "最好先訂。位於科約阿坎區的芙烈達．卡蘿博物館（又叫「藍屋」Casa Azul）非常熱門，門票要上網預訂入場時段，熱門時段常常提早賣完。另外，墨西哥城許多博物館週一休館，出發前先確認開放時間。"
   },
   {
    "scene": "emergency",
    "en": "What's that alarm? Is it an earthquake warning?",
    "zh": "那是什麼警報聲？是地震警報嗎？",
    "tip": "墨西哥城設有地震預警系統，街上的擴音器會發出警報聲並廣播 Alerta sísmica（地震警報）。聽到時保持冷靜，遠離窗戶和玻璃，依照現場人員指示行動；當地防災口號是「不跑、不叫、不推擠」（No corro, no grito, no empujo）。墨西哥的緊急電話是 911。"
   }
  ],
  "dialogue": {
   "title": "Buying a Metro card at Zócalo station",
   "title_zh": "在索卡洛地鐵站買交通卡",
   "lines": [
    {
     "who": "Staff",
     "en": "Good morning. How can I help you?",
     "zh": "早安，需要什麼幫忙嗎？"
    },
    {
     "who": "You",
     "en": "Hi. I'd like to buy a card for the Metro, please.",
     "zh": "嗨，我想買一張搭地鐵用的卡，謝謝。"
    },
    {
     "who": "Staff",
     "en": "Sure. This is the MI card. It works on the Metro, the Metrobús and the Cablebús too. How much would you like to put on it?",
     "zh": "好的。這是 MI 卡，地鐵、Metrobús 快捷公車和 Cablebús 空中纜車都能用。你要儲值多少錢？"
    },
    {
     "who": "You",
     "en": "Enough for a few rides, please. Oh, and how do I get to the Palace of Fine Arts from here?",
     "zh": "夠搭幾趟就好。對了，請問從這裡要怎麼去藝術宮？"
    },
    {
     "who": "Staff",
     "en": "Take Line 2, the blue line, toward Cuatro Caminos, and get off at Bellas Artes. It's just two stops.",
     "zh": "搭 2 號線，就是藍色那條，往 Cuatro Caminos 方向，在 Bellas Artes 站下車，只要兩站。"
    },
    {
     "who": "You",
     "en": "Great. Do I tap the card at the gate?",
     "zh": "太好了。進站時是在閘門感應這張卡嗎？"
    },
    {
     "who": "Staff",
     "en": "That's right. Tap it on the reader and walk through. And keep your bag in front of you. The trains get very crowded.",
     "zh": "沒錯，在讀卡機上感應一下就能通過。還有，包包要放在身體前面，車廂裡會非常擠。"
    },
    {
     "who": "You",
     "en": "Good to know. Thank you so much!",
     "zh": "知道了，非常謝謝你！"
    }
   ]
  },
  "sign": {
   "en": "AGUA NO POTABLE\nNOT DRINKING WATER",
   "zh": "非飲用水（請勿飲用）",
   "note": "在墨西哥城的公共廁所、公園水龍頭和部分旅館的洗手台旁，常看到這種標示，有時還畫著水龍頭和杯子，再加上一條紅色斜線。上面的西班牙文 agua 是「水」，potable 是「可飲用的」（英文也有這個正式用字），agua no potable 就是「不可飲用的水」；下面的英文 drinking water 是「飲用水」，NOT DRINKING WATER 就是「這裡的水不能喝」。墨西哥城的自來水一般不建議直接生飲，就算沒看到這個標示，也最好喝瓶裝水或過濾過的水（agua purificada）。",
   "style": "notice"
  },
  "words": [
   {
    "word": "avocado",
    "pos": "n.",
    "zh": "酪梨",
    "example": "Mashed avocado is the main ingredient in guacamole."
   },
   {
    "word": "mural",
    "pos": "n.",
    "zh": "壁畫",
    "example": "Diego Rivera painted huge murals on the walls of public buildings in Mexico City."
   },
   {
    "word": "altitude",
    "pos": "n.",
    "zh": "海拔；高度",
    "example": "Because of the high altitude, you may get tired more easily in Mexico City."
   },
   {
    "word": "earthquake",
    "pos": "n.",
    "zh": "地震",
    "example": "Our school holds drills so that everyone knows what to do in an earthquake."
   },
   {
    "word": "tap water",
    "pos": "n.",
    "zh": "自來水",
    "example": "Most visitors drink bottled water instead of tap water in Mexico City."
   },
   {
    "word": "pyramid",
    "pos": "n.",
    "zh": "金字塔",
    "example": "The Pyramid of the Sun at Teotihuacan is one of the largest pyramids in the world."
   }
  ],
  "quiz": [
   {
    "q": "In the Palacio de Bellas Artes, you can see Diego Rivera's huge paintings on the walls. What are these paintings called?",
    "options": [
     "Pyramids",
     "Avocados",
     "Earthquakes",
     "Murals"
    ],
    "answer": 3,
    "explain": "mural 是「壁畫」，也就是直接畫在牆上的大型畫作，藝術宮裡就有迪亞哥．里維拉的作品。(A) pyramid 是「金字塔」；(B) avocado 是「酪梨」；(C) earthquake 是「地震」，都不是畫作。故選 (D)"
   },
   {
    "q": "According to the dialogue, what does the staff member say about the MI card?",
    "options": [
     "It can only be used on the Metro.",
     "It also works on the Metrobús and the Cablebús.",
     "Tourists can get it for free.",
     "You must show it to the train driver."
    ],
    "answer": 1,
    "explain": "站務人員說 It works on the Metro, the Metrobús and the Cablebús too，表示 MI 卡除了地鐵，快捷公車和空中纜車也能用。(A) 不是只能搭地鐵；(C) 對話沒有說遊客可以免費拿卡，還要儲值；(D) 進站時是在閘門感應，不必拿給司機看。故選 (B)"
   },
   {
    "q": "Above a sink in a public restroom in Mexico City, you see \"AGUA NO POTABLE / NOT DRINKING WATER.\" What should you do?",
    "options": [
     "Wash your hands there, but don't drink the water.",
     "Fill your water bottle there before you go out.",
     "Drink the water only if it feels cold.",
     "Ask the staff to make the water hot so you can drink it."
    ],
    "answer": 0,
    "explain": "NOT DRINKING WATER 是「非飲用水」，西班牙文 no potable 也是「不可飲用」，所以可以洗手，但不能喝。(B) 把水裝進水壺等於要拿來喝；(C) 水冷不冷和能不能喝無關；(D) 標示要你別喝這裡的水，不是請人加熱後再喝。故選 (A)"
   }
  ],
  "keywords": [
   "Mexico City",
   "Mexican",
   "CDMX",
   "Zocalo",
   "Palacio de Bellas Artes",
   "Chapultepec",
   "Coyoacan",
   "Teotihuacan",
   "Xochimilco",
   "Frida Kahlo",
   "Tenochtitlan",
   "Zócalo",
   "Coyoacán"
  ],
  "related": [
   "a143",
   "a205"
  ]
 }
];
