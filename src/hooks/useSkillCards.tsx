
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SkillCard {
  id: string;
  user_id: string;
  skill_offered: string;
  skill_needed: string | null;
  is_paid: boolean;
  price: number | null;
  language: string;
  availability: string;
  location: string;
  status: string;
  created_at: string;
  user?: {
    name: string;
    karma_points: number;
  };
}

export const useSkillCards = (currentUserId: string | null) => {
  const [skillCards, setSkillCards] = useState<SkillCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchSkillCards = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('skill_cards')
          .select(`
            *,
            users!skill_cards_user_id_fkey (
              name,
              karma_points
            )
          `)
          .eq('status', 'active')
          .neq('user_id', currentUserId);

        // Apply sorting
        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'karma') {
          query = query.order('users(karma_points)', { ascending: false });
        } else if (sortBy === 'free') {
          query = query.eq('is_paid', false).order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data to match our interface
        const transformedData = data?.map(card => ({
          ...card,
          user: card.users
        })) || [];

        // Apply search filter
        const filteredData = searchTerm
          ? transformedData.filter(card =>
              card.skill_offered.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.language.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : transformedData;

        setSkillCards(filteredData);
      } catch (error) {
        console.error('Error fetching skill cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillCards();
  }, [currentUserId, searchTerm, sortBy]);

  return {
    skillCards,
    loading,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy
  };
};
