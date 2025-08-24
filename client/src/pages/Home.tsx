import { TikTokDashboard } from "../components/ui/tiktok-dashboard";

export default function Home() {
  // Mock data for the TikTok Dashboard
  const mockContentCalendar = [
    { date: "2025-08-01", videoTitle: "CIPC Annual Returns Explained", status: "Published" },
    { date: "2025-08-05", videoTitle: "Beneficial Ownership: What You Need to Know", status: "Scheduled" },
    { date: "2025-08-10", videoTitle: "Avoid CIPC Penalties: Quick Tips", status: "Draft" },
  ];

  const mockKPIs = [
    { name: "Followers", value: "85K", target: "100K", unit: "" },
    { name: "Total Views", value: "8.2M", target: "10M", unit: "" },
    { name: "Conversion Rate", value: "2.1", target: "2.5", unit: "%" },
    { name: "Attributable Revenue", value: "R2.1M", target: "R2.5M", unit: "" },
  ];

  const mockVideoPerformance = [
    { id: "v1", title: "CIPC Annual Returns Explained", views: 1500000, conversionRate: 0.02, attributableRevenue: 500000 },
    { id: "v2", title: "Beneficial Ownership: What You Need to Know", views: 2000000, conversionRate: 0.025, attributableRevenue: 750000 },
    { id: "v3", title: "Avoid CIPC Penalties: Quick Tips", views: 1200000, conversionRate: 0.018, attributableRevenue: 300000 },
  ];

  return (
    <main className="bg-white">
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold">
          CIPC Compliance in <span className="text-[#00A859]">90 Seconds</span>
        </h1>
        <p className="mt-4 text-slate-600">No apps. No forms. Just WhatsApp.</p>
        <a
          href="https://wa.me/+27699171527?text=Start%20my%20CIPC%20score"
          className="mt-6 inline-block bg-[#00A859] text-white px-6 py-3 rounded-lg"
        >
          Start on WhatsApp
        </a>
      </section>

      <section className="py-10">
        <TikTokDashboard
          contentCalendar={mockContentCalendar}
          kpis={mockKPIs}
          videoPerformance={mockVideoPerformance}
        />
      </section>
    </main>
  );
}
