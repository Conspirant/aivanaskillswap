import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Tag, Briefcase, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SetupProfile = () => {
  const { user, profile, refetch } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skills: [] as string[],
    location: '',
    bio: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  console.log('🧑‍💼 [DEBUG] SetupProfile - Current user ID:', user?.id);
  console.log('📧 [DEBUG] SetupProfile - Current user email:', user?.email);

  const skillSuggestions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Photography', 'Design',
    'Public Speaking', 'Yoga', 'Cooking', 'Guitar', 'Writing', 'Marketing',
    'Data Science', 'Machine Learning', 'Teaching', 'Languages', 'Fitness'
  ];

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  useEffect(() => {
    // If a profile already exists, redirect to dashboard
    if (profile) {
      navigate('/');
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
      const { data, error } = await supabase
        .from('users')
      .update({
          name: formData.name,
          role: formData.role,
          skills: formData.skills,
          location: formData.location,
          bio: formData.bio || null,
        })
      .eq('auth_user_id', user.id);

      if (error) {
      console.error('❌ [DEBUG] Error updating profile:', error);
      toast({
        title: "Setup Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Profile Updated!" });
      refetch(); // Refetch the context to get the new profile data
      navigate('/');
    }
      setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center text-yellow-400">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <Button onClick={() => navigate('/')} className="bg-yellow-500 hover:bg-yellow-600 text-black">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      {/* Debug Info */}
      <div className="fixed top-0 right-0 bg-black/80 text-yellow-400 text-xs p-3 rounded-bl-lg border-l border-b border-yellow-500/20">
        User: {user.email} | ID: {user.id?.slice(0, 8)}...
      </div>
      
      <div className="w-full max-w-2xl">
        <div className="backdrop-blur-xl bg-black/40 border border-yellow-500/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-3xl mb-6 shadow-lg">
              <Crown className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-3">Complete Your Royal Profile</h1>
            <p className="text-gray-300 text-lg">Join the AIVana SkillSwap elite community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-yellow-400 flex items-center gap-2 font-semibold">
                <User className="w-5 h-5" />
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/30 border-yellow-500/30 text-white placeholder:text-gray-400 focus:bg-black/50 focus:border-yellow-500 rounded-xl h-12 text-lg"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-yellow-400 flex items-center gap-2 font-semibold">
                <Briefcase className="w-5 h-5" />
                Select Your Role *
              </Label>
              <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-black/30 border-yellow-500/30 text-white focus:bg-black/50 focus:border-yellow-500 rounded-xl h-12">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-yellow-500/30">
                  <SelectItem value="learner" className="text-white hover:bg-gray-800 focus:bg-gray-800">Learner - I want to learn new skills</SelectItem>
                  <SelectItem value="helper" className="text-white hover:bg-gray-800 focus:bg-gray-800">Helper - I want to teach others</SelectItem>
                  <SelectItem value="both" className="text-white hover:bg-gray-800 focus:bg-gray-800">Both - I want to learn and teach</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <Label className="text-yellow-400 flex items-center gap-2 font-semibold">
                <Tag className="w-5 h-5" />
                Your Skills *
              </Label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                    className="flex-1 bg-black/30 border-yellow-500/30 text-white placeholder:text-gray-400 focus:bg-black/50 focus:border-yellow-500 rounded-xl"
                    placeholder="Type a skill and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill(skillInput)}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 rounded-xl px-6"
                  >
                    Add
                  </Button>
                </div>
                
                {/* Skill Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addSkill(skill)}
                      className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm transition-all duration-200 hover:scale-105"
                    >
                      {skill}
                    </button>
                  ))}
                </div>

                {/* Selected Skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-full text-sm font-semibold"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-yellow-400 flex items-center gap-2 font-semibold">
                <MapPin className="w-5 h-5" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-black/30 border-yellow-500/30 text-white placeholder:text-gray-400 focus:bg-black/50 focus:border-yellow-500 rounded-xl h-12"
                placeholder="City, State or PIN code"
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-yellow-400 font-semibold">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-black/30 border-yellow-500/30 text-white placeholder:text-gray-400 focus:bg-black/50 focus:border-yellow-500 rounded-xl resize-none"
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-3"></div>
                  Updating Your Profile...
                </div>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Update AIVana SkillSwap
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupProfile;
