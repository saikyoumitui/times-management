"use client";

import { useEffect, useState } from "react";
import {supabase} from "@/lib/supabase";


export default function Home() {
 const [time, setTime] = useState("");
 const [date, setDate] = useState("");
 const [menuOpen, setMenuOpen] = useState(false);
 const [isWorking, setIsWorking] = useState(false);

 const handleStartWork = async () => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase.from("attendance").insert({
    user_id: "09262aee-30c9-482a-864f-09b6e5629233",
    work_date: today,
    start_time: new Date().toISOString(),
  });

  if (error) {
    console.error("出勤エラー:", error);
  } else {
    alert("出勤成功:");
    setIsWorking(true);
  }
};

const handleEndWork = async () => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .update({ end_time: new Date().toISOString() })
    .eq("user_id", "09262aee-30c9-482a-864f-09b6e5629233")
    .eq("work_date", today);

  if (error) {
    console.error("退勤エラー:", error);
  } else {
    alert("退勤しました！");
    setIsWorking(false); // ← 出勤状態を解除
  }
};

useEffect(() => {
  const updateClock = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const week = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = week[now.getDay()];

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    setDate(`${year}年 ${month}月 ${day}日（${weekday}）`);
    setTime(`${hours}:${minutes}:${seconds}`);
  };

  updateClock();
  const interval = setInterval(updateClock, 1000);
  return () => clearInterval(interval);
}, []);

    return (
  <div className="relative w-full max-w-3xl mx-auto mt-10 px-6">
<h1 className="text-3xl font-bold text-center mb-6">
  勤怠管理
</h1>

    {/* 日付 */}
    <p className="text-2xl font-bold mb-4 text-black">
      {date}
    </p>

    {/* 時刻とハンバーガー */}
    <div className="flex items-center justify-between">

      {/* 時刻（秒だけ小さく） */}
      <p className="text-5xl font-bold">
        {time.slice(0, 5)}
        <span className="text-2xl ml-2">{time.slice(6, 8)}</span>
      </p>

      {/* ハンバーガー */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-4xl font-bold border px-4 py-2 rounded"
      >
        ☰
      </button>
    </div>

    {/* メニュー（右に出す） */}
    {menuOpen && (
      <div className="mt-4 w-40 bg-white border shadow-lg rounded ml-auto">
        <button className="block w-full px-4 py-2 hover:bg-gray-100 border-b">
          Aさん
        </button>
        <button className="block w-full px-4 py-2 hover:bg-gray-100 border-b">
          Bさん
        </button>
        <button className="block w-full px-4 py-2 hover:bg-gray-100 border-b">
          Cさん
        </button>
        <button className="block w-full px-4 py-2 hover:bg-gray-100">
          Dさん
        </button>
      </div>
    )}

    {/* ボタン */}
    <div className="flex gap-6 mt-10 flex-wrap">
    <button
      onClick={() => {
        console.log("出勤ボタン押された！");
        handleStartWork();
      }}
      disabled={isWorking}
      className={`w-28 h-20 text-white rounded-lg shadow
      ${isWorking ? "bg-gray-400" : "bg-emerald-500"}`}
      >
         出勤
      </button>

      <button className="w-28 h-20 bg-emerald-500 text-white rounded-lg shadow">
        休憩開始
      </button>

      <button className="w-28 h-20 bg-emerald-500 text-white rounded-lg shadow">
        休憩終了
      </button>

      <button 
       onClick={handleEndWork}
       className="w-28 h-20 bg-emerald-500 text-white rounded-lg shadow">
        退勤
      </button>
    </div>

  </div>
);
  
}

