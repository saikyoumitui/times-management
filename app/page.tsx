export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 mt-20">
      <h1 className="text-3xl font-bold">時間管理アプリ</h1>

      <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow">
        出勤
      </button>

      <button className="px-6 py-3 bg-red-500 text-white rounded-lg shadow">
        退勤
      </button>
   
     　<button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow">
    　　休憩開始
　　　　</button>

      <button className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow">
        休憩終了
      </button>

      
    </div>
  )
}

