import { db, storage } from './firebase';
import { doc as firestoreDoc, setDoc, onSnapshot, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore'; // <-- 所有函式
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Calendar, Cloud, ChevronDown, Sun, CloudSnow, Wind, Utensils, Camera, Train, Plane, Home, Phone, Wallet, Info, Snowflake, ArrowRight, Plus, Trash2, RefreshCw, Pencil, FileText  } from 'lucide-react';

// --- 1. 地點座標 (用於即時天氣 API) ---
const LOCATIONS = {
  "Sydney": { lat: -33.859972, lon: 151.211111 },
  "Jamberoo": { lat: -34.648468, lon: 150.777145 },
  "Taralga": { lat: -34.4636, lon: 149.7978 },
  "Blue Mountain": { lat: -33.7158, lon: 150.3133 },
  "Gold Coast": { lat: -27.4697707, lon: 153.0251235 },
  "Maleny": { lat: -26.7626299, lon: 152.8522429 }, // **FIX 1: 加上逗號**
  "Tin Can Bay": { lat: -25.9167, lon: 153.0000 },
  "Brisbane": { lat: -27.4689682, lon: 153.0234991 }
};

// --- 2. 行程資料 ---
const tripData = [
  {
    day: 1,
    date: "12/25 (四)",
    city: "Sydney",
    title: "抵達悉尼!",
    events: [
      { time: "15:30 - 16:00", type: "transport", title: "抵達 SYD 機場 -> Mascot", desc: "搭 Airport Link 火車去 Mascot 站 (HK$140)。", nav: "Mascot Station", tips: "聖誕日班次可能減少，實際車程 5min。" },
      { time: "16:00 - 16:30", type: "stay", title: "入住 Meriton Suites", desc: "Mascot Central, 8 Jackson Dr (HK$1,050)。", nav: "Meriton Suites Mascot Central", note: "評價4.5/5，24/7開放。" },
      { time: "16:30 - 17:00", type: "stay", title: "酒店休息 / 準備", desc: "喺酒店整頓一下。", nav: "Meriton Suites Mascot Central" },
      { time: "17:00 - 17:30", type: "transport", title: "前往 Circular Quay", desc: "搭火車由 Mascot 去 Circular Quay。", nav: "Circular Quay Station", tips: "實際車程 16min。" },
      { time: "17:30 - 18:45", type: "sight", title: "Circular Quay 夜景", desc: "歌劇院、海港大橋聖誕燈飾。", nav: "Circular Quay", highlight: "聖誕燈飾", tips: "人多擠迫，注意財物！" },
      { time: "18:45 - 21:00", type: "food", title: "Fortune of War 晚餐", desc: "傳統酒吧晚餐 (HK$160)。", nav: "Fortune of War", highlight: "需預約", note: "評價4.3/5，需確認聖誕營業。" },
      { time: "21:00 - 21:15", type: "transport", title: "返酒店休息", desc: "搭火車返 Mascot Central。", nav: "Meriton Suites Mascot Central" }
    ]
  },
  {
    day: 2,
    date: "12/26 (五)",
    city: "Sydney",
    title: "Lululemon & Bondi Beach",
    events: [
      { time: "09:00 - 09:45", type: "food", title: "酒店附近早餐", desc: "Mascot Central 附近 (HK$200)。", nav: "Mascot Central" },
      { time: "10:00 - 10:40", type: "transport", title: "前往 QVB", desc: "搭火車 Mascot -> Central -> QVB (HK$40)。", nav: "Queen Victoria Building", tips: "實際車程 7min。" },
      { time: "10:40 - 12:30", type: "shop", title: "QVB 逛街 (Boxing Day)", desc: "Queen Victoria Building 購物 (評價4.6/5)。", nav: "Queen Victoria Building", highlight: "Boxing Day 熱鬧", tips: "人多擠迫。" },
      { time: "12:30 - 13:30", type: "food", title: "午餐 @ QVB Food Court", desc: "簡單午餐 (HK$100)。", nav: "Queen Victoria Building" },
      { time: "13:30 - 14:15", type: "transport", title: "前往 Outlet", desc: "搭車 去 lululemon oulet。", nav: "The Mill, 41-43 Bourke Rd, Alexandria NSW 2015, Australia", tips: "實際車程 45mins。" },
      { time: "14:15 - 15:15", type: "shop", title: "Lululemon Outlet", desc: "重點: Lululemon (評價4.4/5)。", nav: "The Mill, 41-43 Bourke Rd, Alexandria NSW 2015, Australia", highlight: "必買", tips: "特價多但排隊長。" },
      { time: "15:15 - 16:00", type: "transport", title: "前往機場取車", desc: "搭的士去 Simba Car Hire (HK$100)。", nav: "Simba Car Hire Sydney Airport", note: "檢查車況並拍照。" },
      { time: "16:00 - 17:00", type: "transport", title: "自駕去 Bondi Beach", desc: "油費約 HK$50。", nav: "Bondi Beach", tips: "實際車程 15min。" },
      { time: "17:00 - 18:15", type: "sight", title: "Bondi to Coogee Walk", desc: "海濱步道 (Expensive Parking)。", nav: "Bondi to Coogee Walk", tips: "夏季熱/人多，注意防曬。" },
      { time: "18:15 - 18:45", type: "transport", title: "自駕去 lyf Bondi Junction", desc: "前往住宿點 (No Parking)。", nav: "lyf Bondi Junction Sydney" },
      { time: "18:45 - 19:00", type: "stay", title: "入住 lyf Bondi Junction", desc: "95-97 Oxford St (HK$800)。", nav: "lyf Bondi Junction Sydney", note: "位置方便，評價4.2/5。" },
      { time: "19:00 - 21:00", type: "food", title: "Icebergs Dining Room", desc: "絕美海景晚餐 (HK$300)。", nav: "Icebergs Dining Room and Bar", highlight: "需預約", tips: "海景佳。" }
    ]
  },
  {
    day: 3,
    date: "12/27 (六)",
    city: "Sydney",
    title: "Grand Pacific Drive Roadtrip",
    events: [
      { time: "08:00 - 09:00", type: "food", title: "Bills Bondi 早餐", desc: "283 Bondi Rd，經典早餐 (HK$220)。", nav: "Bills Bondi", highlight: "經典必食" },
      { time: "09:00 - 10:00", type: "transport", title: "自駕去 Cape Solander", desc: "車程約 45min - 1hr。", nav: "Cape Solander" },
      { time: "10:00 - 10:30", type: "sight", title: "Cape Solander 觀景", desc: "觀鯨點及海景，風景美但風大。", nav: "Cape Solander" },
      { time: "10:30 - 11:40", type: "transport", title: "自駕去 Bald Hill Lookout", desc: "車程約 55min (46.7km)。", nav: "Bald Hill Lookout" },
      { time: "11:40 - 12:10", type: "sight", title: "Bald Hill Lookout", desc: "俯瞰 Sea Cliff Bridge，視野開闊。", nav: "Bald Hill Lookout" },
      { time: "12:10 - 12:20", type: "transport", title: "自駕去 Sea Cliff Bridge", desc: "車程 10min (7km)。", nav: "Sea Cliff Bridge" },
      { time: "12:20 - 12:30", type: "sight", title: "Sea Cliff Bridge", desc: "步行觀景，橋景壯觀。", nav: "Sea Cliff Bridge", tips: "風大，抓緊手機。" },
      { time: "12:30 - 13:00", type: "transport", title: "自駕去 Southern Gateway", desc: "車程 20min (23.3km)。", nav: "Southern Gateway Centre" },
      { time: "13:00 - 14:00", type: "sight", title: "Southern Gateway Centre", desc: "休息、去洗手間及觀景。", nav: "Southern Gateway Centre" },
      { time: "14:00 - 14:30", type: "transport", title: "自駕去 Mount Keira", desc: "車程 20min (17.8km)。", nav: "Mount Keira Lookout" },
      { time: "14:30 - 15:00", type: "sight", title: "Mount Keira Lookout", desc: "俯瞰 Wollongong 景色。", nav: "Mount Keira Lookout" },
      { time: "15:00 - 16:00", type: "transport", title: "自駕去 Cathedral Rocks", desc: "車程 40min (41.6km)。", nav: "Cathedral Rocks Kiama" },
      { time: "16:00 - 16:30", type: "sight", title: "Cathedral Rocks", desc: "觀賞火山岩柱地質奇觀。", nav: "Cathedral Rocks Kiama" },
      { time: "16:30 - 16:45", type: "transport", title: "自駕去 Bombo Headland", desc: "車程 15min (5km)。", nav: "Bombo Headland Geological Site" },
      { time: "16:45 - 17:00", type: "sight", title: "Bombo Headland", desc: "觀賞玄武岩柱。", nav: "Bombo Headland Geological Site" },
      { time: "17:00 - 17:15", type: "transport", title: "自駕去 Kiama Blowhole", desc: "車程 10min (2km)。", nav: "Kiama Blowhole" },
      { time: "17:15 - 17:45", type: "sight", title: "Kiama Blowhole", desc: "噴水洞，浪大時最壯觀。", nav: "Kiama Blowhole" },
      { time: "17:45 - 18:15", type: "transport", title: "自駕去 Saddleback Mt", desc: "車程 15min (9km)。", nav: "Saddleback Mountain Lookout" },
      { time: "18:15 - 18:45", type: "sight", title: "Saddleback Mt Lookout", desc: "俯瞰 Kiama，觀賞日落。", nav: "Saddleback Mountain Lookout" },
      { time: "18:45 - 19:45", type: "transport", title: "自駕去 Balgownie BnB", desc: "車程 50min (43km)。", nav: "20 Church St, Balgownie NSW 2519, Australia" },
      { time: "19:45 - 20:00", type: "stay", title: "入住 Airbnb Balgownie", desc: "舒適住宿 (HK$900)。", nav: "20 Church St, Balgownie NSW 2519, Australia", note: "需確認入住時間。" },
      { time: "20:00 - 21:30", type: "food", title: "The Lagoon Seafood", desc: "海鮮晚餐 (HK$200)。", nav: "The Lagoon Seafood Restaurant", highlight: "海鮮新鮮" }
    ]
  },
  {
    day: 4,
    date: "12/28 (日)",
    city: "Jamberoo",
    title: "Jamberoo Action Park",
    events: [
      { time: "08:30 - 09:00", type: "food", title: "Airbnb 自備早餐", desc: "簡單早餐 (HK$100)。", nav: "Balgownie, NSW" },
      { time: "09:00 - 10:00", type: "transport", title: "自駕去 Jamberoo", desc: "車程 50min (45km)。", nav: "Jamberoo Action Park" },
      { time: "10:00 - 17:00", type: "sight", title: "Jamberoo Action Park", desc: "全日玩水 (門票 HK$600)。", nav: "Jamberoo Action Park", highlight: "Funnel Web 必玩", tips: "預購門票避排隊。" },
      { time: "17:00 - 19:15", type: "transport", title: "自駕去 Goulburn", desc: "車程 2hr 15min (149km)。", nav: "Goulburn, NSW" },
      { time: "19:15 - 19:30", type: "stay", title: "入住 Mercure Goulburn", desc: "2 Lockyer St (HK$800)。", nav: "Mercure Goulburn", note: "評價4.2/5。" },
      { time: "19:30 - 21:00", type: "food", title: "Hibernian Hotel 晚餐", desc: "傳統酒吧晚餐 (HK$160)。", nav: "Hibernian Hotel Goulburn" }
    ]
  },
  {
    day: 5,
    date: "12/29 (一)",
    city: "Taralga",
    title: "方形便便獸 -> 藍山",
    events: [
      { time: "08:30 - 09:00", type: "food", title: "酒店早餐", desc: "已包早餐。", nav: "Mercure Goulburn" },
      { time: "09:00 - 10:00", type: "transport", title: "自駕去 Taralga Wildlife", desc: "車程 50min (42km)。", nav: "Taralga Wildlife Park" },
      { time: "10:00 - 12:00", type: "sight", title: "Taralga Wildlife Park", desc: "Wombat Interaction (HK$200)。", nav: "Taralga Wildlife Park", highlight: "重點: 摸袋熊", tips: "需預約互動。" },
      { time: "12:00 - 16:00", type: "transport", title: "自駕去 Lincoln's Rock", desc: "含午餐時間，車程 2hr 45min。", nav: "Lincoln's Rock" },
      { time: "16:00 - 16:30", type: "sight", title: "Lincoln's Rock", desc: "俯瞰 Jamison Valley，懸崖打卡。", nav: "Lincoln's Rock", tips: "無欄杆，注意安全！" },
      { time: "16:30 - 16:40", type: "transport", title: "自駕去 Wentworth Falls", desc: "車程 10min (13km)。", nav: "Wentworth Falls Lookout" },
      { time: "16:40 - 17:15", type: "sight", title: "Wentworth Falls Lookout", desc: "睇瀑布。", nav: "Wentworth Falls Lookout" },
      { time: "17:15 - 17:45", type: "transport", title: "自駕去 Govetts Leap", desc: "車程 30min (24km)。", nav: "Govetts Leap Lookout" },
      { time: "17:45 - 18:30", type: "sight", title: "Govetts Leap Lookout", desc: "俯瞰 Grose Valley。", nav: "Govetts Leap Lookout" },
      { time: "18:30 - 19:00", type: "transport", title: "自駕去 Katoomba", desc: "前往酒店 (15km)。", nav: "Fairmont Resort & Spa Blue Mountains" },
      { time: "18:40 - 19:00", type: "stay", title: "入住 Fairmont Resort", desc: "Blue Mountains (HK$1,300)。", nav: "Fairmont Resort & Spa Blue Mountains", note: "度假村舒適。" },
      { time: "19:00 - 20:30", type: "food", title: "Embers 晚餐", desc: "酒店內晚餐 (HK$200)。", nav: "Embers Restaurant", highlight: "需預約" }
    ]
  },
  {
    day: 6,
    date: "12/30 (二)",
    city: "Blue Mountain",
    title: "Scenic World -> Brisbane",
    events: [
      { time: "08:00 - 08:45", type: "food", title: "酒店早餐", desc: "Fairmont Resort。", nav: "Fairmont Resort & Spa Blue Mountains" },
      { time: "08:45 - 09:00", type: "transport", title: "自駕去 Scenic World", desc: "車程 10min。", nav: "Scenic World" },
      { time: "09:00 - 12:00", type: "sight", title: "Scenic World", desc: "纜車無限票 (HK$600)。", nav: "Scenic World", highlight: "Railway 必坐", tips: "9am 開門即入。" },
      { time: "12:00 - 13:00", type: "food", title: "午餐 @ Scenic World", desc: "EATS 或 Echo Point (HK$110)。", nav: "Scenic World" },
      { time: "13:00 - 16:00", type: "transport", title: "還車 & 去機場", desc: "Simba 還車 -> 的士去機場。", nav: "Simba Car Hire Sydney Airport", note: "16:00 準時還車。" },
      { time: "16:00 - 18:30", type: "transport", title: "飛往布里斯本", desc: "JQ822 (18:25 - 18:55) 機票 HK$1,100。", nav: "Sydney Airport Domestic Terminal" },
      { time: "19:15 - 19:30", type: "transport", title: "的士去酒店", desc: "前往 Royal Albert Hotel (HK$150)。", nav: "Royal Albert Hotel Brisbane" },
      { time: "20:00 - 21:30", type: "food", title: "Popolo Italian Kitchen", desc: "義式晚餐 (HK$160)。", nav: "Popolo Italian Kitchen", note: "評價 4.3/5。" }
    ]
  },
  {
    day: 7,
    date: "12/31 (三)",
    city: "Gold Coast",
    title: "Movie World & 2026!",
    events: [
      { time: "08:00 - 09:30", type: "food", title: "酒店早餐", desc: "Royal Albert Hotel。", nav: "Royal Albert Hotel Brisbane" },
      { time: "09:30 - 10:00", type: "transport", title: "取車 (Enterprise)", desc: "400 George St (租車 HK$375)。", nav: "Enterprise Rent-A-Car Brisbane City" },
      { time: "10:00 - 11:00", type: "transport", title: "自駕去 Movie World", desc: "車程 1hr (55km)。", nav: "Warner Bros. Movie World" },
      { time: "11:00 - 17:00", type: "sight", title: "Warner Bros Movie World", desc: "全日樂園 (門票 HK$1,000)。", nav: "Warner Bros. Movie World", highlight: "DC Rivals / Superman", tips: "提前買票。" },
      { time: "17:00 - 18:00", type: "transport", title: "自駕去 Surfers Paradise", desc: "車程 1hr (40km)。", nav: "Surfers Paradise" },
      { time: "18:00 - 18:30", type: "stay", title: "入住 Mercure Gold Coast", desc: "81 Surf Parade (HK$1,350)。", nav: "Mercure Gold Coast Resort" },
      { time: "18:30 - 20:00", type: "sight", title: "海灘散步 / 休息", desc: "Surfers Paradise Beach。", nav: "Surfers Paradise Beach" },
      { time: "20:00 - 21:00", type: "food", title: "Social Eating House", desc: "晚餐 (HK$200)。", nav: "Social Eating House + Bar", highlight: "需預約" },
      { time: "21:00 - 23:00", type: "sight", title: "新年煙花 🎆", desc: "Surfers Paradise Beach。", nav: "Surfers Paradise Beach", tips: "19:00 前霸位。" }
    ]
  },
  {
    day: 8,
    date: "01/01 (四)",
    city: "Gold Coast",
    title: "抱樹熊 & 螢火蟲",
    events: [
      { time: "09:15 - 10:00", type: "transport", title: "自駕去 Currumbin", desc: "車程 45min (25km)。", nav: "Currumbin Wildlife Sanctuary" },
      { time: "10:00 - 14:00", type: "sight", title: "Currumbin Wildlife", desc: "Koala Encounter + Lunch (HK$1,300)。", nav: "Currumbin Wildlife Sanctuary", highlight: "抱樹熊", tips: "預約 8:45/9:00 時段。" },
      { time: "14:00 - 15:15", type: "transport", title: "自駕去 Tamborine", desc: "車程 1hr 15min (90km)。", nav: "Tamborine Mountain" },
      { time: "15:15 - 16:45", type: "sight", title: "螢火蟲洞 & Curtis Falls", desc: "Glow Worm Caves (門票 HK$200)。", nav: "Glow Worm Caves Tamborine Mountain", note: "新年確認開放。" },
      { time: "16:45 - 18:15", type: "transport", title: "自駕去 Wynnum", desc: "車程 1hr 30min (80km)。", nav: "Wynnum" },
      { time: "18:15 - 18:45", type: "sight", title: "Wynnum Waterfront", desc: "海濱散步放鬆。", nav: "Wynnum Jetty" },
      { time: "18:45 - 19:00", type: "stay", title: "入住 Wynnum Anchor", desc: "14 Adam St (HK$880)。", nav: "Wynnum Anchor Quay" },
      { time: "19:00 - 20:30", type: "food", title: "Cedar & Pine 晚餐", desc: "晚餐 (HK$160)。", nav: "Cedar & Pine Bar" }
    ]
  },
  {
    day: 9,
    date: "01/02 (五)",
    city: "Maleny",
    title: "鴨嘴獸 -> Maleny",
    events: [
      { time: "07:00 - 08:30", type: "transport", title: "自駕去 Maleny", desc: "車程 1hr 30min (85km)。", nav: "Obi Obi Boardwalk" },
      { time: "08:30 - 09:30", type: "sight", title: "睇鴨嘴獸 (Platypus)", desc: "Obi Obi Boardwalk (免費)。", nav: "Obi Obi Boardwalk", tips: "保持安靜，帶望遠鏡。" },
      { time: "09:30 - 11:30", type: "sight", title: "Maleny 鎮中心", desc: "逛街飲咖啡 (HK$60)。", nav: "Maple Street Maleny" },
      { time: "11:30 - 12:15", type: "transport", title: "自駕去 Glass House Mts", desc: "車程 40min (20km)。", nav: "Glass House Mountains Lookout" },
      { time: "12:15 - 13:15", type: "sight", title: "Glass House Mts Lookout", desc: "360度全景，免費。", nav: "Glass House Mountains Lookout" },
      { time: "13:15 - 13:45", type: "transport", title: "自駕去 Mary Cairncross", desc: "車程 30min (15km)。", nav: "Mary Cairncross Scenic Reserve" },
      { time: "13:45 - 16:00", type: "sight", title: "Mary Cairncross Reserve", desc: "雨林步道 + 午餐 (HK$120)。", nav: "Mary Cairncross Scenic Reserve" },
      { time: "16:00 - 18:00", type: "transport", title: "自駕去 Tin Can Bay", desc: "車程 2hr (145km)。", nav: "Tin Can Bay" },
      { time: "18:00 - 18:15", type: "stay", title: "入住 Tin Can Bay Motel", desc: "2-4 Lagoon St (HK$830)。", nav: "Tin Can Bay Motel" },
      { time: "18:15 - 19:30", type: "food", title: "Marina Bar & Grill", desc: "晚餐 (HK$160)。", nav: "Marina Bar & Grill Tin Can Bay" }
    ]
  },
  {
    day: 10,
    date: "01/03 (六)",
    city: "Tin Can Bay",
    title: "餵海豚 -> Carlo Sand",
    events: [
      { time: "06:30 - 06:45", type: "food", title: "酒店附近早餐", desc: "早餐 (HK$100)。", nav: "Tin Can Bay" },
      { time: "06:45 - 08:15", type: "sight", title: "餵野生海豚", desc: "Barnacles Dolphin Centre (HK$100)。", nav: "Barnacles Dolphin Centre", highlight: "7am 抵達", tips: "8am 餵食。" },
      { time: "08:15 - 09:30", type: "transport", title: "自駕去 Carlo Sand Blow", desc: "車程 1hr 15min (60km)。", nav: "Carlo Sand Blow" },
      { time: "09:30 - 11:30", type: "sight", title: "Carlo Sand Blow 滑沙", desc: "租借滑沙板 + 觀景 (HK$100)。", nav: "Carlo Sand Blow", tips: "帶水，11:30前離開避熱浪。" },
      { time: "11:30 - 11:45", type: "transport", title: "自駕去 Rainbow Beach 鎮", desc: "車程 10min。", nav: "Rainbow Beach" },
      { time: "11:45 - 12:45", type: "food", title: "Rainbow Beach 午餐", desc: "鎮中心午餐 + 購物 (HK$120)。", nav: "Rainbow Beach" },
      { time: "12:45 - 13:00", type: "transport", title: "前往 Coloured Sands", desc: "車程 5min。", nav: "Griffin Esplanade" },
      { time: "13:00 - 14:00", type: "sight", title: "Coloured Sands", desc: "彩色沙崖漫步 (免費)。", nav: "Rainbow Beach Coloured Sands", tips: "潮退時最佳。" },
      { time: "14:00 - 14:15", type: "sight", title: "Rainbow Stairs", desc: "打卡位。", nav: "Laurie Hanson Park" },
      { time: "14:15 - 18:00", type: "transport", title: "自駕返 Brisbane", desc: "車程 3hr 30min (226km)。", nav: "Brisbane City" },
      { time: "18:00 - 18:30", type: "stay", title: "入住 Royal Albert Hotel", desc: "Brisbane (HK$860)。", nav: "Royal Albert Hotel Brisbane" },
      { time: "18:30 - 19:30", type: "food", title: "Massimo 晚餐", desc: "晚餐 (HK$200)。", nav: "Massimo Restaurant & Bar" }
    ]
  },
  {
    day: 11,
    date: "01/04 (日)",
    city: "Brisbane",
    title: "Brisbane City Walk",
    events: [
      { time: "10:00 - 10:30", type: "transport", title: "還車 (Enterprise)", desc: "10:00 前還車 (400 George St)。", nav: "Enterprise Rent-A-Car Brisbane City" },
      { time: "09:30 - 12:30", type: "sight", title: "上午: 城市探索 (二選一)", desc: "方案1: New Farm 飲咖啡/公園散步 | 方案2: City Botanic Gardens。", nav: "Brisbane City", highlight: "自由活動" },
      { time: "12:30 - 15:00", type: "food", title: "午餐時間", desc: "方案1: Mary Mae's (河邊) | 方案2: South Bank 過橋午餐。", nav: "Brisbane City" },
      { time: "15:00 - 17:00", type: "sight", title: "下午: 逛街/下午茶", desc: "方案1: James St 精品街 | 方案2: South Bank 河岸/人造沙灘。", nav: "James Street" },
      { time: "18:00 - 20:00", type: "food", title: "晚餐時間", desc: "方案1: sAme sAme (James St) | 方案2: Harajuku Gyoza (South Bank)。", nav: "South Bank Parklands" }
    ]
  },
  {
    day: 12,
    date: "01/05 (一)",
    city: "Brisbane",
    title: "回家囉 ✈️",
    events: [
      { time: "07:45 - 08:15", type: "transport", title: "前往機場", desc: "搭的士去 BNE 機場 (HK$200)。", nav: "Brisbane Airport" },
      { time: "08:15 - 10:40", type: "sight", title: "機場 Check-in", desc: "辦理登機手續。", nav: "Brisbane International Airport" },
      { time: "10:40 - 20:00", type: "transport", title: "飛往香港", desc: "經莫爾茲比港轉機 (PX004/PX008)。", nav: "Hong Kong International Airport" }
    ]
  }
];
const infoData = {
  flights: [
    { date: "12/24", route: "深圳 SZX T3 ➔ 成都 CTU T1", code: "3U8706", time: "16:55 - 20:00" },
    { date: "12/25", route: "成都 TFU T1 ➔ 悉尼 SYD T1", code: "3U3891", time: "01:40 - 15:25" },
    { date: "12/30", route: "悉尼 SYD ➔ 布里斯本 BNE", code: "JQ822", time: "18:25 - 18:55" },
    { date: "01/05", route: "布里斯本 BNE ➔ 莫爾茲比港 POM", code: "PX004", time: "10:40 - 13:50" },
    { date: "01/05", route: "莫爾茲比港 POM ➔ 香港 HKG", code: "PX008", time: "14:55 - 19:35" }
  ],
  hotels: [
    { name: "Meriton Suites Mascot Central", city: "Sydney", nights: "1晚", note: "到店付款 HKD 1,101, Agoda" },
    { name: "lyf Bondi Junction", city: "Sydney", nights: "1晚", note: "已付 AUD 150, booking.com" },
    { name: "Airbnb Balgownie", city: "Sydney", nights: "1晚", note: "已付 HKD 877, Airbnb" },
    { name: "Mercure Goulburn", city: "Sydney", nights: "1晚", note: "已付 AUD 155.21, Agoda" },
    { name: "Fairmont Resort & Spa Blue Mountains", city: "Sydney", nights: "1晚", note: "已付 AUD 293, Agoda" },
    { name: "Royal Albert Hotel", city: "Brisbane", nights: "1晚", note: "已付 AUD 169, booking.com" },
    { name: "Mercure Gold Coast", city: "Brisbane", nights: "1晚", note: "已付 HKD 1,368, Agoda" },
    { name: "Wynnum Anchor Quay", city: "Brisbane", nights: "1晚", note: "已付 AUD 171, booking.com" },
    { name: "Tin Can Bay Motel", city: "Brisbane", nights: "1晚", note: "已付 AUD 163, booking.com" },
    { name: "Capri Fraser Brisbane", city: "Brisbane", nights: "2晚", note: "已付 HKD 1,400, Trip.com" },
  ]
};

