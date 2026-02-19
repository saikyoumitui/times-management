"use client";

import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function TestPage() {
  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from("users").select("*");
      console.log("data:", data);
      console.log("error:", error);
    };
    test();
  }, []);

  return <div>Supabase 接続テスト中…</div>;
}