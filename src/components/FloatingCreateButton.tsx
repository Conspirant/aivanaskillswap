
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FloatingCreateButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/create-skill-card')}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-110 z-50"
      size="icon"
      title="Create Skill Card"
    >
      <Plus className="h-6 w-6 text-black" />
    </Button>
  );
};

export default FloatingCreateButton;
