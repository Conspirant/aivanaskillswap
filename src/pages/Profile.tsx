import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Star, Calendar, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/alert-dialog";

interface SkillCard {
  id: string;
  skill_offered: string;
  is_paid: boolean;
  price: number | null;
  skill_needed: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useApp();
  const [skillCards, setSkillCards] = useState<SkillCard[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.id) {
      fetchSkillCards();
    }
  }, [profile]);

  const fetchSkillCards = async () => {
    if (!profile) return;
    console.log(`[DEBUG] Fetching skill cards for profile ID: ${profile.id}`);
    try {
      const { data, error } = await supabase
        .from('skill_cards')
        .select('*')
        .eq('user_id', profile.id);
      
      if (error) {
        console.error("[DEBUG] Error fetching skill cards:", error);
        throw error;
      }
      
      console.log(`[DEBUG] Found ${data?.length || 0} skill cards:`, data);
      setSkillCards(data || []);
    } catch (error) {
      console.error("Error fetching skill cards:", error);
      toast({
        title: "Error",
        description: "Failed to load your skill cards.",
        variant: "destructive",
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

      setSkillCards(prev => prev.filter(card => card.id !== cardId));
      toast({
        title: "Success",
        description: "Skill card deleted successfully.",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      });
    } catch (error) {
      console.error("Error deleting skill card:", error);
      toast({
        title: "Error",
        description: "Failed to delete skill card.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
       <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <p className="text-yellow-400">Profile not available. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="bg-black/80 backdrop-blur border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="text-xs text-gray-400">
              User: {user.email} | Profile: {profile.name}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-black/40 border-yellow-500/20 backdrop-blur-xl mb-8">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-black" />
                </div>
              </div>
              <CardTitle className="text-3xl text-yellow-400 mb-2">{profile.name}</CardTitle>
              <div className="flex items-center justify-center text-gray-300 mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                {profile.location}
              </div>
              <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                {profile.role === 'learner' ? 'Learner' : profile.role === 'helper' ? 'Helper' : 'Both'}
              </Badge>
            </CardHeader>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">My Skill Cards</h2>
            {skillCards.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {skillCards.map(card => (
                  <Card key={card.id} className="bg-black/40 border-yellow-500/20 backdrop-blur-xl">
              <CardHeader>
                      <CardTitle className="text-white">{card.skill_offered}</CardTitle>
              </CardHeader>
                    <CardContent>
                      <Badge variant={card.is_paid ? "destructive" : "secondary"}>
                        {card.is_paid ? `Paid: ₹${card.price}` : `Trade: ${card.skill_needed || 'N/A'}`}
                      </Badge>
                    </CardContent>
                    <div className="p-4 flex justify-end">
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-black border-red-500/30 text-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will permanently delete your skill card. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSkillCard(card.id)} className="bg-red-600 hover:bg-red-700">
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                    ))}
                  </div>
            ) : (
              <p className="text-gray-400">You have not created any skill cards yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
