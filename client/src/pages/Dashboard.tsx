import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navigation/navbar";

interface DashboardData {
  stats: {
    formsFiledThisMonth: number;
    alertsSent: number;
    costSaved: number;
  };
  // Add other properties from the API response here
}

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/analytics/dashboard/default"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-dark-gray mb-2">Welcome back, Sarah!</h1>
              <p className="text-medium-gray">ABC Marketing (Pty) Ltd - Registration: 2019/123456/07</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Badge className="bg-compliance-green/10 text-compliance-green hover:bg-compliance-green/20">
                ✅ Compliant
              </Badge>
              <Badge className="bg-trust-blue/10 text-trust-blue hover:bg-trust-blue/20">
                📅 Next: AR Due Mar 15
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Active Agents
                <Badge className="bg-compliance-green text-white">6 Online</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-compliance-green rounded-full mr-3"></div>
                  <span className="text-sm">CIPC Commander</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-compliance-green rounded-full mr-3"></div>
                  <span className="text-sm">Regulation Sentinel</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm">Form Autopilot (Working)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                This Month
                <span className="text-trust-blue text-sm">February 2024</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-medium-gray">Forms Filed</span>
                  <span className="font-semibold">{dashboardData?.stats?.formsFiledThisMonth || 3}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-medium-gray">Alerts Sent</span>
                  <span className="font-semibold">{dashboardData?.stats?.alertsSent || 12}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-medium-gray">Cost Saved</span>
                  <span className="font-semibold text-compliance-green">R{dashboardData?.stats?.costSaved || 2400}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                Upcoming
                <svg className="w-4 h-4 text-trust-blue" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="bg-yellow-50 p-2 rounded border-l-4 border-yellow-500">
                  <p className="text-sm font-semibold">Annual Return</p>
                  <p className="text-xs text-medium-gray">Due: March 15, 2024</p>
                </div>
                <div className="bg-blue-50 p-2 rounded border-l-4 border-trust-blue">
                  <p className="text-sm font-semibold">B-BBEE Renewal</p>
                  <p className="text-xs text-medium-gray">Due: April 30, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Agent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-compliance-green rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>Form Autopilot</strong> successfully submitted CoR 14.1</p>
                  <p className="text-xs text-medium-gray">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-trust-blue rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>Regulation Sentinel</strong> detected new CIPC regulation update</p>
                  <p className="text-xs text-medium-gray">1 day ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-sa-orange rounded-full flex items-center justify-center mr-3 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm"><strong>Lead Scout</strong> found 5 new potential clients</p>
                  <p className="text-xs text-medium-gray">2 days ago</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-4">
              <Button className="bg-trust-blue hover:bg-blue-700">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Chat with CIPC Commander
              </Button>
              <Button variant="outline" className="border-compliance-green text-compliance-green hover:bg-compliance-green hover:text-white">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.506"/>
                </svg>
                WhatsApp Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
