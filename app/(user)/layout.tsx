import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SanityLive } from "@/sanity/lib/live";

export const metadata: Metadata = {
  title: "Antioch LMS",
  description: "Antioch Christian Resource Center Learning Management System"
};

export default function UserLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-14 sm:pt-16">{children}</main>
        <Footer />
      </div>
      <SanityLive />
    </>
  );
}
