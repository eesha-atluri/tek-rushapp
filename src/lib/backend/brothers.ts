import { supabase } from "@/lib/supabase";

export type Brother = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "brother";
};

export async function getBrothers() {
  const { data, error } = await supabase
    .from("brothers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Brother[];
}