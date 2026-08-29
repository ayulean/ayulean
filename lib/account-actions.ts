"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customerClient, currentUser } from "./auth-customer";

export async function signOutAction() {
  const supabase = await customerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function saveProfileAction(formData: FormData) {
  const user = await currentUser();
  if (!user) redirect("/account/login");

  const supabase = await customerClient();
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name: String(formData.get("full_name") ?? "").trim().slice(0, 80),
      phone: String(formData.get("phone") ?? "").replace(/\s/g, "").slice(0, 15),
      address: String(formData.get("address") ?? "").trim().slice(0, 300),
      city: String(formData.get("city") ?? "").trim().slice(0, 60),
      state: String(formData.get("state") ?? "").trim().slice(0, 60),
      pincode: String(formData.get("pincode") ?? "").trim().slice(0, 6),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw new Error(`Failed to save profile: ${error.message}`);

  revalidatePath("/account");
  redirect("/account?saved=1");
}
