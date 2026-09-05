import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SetupNotice from "@/components/SetupNotice";
import { accountsEnabled, currentUser, displayName } from "@/lib/auth-customer";
import { supabaseConfigured } from "@/lib/supabase";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  if (!supabaseConfigured) return <SetupNotice />;

  const user = accountsEnabled ? await currentUser() : null;

  return (
    <>
      <Header userName={user ? displayName(user) : null} />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
