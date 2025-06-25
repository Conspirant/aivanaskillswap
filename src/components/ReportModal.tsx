
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  fromUserId: string;
}

const REPORT_REASONS = [
  { value: 'no-show', label: 'No-show' },
  { value: 'fake-user', label: 'Fake User' },
  { value: 'payment-scam', label: 'Payment Scam' },
  { value: 'inappropriate-behavior', label: 'Inappropriate Behavior' },
];

const ReportModal = ({ isOpen, onClose, sessionId, fromUserId }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Reason Required",
        description: "Please select a reason for reporting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          session_id: sessionId,
          from_user_id: fromUserId,
          reason,
          description: description || null,
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for reporting this issue. We'll review it shortly.",
        className: "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30",
      });

      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/95 border-red-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-red-400 text-xl">Report Issue</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Reason for Report</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-black/50 border-red-500/30 text-white">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-red-500/30">
                {REPORT_REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption.value} value={reasonOption.value} className="text-white hover:bg-red-500/10">
                    {reasonOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Additional Details (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about the issue..."
              className="bg-black/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !reason}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
