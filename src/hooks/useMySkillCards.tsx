
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SkillCard } from './useSkillCards';

export const useMySkillCards = (currentUserId: string | null) => {
  const [mySkillCards, setMySkillCards] = useState<SkillCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMySkillCards = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('skill_cards')
          .select(`
            *,
            users!skill_cards_user_id_fkey (
              name,
              karma_points
            )
          `)
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to match our interface
        const transformedData = data?.map(card => ({
          ...card,
          user: card.users
        })) || [];

        setMySkillCards(transformedData);
      } catch (error) {
        console.error('Error fetching my skill cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMySkillCards();
  }, [currentUserId]);

  return { mySkillCards, loading };
};
