import { supabase } from "@/lib/supabase";

export type CurrentBrother = {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: "admin" | "brother";
};

export async function getCurrentBrotherProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("brothers")
    .select("id, auth_user_id, name, email, role")
    .eq("auth_user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as CurrentBrother;
}

export async function requireAdmin() {
  const brother = await getCurrentBrotherProfile();

  if (!brother || brother.role !== "admin") {
    return null;
  }

  return brother;
}