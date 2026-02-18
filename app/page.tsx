"use client";

import { useEffect, useState } from "react";

export default function Home() {
 const [time, setTime] = useState("");

 useEffect(() => {
    const updateClock = () => {
     const now = new Date();
     const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setTime(`${hours}:${minutes}`);
   };

   updateClock(); // 最初に表示する// 
   const interval = setInterval(updateClock, 60000); // 1分ごと更新

   return () => clearInterval(interval);
  },[]); 
  
    return (
    <div className="flex flex-col items-center gap-6 mt-20">
      <h1 className="text-3xl font-bold">時間管理アプリ</h1>


<div className="flex gap-4">  
      <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow">
        出勤
      </button>

      <button className="px-6 py-3 bg-red-500 text-white rounded-lg shadow">
        退勤
      </button>
   
     <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow">
        休憩中
    </button>

      <button className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow">
        休憩終了
      </button>
  </div>
      
    </div>
  )

}

