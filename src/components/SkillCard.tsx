
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  GraduationCap, 
  MessageCircle, 
  DollarSign, 
  Globe, 
  MapPin, 
  Clock,
  Award 
} from 'lucide-react';
import { SkillCard as SkillCardType } from '@/hooks/useSkillCards';
import { useNavigate } from 'react-router-dom';

interface SkillCardProps {
  card: SkillCardType;
  isOwn?: boolean;
}

const SkillCard = ({ card, isOwn = false }: SkillCardProps) => {
  const navigate = useNavigate();

  const handleRequestSession = () => {
    navigate(`/request-session?cardId=${card.id}`);
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-black/95 border-2 border-yellow-500/20 hover:border-yellow-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 backdrop-blur-xl">
      {/* Golden glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative z-10">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{card.user?.name || 'Anonymous'}</h3>
            <div className="flex items-center gap-1 text-yellow-400">
              <Award className="w-4 h-4" />
              <span className="text-sm">{card.user?.karma_points || 0} Karma</span>
            </div>
          </div>
        </div>

        {/* Skill Offered */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Skill Offered</span>
          </div>
          <h4 className="text-xl font-bold text-white">{card.skill_offered}</h4>
        </div>

        {/* Skill Needed or Price */}
        <div className="mb-4">
          {card.is_paid ? (
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400 border-green-400/30 font-semibold">
                ₹{card.price} per session
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-medium">Seeking: </span>
              <span className="text-white">{card.skill_needed || 'Open to discussion'}</span>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">{card.language}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">{card.location}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm">{card.availability}</span>
          </div>
        </div>

        {/* Request Button - only show if not own card */}
        {!isOwn && (
          <Button 
            onClick={handleRequestSession}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30"
          >
            Request Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillCard;
