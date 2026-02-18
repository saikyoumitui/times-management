import { supabase } from "@/lib/supabase";

export default async function CustomersPage() {
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return <div>エラー: {error.message}</div>;

  return (
    <div>
      <h1>顧客一覧</h1>
      <ul>
        {customers?.map((c) => (
          <li key={c.id}>
            {c.name} / {c.address} / {c.phone}
          </li>
        ))}
      </ul>
    </div>
  );
}
