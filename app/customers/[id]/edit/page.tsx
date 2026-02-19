"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function EditCustomer({ params }: any) {
  const id = params.id; // ← URL の [id] がここに入る

  const [customer, setCustomer] = useState<any>(null);

  // 初期データ読み込み
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setCustomer(data);
    };

    load();
  }, [id]);

  // 更新処理
  const update = async () => {
    const { error } = await supabase
      .from("customers")
      .update({
        name: customer.name,
        address: customer.address,
        phone: customer.phone,
      })
      .eq("id", id);

    if (error) {
      alert("更新エラー: " + error.message);
    } else {
      alert("更新完了");
    }
  };

  if (!customer) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>顧客編集</h1>

      <input
        value={customer.name}
        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        placeholder="名前"
      />

      <input
        value={customer.address}
        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
        placeholder="住所"
      />

      <input
        value={customer.phone}
        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        placeholder="電話番号"
      />

      <button onClick={update}>更新</button>
    </div>
  );
}
