import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, slot, playerData, chapter, playtime } = await req.json();

    if (!userId || !playerData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('saves')
      .select('id')
      .eq('user_id', userId)
      .eq('slot', slot)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('saves')
        .update({
          player_data: playerData,
          chapter,
          playtime,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('slot', slot);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('saves')
        .insert({ user_id: userId, slot, player_data: playerData, chapter, playtime });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
