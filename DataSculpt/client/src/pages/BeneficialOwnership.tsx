import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BeneficialOwnershipForm from "@/components/beneficial-ownership/BeneficialOwnershipForm";
import { useState } from "react";
import { Calendar, AlertTriangle, CheckCircle, Clock, FileText, Users } from "lucide-react";

export default function BeneficialOwnership() {
  const [showForm, setShowForm] = useState(false);
  const companyId = "demo-company-123"; // This would come from route params or context

  const { data: ownershipData, isLoading } = useQuery({
    queryKey: ["/api/beneficial-ownership", companyId],
    retry: false,
    enabled: false // Disable auto-fetch since this endpoint doesn't exist yet
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Compliant</Badge>;
      case "due_soon":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Due Soon</Badge>;
      case "overdue":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setShowForm(false)}>
            ← Back to Overview
          </Button>
        </div>
        <BeneficialOwnershipForm 
          companyId={companyId}
          onSubmitSuccess={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficial Ownership</h1>
          <p className="text-muted-foreground mt-2">
            Manage your company's beneficial ownership filings and compliance status
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <FileText className="w-4 h-4 mr-2" />
          File COR46 Form
        </Button>
      </div>

      {/* Current Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusBadge("pending")}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last updated Never
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Not set
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Annual filing required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficial Owners</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Registered owners
            </p>
          </CardContent>
        </Card>
      </div>



      {/* No Data State */}
      {(
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Beneficial Ownership Filing Found</h3>
            <p className="text-muted-foreground mb-6">
              Get started by filing your first COR46 beneficial ownership form
            </p>
            <Button onClick={() => setShowForm(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Start Filing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}