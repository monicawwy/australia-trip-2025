import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Calendar, Cloud, Sun, CloudSnow, Wind, Utensils, Camera, Train, Plane, Home, Phone, Wallet, Info, Snowflake, ArrowRight, Plus, Trash2, RefreshCw } from 'lucide-react';

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
                city: "Sydney", // 用於天氣對應
                title: "悉尼 Mascot",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "15:30", type: "transport", title: "抵達 SYD 機場", desc: "搭 Airport Link 去 Mascot 站 (HK$140)", nav: "Sydney Airport" },
                    { time: "16:00", type: "stay", title: "入住 Meriton Suites", desc: "Mascot Central, 8 Jackson Dr", note: "評價4.5/5", nav: "Meriton Suites Mascot Central" },
                    { time: "17:30", type: "sight", title: "Circular Quay 夜景", desc: "歌劇院、海港大橋聖誕燈飾", nav: "Circular Quay", tips: "聖誕人多，注意財物！" },
                    { time: "18:45", type: "food", title: "Fortune of War 晚餐", desc: "傳統酒吧 (HK$160)", note: "需確認營業", nav: "Fortune of War", highlight: "必吃" },
                ]
            },
            {
                day: 2,
                date: "12/26 (五)",
                city: "Sydney",
                title: "Bondi & Boxing Day",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "10:00", type: "sight", title: "QVB 逛街", desc: "Boxing Day 購物熱點", nav: "Queen Victoria Building" },
                    { time: "14:15", type: "shop", title: "Birkenhead Point Outlet", desc: "重點: Lululemon", highlight: "必買", nav: "Birkenhead Point Outlet" },
                    { time: "15:15", type: "transport", title: "Simba Car Hire 取車", desc: "悉尼機場取車", nav: "Simba Car Hire Sydney Airport", note: "檢查車況並拍照" },
                    { time: "17:00", type: "sight", title: "Bondi to Coogee Walk", desc: "海濱步道，注意防曬", nav: "Bondi Beach", tips: "帶水！無遮蔭" },
                    { time: "19:00", type: "food", title: "Icebergs Dining Room", desc: "絕美海景晚餐 (HK$300)", highlight: "需預約", nav: "Icebergs Dining Room and Bar" },
                    { time: "20:00", type: "stay", title: "lyf Bondi Junction", desc: "95-97 Oxford St", nav: "lyf Bondi Junction Sydney" }
                ]
            },
            {
                day: 3,
                date: "12/27 (六)",
                city: "Sydney",
                location: "Grand Pacific Drive",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "08:00", type: "food", title: "Bills Bondi 早餐", desc: "經典早餐 (HK$220)", nav: "Bills Bondi", highlight: "經典" },
                    { time: "10:00", type: "sight", title: "Cape Solander", desc: "觀鯨點及海景", nav: "Cape Solander" },
                    { time: "12:10", type: "sight", title: "Sea Cliff Bridge", desc: "藍色海洋路大橋", nav: "Sea Cliff Bridge", tips: "風大，拍照抓緊手機" },
                    { time: "17:15", type: "sight", title: "Kiama Blowhole", desc: "噴水洞", nav: "Kiama Blowhole", tips: "浪大時最壯觀" },
                    { time: "19:45", type: "stay", title: "Airbnb Balgownie", desc: "Balgownie 區域", nav: "Balgownie, NSW" }
                ]
            },
            {
                day: 4,
                date: "12/28 (日)",
                city: "Jamberoo",
                title: "Jamberoo 水上樂園",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "10:00", type: "sight", title: "Jamberoo Action Park", desc: "全日玩水 (HK$600)", highlight: "預購門票", nav: "Jamberoo Action Park", tips: "Funnel Web 滑梯必玩！" },
                    { time: "17:00", type: "transport", title: "前往 Goulburn", desc: "車程約 2hr 15min", nav: "Goulburn, NSW" },
                    { time: "19:15", type: "stay", title: "Mercure Goulburn", desc: "2 Lockyer St", nav: "Mercure Goulburn" }
                ]
            },
            {
                day: 5,
                date: "12/29 (一)",
                city: "Taralga",
                title: "藍山 & 袋熊",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "10:00", type: "sight", title: "Taralga Wildlife Park", desc: "Wombat 互動 (需預約)", highlight: "重點活動", nav: "Taralga Wildlife Park" },
                    { time: "16:00", type: "sight", title: "Lincoln's Rock", desc: "懸崖打卡位", nav: "Lincoln's Rock", tips: "無欄杆，注意安全" },
                    { time: "18:40", type: "stay", title: "Fairmont Resort & Spa Blue Mountains", desc: "Blue Mountains", nav: "Fairmont Resort Blue Mountains" }
                ]
            },
            {
                day: 6,
                date: "12/30 (二)",
                city: "Blue Mountain",
                title: "Scenic World -> 布里斯本",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "09:00", type: "sight", title: "Scenic World", desc: "三種纜車體驗", highlight: "無限票", nav: "Scenic World" },
                    { time: "16:00", type: "transport", title: "還車 & 飛往布里斯本", desc: "Simba 還車 -> 機場", nav: "Simba Car Hire Sydney Airport" },
                    { time: "18:25", type: "transport", title: "飛往 BNE (JQ822)", desc: "Jetstar 18:25 - 18:55", nav: "Sydney Airport Domestic Terminal" },
                    { time: "20:00", type: "food", title: "Popolo Italian Kitchen", desc: "義式晚餐 (HK$160)", nav: "Popolo Italian Kitchen" },
                    { time: "20:00", type: "stay", title: "Royal Albert Hotel", desc: "167 Albert St", nav: "Royal Albert Hotel Brisbane" }
                ]
            },
            {
                day: 7,
                date: "12/31 (三)",
                city: "Gold Coast",
                title: "黃金海岸 Movie World",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "09:30", type: "transport", title: "取車 (Enterprise)", desc: "400 George St", nav: "Enterprise Rent-A-Car Brisbane City" },
                    { time: "11:00", type: "sight", title: "Warner Bros Movie World", desc: "全日樂園", highlight: "DC Rivals 必玩", nav: "Warner Bros. Movie World" },
                    { time: "21:00", type: "sight", title: "新年煙花 🎆", desc: "Surfers Paradise Beach", nav: "Surfers Paradise Beach", tips: "19:00 前去佔位！" },
                    { time: "18:00", type: "stay", title: "Mercure Gold Coast", desc: "81 Surf Parade", nav: "Mercure Gold Coast Resort" }
                ]
            },
            {
                day: 8,
                date: "01/01 (四)",
                city: "Gold Coast",
                title: "抱樹熊 & 螢火蟲",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "10:00", type: "sight", title: "Currumbin Wildlife", desc: "Koala Encounter (需預約 8:45/9:00)", highlight: "抱樹熊", nav: "Currumbin Wildlife Sanctuary" },
                    { time: "15:15", type: "sight", title: "Tamborine Mountain", desc: "螢火蟲洞 & 瀑布", nav: "Glow Worm Caves Tamborine Mountain" },
                    { time: "18:45", type: "stay", title: "Wynnum Anchor Quay", desc: "14 Adam St", nav: "Wynnum Anchor Quay" }
                ]
            },
            {
                day: 9,
                date: "01/02 (五)",
                city: "Maleny",
                location: "鴨嘴獸 & 玻璃屋山",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "08:30", type: "sight", title: "Maleny 鴨嘴獸", desc: "Obi Obi Boardwalk", tips: "保持安靜，帶望遠鏡", nav: "Obi Obi Boardwalk" },
                    { time: "12:15", type: "sight", title: "Glass House Mountains", desc: "Lookout 觀景", nav: "Glass House Mountains Lookout" },
                    { time: "18:00", type: "stay", title: "Tin Can Bay Motel", desc: "2-4 Lagoon St", nav: "Tin Can Bay Motel" }
                ]
            },
            {
                day: 10,
                date: "01/03 (六)",
                city: "Tin Can Bay",
                title: "餵海豚 & 彩色沙",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "08:00", type: "sight", title: "餵野生海豚", desc: "Barnacles Dolphin Centre", highlight: "7am 抵達", nav: "Barnacles Dolphin Centre" },
                    { time: "09:30", type: "sight", title: "Carlo Sand Blow", desc: "滑沙 + 絕美沙丘", tips: "帶水，很曬！", nav: "Carlo Sand Blow" },
                    { time: "13:00", type: "sight", title: "Coloured Sands", desc: "彩色沙崖漫步", nav: "Rainbow Beach Coloured Sands" },
                    { time: "18:00", type: "stay", title: "回到 Capri Fraser Brisbane", desc: "Brisbane", nav: "Capri Fraser Brisbane" }
                ]
            },
            {
                day: 11,
                date: "01/04 (日)",
                city: "Brisbane",
                title: "布里斯本 City Walk",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "10:00", type: "transport", title: "還車 (Enterprise)", desc: "10:00 前還車", nav: "Enterprise Rent-A-Car Brisbane City" },
                    { time: "AM", type: "sight", title: "方案一: New Farm", desc: "文青咖啡 & 公園", nav: "New Farm Park" },
                    { time: "PM", type: "sight", title: "方案二: South Bank", desc: "人造沙灘 & 河岸晚餐", nav: "South Bank Parklands" }
                ]
            },
            {
                day: 12,
                date: "01/05 (一)",
                city: "Brisbane",
                title: "回家囉 ✈️",
                events: [ // **FIX 2: 將 events 改為 activities**
                    { time: "07:45", type: "transport", title: "前往機場", desc: "BNE 機場", nav: "Brisbane Airport" },
                    { time: "10:40", type: "transport", title: "飛往香港 (PX004/008)", desc: "經莫爾茲比港轉機", nav: "Brisbane International Airport" }
                ]
            }
        ];

