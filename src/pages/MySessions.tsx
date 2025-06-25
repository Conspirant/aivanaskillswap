import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  User, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  ArrowLeft,
  Star,
  AlertTriangle,
  Crown,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import FeedbackModal from '@/components/FeedbackModal';
import ReportModal from '@/components/ReportModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Session {
  id: string;
  skill_card_id: string;
  learner_id: string;
  helper_id: string;
  status: string;
  meeting_link: string;
  session_time: string;
  notes: string | null;
  skill_cards: {
    skill_offered: string;
    skill_needed: string | null;
    is_paid: boolean;
    price: number | null;
    language: string;
    location: string;
  };
  learner?: {
    name: string;
  };
  helper?: {
    name: string;
  };
}

const MySessions = () => {
  const navigate = useNavigate();
  const { user, profile, loading: contextLoading } = useApp();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    fromUserId: string;
    toUserId: string;
    toUserName: string;
  }>({
    isOpen: false,
    sessionId: '',
    fromUserId: '',
    toUserId: '',
    toUserName: '',
  });
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    fromUserId: string;
  }>({
    isOpen: false,
    sessionId: '',
    fromUserId: '',
  });

  console.log('📅 [DEBUG] MySessions - User ID:', user?.id);
  console.log('👤 [DEBUG] MySessions - Profile ID:', profile?.id);

  useEffect(() => {
    if (contextLoading) return;
    if (!user) {
        navigate('/');
      return;
    }
    if (!profile) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select(`
            *,
            skill_cards!inner (
              skill_offered,
              skill_needed,
              is_paid,
              price,
              language,
              location
            ),
            learner:users!sessions_learner_id_fkey (
              name
            ),
            helper:users!sessions_helper_id_fkey (
              name
            )
          `)
          .or(`learner_id.eq.${profile.id},helper_id.eq.${profile.id}`)
          .order('session_time', { ascending: true });

        if (error) throw error;
        setSessions(data || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your sessions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, profile, contextLoading, navigate, toast]);

  if (contextLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <p className="text-yellow-400">Profile not available.</p>
      </div>
    );
  }

  const approveSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'confirmed' })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, status: 'confirmed' }
            : session
        )
      );

      toast({
        title: "Session Confirmed",
        description: "The learner will be notified.",
        className: "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30",
      });
    } catch (error) {
      console.error('Error confirming session:', error);
      toast({
        title: "Error",
        description: "Failed to confirm session.",
        variant: "destructive",
      });
    }
  };

  const declineSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'declined' })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, status: 'declined' }
            : session
        )
      );

      toast({
        title: "Session Declined",
        description: "The learner will be notified.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error declining session:', error);
      toast({
        title: "Error",
        description: "Failed to decline session.",
        variant: "destructive",
      });
    }
  };

  const cancelSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'cancelled' })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, status: 'cancelled' }
            : session
        )
      );

      toast({
        title: "Session Cancelled",
        description: "Your request has been cancelled.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel session.",
        variant: "destructive",
      });
    }
  };

  const markAsComplete = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ status: 'completed' })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'completed' }
            : session
        )
      );

      toast({
        title: "Session Complete",
        description: "You can now rate this session.",
        className: "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30",
      });
    } catch (error) {
      console.error('Error marking session as complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark session as complete.",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        .delete()
        .or(`learner_id.eq.${profile.id},helper_id.eq.${profile.id}`);

      console.log('Deleted sessions:', data);

      if (error) {
         throw error;
      }
      
      setSessions([]);

      toast({
        title: "History Cleared",
        description: "Your session history has been cleared.",
        className: "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30",
      });

    } catch (error: any) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error",
        description: error?.message || JSON.stringify(error) || "Failed to clear session history. This could be due to security policies. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const openFeedbackModal = (session: Session, isAsLearner: boolean) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Could not identify your user profile. Please try again.",
        variant: "destructive",
      });
      return;
    }
    const toUserId = isAsLearner ? session.helper_id : session.learner_id;
    const toUserName = isAsLearner ? session.helper?.name || 'Helper' : session.learner?.name || 'Learner';
    
    setFeedbackModal({
      isOpen: true,
      sessionId: session.id,
      fromUserId: profile.id,
      toUserId,
      toUserName,
    });
  };

  const openReportModal = (sessionId: string) => {
    setReportModal({
      isOpen: true,
      sessionId,
      fromUserId: profile?.id || '',
    });
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => prev.filter(session => session.id !== sessionId));

      toast({
        title: "Session Deleted",
        description: "The session has been deleted.",
        className: "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/30",
      });
    } catch (error: any) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: error?.message || JSON.stringify(error) || "Failed to delete session.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'declined':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const SessionCard = ({ session, isAsLearner }: { session: Session; isAsLearner: boolean }) => {
    const sessionDate = new Date(session.session_time);
    const isUpcoming = sessionDate > new Date();
    const isPast = sessionDate < new Date();

    return (
      <Card className="backdrop-blur-xl bg-black/40 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-lg mb-2 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                {session.skill_cards.skill_offered}
              </CardTitle>
              <div className="flex items-center gap-2 text-gray-400">
                <User className="w-4 h-4" />
                <span>
                  {isAsLearner ? 'with' : 'for'} {isAsLearner ? session.helper?.name : session.learner?.name}
                </span>
              </div>
            </div>
            <Badge className={`${getStatusColor(session.status)} flex items-center gap-1`}>
              {getStatusIcon(session.status)}
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-500" />
              <span>{format(sessionDate, 'MMMM do, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span>{format(sessionDate, 'p')}</span>
            </div>
            {session.skill_cards.skill_needed && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Skill exchange: {session.skill_cards.skill_needed}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          {session.status === 'pending' && isUpcoming && !isAsLearner && (
            <>
              <Button
                onClick={() => approveSession(session.id)}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Session
              </Button>
              <Button
                onClick={() => declineSession(session.id)}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </>
          )}

          {session.status === 'pending' && isUpcoming && isAsLearner && (
            <Button
              onClick={() => cancelSession(session.id)}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Request
            </Button>
          )}

            {session.status === 'confirmed' && isUpcoming && (
              <Button
                onClick={() => window.open(session.meeting_link, '_blank')}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Meeting
              </Button>
            )}
            {session.status === 'confirmed' && isPast && isAsLearner && (
              <Button
                onClick={() => markAsComplete(session.id)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
              </Button>
            )}
            {session.status === 'completed' && (
                <Button
                  onClick={() => openFeedbackModal(session, isAsLearner)}
              className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <Star className="w-4 h-4 mr-2" />
              Leave Feedback
                </Button>
          )}
                <Button
                  onClick={() => openReportModal(session.id)}
            variant="ghost"
            className="w-full sm:w-auto text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-black border-red-500/30 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this session from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteSession(session.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    );
  };

  const learnerSessions = sessions.filter(s => s.learner_id === profile.id);
  const helperSessions = sessions.filter(s => s.helper_id === profile.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Debug Info */}
      <div className="bg-black/80 backdrop-blur text-yellow-400 text-xs p-3 border-b border-yellow-500/20">
        <div className="container mx-auto">
          <span className="font-mono">📅 MySessions - Profile: {profile.name} ({profile.id?.slice(0, 8)}...) | Sessions: {sessions.length}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
          
          <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center gap-3">
            <Crown className="w-8 h-8" />
            My Premium Sessions
          </h1>
          <p className="text-gray-300">Manage your learning and teaching sessions</p>
        </div>

        {/* Sessions Tabs */}
        <Tabs defaultValue="learning" className="space-y-6">
          <TabsList className="backdrop-blur-xl bg-black/40 border border-yellow-500/20">
            <TabsTrigger 
              value="learning" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black text-gray-300 font-semibold"
            >
              Learning Sessions ({learnerSessions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="teaching" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black text-gray-300 font-semibold"
            >
              Teaching Sessions ({helperSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learning" className="space-y-4">
            {learnerSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">No Learning Sessions Yet</h3>
                <p className="text-gray-400 mb-6">Start exploring skills and book your first session!</p>
                <Button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold transition-all duration-300 hover:scale-105"
                >
                  Explore Skills
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {learnerSessions.map((session) => (
                  <SessionCard key={session.id} session={session} isAsLearner={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="teaching" className="space-y-4">
            {helperSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">No Teaching Sessions Yet</h3>
                <p className="text-gray-400 mb-6">Create a skill card to start teaching others!</p>
                <Button
                  onClick={() => navigate('/create-skill-card')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold transition-all duration-300 hover:scale-105"
                >
                  Create Skill Card
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {helperSessions.map((session) => (
                  <SessionCard key={session.id} session={session} isAsLearner={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({ ...prev, isOpen: false }))}
        sessionId={feedbackModal.sessionId}
        fromUserId={feedbackModal.fromUserId}
        toUserId={feedbackModal.toUserId}
        toUserName={feedbackModal.toUserName}
      />
      
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal(prev => ({ ...prev, isOpen: false }))}
        sessionId={reportModal.sessionId}
        fromUserId={reportModal.fromUserId}
      />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-black border-red-500/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all of your sessions from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearHistory} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MySessions;
