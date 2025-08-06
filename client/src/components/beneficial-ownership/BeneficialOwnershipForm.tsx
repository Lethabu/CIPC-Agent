import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, FileText, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BeneficialOwner {
  fullName: string;
  idNumber: string;
  nationality: string;
  ownershipPercentage: number;
  natureOfControl: string;
  address: string;
}

interface BeneficialOwnershipFormProps {
  companyId: string;
  onSubmitSuccess?: () => void;
}

export default function BeneficialOwnershipForm({ companyId, onSubmitSuccess }: BeneficialOwnershipFormProps) {
  const [beneficialOwners, setBeneficialOwners] = useState<BeneficialOwner[]>([
    {
      fullName: "",
      idNumber: "",
      nationality: "South African",
      ownershipPercentage: 0,
      natureOfControl: "",
      address: ""
    }
  ]);
  
  const [significantControl, setSignificantControl] = useState({
    controlType: "",
    description: "",
    effectiveDate: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/beneficial-ownership/generate", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form Generated",
        description: "COR46 Beneficial Ownership form has been generated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/beneficial-ownership", companyId] });
      onSubmitSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const submitFormMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/beneficial-ownership/submit", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form Submitted",
        description: "COR46 form has been submitted to CIPC successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/beneficial-ownership", companyId] });
      onSubmitSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addBeneficialOwner = () => {
    setBeneficialOwners([...beneficialOwners, {
      fullName: "",
      idNumber: "",
      nationality: "South African",
      ownershipPercentage: 0,
      natureOfControl: "",
      address: ""
    }]);
  };

  const removeBeneficialOwner = (index: number) => {
    setBeneficialOwners(beneficialOwners.filter((_, i) => i !== index));
  };

  const updateBeneficialOwner = (index: number, field: keyof BeneficialOwner, value: string | number) => {
    const updated = [...beneficialOwners];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficialOwners(updated);
  };

  const handleGenerateForm = () => {
    const formData = {
      companyId,
      beneficialOwners,
      significantControl
    };
    generateFormMutation.mutate(formData);
  };

  const handleSubmitForm = () => {
    const formData = {
      companyId,
      beneficialOwners,
      significantControl,
      formType: "COR46",
      declarationDate: new Date().toISOString()
    };
    
    submitFormMutation.mutate({
      filingId: companyId,
      formData
    });
  };

  const totalOwnership = beneficialOwners.reduce((sum, owner) => sum + (owner.ownershipPercentage || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            COR46 Beneficial Ownership Filing
          </CardTitle>
          <CardDescription>
            File beneficial ownership information with CIPC. This form must be submitted annually 
            or when ownership structure changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Beneficial Owners Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Beneficial Owners</h3>
              <Button onClick={addBeneficialOwner} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Owner
              </Button>
            </div>
            
            {beneficialOwners.map((owner, index) => (
              <Card key={index} className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Beneficial Owner {index + 1}</CardTitle>
                    {beneficialOwners.length > 1 && (
                      <Button 
                        onClick={() => removeBeneficialOwner(index)}
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      value={owner.fullName}
                      onChange={(e) => updateBeneficialOwner(index, 'fullName', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div>
                    <Label>ID Number</Label>
                    <Input
                      value={owner.idNumber}
                      onChange={(e) => updateBeneficialOwner(index, 'idNumber', e.target.value)}
                      placeholder="Enter ID number"
                    />
                  </div>
                  
                  <div>
                    <Label>Nationality</Label>
                    <Select 
                      value={owner.nationality}
                      onValueChange={(value) => updateBeneficialOwner(index, 'nationality', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="South African">South African</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Ownership Percentage</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={owner.ownershipPercentage}
                      onChange={(e) => updateBeneficialOwner(index, 'ownershipPercentage', parseFloat(e.target.value) || 0)}
                      placeholder="Enter percentage"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Nature of Control</Label>
                    <Input
                      value={owner.natureOfControl}
                      onChange={(e) => updateBeneficialOwner(index, 'natureOfControl', e.target.value)}
                      placeholder="Describe the nature of control"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Address</Label>
                    <Textarea
                      value={owner.address}
                      onChange={(e) => updateBeneficialOwner(index, 'address', e.target.value)}
                      placeholder="Enter full address"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Ownership Total Warning */}
            {totalOwnership !== 100 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Warning:</strong> Total ownership is {totalOwnership}%. 
                  It should equal 100% for accurate filing.
                </p>
              </div>
            )}
          </div>

          {/* Significant Control Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Significant Control Information</h3>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Type of Control</Label>
                  <Select 
                    value={significantControl.controlType}
                    onValueChange={(value) => setSignificantControl(prev => ({ ...prev, controlType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select control type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voting_rights">Voting Rights</SelectItem>
                      <SelectItem value="appointment_rights">Right to Appoint Directors</SelectItem>
                      <SelectItem value="significant_influence">Significant Influence</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={significantControl.description}
                    onChange={(e) => setSignificantControl(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the significant control arrangement"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Effective Date</Label>
                  <Input
                    type="date"
                    value={significantControl.effectiveDate}
                    onChange={(e) => setSignificantControl(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filing Cost Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Filing Information</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>• CIPC Filing Fee: R2.50</p>
              <p>• Service Fee: R5.00</p>
              <p>• Total Cost: R7.50</p>
              <p>• Processing Time: 5-10 business days</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleGenerateForm}
              disabled={generateFormMutation.isPending || beneficialOwners.some(owner => !owner.fullName || !owner.idNumber)}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {generateFormMutation.isPending ? "Generating..." : "Generate Form"}
            </Button>
            
            <Button 
              onClick={handleSubmitForm}
              disabled={submitFormMutation.isPending || totalOwnership !== 100}
              variant="default"
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitFormMutation.isPending ? "Submitting..." : "Submit to CIPC"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}