import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, Send, Crown, Star, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const RequestSession = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cardId = searchParams.get('cardId');
  const { user, profile, loading: contextLoading } = useApp();
  const { toast } = useToast();

  const [skillCard, setSkillCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const getMinTime = () => {
    if (!date) return '';
    const today = new Date();
    // Check if the selected date is today
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      // Return current time in HH:mm format
      return today.toTimeString().slice(0, 5);
    }
    return ''; // No minimum time for future dates
  };

  console.log('📅 [DEBUG] RequestSession - User ID:', user?.id);
  console.log('👤 [DEBUG] RequestSession - Profile ID:', profile?.id);
  console.log('🎯 [DEBUG] RequestSession - Card ID:', cardId);

  useEffect(() => {
    if (contextLoading) return;
    if (!user) {
      navigate('/');
    }

    if (!cardId || !user) {
      navigate('/');
      return;
    }

    const fetchSkillCard = async () => {
      try {
        console.log(`[1] Fetching skill card with ID: ${cardId}`);
        const { data, error } = await supabase
          .from('skill_cards')
          .select('*, users(*)')
          .eq('id', cardId)
          .single();

        if (error) throw error;
        console.log('[2] Initial data received from Supabase:', data);

        let finalData = data;

        if (data && !data.users && data.user_id) {
          console.log(`[3] User data was not joined. Starting fallback fetch for user_id: ${data.user_id}`);
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user_id)
            .single();
          
          if (userError) {
            console.error('[4] Fallback user fetch FAILED:', userError);
          } else {
            console.log('[4] Fallback user fetch SUCCEEDED. User data:', userData);
            finalData = { ...data, users: userData };
          }
        } else if (data && data.users) {
            console.log('[3] User data was successfully joined.');
        } else {
            console.error('[3] Fetch failed: No user data joined and no user_id found on skill card.');
        }
        
        console.log('[5] Final skill card data before setting state:', finalData);
        setSkillCard(finalData);
      } catch (error) {
        console.error('❌ [DEBUG] Error fetching skill card:', error);
        toast({
          title: "Error",
          description: "Failed to load skill card details",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSkillCard();
  }, [cardId, user, profile, contextLoading, navigate, toast]);

  const generateMeetingLink = () => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const meetingLink = `https://meet.jit.si/AIVana-${timestamp}-${randomId}`;
    console.log('🔗 [DEBUG] Generated meeting link:', meetingLink);
    return meetingLink;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !profile || !skillCard) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your session",
        variant: "destructive",
      });
      return;
    }

    // Debug logs to confirm skillCard and user_id
    console.log('Skill card object before submit:', skillCard);
    console.log('Skill card user_id:', skillCard.user_id);

    if (!skillCard.user_id) {
      toast({
        title: "Error",
        description: "Skill card is missing an owner. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const [hours, minutes] = time.split(':');
    const sessionDateTime = new Date(date);
    sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0); // Clear seconds/ms

    if (sessionDateTime <= new Date()) {
      toast({
        title: "Invalid Time",
        description: "Please select a date and time in the future.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Generate unique meeting link
      const meetingLink = generateMeetingLink();

      const sessionData = {
        skill_card_id: cardId,
        learner_id: profile.id, // Current user's profile ID
        helper_id: skillCard.user_id, // Use user_id directly from the skill card
        session_time: sessionDateTime.toISOString(),
        meeting_link: meetingLink,
        notes: notes || null,
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "🎉 Session Request Sent!",
        description: `Your request has been sent to the skill card owner.`,
        className: "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
      });

      setTimeout(() => {
        navigate('/my-sessions');
      }, 3000);

    } catch (error) {
      toast({
        title: "❌ Request Failed",
        description: "Failed to send session request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (contextLoading || loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!skillCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Skill Card Not Found</h1>
          <Button onClick={() => navigate('/')} className="bg-yellow-500 text-black hover:bg-yellow-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Debug Info */}
      <div className="bg-black/80 backdrop-blur text-yellow-400 text-xs p-3 border-b border-yellow-500/20">
        <div className="container mx-auto">
          <span className="font-mono">📅 Session Request - Learner: {profile?.name} ({profile?.id?.slice(0, 8)}...) | Helper: {skillCard?.users?.name} ({skillCard?.users?.id?.slice(0, 8)}...)</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 mb-4 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Request Premium Session</h1>
          <p className="text-gray-300">Book a learning session with {skillCard.users?.name}</p>
        </div>

        {/* Skill Card Summary */}
        <Card className="backdrop-blur-xl bg-black/40 border-yellow-500/30 mb-8 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Session Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Skill Offered</Label>
              <p className="text-white font-semibold text-lg">{skillCard.skill_offered}</p>
            </div>
            
            <div>
              <Label className="text-gray-300">
                {skillCard.is_paid ? 'Price' : 'Skill Needed'}
              </Label>
              <p className="text-white font-semibold">
                {skillCard.is_paid 
                  ? `₹${skillCard.price} per session`
                  : skillCard.skill_needed || 'Open to discussion'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Language</Label>
                <p className="text-white">{skillCard.language}</p>
              </div>
              <div>
                <Label className="text-gray-300">Location</Label>
                <p className="text-white">{skillCard.location}</p>
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Availability</Label>
              <p className="text-white">{skillCard.availability}</p>
            </div>

            {skillCard.users && (
              <div className="pt-2 border-t border-yellow-500/20">
                <Label className="text-gray-300">Instructor Stats</Label>
                <div className="flex gap-4 mt-1">
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {skillCard.users.karma_points} Karma
                  </span>
                  <span className="text-blue-400 flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    {skillCard.users.trust_score} Trust
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card className="backdrop-blur-xl bg-black/40 border-yellow-500/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-yellow-400">Choose Your Preferred Time</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Picker */}
              <div className="space-y-2">
                <Label className="text-gray-300">Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-black/30 border-yellow-500/30 text-white hover:border-yellow-500 hover:bg-black/50",
                        !date && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-yellow-400" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-900 border-yellow-500/30">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      fromDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-black/20 border-yellow-500/30"
                  min={getMinTime()}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-gray-300">Notes or Questions (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific topics you'd like to focus on, questions, or additional details..."
                  className="bg-black/30 border-yellow-500/30 text-white placeholder:text-gray-500 focus:border-yellow-500 focus:bg-black/50 min-h-[100px]"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !date || !time}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30 disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Premium Session Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestSession;
