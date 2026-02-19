"use client";

import { useEffect, useState } from "react";
import {supabase} from "@/lib/supabase";

const getToday = () => {
  return new Date()
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
};


export default function Home() {
 const [time, setTime] = useState("");
 const [date, setDate] = useState("");
 const [menuOpen, setMenuOpen] = useState(false);
 const [isWorking, setIsWorking] = useState(false);
 const [isOnBreak, setIsOnBreak] = useState(false);
 const [userId, setUserId] = useState("09262aee-30c9-482a-864f-09b6e5629233");
 
  const checkTodayAttendance = async () => {
    const today = getToday();

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("work_date", today)
      .order("start_time", { ascending: true });

    if (error) return;

    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      setIsWorking(latest.start_time && !latest.end_time);
    } else {
      setIsWorking(false);
    }
  };

  const checkBreakStatus = async () => {
    const today = getToday();

    const { data, error } = await supabase
      .from("break")
      .select("*")
      .eq("user_id", userId)
      .eq("work_date", today)
      .order("break_start", { ascending: true });

    if (error) return;

    if (data && data.length > 0) {
      const latest = data[data.length - 1];
      setIsOnBreak(latest.break_start && !latest.break_end);
    } else {
      setIsOnBreak(false);
    }
  };

const handleStartWork = async () => {
  const today = getToday();

  const { data, error } = await supabase.from("attendance").insert({
    user_id: userId,
    work_date: today,
    start_time: new Date().toISOString(),
  });

  if (error) {
    console.error("出勤エラー:", error);
  } else {
    alert("出勤しました!");
    setIsWorking(true);
     checkTodayAttendance();
  }
};

const handleEndWork = async () => {
  const today = getToday();

  const { data, error } = await supabase
    .from("attendance")
    .update({ end_time: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("work_date", today);

  if (error) {
    console.error("退勤エラー:", error);
  } else {
    alert("退勤しました!");
    setIsWorking(false);
  }
};

const handleBreakStart = async () => {
  console.log("userId:", userId);

  const today = getToday();

  const { data, error } = await supabase.from("break").insert({
    user_id: userId,
    work_date: today,
    break_start: new Date().toISOString(),
  });

  if (error) {
    console.error("休憩開始エラー:", JSON.stringify(error, null, 2));
  } else {
    alert("休憩を開始しました!");
    checkBreakStatus();
  }
};

const handleBreakEnd = async () => {
  const today = getToday();

  const { data, error } = await supabase
    .from("break")
    .select("*")
    .eq("user_id", userId)
    .eq("work_date", today)
    .is("break_end", null)
    .order("break_start", { ascending: true });

  if (error) {
    console.error("休憩終了レコード取得エラー:", error);
    return;
  }

  if (!data || data.length === 0) {
    alert("休憩中のレコードがありません。");
    return;
  }

  const latest = data[data.length - 1];

  const { error: updateError } = await supabase
    .from("break")
    .update({ break_end: new Date().toISOString() })
    .eq("id", latest.id);

  if (updateError) {
    console.error("休憩終了エラー:", updateError);
  } else {
    alert("休憩を終了しました!");
    checkBreakStatus();
  }
};

useEffect(() => {
  const checkTodayAttendance = async () => {
    const today = getToday(); 

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("work_date", today)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("出勤状態取得エラー:", JSON.stringify(error, null, 2));
      return;
    }

    if (data && data.length > 0) {
      const latest = data[data.length - 1];


      if (latest.start_time && !latest.end_time) {
        setIsWorking(true);
      } else {
        setIsWorking(false);
      }
    } else {
      setIsWorking(false);
    }
  };

  checkTodayAttendance(); // ← useEffect の中で1回だけ呼ぶ
}, [userId]);

useEffect(() => {
  const checkBreakStatus = async () => {
    const today = getToday();

    const { data, error } = await supabase
      .from("break")
      .select("*")
      .eq("user_id", userId)
      .eq("work_date", today)
      .order("break_start", { ascending: true });

    if (error) {
      console.error("休憩状態取得エラー:", error);
      return;
    }

    if (data && data.length > 0) {
      const latest = data[data.length - 1];

      // break_start はあるが break_end が null → 休憩中
      if (latest.break_start && !latest.break_end) {
        setIsOnBreak(true);
      } else {
        setIsOnBreak(false);
      }
    } else {
      setIsOnBreak(false);
    }
  };

  checkBreakStatus();
}, [userId]);

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
      <button
        onClick={() => setUserId("09262aee-30c9-482a-864f-09b6e5629233")}
        className="block w-full px-4 py-2 hover:bg-gray-100 border-b"
      >
        Aさん
        </button>

        <button
          onClick={() => setUserId("0c0127be-a6a8-4106-b297-dbfbdfd32a90")}
          className="block w-full px-4 py-2 hover:bg-gray-100 border-b"
        >
        Bさん
        </button>

        <button
        onClick={() => setUserId("170688a4-2c05-4f96-9c56-ab19e572d5bb")}
        className="block w-full px-4 py-2 hover:bg-gray-100 border-b"
      >
        Cさん
        </button>

        <button
        onClick={() => setUserId("b7ce8544-da9f-4a99-993a-e62057554688")}
        className="block w-full px-4 py-2 hover:bg-gray-100"
        >
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

     <button
      onClick={handleBreakStart}
        disabled={!isWorking || isOnBreak}
        className={`w-28 h-20 text-white rounded-lg shadow
          ${!isWorking || isOnBreak ? "bg-gray-400" : "bg-emerald-500"}`}
        >
         休憩開始
      </button>

      <button
      onClick={handleBreakEnd}
        disabled={!isWorking || !isOnBreak}
        className={`w-28 h-20 text-white rounded-lg shadow
          ${!isWorking || !isOnBreak ? "bg-gray-400" : "bg-yellow-500 animate-pulse"}`}
      >
       休憩終了
      </button>
     
  
     <button 
      onClick={handleEndWork}
      disabled={!isWorking || isOnBreak}
      className={`w-28 h-20 text-white rounded-lg shadow
        ${!isWorking || isOnBreak ? "bg-gray-400" : "bg-emerald-500"}`}
      >
      退勤
    </button>

    </div>

  </div>
);
  
}

