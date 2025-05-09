import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FEEDBACK_OPTIONS, POLICY_OPTIONS } from "@/lib/constants/index-constants";

interface ReportPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

type ReportStep = "report" | "feedback";

const ReportPopover = ({ open, onOpenChange, postId }: ReportPopoverProps) => {
  const [step, setStep] = useState<ReportStep>("report");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after animation finishes
    setTimeout(() => {
      setStep("report");
      setSelectedPolicies([]);
      setSelectedFeedback(null);
    }, 300);
  };

  const handleSubmit = async () => {
    if (selectedPolicies.length === 0 || !selectedFeedback) {
      if (step === "report") {
        // If on report step and policies selected, move to feedback step
        if (selectedPolicies.length > 0) {
          setStep("feedback");
        } else {
          toast.error("Please select at least one policy");
        }
        return;
      } else {
        toast.error("Please select a feedback option");
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/post/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_category: selectedPolicies.join(', '),
          reason: selectedFeedback,
          postId: postId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit report');
      }

      toast.success("Report submitted successfully");
      handleClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePolicy = (policy: string) => {
    if (selectedPolicies.includes(policy)) {
      setSelectedPolicies(selectedPolicies.filter(p => p !== policy));
    } else {
      setSelectedPolicies([...selectedPolicies, policy]);
    }
  };

  const handleContinueToFeedback = () => {
    if (selectedPolicies.length === 0) {
      toast.error("Please select at least one policy");
      return;
    }
    setStep("feedback");
  };

  const handleBackToReport = () => {
    setStep("report");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Report this post</DialogTitle>
          </div>
        </DialogHeader>

        {step === "report" && (
          <div className="">
            <h3 className="text-2xl font-semibold mb-6">Select our policy that applies</h3>
            
            <div className="flex flex-wrap gap-3 mb-16">
              {POLICY_OPTIONS.map((policy) => (
                <button
                  key={policy}
                  className={`px-5 py-3 rounded-full border ${
                    selectedPolicies.includes(policy)
                      ? "border-blue-700 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } transition-colors text-sm md:text-base`}
                  onClick={() => togglePolicy(policy)}
                  disabled={isSubmitting}
                >
                  {policy}
                </button>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleContinueToFeedback}
                className={`px-8 py-3 rounded-full font-medium text-white ${
                  selectedPolicies.length > 0 && !isSubmitting ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-300 cursor-not-allowed"
                } transition-colors`}
                disabled={selectedPolicies.length === 0 || isSubmitting}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        
        {step === "feedback" && (
          <div className="">
            <h3 className="text-2xl font-semibold mb-8">Tell us why to help improve the feed.</h3>
            
            <div className="space-y-5 mb-16">
              {FEEDBACK_OPTIONS.map((option) => (
                <div key={option} className="flex items-center gap-3">
                  <div 
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedFeedback === option ? "border-blue-700" : "border-gray-300"
                    }`}
                    onClick={() => setSelectedFeedback(option)}
                  >
                    {selectedFeedback === option && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-700"></div>
                    )}
                  </div>
                  <span className="text-lg text-gray-700">{option}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button 
                onClick={handleBackToReport}
                className="text-blue-700 hover:underline font-medium"
                disabled={isSubmitting}
              >
                Back to policies
              </button>
              <button 
                onClick={handleSubmit}
                className={`px-8 py-3 rounded-full font-medium text-white ${
                  selectedFeedback && !isSubmitting ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-300 cursor-not-allowed"
                } transition-colors`}
                disabled={!selectedFeedback || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportPopover;