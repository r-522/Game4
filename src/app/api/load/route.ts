import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('saves')
      .select('*')
      .eq('user_id', userId)
      .order('slot', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ saves: data || [] });
  } catch (error) {
    console.error('Load error:', error);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}
