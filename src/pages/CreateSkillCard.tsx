import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const CreateSkillCard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: contextLoading } = useApp();
  const { toast } = useToast();
  
  const [skillOffered, setSkillOffered] = useState('');
  const [skillNeeded, setSkillNeeded] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [language, setLanguage] = useState('');
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!contextLoading && !user) {
      navigate('/');
    }
  }, [user, contextLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast({
        title: "Profile Required",
        description: "Your profile is still loading. Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }
    
    if (!skillOffered || !language || !availability || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (isPaid && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price for paid services.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('skill_cards')
        .insert({
          user_id: profile.id,
          skill_offered: skillOffered,
          skill_needed: isPaid ? null : skillNeeded || null,
          is_paid: isPaid,
          price: isPaid ? parseInt(price) : null,
          language,
          availability,
          location,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [DEBUG] Skill card created successfully:', data);
      
      toast({
        title: "Card created successfully! ✨",
        description: "Your skill card is now live and visible to others.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('❌ [DEBUG] Error creating skill card:', error);
      toast({
        title: "Error",
        description: "Failed to create skill card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1a1a2e] to-[#16213e] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1a1a2e] to-[#16213e] text-white flex items-center justify-center">
        <p>Your profile is being prepared. You will be able to create a skill card shortly.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E0E0E] via-[#1a1a2e] to-[#16213e] text-white">
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
          
          <h1 className="text-4xl font-bold neon-text mb-2 flex items-center">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-400" />
            Create Skill Card
          </h1>
          <p className="text-gray-400">Share your expertise and connect with learners</p>
        </div>

        {/* Form */}
        <Card className="glassmorphism border-yellow-500/20 neon-glow">
          <CardHeader>
            <CardTitle className="text-yellow-400 text-xl">Skill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">Skill You're Offering *</label>
                <Input
                  value={skillOffered}
                  onChange={(e) => setSkillOffered(e.target.value)}
                  placeholder="e.g., Web Development, Guitar Lessons, French Tutoring"
                  className="bg-black/40 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 transition-all duration-300"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-black/20 border border-yellow-500/20">
                <Switch
                  checked={isPaid}
                  onCheckedChange={setIsPaid}
                  className="data-[state=checked]:bg-yellow-500"
                />
                <div>
                  <label className="text-gray-300 font-medium">Paid Service</label>
                  <p className="text-gray-500 text-sm">Toggle if you want to charge for your service</p>
                </div>
              </div>

              {isPaid ? (
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Price (₹) *</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g., 500"
                    className="bg-black/40 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 transition-all duration-300"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Skill You Want in Exchange</label>
                  <Input
                    value={skillNeeded}
                    onChange={(e) => setSkillNeeded(e.target.value)}
                    placeholder="e.g., Graphic Design, Photography, Marketing (Optional)"
                    className="bg-black/40 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 transition-all duration-300"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Language *</label>
                  <Input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g., English, Hindi"
                    className="bg-black/40 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">Location *</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Mumbai, Online"
                    className="bg-black/40 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium mb-2 block">Availability *</label>
                <Textarea
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="When are you available? e.g., Weekends, Evenings 6-9 PM"
                  className="bg-black/40 border-yellow-500/30 text-white placeholder-gray-500 focus:border-yellow-500 transition-all duration-300 resize-none"
                  rows={3}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 transition-all duration-300 hover:scale-105 ripple"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Skill Card
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

export default CreateSkillCard;
