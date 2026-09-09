import { Suspense } from "react";
import AccountLink, { AccountLinkView } from "@/components/AccountLink";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SetupNotice from "@/components/SetupNotice";
import { supabaseConfigured } from "@/lib/supabase";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  if (!supabaseConfigured) return <SetupNotice />;

  return (
    <>
      <Header
        accountBar={
          <Suspense fallback={<AccountLinkView variant="bar" name={null} />}>
            <AccountLink variant="bar" />
          </Suspense>
        }
        accountMenu={
          <Suspense fallback={<AccountLinkView variant="menu" name={null} />}>
            <AccountLink variant="menu" />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
