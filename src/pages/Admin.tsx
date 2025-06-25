import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Calendar, 
  AlertTriangle, 
  Trash2, 
  Ban, 
  AlertCircle,
  Crown,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useApp();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [skillCards, setSkillCards] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);

  console.log('🔐 [DEBUG] Admin - User email:', user?.email);
  console.log('👑 [DEBUG] Admin - Profile loaded:', !!profile);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/');
      return;
    }
    // New admin check: allow if profile.role === 'admin'
    if (profile?.role !== 'admin') {
      toast({ title: "Unauthorized", variant: "destructive" });
      navigate('/');
    } else {
      setIsAdmin(true);
    }
  }, [user, profile, loading, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      console.log('📊 [DEBUG] Fetching admin data...');
      
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (usersError) { console.error('Users fetch error:', usersError); throw usersError; }

      // Fetch all sessions with related data
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          skill_cards (skill_offered),
          learner:users!sessions_learner_id_fkey (name),
          helper:users!sessions_helper_id_fkey (name)
        `)
        .order('created_at', { ascending: false });
      if (sessionsError) { console.error('Sessions fetch error:', sessionsError); throw sessionsError; }

      // Fetch all reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (reportsError) { console.error('Reports fetch error:', reportsError); throw reportsError; }

      // Fetch all skill cards
      const { data: skillCardsData, error: skillCardsError } = await supabase
        .from('skill_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (skillCardsError) { console.error('Skill cards fetch error:', skillCardsError); throw skillCardsError; }

      // Fetch all announcements (no join)
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (announcementsError) { console.error('Announcements fetch error:', announcementsError); throw announcementsError; }

      setUsers(usersData || []);
      setSessions(sessionsData || []);
      setReports(reportsData || []);
      setSkillCards(skillCardsData || []);
      setAnnouncements(announcementsData || []);

      console.log('✅ [DEBUG] Admin data fetched successfully');
      console.log('👥 Users:', usersData?.length);
      console.log('📅 Sessions:', sessionsData?.length);
      console.log('🚨 Reports:', reportsData?.length);

    } catch (error) {
      console.error('❌ [DEBUG] Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    }
  };

  const resetProfile = async (userId: string) => {
    try {
      console.log('🔄 [DEBUG] Resetting profile for user:', userId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Profile Reset",
        description: "User profile has been deleted successfully",
        className: "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30",
      });

      // Refresh data
      fetchAdminData();
    } catch (error) {
      console.error('Error resetting profile:', error);
      toast({
        title: "Error",
        description: "Failed to reset profile",
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      console.log('🗑️ [DEBUG] Deleting session:', sessionId);
      
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Session Deleted",
        description: "Session has been removed successfully",
        className: "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30",
      });

      // Refresh data
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  // User status control handlers
  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);
      if (error) throw error;
      toast({
        title: `User ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        description: `User status updated to ${newStatus}`,
        className: 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30',
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  // Skill card moderation handlers
  const updateSkillCardStatus = async (cardId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('skill_cards')
        .update({ status: newStatus })
        .eq('id', cardId);
      if (error) throw error;
      toast({
        title: `Skill Card ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        description: `Skill card status updated to ${newStatus}`,
        className: 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30',
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update skill card status',
        variant: 'destructive',
      });
    }
  };
  const deleteSkillCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('skill_cards')
        .delete()
        .eq('id', cardId);
      if (error) throw error;
      toast({
        title: 'Skill Card Removed',
        description: 'Skill card has been deleted',
        className: 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30',
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete skill card',
        variant: 'destructive',
      });
    }
  };

  // Announcement handlers
  const handleAnnouncementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value });
  };
  const createAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAnnouncement(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: newAnnouncement.title,
          message: newAnnouncement.message,
          created_by: profile.id,
        });
      if (error) throw error;
      toast({
        title: 'Announcement Created',
        description: 'Your announcement has been posted.',
        className: 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30',
      });
      setNewAnnouncement({ title: '', message: '' });
      fetchAdminData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create announcement',
        variant: 'destructive',
      });
    } finally {
      setCreatingAnnouncement(false);
    }
  };
  const deleteAnnouncement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({
        title: 'Announcement Deleted',
        description: 'Announcement has been removed.',
        className: 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30',
      });
      fetchAdminData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete announcement',
        variant: 'destructive',
      });
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Debug Info */}
      <div className="bg-black/80 backdrop-blur text-yellow-400 text-xs p-3 border-b border-yellow-500/20">
        <div className="container mx-auto">
          <span className="font-mono">👑 Admin Panel - User: {user.email} | Access: GRANTED</span>
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
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-yellow-400 mb-1">Admin Control Panel</h1>
              <p className="text-gray-300">Manage AIVana SkillSwap platform</p>
            </div>
          </div>

          <Button
            onClick={fetchAdminData}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-xl bg-black/40 border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-black/40 border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{sessions.length}</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-black/40 border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{reports.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="backdrop-blur-xl bg-black/40 border border-yellow-500/20">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black text-gray-300 font-semibold"
            >
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger 
              value="sessions" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black text-gray-300 font-semibold"
            >
              Sessions ({sessions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black text-gray-300 font-semibold"
            >
              Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger 
              value="skill-cards" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black text-gray-300 font-semibold"
            >
              Skill Cards ({skillCards.length})
            </TabsTrigger>
            <TabsTrigger 
              value="user-status" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black text-gray-300 font-semibold"
            >
              User Status
            </TabsTrigger>
            <TabsTrigger 
              value="announcements" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-black text-gray-300 font-semibold"
            >
              Announcements ({announcements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="backdrop-blur-xl bg-black/40 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <p className="text-gray-300">{user.email}</p>
                      <div className="flex gap-2">
                        <Badge className="bg-blue-500/20 text-blue-400">{user.role}</Badge>
                        <Badge className="bg-green-500/20 text-green-400">{user.karma_points} Karma</Badge>
                        <Badge className="bg-purple-500/20 text-purple-400">{user.trust_score} Trust</Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        Skills: {user.skills?.join(', ') || 'None'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => resetProfile(user.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Reset Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="backdrop-blur-xl bg-black/40 border-yellow-500/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">
                        {session.skill_cards?.skill_offered || 'Unknown Skill'}
                      </h3>
                      <p className="text-gray-300">
                        Learner: {session.learner?.name} | Helper: {session.helper?.name}
                      </p>
                      <div className="flex gap-2">
                        <Badge className={`${
                          session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          session.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">
                        Session Time: {new Date(session.session_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => deleteSession(session.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">No Reports</h3>
                <p className="text-gray-400">All users are behaving well!</p>
              </div>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="backdrop-blur-xl bg-black/40 border-red-500/20">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-semibold text-white">{report.reason}</h3>
                      </div>
                      <p className="text-gray-300">{report.description}</p>
                      <p className="text-sm text-gray-400">
                        Reported: {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="skill-cards">
            <div className="space-y-4">
              {skillCards.map((card) => (
                <Card key={card.id} className="backdrop-blur-xl bg-black/40 border-yellow-500/20">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{card.skill_offered}</h3>
                      <p className="text-gray-300">Needed: {card.skill_needed || 'None'}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className={
                          card.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          card.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          card.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }>{card.status}</Badge>
                        <Badge className="bg-blue-500/20 text-blue-400">{card.language}</Badge>
                        <Badge className="bg-purple-500/20 text-purple-400">{card.location}</Badge>
                      </div>
                      <p className="text-sm text-gray-400">Created: {new Date(card.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {card.status !== 'approved' && (
                        <Button
                          onClick={() => updateSkillCardStatus(card.id, 'approved')}
                          variant="outline"
                          size="sm"
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <Shield className="w-4 h-4 mr-1" />Approve
                        </Button>
                      )}
                      {card.status !== 'rejected' && (
                        <Button
                          onClick={() => updateSkillCardStatus(card.id, 'rejected')}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Ban className="w-4 h-4 mr-1" />Reject
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteSkillCard(card.id)}
                        variant="outline"
                        size="sm"
                        className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="user-status">
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="backdrop-blur-xl bg-black/40 border-yellow-500/20">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <p className="text-gray-300">{user.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-blue-500/20 text-blue-400">{user.role}</Badge>
                        <Badge className={
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          user.status === 'banned' ? 'bg-red-500/20 text-red-400' :
                          user.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }>{user.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.status !== 'banned' && (
                        <Button
                          onClick={() => updateUserStatus(user.id, 'banned')}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Ban className="w-4 h-4 mr-1" />Ban
                        </Button>
                      )}
                      {user.status !== 'suspended' && (
                        <Button
                          onClick={() => updateUserStatus(user.id, 'suspended')}
                          variant="outline"
                          size="sm"
                          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />Suspend
                        </Button>
                      )}
                      {user.status !== 'active' && (
                        <Button
                          onClick={() => updateUserStatus(user.id, 'active')}
                          variant="outline"
                          size="sm"
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        >
                          <Shield className="w-4 h-4 mr-1" />Reactivate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="announcements">
            <div className="space-y-6">
              <form onSubmit={createAnnouncement} className="bg-black/40 p-6 rounded-lg border border-yellow-500/20 mb-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Create Announcement</h3>
                <input
                  type="text"
                  name="title"
                  value={newAnnouncement.title}
                  onChange={handleAnnouncementChange}
                  placeholder="Title"
                  className="w-full p-2 mb-2 rounded bg-gray-900 text-white border border-yellow-500/20"
                  required
                />
                <textarea
                  name="message"
                  value={newAnnouncement.message}
                  onChange={handleAnnouncementChange}
                  placeholder="Message"
                  className="w-full p-2 mb-2 rounded bg-gray-900 text-white border border-yellow-500/20"
                  rows={3}
                  required
                />
                <Button type="submit" disabled={creatingAnnouncement} className="bg-yellow-500 text-black font-semibold">
                  {creatingAnnouncement ? 'Posting...' : 'Post Announcement'}
                </Button>
              </form>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-gray-400">No announcements yet.</div>
                ) : (
                  announcements.map((a) => (
                    <Card key={a.id} className="backdrop-blur-xl bg-black/40 border-yellow-500/20">
                      <CardContent className="p-6 flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-yellow-400">{a.title}</h4>
                          <p className="text-gray-300 mb-2">{a.message}</p>
                          <div className="text-xs text-gray-400">
                            Posted {new Date(a.created_at).toLocaleString()} by {a.created_by || 'Unknown'}
                          </div>
                        </div>
                        <Button
                          onClick={() => deleteAnnouncement(a.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />Delete
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
