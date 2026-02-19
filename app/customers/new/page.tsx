"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NewCustomer() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { error } = await supabase
      .from("customers")
      .insert({ name, address, phone });

    if (error) alert(error.message);
    else alert("登録完了");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="名前" />
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="住所" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="電話番号" />
      <button type="submit">登録</button>
    </form>
  );
}