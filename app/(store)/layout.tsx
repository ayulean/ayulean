import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SetupNotice from "@/components/SetupNotice";
import { supabaseConfigured } from "@/lib/supabase";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  if (!supabaseConfigured) return <SetupNotice />;

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
