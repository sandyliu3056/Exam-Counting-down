/* =====================================================
   預設教材 (老師可在網站內新增 / 修改 / 匯出)
   ===================================================== */
window.SEED_DATA = {
  settings: {
    examName: "117學年度 四技二專統一入學測驗",
    examNameEn: "117 TVE Joint College Entrance Exam",
    examDate: "2028-04-24",
    studentName: "",
    motto: "Practice makes perfect. 每天 10 個單字、1 篇文章！",
    teacherCode: "teacher2028"
  },
  articles: [
    {
      id: "a1",
      title: "The Power of a Good Night's Sleep",
      level: "統測 B 級",
      tags: ["健康", "科普"],
      passage:
`Many high school students stay up late to study, believing that more hours at the desk will lead to better grades. However, scientists have found that sleep is just as important as study time. During sleep, the brain organizes the information it received during the day and moves it into long-term memory. Without enough rest, students may find it hard to remember what they studied the night before.

Experts suggest that teenagers need eight to ten hours of sleep each night. Unfortunately, a recent survey showed that most students in Taiwan sleep less than seven hours on school nights. Lack of sleep not only affects memory but also leads to poor concentration and a bad mood.

So what can students do? First, try to go to bed and wake up at the same time every day, even on weekends. Second, avoid using cell phones in bed, since the blue light from screens makes it harder to fall asleep. Finally, if you have to review before an exam, study earlier in the evening and then get a full night's rest. A well-rested brain is the best tool you can bring into the exam room.`,
      questions: [
        { q: "What is the main idea of this passage?",
          options: ["Students should study more hours every night.", "Sleep is important for learning and memory.", "Cell phones are bad for students' eyes.", "Teenagers in Taiwan are lazy."],
          answer: 1, explain: "全文重點：睡眠和讀書一樣重要，有助記憶與專注。" },
        { q: "According to the passage, what happens in the brain during sleep?",
          options: ["It stops working completely.", "It forgets unimportant things.", "It moves information into long-term memory.", "It creates blue light."],
          answer: 2, explain: "第一段：the brain organizes the information... and moves it into long-term memory." },
        { q: "How many hours of sleep do experts suggest for teenagers?",
          options: ["Less than seven hours.", "Exactly seven hours.", "Eight to ten hours.", "More than ten hours."],
          answer: 2, explain: "第二段：teenagers need eight to ten hours of sleep each night." },
        { q: "Which of the following is NOT a suggestion in the passage?",
          options: ["Keep a regular sleep schedule.", "Don't use your phone in bed.", "Review earlier in the evening.", "Drink coffee before the exam."],
          answer: 3, explain: "文中沒有提到喝咖啡；其他三項都在第三段。" },
        { q: "The word \"concentration\" in the second paragraph is closest in meaning to ______.",
          options: ["attention", "happiness", "exercise", "memory"],
          answer: 0, explain: "concentration = 專注力，與 attention 意思最接近。" }
      ]
    },
    {
      id: "a2",
      title: "Night Markets: The Heart of Taiwanese Culture",
      level: "統測 B 級",
      tags: ["文化", "生活"],
      passage:
`If you ask a foreign visitor what they remember most about Taiwan, the answer is often the same: the night markets. Every evening, streets that are quiet during the day turn into busy, colorful markets full of food stands, games, and small shops. From stinky tofu and bubble tea to oyster omelets, the variety of snacks is endless.

Night markets are more than just places to eat. For many families, walking through a night market after dinner is a way to relax and spend time together. Students meet their friends there, and older people enjoy the lively atmosphere. The prices are low, so everyone can afford to try something new.

In recent years, some night markets have faced problems such as noise, garbage, and crowded streets. Local governments have started to work with vendors to keep the markets clean and safe. Some markets now use reusable containers, and others have added recycling stations. These efforts show that night markets can be both traditional and modern at the same time.`,
      questions: [
        { q: "What do foreign visitors often remember most about Taiwan?",
          options: ["The tall buildings.", "The night markets.", "The high-speed rail.", "The temples."],
          answer: 1, explain: "第一段第一句。" },
        { q: "Why can everyone afford to try something new at night markets?",
          options: ["Because the food is free.", "Because the prices are low.", "Because the government pays.", "Because students get a discount."],
          answer: 1, explain: "第二段：The prices are low, so everyone can afford to try something new." },
        { q: "Which problem is NOT mentioned in the passage?",
          options: ["Noise", "Garbage", "Crowded streets", "Food safety"],
          answer: 3, explain: "第三段提到 noise, garbage, crowded streets；沒有提到 food safety。" },
        { q: "What does the word \"vendors\" most likely mean?",
          options: ["Tourists", "Police officers", "People who sell things", "Teachers"],
          answer: 2, explain: "vendor = 攤販、小販。" },
        { q: "What can we infer from the last paragraph?",
          options: ["Night markets will disappear soon.", "Night markets are trying to become more environmentally friendly.", "Vendors refuse to cooperate with the government.", "Night markets are only for tourists."],
          answer: 1, explain: "reusable containers、recycling stations 顯示夜市朝環保方向改進。" }
      ]
    },
    {
      id: "a3",
      title: "A Letter to the Customer Service Department",
      level: "統測 應用文",
      tags: ["書信", "商業"],
      passage:
`Dear Customer Service,

I am writing to complain about a wireless speaker I ordered from your website on March 2 (Order No. 58213). The package arrived on March 6, but when I opened it, I found that the speaker was damaged. There is a large crack on the side, and it does not turn on at all.

I have been a loyal customer of your company for over three years, and this is the first time I have had a problem with an order. I would like to request a replacement as soon as possible. If a replacement is not available, please give me a full refund.

I have attached photos of the damaged product and a copy of my receipt. I look forward to hearing from you within five working days.

Sincerely,
Amy Chen`,
      questions: [
        { q: "What is the purpose of this letter?",
          options: ["To order a new speaker.", "To complain about a damaged product.", "To thank the company for its service.", "To ask for a job."],
          answer: 1, explain: "第一句：I am writing to complain about..." },
        { q: "When did the package arrive?",
          options: ["March 2", "March 5", "March 6", "March 9"],
          answer: 2, explain: "The package arrived on March 6." },
        { q: "What does Amy want the company to do first?",
          options: ["Give her a discount.", "Send a replacement.", "Repair the speaker.", "Call her back."],
          answer: 1, explain: "I would like to request a replacement as soon as possible." },
        { q: "What did Amy attach to the letter?",
          options: ["A new order form.", "Photos and a receipt.", "The broken speaker.", "A thank-you card."],
          answer: 1, explain: "I have attached photos of the damaged product and a copy of my receipt." },
        { q: "The word \"loyal\" is closest in meaning to ______.",
          options: ["angry", "new", "faithful", "rich"],
          answer: 2, explain: "loyal = 忠誠的 = faithful。" }
      ]
    }
  ],
  vocab: [
    // Unit 1 學習與健康
    { id:"v1", word:"concentrate", pos:"v.", zh:"專注、集中", example:"It is hard to concentrate when the room is noisy.", unit:"Unit 1 學習與健康" },
    { id:"v2", word:"memory", pos:"n.", zh:"記憶、記憶力", example:"Sleep helps improve your memory.", unit:"Unit 1 學習與健康" },
    { id:"v3", word:"survey", pos:"n.", zh:"調查", example:"A recent survey showed that students sleep too little.", unit:"Unit 1 學習與健康" },
    { id:"v4", word:"avoid", pos:"v.", zh:"避免", example:"You should avoid using your phone in bed.", unit:"Unit 1 學習與健康" },
    { id:"v5", word:"effect", pos:"n.", zh:"影響、效果", example:"Lack of sleep has a bad effect on your mood.", unit:"Unit 1 學習與健康" },
    { id:"v6", word:"suggest", pos:"v.", zh:"建議", example:"Experts suggest eight hours of sleep a night.", unit:"Unit 1 學習與健康" },
    { id:"v7", word:"organize", pos:"v.", zh:"組織、整理", example:"The brain organizes information during sleep.", unit:"Unit 1 學習與健康" },
    { id:"v8", word:"schedule", pos:"n.", zh:"時間表、行程", example:"Keep a regular sleep schedule.", unit:"Unit 1 學習與健康" },
    { id:"v9", word:"review", pos:"v.", zh:"複習", example:"Review your notes before the test.", unit:"Unit 1 學習與健康" },
    { id:"v10", word:"attention", pos:"n.", zh:"注意力", example:"Pay attention to the teacher.", unit:"Unit 1 學習與健康" },
    // Unit 2 文化與生活
    { id:"v11", word:"variety", pos:"n.", zh:"多樣性、種類", example:"The night market offers a variety of snacks.", unit:"Unit 2 文化與生活" },
    { id:"v12", word:"atmosphere", pos:"n.", zh:"氣氛", example:"I love the lively atmosphere of the market.", unit:"Unit 2 文化與生活" },
    { id:"v13", word:"afford", pos:"v.", zh:"負擔得起", example:"We can't afford a new car this year.", unit:"Unit 2 文化與生活" },
    { id:"v14", word:"vendor", pos:"n.", zh:"攤販、小販", example:"The vendor sells fried chicken.", unit:"Unit 2 文化與生活" },
    { id:"v15", word:"traditional", pos:"adj.", zh:"傳統的", example:"Night markets are a traditional part of Taiwanese life.", unit:"Unit 2 文化與生活" },
    { id:"v16", word:"reusable", pos:"adj.", zh:"可重複使用的", example:"Bring a reusable cup to save plastic.", unit:"Unit 2 文化與生活" },
    { id:"v17", word:"recycle", pos:"v.", zh:"回收", example:"Please recycle your bottles and cans.", unit:"Unit 2 文化與生活" },
    { id:"v18", word:"crowded", pos:"adj.", zh:"擁擠的", example:"The streets are crowded on weekends.", unit:"Unit 2 文化與生活" },
    { id:"v19", word:"local", pos:"adj.", zh:"當地的", example:"The local government cleaned up the market.", unit:"Unit 2 文化與生活" },
    { id:"v20", word:"effort", pos:"n.", zh:"努力", example:"Their efforts made the market cleaner.", unit:"Unit 2 文化與生活" },
    // Unit 3 商業與書信
    { id:"v21", word:"complain", pos:"v.", zh:"抱怨、投訴", example:"I am writing to complain about the service.", unit:"Unit 3 商業與書信" },
    { id:"v22", word:"order", pos:"n./v.", zh:"訂單；訂購", example:"Your order will arrive in three days.", unit:"Unit 3 商業與書信" },
    { id:"v23", word:"damaged", pos:"adj.", zh:"損壞的", example:"The package was damaged during delivery.", unit:"Unit 3 商業與書信" },
    { id:"v24", word:"loyal", pos:"adj.", zh:"忠誠的", example:"She is a loyal customer of the shop.", unit:"Unit 3 商業與書信" },
    { id:"v25", word:"replacement", pos:"n.", zh:"替換品、更換", example:"I would like a replacement for the broken item.", unit:"Unit 3 商業與書信" },
    { id:"v26", word:"refund", pos:"n./v.", zh:"退款", example:"The store gave me a full refund.", unit:"Unit 3 商業與書信" },
    { id:"v27", word:"attach", pos:"v.", zh:"附上、附加", example:"I have attached my resume to this email.", unit:"Unit 3 商業與書信" },
    { id:"v28", word:"receipt", pos:"n.", zh:"收據", example:"Keep the receipt in case you want to return it.", unit:"Unit 3 商業與書信" },
    { id:"v29", word:"available", pos:"adj.", zh:"可取得的、有空的", example:"Is the manager available this afternoon?", unit:"Unit 3 商業與書信" },
    { id:"v30", word:"request", pos:"v./n.", zh:"要求、請求", example:"We request a reply within five days.", unit:"Unit 3 商業與書信" },
    // Unit 4 統測高頻字
    { id:"v31", word:"environment", pos:"n.", zh:"環境", example:"We must protect the environment.", unit:"Unit 4 統測高頻字" },
    { id:"v32", word:"opportunity", pos:"n.", zh:"機會", example:"This job is a great opportunity for you.", unit:"Unit 4 統測高頻字" },
    { id:"v33", word:"responsible", pos:"adj.", zh:"負責任的", example:"He is responsible for the project.", unit:"Unit 4 統測高頻字" },
    { id:"v34", word:"experience", pos:"n./v.", zh:"經驗；經歷", example:"She has five years of work experience.", unit:"Unit 4 統測高頻字" },
    { id:"v35", word:"necessary", pos:"adj.", zh:"必要的", example:"It is necessary to wear a helmet.", unit:"Unit 4 統測高頻字" },
    { id:"v36", word:"improve", pos:"v.", zh:"改善、進步", example:"Reading every day will improve your English.", unit:"Unit 4 統測高頻字" },
    { id:"v37", word:"provide", pos:"v.", zh:"提供", example:"The school provides free lunch.", unit:"Unit 4 統測高頻字" },
    { id:"v38", word:"increase", pos:"v./n.", zh:"增加", example:"The price of oil increased last month.", unit:"Unit 4 統測高頻字" },
    { id:"v39", word:"although", pos:"conj.", zh:"雖然", example:"Although it was raining, we went out.", unit:"Unit 4 統測高頻字" },
    { id:"v40", word:"therefore", pos:"adv.", zh:"因此", example:"He was sick; therefore, he stayed home.", unit:"Unit 4 統測高頻字" },
    { id:"v41", word:"customer", pos:"n.", zh:"顧客", example:"The customer is always right.", unit:"Unit 4 統測高頻字" },
    { id:"v42", word:"delivery", pos:"n.", zh:"遞送、配送", example:"Free delivery is available for orders over $500.", unit:"Unit 4 統測高頻字" },
    { id:"v43", word:"advertisement", pos:"n.", zh:"廣告", example:"I saw an advertisement for the new phone.", unit:"Unit 4 統測高頻字" },
    { id:"v44", word:"benefit", pos:"n./v.", zh:"好處；有益於", example:"Exercise has many benefits.", unit:"Unit 4 統測高頻字" },
    { id:"v45", word:"decision", pos:"n.", zh:"決定", example:"Making a decision is not always easy.", unit:"Unit 4 統測高頻字" },
    { id:"v46", word:"familiar", pos:"adj.", zh:"熟悉的", example:"Her face looks familiar to me.", unit:"Unit 4 統測高頻字" },
    { id:"v47", word:"population", pos:"n.", zh:"人口", example:"The population of Taiwan is about 23 million.", unit:"Unit 4 統測高頻字" },
    { id:"v48", word:"similar", pos:"adj.", zh:"相似的", example:"The two phones look very similar.", unit:"Unit 4 統測高頻字" },
    { id:"v49", word:"serious", pos:"adj.", zh:"嚴重的、認真的", example:"Air pollution is a serious problem.", unit:"Unit 4 統測高頻字" },
    { id:"v50", word:"achieve", pos:"v.", zh:"達成", example:"You can achieve your goal with hard work.", unit:"Unit 4 統測高頻字" }
  ]
};
