import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Tag, Briefcase, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileOnboardingProps {
  user: any;
  onComplete: () => void;
}

const ProfileOnboarding = ({ user, onComplete }: ProfileOnboardingProps) => {
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

  const skillSuggestions = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Photography', 'Design',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role || !formData.location || formData.skills.length === 0) {
      toast({
        title: "Please fill in all required fields",
        description: "Name, role, skills, and location are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🧑‍💼 Creating profile for user:', user.id);
      console.log('📝 Profile data:', formData);

      // Check if profile already exists to prevent duplicates
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (existingProfile) {
        console.log('✅ Profile already exists, redirecting...');
        toast({
          title: "Profile already exists",
          description: "Redirecting to dashboard...",
        });
        onComplete();
        return;
      }

      // Insert new user profile with proper error handling
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.id,
          email: user.email,
          name: formData.name,
          role: formData.role,
          skills: formData.skills,
          location: formData.location,
          bio: formData.bio || null,
          karma_points: 0,
          trust_score: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Profile creation error:', error);
        throw error;
      }

      console.log('✅ Profile created successfully:', data);

      toast({
        title: "🎉 Profile created successfully!",
        description: "Welcome to AIVana SkillSwap!",
        className: "bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30",
      });

      onComplete();
    } catch (error: any) {
      console.error('❌ Error creating profile:', error);
      toast({
        title: "Error saving profile",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-3xl mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to AIVana SkillSwap!</h1>
            <p className="text-white/80">Let's build your profile and start connecting with others.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/90 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-white/90 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Select your role *
              </Label>
              <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white focus:bg-white/15 focus:border-white/40 rounded-xl">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="learner" className="text-white hover:bg-slate-700">Learner - I want to learn new skills</SelectItem>
                  <SelectItem value="helper" className="text-white hover:bg-slate-700">Helper - I want to teach others</SelectItem>
                  <SelectItem value="both" className="text-white hover:bg-slate-700">Both - I want to learn and teach</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label className="text-white/90 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                What skills can you offer? *
              </Label>
              <div className="space-y-3">
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
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl"
                    placeholder="Type a skill and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={() => addSkill(skillInput)}
                    className="bg-white/20 hover:bg-white/30 text-white rounded-xl"
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
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 rounded-full text-sm transition-all duration-200 hover:scale-105"
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
                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500/50 to-cyan-500/50 text-white rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-red-300"
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
              <Label htmlFor="location" className="text-white/90 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Where are you located? *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl"
                placeholder="City, State or PIN code"
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white/90">Short Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/40 rounded-xl resize-none"
                placeholder="Tell us a bit about yourself..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-medium py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Profile...
                </div>
              ) : (
                'Complete Profile Setup'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileOnboarding;
