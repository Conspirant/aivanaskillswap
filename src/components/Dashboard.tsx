import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useSkillCards } from '@/hooks/useSkillCards';
import { useMySkillCards } from '@/hooks/useMySkillCards';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Bell, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkillCard from './SkillCard';
import SkillSearch from './SkillSearch';
import ConfettiWelcome from './ConfettiWelcome';
import UserDropdown from './UserDropdown';
import FloatingCreateButton from './FloatingCreateButton';
import { Card } from '@/components/ui/card';

const LOGO_URL = '/logo.png';

const Dashboard = () => {
  const { user, profile } = useApp();
  const navigate = useNavigate();
  const {
    skillCards,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy
  } = useSkillCards(profile?.id || null);
  
  const { mySkillCards, loading: myCardsLoading } = useMySkillCards(profile?.id || null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await import('@/integrations/supabase/client').then(m => m.supabase)
        .then(supabase => supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
        );
      if (!error) setAnnouncements(data || []);
    };
    fetchAnnouncements();
  }, []);

  if (loading || myCardsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1a1a2e] to-[#16213e] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="shimmer h-8 w-48 mx-auto mb-4 rounded-lg"></div>
            <div className="shimmer h-4 w-64 mx-auto rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1a1a2e] to-[#16213e] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">No profile found</h3>
            <p className="text-gray-400 mb-6">Please create a profile to continue</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1a1a2e] to-[#16213e] text-white">
      <ConfettiWelcome userName={profile.name} />
      {/* Announcement Banner */}
      {announcements.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 shadow-lg">
          <strong>{announcements[0].title}</strong>
          <div>{announcements[0].message}</div>
          <div className="text-xs text-gray-500">
            {new Date(announcements[0].created_at).toLocaleString()}
          </div>
        </div>
      )}
      
      {/* Top Navigation Bar */}
      <nav className="glassmorphism border-b border-yellow-500/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Logo and Brand */}
              <img src={LOGO_URL} alt="AIVana Logo" className="h-12 w-12 rounded-full shadow-lg border-2 border-purple-400 bg-black/30" style={{boxShadow: '0 0 24px #a78bfa, 0 0 8px #a78bfa'}} />
              <div>
                <h2 className="font-extrabold text-3xl md:text-4xl bg-gradient-to-r from-[#a78bfa] to-[#6366f1] bg-clip-text text-transparent drop-shadow-[0_0_12px_#a78bfa] tracking-tight">AIVana</h2>
                <p className="text-sm text-blue-300 font-medium tracking-wide mt-1">Empowering Skill Sharing</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/leaderboard')}
                variant="ghost"
                size="icon"
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-all duration-300"
                title="Leaderboard"
              >
                <Trophy className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-all duration-300"
                title="Notifications (Coming Soon)"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <UserDropdown userName={profile.name} userEmail={profile.email} />
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with action buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 neon-text mb-2">
              Skill Marketplace
            </h1>
            <p className="text-gray-400">Discover amazing skills and share your expertise</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/my-sessions')}
              variant="premium"
              className=""
            >
              <Calendar className="h-5 w-5 mr-2" />
              My Sessions
            </Button>
            <Button
              onClick={() => navigate('/create-skill-card')}
              variant="premium"
              className=""
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Skill Card
            </Button>
            {(profile.email === 'gwakamoliyeah@gmail.com' || (user && user.email === 'gwakamoliyeah@gmail.com')) && (
              <Button
                onClick={() => navigate('/admin')}
                variant="premium"
                className=""
              >
                <Trophy className="h-5 w-5 mr-2" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card variant="premium" className="text-center neon-glow">
            <h4 className="text-lg font-semibold text-yellow-400 mb-1">Karma Points</h4>
            <p className="text-2xl font-bold neon-text">{profile.karma_points}</p>
          </Card>
          <Card variant="premium" className="text-center neon-glow">
            <h4 className="text-lg font-semibold text-yellow-400 mb-1">Trust Score</h4>
            <p className="text-2xl font-bold neon-text">{profile.trust_score}</p>
          </Card>
          <Card variant="premium" className="text-center neon-glow">
            <h4 className="text-lg font-semibold text-yellow-400 mb-1">My Skills</h4>
            <p className="text-2xl font-bold neon-text">{mySkillCards.length}</p>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="explore" className="space-y-6">
          <TabsList className="glassmorphism border border-yellow-500/20">
            <TabsTrigger 
              value="explore" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-gray-300 font-medium"
            >
              Explore Skills ({skillCards.length})
            </TabsTrigger>
            <TabsTrigger 
              value="my-cards" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black text-gray-300 font-medium"
            >
              My Skill Cards ({mySkillCards.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="space-y-6">
            {/* Search Section */}
            <SkillSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Skill Cards Grid */}
            {skillCards.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">No skill cards found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a skill card!'}
                </p>
                <Button
                  onClick={() => navigate('/create-skill-card')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Skill Card
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillCards.map((card) => (
                  <SkillCard key={card.id} card={card} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-cards" className="space-y-6">
            {mySkillCards.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">No skill cards yet</h3>
                <p className="text-gray-400 mb-6">Share your expertise with the community!</p>
                <Button
                  onClick={() => navigate('/create-skill-card')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Skill Card
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySkillCards.map((card) => (
                  <SkillCard key={card.id} card={card} isOwn={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <FloatingCreateButton />
    </div>
  );
};

export default Dashboard;