const infoData = {
  flights: [
    { date: "12/24", route: "深圳 SZX ➔ 成都 CTU", code: "3U8706", time: "16:55 - 20:00" },
    { date: "12/25", route: "成都 CTU ➔ 悉尼 SYD", code: "3U3891", time: "01:40 - 15:25" },
    { date: "12/30", route: "悉尼 SYD ➔ 布里斯本 BNE", code: "JQ822", time: "18:25 - 18:55" },
    { date: "01/05", route: "布里斯本 BNE ➔ 莫爾茲比港 POM", code: "PX004", time: "10:40 - 13:50" },
    { date: "01/05", route: "莫爾茲比港 POM ➔ 香港 HKG", code: "PX008", time: "14:55 - 19:35" }
  ],
  hotels: [
    { name: "Meriton Suites Mascot Central", city: "Sydney", nights: "1晚", note: "已付, Agoda" },
    { name: "lyf Bondi Junction", city: "Sydney", nights: "1晚", note: "已付, booking.com" },
    { name: "Airbnb Balgownie", city: "Sydney", nights: "1晚", note: "已付, Airbnb" },
    { name: "Mercure Goulburn", city: "Sydney", nights: "1晚", note: "已付, Agoda" },
    { name: "Fairmont Resort & Spa Blue Mountains", city: "Sydney", nights: "1晚", note: "已付, Agoda" },
    { name: "Royal Albert Hotel", city: "Brisbane", nights: "1晚", note: "已付, booking.com" },
    { name: "Mercure Gold Coast", city: "Brisbane", nights: "1晚", note: "已付, Agoda" },
    { name: "Wynnum Anchor Quay", city: "Brisbane", nights: "1晚", note: "已付, booking.com" },
    { name: "Tin Can Bay Motel", city: "Brisbane", nights: "1晚", note: "已付, booking.com" },
    { name: "Capri Fraser Brisbane", city: "Brisbane", nights: "2晚", note: "已付, Trip.com" },
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
  
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl shadow-sm border border-white/50 ${isCold ? 'bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-orange-50'}`}>
      <div className={`p-2 rounded-full ${isCold ? 'bg-blue-200 text-blue-600' : 'bg-orange-200 text-orange-600'}`}>
        {/* 簡單的天氣圖標判斷 */}
        {weather?.temperature < 10 ? <Cloud size={18} /> : (weather?.temperature > 25 ? <Sun size={18} /> : <Cloud size={18} />)}
      </div>
      <div>
        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Live Weather in {city}</div>
        <div className="font-black text-xl text-gray-800 flex items-center gap-1">
          {weather?.temperature}°C
          {weather?.windspeed > 15 && <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600 flex items-center"><Wind size={8}/> 風大</span>}
        </div>
      </div>
    </div>
  );
};

// 匯率換算器
const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AUS'); 
  const RATES = { AUS: 5.2, USD: 7.8 }; 

  const result = amount ? (parseFloat(amount) * RATES[currency]).toFixed(1) : 0;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-pink-100 mb-6">
      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
        <RefreshCw size={18} className="text-pink-500"/> 匯率計算機
      </h3>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
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
            className="absolute right-2 top-2 bottom-2 bg-white rounded-lg border border-gray-200 text-sm font-bold px-2 text-gray-600"
          >
            <option value="AUS">$ AUS</option> {/* **FIX 3: 修正選項 value** */}
            <option value="USD">$ USD</option>
          </select>
        </div>
        <ArrowRight className="text-gray-300" />
        <div className="flex-1 bg-pink-50 p-3 rounded-xl border border-pink-100 flex flex-col justify-center items-center">
           <span className="text-xs text-pink-400 font-bold">HKD</span>
           <span className="font-black text-xl text-pink-600">${result}</span>
        </div>
      </div>
      <p className="text-[10px] text-center text-gray-400">匯率：1 AUS ≈ 5.2 | 1 USD ≈ 7.8</p>
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

const ActivityCard = ({ act }) => {
  let Icon = MapPin;
  let style = "border-l-4 border-gray-300 bg-white";
  
  if (act.type === 'flight') { Icon = Plane; style = "border-l-4 border-blue-400 bg-blue-50"; }
  if (act.type === 'food') { Icon = Utensils; style = "border-l-4 border-orange-400 bg-orange-50"; }
  if (act.type === 'stay') { Icon = Home; style = "border-l-4 border-purple-400 bg-purple-50"; } // **FIX 4: 修正 Stay 為小寫 stay**
  if (act.type === 'aurora') { Icon = Snowflake; style = "border-l-4 border-teal-400 bg-teal-50 shadow-md shadow-teal-100/50"; }
  if (act.type === 'activity' || act.type === 'sight' || act.type === 'shop') { Icon = Camera; style = "border-l-4 border-pink-400 bg-pink-50"; } // **OPT 3: 增加 shop 類型**
  if (act.type === 'transport') { Icon = Train; style = "border-l-4 border-green-400 bg-green-50"; }

  const handleNav = () => {
    const query = act.nav || act.title; // 用 act.nav 優先
    if (query) {
      // **FIX 5: 修正 Google Maps 連結語法**
      window.open(`http://googleusercontent.com/maps.google.com/search?api=1&query=${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <div className={`p-4 mb-3 rounded-2xl shadow-sm ${style} relative transition-all active:scale-[0.98]`}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className="bg-white/90 px-2 py-0.5 rounded-md text-xs font-black text-gray-500 shadow-sm font-mono">{act.time}</span>
          <Icon size={16} className="text-gray-600 opacity-70" />
        </div>
        {act.nav && ( // **FIX 6: 將 act.location 改為 act.nav**
          <button onClick={handleNav} className="flex items-center gap-1 bg-blue-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow hover:bg-blue-600">
            <Navigation size={10} /> GO
          </button>
        )}
      </div>
      <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1">{act.title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">
        <HighlightText text={act.desc} />
      </p>
      {/* **OPT 4: 顯示 highlight/note/tips 額外資訊** */}
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

// --- 4. 主程式 ---
export default function App() {
  const [tab, setTab] = useState('trip'); // trip, info, budget
  const [expenses, setExpenses] = useState([]);
  const [newExpName, setNewExpName] = useState('');
  const [newExpCost, setNewExpCost] = useState('');

  const addExpense = () => {
    if (newExpName && newExpCost) {
      setExpenses([...expenses, { id: Date.now(), name: newExpName, cost: parseFloat(newExpCost) }]);
      setNewExpName('');
      setNewExpCost('');
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#FFF5F7] pb-28 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md px-6 py-4 rounded-b-[2rem] shadow-sm border-b border-pink-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">🇦🇺 澳洲Christmas之旅</h1>
          <p className="text-xs text-pink-400 font-bold tracking-wider">Sydney & Brisbane 2026</p>
        </div>
        <div className="bg-pink-100 p-2 rounded-full text-xl animate-bounce shadow-inner">☃️</div>
      </header>

      {/* Content */}
      <main className="p-4">
        {/* --- TAB 1: 行程 (Trip) --- */}
        {tab === 'trip' && (
          <div className="space-y-8 animate-fadeIn">
            {tripData.map((day) => (
              <div key={day.day}>
                {/* 日期標題與天氣 */}
                <div className="flex justify-between items-end mb-4 px-1">
                  <div>
                    <div className="text-3xl font-black text-gray-800 font-mono tracking-tighter">Day {day.day}</div>
                    <div className="text-sm font-bold text-pink-500">{day.date}</div>
                  </div>
                  <WeatherWidget city={day.city} />
                </div>
                
                {/* 行程卡片列表 */}
                <div className="space-y-3">
                  {/* **FIX 7: 將 day.activities 改為 day.events** */}
                  {day.events.map((act, i) => (
                    <ActivityCard key={i} act={act} />
                  ))}
                </div>
              </div>
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
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="項目 (如: 晚餐)" 
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  className="flex-1 p-2 rounded-xl bg-gray-50 border text-sm focus:outline-green-400"
                />
                <input 
                  type="number" 
                  placeholder="$" 
                  value={newExpCost}
                  onChange={(e) => setNewExpCost(e.target.value)}
                  className="w-20 p-2 rounded-xl bg-gray-50 border text-sm focus:outline-green-400"
                />
                <button onClick={addExpense} className="bg-green-500 text-white p-2 rounded-xl shadow-md active:scale-95">
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
