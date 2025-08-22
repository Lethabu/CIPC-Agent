import React from 'react';

interface TikTokKPI {
  name: string;
  value: string;
  target: string;
  unit: string;
}

interface TikTokVideoPerformance {
  id: string;
  title: string;
  views: number;
  conversionRate: number;
  attributableRevenue: number;
}

interface TikTokDashboardProps {
  contentCalendar: { date: string; videoTitle: string; status: string }[];
  kpis: TikTokKPI[];
  videoPerformance: TikTokVideoPerformance[];
}

export const TikTokDashboard: React.FC<TikTokDashboardProps> = ({
  contentCalendar,
  kpis,
  videoPerformance,
}) => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">TikTok Viral Growth Engine Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.name} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-600">{kpi.name}</h3>
              <p className="text-3xl font-bold text-[#00A859] mt-2">
                {kpi.value}
                <span className="text-base text-gray-500 ml-1">{kpi.unit}</span>
              </p>
              <p className="text-sm text-gray-500">Target: {kpi.target}{kpi.unit}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">AI-Powered Content Calendar</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contentCalendar.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.videoTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Video Performance</h2>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attributable Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videoPerformance.map((video) => (
                <tr key={video.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{video.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{video.views.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(video.conversionRate * 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R{video.attributableRevenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};