// --- 3. 小工具組件 ---

// 天氣元件 (使用 Open-Meteo API)
const WeatherWidget = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const loc = LOCATIONS[city] || LOCATIONS["Sydney"];
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current_weather=true`);
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (e) {
        console.error("Weather fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [city]);

  if (loading) return <div className="text-xs text-gray-400 animate-pulse">載入天氣...</div>;

  const isCold = weather?.temperature < 15; // **OPT 1: 將判斷嚴寒條件改為 15 度以下**
  
  // --- 新版 WeatherWidget ---
  return (
    // 1. 外框：改用 flex-col (直排模式)，因為要分上下層
    <div className={`flex flex-col justify-between p-2 rounded-xl shadow-sm border border-white/50 w-[120px] h-[90px] flex-shrink-0 ${isCold ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-orange-50'}`}>
      
      {/* 2. 上層：城市名稱 (置中) */}
      <div className="w-full text-center border-b border-black/5 pb-1 mb-1">
        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider line-clamp-2">{city}即時天氣
        </div>
      </div>

      {/* 3. 下層：左右分開 (左公仔、右溫度) */}
      <div className="flex items-center justify-between px-1 flex-1">
        
        {/* 左下：天氣公仔 */}
        <div className={`p-1.5 rounded-full flex-shrink-0 ${isCold ? 'bg-blue-200 text-blue-600' : 'bg-orange-200 text-orange-600'}`}>
          {weather?.temperature < -5 ? <Snowflake size={20} /> : (weather?.temperature > 10 ? <Sun size={20} /> : <Cloud size={20} />)}
        </div>

        {/* 右下：溫度 + 風速 */}
        <div className="flex flex-col items-end"> {/* items-end 令佢靠右對齊 */}
          
          {/* 溫度：用 Math.round() 取整數 */}
          <div className="font-black text-2xl text-gray-800 leading-none">
            {weather?.temperature ? Math.round(weather.temperature) : '--'}°C
          </div>

          {/* 風速提示 */}
          {weather?.windspeed > 15 && (
             <span className="text-[9px] bg-gray-200 px-1.5 py-0.5 rounded-full text-gray-600 flex items-center gap-1 mt-1">
               <Wind size={8}/> 風大
             </span>
          )}
        </div>

      </div>
    </div>
  );
};

