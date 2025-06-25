
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import UserAvatar from '@/components/UserAvatar';

interface LeaderboardUser {
  id: string;
  name: string;
  karma_points: number;
  trust_score: number;
  skills: string[];
  sessions_taught: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Get users with their session counts
        const { data: users, error } = await supabase
          .from('users')
          .select(`
            id,
            name,
            karma_points,
            trust_score,
            skills
          `)
          .order('karma_points', { ascending: false })
          .order('trust_score', { ascending: false })
          .limit(10);

        if (error) throw error;

        // Get session counts for each user
        const usersWithSessions = await Promise.all(
          (users || []).map(async (user) => {
            const { data: sessions } = await supabase
              .from('sessions')
              .select('id')
              .eq('helper_id', user.id)
              .eq('status', 'completed');

            return {
              ...user,
              sessions_taught: sessions?.length || 0,
            };
          })
        );

        setTopUsers(usersWithSessions);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getTrustBadge = (trustScore: number) => {
    if (trustScore >= 90) {
      return { label: 'Gold Mentor', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: Trophy };
    } else if (trustScore >= 75) {
      return { label: 'Trusted', color: 'bg-gradient-to-r from-blue-400 to-blue-600', icon: Medal };
    }
    return null;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-xl font-bold text-yellow-400">#{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1a1a2e] to-[#16213e] text-white flex items-center justify-center">
        <div className="shimmer h-12 w-12 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1a1a2e] to-[#16213e] text-white">
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
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-yellow-400 neon-text mb-2">🏆 Top Helpers</h1>
            <p className="text-gray-400">Celebrating our most valuable community members</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto space-y-4">
          {topUsers.map((user, index) => {
            const trustBadge = getTrustBadge(user.trust_score);
            
            return (
              <Card key={user.id} className="glassmorphism border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 neon-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Rank and User Info */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 glassmorphism rounded-full">
                        {getRankIcon(index)}
                      </div>
                      
                      <UserAvatar name={user.name} className="h-12 w-12" />
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                          {trustBadge && (
                            <Badge className={`${trustBadge.color} text-white font-semibold px-2 py-1 flex items-center gap-1`}>
                              <trustBadge.icon className="w-3 h-3" />
                              {trustBadge.label}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {user.skills.slice(0, 3).map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline" className="border-yellow-500/30 text-yellow-400 text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {user.skills.length > 3 && (
                            <Badge variant="outline" className="border-gray-500/30 text-gray-400 text-xs">
                              +{user.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-right">
                      <div>
                        <p className="text-sm text-gray-400">Karma Points</p>
                        <p className="text-2xl font-bold text-yellow-400">{user.karma_points}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-400">Trust Score</p>
                        <p className="text-xl font-semibold text-white">{user.trust_score}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-blue-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{user.sessions_taught} sessions</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {topUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-yellow-400 mb-2">No helpers yet</h3>
            <p className="text-gray-400 mb-6">Be the first to start teaching and earning karma!</p>
            <Button
              onClick={() => navigate('/create-skill-card')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold"
            >
              Create Skill Card
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
