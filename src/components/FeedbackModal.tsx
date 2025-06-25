import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  toUserName: string;
}

const FeedbackModal = ({ isOpen, onClose, sessionId, fromUserId, toUserId, toUserName }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Submit feedback
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          session_id: sessionId,
          from_user_id: fromUserId,
          to_user_id: toUserId,
          rating,
          comment: comment || null,
        });

      if (feedbackError) throw feedbackError;

      // Get user to update karma for. Use maybeSingle to prevent error if user is not found.
      const { data: userToUpdate, error: getUserError } = await supabase
        .from('users')
        .select('karma_points')
        .eq('id', toUserId)
        .maybeSingle();

      if (getUserError) throw getUserError;

      // If user is found, proceed to update karma and trust score
      if (userToUpdate) {
        const newKarmaPoints = (userToUpdate.karma_points || 0) + 5;

      // Update karma points
      const { error: karmaError } = await supabase
        .from('users')
        .update({ karma_points: newKarmaPoints })
        .eq('id', toUserId);

      if (karmaError) throw karmaError;

      // Update trust score (simplified calculation)
      const { data: userFeedback } = await supabase
        .from('feedback')
        .select('rating')
        .eq('to_user_id', toUserId);

      if (userFeedback) {
        const avgRating = userFeedback.reduce((sum, f) => sum + f.rating, 0) / userFeedback.length;
        const sessionCount = userFeedback.length;
        
        // Get reports count
        const { data: reports } = await supabase
          .from('reports')
          .select('id')
          .eq('session_id', sessionId);

        const reportsCount = reports?.length || 0;
        const trustScore = Math.max(0, Math.round(avgRating * sessionCount - reportsCount));

        await supabase
          .from('users')
          .update({ trust_score: trustScore })
          .eq('id', toUserId);
      }

      toast({
        title: "Feedback Submitted!",
        description: `Thank you for rating ${toUserName}. They earned +5 karma points!`,
        className: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
      });
      } else {
        // Handle case where user does not exist. The feedback is still valuable.
        console.warn(`Feedback submitted, but user ${toUserId} not found. Skipping karma/trust score update.`);
        toast({
          title: "Feedback Submitted!",
          description: "Your feedback was recorded, but the user's stats could not be updated.",
        });
      }

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/95 border-yellow-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-yellow-400 text-xl">Rate Your Session</DialogTitle>
           <DialogDescription className="text-gray-400 !pt-2">
            How was your session with {toUserName}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Additional Comments (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-500 focus:border-yellow-500"
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
              disabled={submitting || rating === 0}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