// 匯率換算器 (實時版)
const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AUD');
  const [rates, setRates] = useState({ AUD: 5.2, USD: 7.8 }); // 預設值，以防 API 失敗
  const [loading, setLoading] = useState(true);

  // 自動抓取最新匯率
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // 使用 frankfurter API 抓取 HKD 對 AUD 和 USD 的匯率
        // 因為我們要算 "1 外幣 = ? HKD"，所以我們查 HKD 的匯率再倒過來算，或者直接查 AUD/USD 對 HKD
        const res = await fetch('https://api.frankfurter.app/latest?from=HKD&to=AUD,USD');
        const data = await res.json();
        
        // API 回傳的是 1 HKD = ? AUD (例如 0.19)，我們要反過來算 1 AUD = ? HKD (1 / 0.19)
        if (data && data.rates) {
          setRates({
            AUD: (1 / data.rates.AUD).toFixed(2),
            USD: (1 / data.rates.USD).toFixed(2)
          });
        }
      } catch (e) {
        console.error("Rate fetch failed", e);
        // 失敗時保持預設值，不影響使用
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  // 計算結果
  const rate = rates[currency];
  const result = amount ? (parseFloat(amount) * rate).toFixed(1) : 0;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 mb-6">
      <h3 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2"><RefreshCw size={18} className="text-pink-500"/> 匯率計算機</span>
        {loading ? <span className="text-[10px] text-gray-400 animate-pulse">更新中...</span> : <span className="text-[10px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full">● 即時匯率</span>}
      </h3>
      
      <div className="flex items-center gap-3 mb-3">
        {/* 左邊：輸入與選擇 (上下排) */}
        <div className="flex-1 flex flex-col gap-2">
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="輸入金額"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-pink-400 font-bold text-lg"
          />
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2 bg-white rounded-lg border border-gray-200 text-sm font-bold text-gray-600"
          >
            <option value="AUD">🇦🇺 澳元 (AUD)</option>
            <option value="USD">🇺🇸 美金 (USD)</option>
          </select>
        </div>

        <ArrowRight className="text-gray-300" />

        {/* 右邊：結果顯示 */}
        <div className="flex-1 bg-pink-50 p-3 rounded-xl border border-pink-100 flex flex-col justify-center items-center self-stretch">
           <span className="text-xs text-pink-400 font-bold">HKD</span>
           <span className="font-black text-2xl text-pink-600">${result}</span>
        </div>
      </div>
      
      <p className="text-[10px] text-center text-gray-400">
        當前匯率：1 {currency} ≈ {rate} HKD
      </p>
    </div>
  );
};

