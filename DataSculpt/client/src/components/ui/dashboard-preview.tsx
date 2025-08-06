import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">
            Your Compliance Command Center
          </h2>
          <p className="text-xl text-medium-gray">
            Monitor all your CIPC activities from one unified dashboard
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="bg-gray-100 rounded-2xl p-6 shadow-2xl">
          {/* Dashboard Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-dark-gray mb-2">Welcome back, Sarah!</h3>
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
            </CardContent>
          </Card>

          {/* Agent Status Cards */}
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
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-medium-gray">Alerts Sent</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-medium-gray">Cost Saved</span>
                    <span className="font-semibold text-compliance-green">R2,400</span>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
