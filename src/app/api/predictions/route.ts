import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isPast } from 'date-fns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates, matchId, userId } = body;

    if (!updates || !matchId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify against Supabase with Service Role to bypass client RLS if any, or just normal key
    // Better to use service role key if we want to securely check and insert.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch match to check if it's locked
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('match_time, manual_override')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found or database error' },
        { status: 404 }
      );
    }

    // 2. Validate locking logic
    const manualOverride = match.manual_override || 'auto';
    const isTimePassed = isPast(new Date(match.match_time.replace(' ', 'T')));
    
    const isLocked = manualOverride === 'closed' || (manualOverride !== 'open' && isTimePassed);

    if (isLocked) {
      return NextResponse.json(
        { error: 'التوقعات مغلقة لهذه المباراة ولا يمكن الحفظ.' },
        { status: 403 }
      );
    }

    // 3. Insert predictions
    const { error: insertError } = await supabase
      .from('predictions')
      .upsert(updates, { onConflict: 'user_id, question_id' });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Prediction Save Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