// 關鍵字標記元件
const HighlightText = ({ text }) => {
  if (!text) return null;
  // **OPT 2: 增加 '必買' 標記**
  const regex = /(HKD [\d,]+|AUS [\d,]+|USD [\d,]+|已付|免費|Call uber|必吃|必去|需預約|必買)/gi; 
  
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.match(regex)) {
          const isMoney = part.match(/(HKD|AUS|USD)/);
          const isPaid = part.match(/已付|免費/);
          const isImportant = part.match(/Call uber|必吃|必去|需預約|必買/); // **OPT 2: 增加 '必買' 標記**
          
          let color = "bg-gray-100";
          if (isPaid) color = "bg-green-100 text-green-700 border border-green-200";
          else if (isMoney) color = "bg-yellow-50 text-yellow-700 border border-yellow-200";
          else if (isImportant) color = "bg-red-50 text-red-600 border border-red-200";

          return <span key={i} className={`font-bold px-1.5 py-0.5 rounded text-xs mx-0.5 inline-block my-0.5 ${color}`}>{part}</span>;
        }
        return part;
      })}
    </span>
  );
};

// --- 修改後的 ActivityCard ---
const ActivityCard = ({ act, dayIndex, eventIndex, fullData }) => {
  // 狀態管理
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 暫存編輯中的資料
  const [editData, setEditData] = useState({ ...act });

  // 1. 處理儲存文字修改
  const handleSave = async () => {
    try {
      // 複製一份完整的行程資料
      const newData = [...fullData];
      // 更新特定那天的特定活動
      newData[dayIndex].events[eventIndex] = editData;

      // 寫入 Firebase
      await updateDoc(doc(db, "trips", "main_trip"), {
        days: newData
      });
      
      setIsEditing(false); // 關閉編輯模式
    } catch (e) {
      alert("儲存失敗: " + e.message);
    }
  };

  // 2. 處理 PDF/圖片 上傳 (到 Firebase Storage)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    try {
      // 建立檔案路徑：files/時間_檔名
      const storageRef = ref(storage, `files/${Date.now()}_${file.name}`);
      
      // 上傳
      await uploadBytes(storageRef, file);
      // 拿回網址
      const url = await getDownloadURL(storageRef);

      // 自動將網址填入去 editData 的 doc 欄位
      setEditData(prev => ({ ...prev, doc: url }));
      
    } catch (error) {
      alert("上傳失敗");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // --- 樣式設定 (保持不變) ---
  let Icon = MapPin;
  let style = "border-l-4 border-gray-300 bg-white";
  if (act.type === 'flight') { Icon = Plane; style = "border-l-4 border-blue-400 bg-blue-50"; }
  if (act.type === 'food') { Icon = Utensils; style = "border-l-4 border-orange-400 bg-orange-50"; }
  if (act.type === 'stay') { Icon = Home; style = "border-l-4 border-purple-400 bg-purple-50"; }
  if (act.type === 'transport') { Icon = Train; style = "border-l-4 border-green-400 bg-green-50"; }
  if (act.type === 'activity' || act.type === 'sight') { Icon = Camera; style = "border-l-4 border-pink-400 bg-pink-50"; }

  // --- 顯示模式 vs 編輯模式 ---
  return (
    <div className={`p-4 mb-3 rounded-2xl shadow-sm ${style} relative`}>
      
      {/* 編輯按鈕 (右上角) */}
      <button 
        onClick={() => setIsEditing(!isEditing)} 
        className="absolute top-2 right-2 text-gray-400 hover:text-pink-500"
      >
        <Pencil size={14} />
      </button>

      {isEditing ? (
        // === 編輯模式 ===
        <div className="space-y-3 animate-fadeIn">
          <div className="text-xs font-bold text-gray-400">編輯活動</div>
          
          {/* 時間與標題 */}
          <div className="flex gap-2">
            <input 
              className="w-1/3 border p-1 rounded text-xs" 
              value={editData.time} 
              onChange={e => setEditData({...editData, time: e.target.value})}
            />
            <input 
              className="w-2/3 border p-1 rounded text-sm font-bold" 
              value={editData.title} 
              onChange={e => setEditData({...editData, title: e.target.value})}
            />
          </div>

          {/* 描述 */}
          <textarea 
            className="w-full border p-1 rounded text-sm h-20"
            value={editData.desc}
            onChange={e => setEditData({...editData, desc: e.target.value})}
          />

          {/* 檔案上傳區 */}
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-dashed border-gray-300">
             <label className="bg-white border px-2 py-1 rounded cursor-pointer text-xs font-bold flex items-center gap-1">
               {isUploading ? <Loader2 className="animate-spin" size={12}/> : <Plus size={12}/>} 
               上傳文件
               <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading}/>
             </label>
             {editData.doc && <span className="text-[10px] text-green-600 truncate max-w-[150px]">已連結文件</span>}
          </div>

          {/* 儲存按鈕 */}
          <button 
            onClick={handleSave} 
            className="w-full bg-green-500 text-white py-1.5 rounded-lg text-sm font-bold shadow-md active:scale-95"
          >
            儲存變更
          </button>
        </div>
      ) : (
        // === 顯示模式 (原本的樣子) ===
        <>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <span className="bg-white/90 px-2 py-0.5 rounded-md text-xs font-black text-gray-500 font-mono">{act.time}</span>
              <Icon size={16} className="text-gray-600 opacity-70" />
            </div>
            
            <div className="flex gap-1 mr-6"> {/* mr-6 是為了避開編輯按鈕 */}
               {/* 文件按鈕：如果有 editData.doc (Firebase 網址) 就顯示 */}
               {act.doc && (
                <a href={act.doc} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-[10px] font-bold shadow hover:bg-yellow-500">
                  <FileText size={10} /> 文件
                </a>
               )}
               {act.nav && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.nav)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-blue-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow hover:bg-blue-600">
                  <Navigation size={10} /> GO
                </a>
               )}
            </div>
          </div>

          <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1">{act.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed"><HighlightText text={act.desc} /></p>
          
          {(act.highlight || act.tips) && (
            <div className="mt-2 text-[11px] text-gray-500 bg-white/70 p-1.5 rounded-lg border border-gray-100 italic">
               {act.highlight && <span className="mr-2 text-red-500 font-bold">★ {act.highlight}</span>}
               {act.tips && <span>💡 {act.tips}</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

           {/* 2. 導航按鈕 */}
           {act.nav && (
            <button 
              // onClick={...} 
              className="flex items-center gap-1 bg-blue-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow hover:bg-blue-600"
            >
              <Navigation size={10} /> GO
            </button>
           )}

      {/* 標題區 + 鉛筆仔 */}
      <div className="flex items-center gap-2 mb-1">
        <h4 className="font-bold text-gray-800 text-lg leading-tight">{act.title}</h4>
        {/* 鉛筆按鈕：點擊開啟編輯 */}
        <button onClick={() => setIsEditing(!isEditing)} className="text-gray-300 hover:text-pink-500 transition-colors">
          <Pencil size={14} />
        </button>
      </div>

      {/* 編輯模式輸入框 (只有按鉛筆才出現) */}
      {isEditing && (
        <div className="mb-2 flex gap-2 animate-fadeIn">
          <input 
            type="text" 
            placeholder="貼上 PDF/圖片 連結 (如 Google Drive)" 
            value={tempLink}
            onChange={(e) => setTempLink(e.target.value)}
            className="flex-1 text-xs p-2 border border-pink-200 rounded-lg bg-pink-50 focus:outline-pink-400"
          />
          <button onClick={handleSaveLink} className="bg-pink-500 text-white text-xs px-3 rounded-lg font-bold">儲存</button>
        </div>
      )}

      <p className="text-sm text-gray-600 leading-relaxed">
        <HighlightText text={act.desc} />
      </p>
      {(act.highlight || act.note || act.tips) && (
        <div className="mt-2 text-[11px] text-gray-500 bg-white/70 p-1.5 rounded-lg border border-gray-100 italic">
          {act.highlight && <span className="mr-2 text-red-500 font-bold">重點: {act.highlight}</span>}
          {act.note && <span className="mr-2">📝 {act.note}</span>}
          {act.tips && <span className="mr-2">💡 {act.tips}</span>}
        </div>
      )}
    </div>
  );
};

// --- 4. 每天行程卡片 (新增組件) ---
const DayCard = ({ day, dayIndex, fullData }) => {
  // 1. 使用 State 追蹤卡片是否展開
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. 處理點擊事件：切換 isExpanded 的狀態
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

// *** 新增：行程刪除/修改功能 ***
    const deleteEvent = async (eventIndexToDelete) => {
        if (!window.confirm("確定要刪除這項行程嗎？此操作不可逆！")) return;

        // 1. 複製目前的完整行程資料
        const newDays = [...fullData];

        // 2. 在記憶體中，從這一天 (dayIndex) 的 events 陣列中刪除指定的活動 (eventIndexToDelete)
        newDays[dayIndex].events.splice(eventIndexToDelete, 1);

        // 3. 將整個新的行程陣列寫回 Firebase (使用 setDoc，因為它是最簡單和安全的)
        try {
            // trips 是集合名稱，main_trip 是文件名稱
            await setDoc(doc(db, "trips", "main_trip"), {
                days: newDays
            });
            alert("行程刪除成功！");
        } catch (error) {
            console.error("刪除失敗", error);
            alert("刪除失敗。");
        }
    };
      
  return (
    // 外層容器，設定圓角和陰影
    <div className="bg-white rounded-3xl shadow-lg border border-pink-100 overflow-hidden transition-all duration-300">
      
      {/* 卡片頭部 (永遠顯示) - 點擊區域 */}
      <div 
        className={`p-3 min-h-[120px] cursor-pointer flex justify-between items-center transition-colors ${isExpanded ? 'bg-pink-100/50' : 'hover:bg-pink-50'}`}
        onClick={toggleExpand}
      >
        <div className="flex items-start gap-4 flex-grow min-w-0">
          <div className="text-center min-w-[70px] flex-shrink-0">
            {/* 核心資訊：Day 1 */}
            <div className="text-3xl font-black text-gray-800 font-mono tracking-tighter">Day {day.day}</div>
            {/* 核心資訊：日期 */}
            <div className="text-sm font-bold text-pink-500">{day.date}</div>
          </div>
          
          <div className="w-[140px]"> {/* 鎖死闊度 */}
            {/* 核心資訊：行程標題 - 加入 line-clamp-3 以限制夾住 3 行 */}
            <h3 className="text-lg font-black text-gray-800 leading-tight line-clamp-3">{day.title}</h3>
            {/* ... 城市資訊 ... */}
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-pink-400"/>
                {day.city}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 min-w-[120px]">
            {/* 天氣小工具 */}
            <WeatherWidget city={day.city} />

            {/* 展開/收起圖標 */}
            <ChevronDown 
              size={20} 
              className={`text-gray-500 transition-transform duration-300 ${isExpanded ? 'transform rotate-180 text-pink-500' : ''}`}
            />
        </div>
      </div>

      {/* 卡片內容 (根據 isExpanded 狀態顯示/隱藏) */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100 p-4' : 'max-h-0 opacity-0 overflow-hidden p-0'}`}>
        {/* 只有展開時才顯示內容和 padding */}
        {isExpanded && (
          <div className="pt-4 border-t border-pink-100">
            <h4 className="text-md font-bold text-gray-700 mb-3 ml-2">今日行程 ({day.events.length} 項活動)</h4>
            <div className="space-y-3">
              {day.events.map((act, i) => (
                <ActivityCard key={i} act={act} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 5. 主程式 ---
export default function App() {
  const [tab, setTab] = useState('trip'); // trip, info, budget
  const [expenses, setExpenses] = useState([]);
  const [newExpName, setNewExpName] = useState('');
  const [newExpCost, setNewExpCost] = useState('');
  const [firebaseTripData, setFirebaseTripData] = useState([]);
  const [loading, setLoading] = useState(true);

  // *** 2. 新增：App 啟動時開始監聽 Firebase ***
  useEffect(() => {
    // 監聽 "trips" 集合裡的 "main_trip" 文件
    const unsubscribe = onSnapshot(doc(db, "trips", "main_trip"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        // 當雲端資料有變，這裡會自動執行
        setFirebaseTripData(docSnapshot.data().days);
      }
      setLoading(false);
    });

    // 清除函式：當元件被移除時，停止監聽 (節省資源)
    return () => unsubscribe(); 
  }, []); // [] 代表只在 App 首次載入時執行一次
  
  // *** 新增：Loading 畫面處理 (防止資料未到就運行) ***
  if (loading) return <div className="p-10 text-center text-gray-500 font-bold">載入行程中，請稍候...</div>;

  const addExpense = () => {
    if (newExpName && newExpCost) {
      setExpenses([...expenses, { id: Date.now(), name: newExpName, cost: parseFloat(newExpCost) }]);
      setNewExpName('');
      setNewExpCost('');
    }
  };

  // 用於將原本的 tripData 上傳到 Firebase (只需按一次)
   const uploadDataToFirebase = async () => {
     try {
       await setDoc(doc(db, "trips", "main_trip"), {
         days: tripData // 這裡用你原本那個好長的 tripData 變數
       });
       alert("上傳成功！現在可以刪除這個按鈕了");
     } catch (error) {
       console.error("上傳失敗", error);
       alert("上傳失敗");
  }
};
  
  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    
    <div className="max-w-md mx-auto min-h-screen bg-[#FFF5F7] pb-28 font-sans">

     {/* 刪除或註解以下三行，因為資料庫已初始化成功 */}
      {/* <button onClick={uploadDataToFirebase} className="bg-red-500 text-white p-2">
        初始化資料庫 (只按一次)
      </button> */}

    {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md px-6 py-4 rounded-b-[2rem] shadow-sm border-b border-pink-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">澳洲聖誕之旅🎄</h1>
          <p className="text-xs text-pink-400 font-bold tracking-wider">Sydney & Brisbane 2026</p>
        </div>
        <div className="bg-pink-100 p-2 rounded-full text-xl animate-bounce shadow-inner">🎅</div>
      </header>

      {/* Content */}
      <main className="p-4">
        {/* --- TAB 1: 行程 (Trip) --- */}
        {tab === 'trip' && (
          <div className="space-y-8 animate-fadeIn">
            {/* *** 替換資料來源並傳遞編輯用參數 *** */}
            {firebaseTripData.map((day, dayIndex) => (
              <DayCard 
                 key={day.day} 
                 day={day} 
                 dayIndex={dayIndex}        // 新增：傳遞當前是第幾天 (從 0 開始)
                 fullData={firebaseTripData} // 新增：傳遞完整的行程資料
              />
            ))}
          </div>
        )}

        {/* --- TAB 2: 資訊 (Info) --- */}
        {tab === 'info' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 航班資訊 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-blue-100">
              <h3 className="font-bold text-lg text-blue-600 mb-4 flex items-center gap-2 border-b border-blue-50 pb-2">
                <Plane size={20} /> 航班資訊
              </h3>
              <div className="space-y-4">
                {infoData.flights.map((f, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div>
                      <div className="font-black text-gray-700">{f.route}</div>
                      <div className="text-xs text-gray-400">{f.date}</div>
                    </div>
                    <div className="text-right">
                      {/* **FIX 8: 將 f.no 改為 f.code** */}
                      <div className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded">{f.code}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{f.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 住宿資訊 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-purple-100">
              <h3 className="font-bold text-lg text-purple-600 mb-4 flex items-center gap-2 border-b border-purple-50 pb-2">
                <Home size={20} /> 住宿列表
              </h3>
              <div className="space-y-4">
                {infoData.hotels.map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg text-purple-400">
                       <span className="font-bold text-xs block text-center">{h.nights}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{h.name}</div>
                      <div className="text-xs text-gray-500">{h.city} · {h.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

             {/* 緊急聯絡 */}
             <div className="bg-red-50 p-5 rounded-3xl shadow-sm border border-red-100">
              <h3 className="font-bold text-lg text-red-600 mb-3 flex items-center gap-2">
                <Phone size={20} /> 緊急聯絡
              </h3>
              <div className="flex justify-between items-center mb-2">
                  {/* **OPT 5: 修正緊急電話為澳洲緊急電話 (000)** */}
                  <span className="text-sm text-gray-700">澳洲緊急電話 (警察、救護、火警)</span>
                  <a href="tel:000" className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow hover:bg-red-600">Call 000</a>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">外交部緊急聯絡</span>
                  <a href="tel:+886800085095" className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow hover:bg-red-600">Call</a>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: 記帳 (Budget) --- */}
        {tab === 'budget' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 匯率計算機 */}
            <CurrencyConverter />

            {/* 記帳本 */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-green-100">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Wallet className="text-green-500" /> 即時記帳 (HKD)
              </h3>

              {/* 總金額 */}
              <div className="bg-gray-800 text-white p-4 rounded-2xl mb-6 flex justify-between items-center shadow-lg shadow-gray-200">
                <span className="text-sm text-gray-400">目前總花費</span>
                <span className="text-2xl font-mono font-bold">${totalExpense.toFixed(1)}</span> {/* **OPT 6: 總金額顯示一位小數** */}
              </div>

              {/* 新增輸入框 */}
              <div className="flex items-end gap-2 mb-4 w-full"> {/* 加了 items-end (底部對齊) 和 w-full (不爆棚) */}
  
               {/* 項目名輸入框：改成 textarea 自動增高 */}
               <div className="flex-1 min-w-0 relative"> {/* 加 min-w-0 這是關鍵！防止 flex 爆出去 */}
                <textarea 
                rows={1} // 預設 1 行高
                placeholder="項目 (如: 晚餐)" 
                value={newExpName}
                onChange={(e) => {
                setNewExpName(e.target.value);
                // 自動調整高度的小魔法
                e.target.style.height = 'auto'; 
                e.target.style.height = e.target.scrollHeight + 'px';
                }}
                className="w-full p-2 rounded-xl bg-gray-50 border text-sm focus:outline-green-400 resize-none overflow-hidden block leading-normal" 
               // resize-none: 不顯示手動拉大角; overflow-hidden: 隱藏捲軸; block: 消除奇怪間距
               style={{ minHeight: '38px' }} // 設定一個最小高度，跟隔壁 input 一樣高
              />
            </div>

              {/* 金額輸入框：保持不變，但加了 flex-shrink-0 */}
              <input 
              type="number" 
              placeholder="$" 
              value={newExpCost}
              onChange={(e) => setNewExpCost(e.target.value)}
              className="w-20 p-2 h-[38px] rounded-xl bg-gray-50 border text-sm focus:outline-green-400 flex-shrink-0" // 加 h-[38px] 固定高度
              />

              {/* 加號按鈕：保持不變，加 flex-shrink-0 */}
              <button onClick={addExpense} className="bg-green-500 text-white w-[38px] h-[38px] rounded-xl shadow-md active:scale-95 flex justify-center items-center flex-shrink-0">
              <Plus size={20} />
              </button>
            </div>

              {/* 列表 */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {expenses.length === 0 && <div className="text-center text-gray-300 text-sm py-4">還沒有記帳喔 ~</div>}
                {expenses.map((e) => (
                  <div key={e.id} className="flex justify-between items-center p-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{e.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-gray-800">${e.cost.toFixed(1)}</span> {/* **OPT 6: 列表金額顯示一位小數** */}
                      <button onClick={() => deleteExpense(e.id)} className="text-red-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white p-1 flex justify-between items-center z-50 px-2">
        <button onClick={() => setTab('trip')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${tab === 'trip' ? 'bg-pink-50 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Calendar size={22} strokeWidth={tab === 'trip' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">行程</span>
        </button>
        <button onClick={() => setTab('info')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${tab === 'info' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Plane size={22} strokeWidth={tab === 'info' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">資訊</span>
        </button>
        <button onClick={() => setTab('budget')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${tab === 'budget' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
          <Wallet size={22} strokeWidth={tab === 'budget' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">記帳</span>
        </button>
      </nav>
    </div>
  );

}
