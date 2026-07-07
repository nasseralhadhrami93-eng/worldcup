import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
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

    // Initialize the Supabase client with the user's cookies to verify their session
    const supabaseUser = await createClient();

    // Verify the user is authenticated and matches the userId
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session or user mismatch' },
        { status: 401 }
      );
    }

    // 1. Fetch match to check if it's locked using the user client
    const { data: match, error: matchError } = await supabaseUser
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

    // 3. Insert predictions using the Service Role Key to bypass any RLS policies 
    // that might be blocking late insertions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: 'System configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.' },
        { status: 500 }
      );
    }

    const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    const { error: insertError } = await supabaseAdmin
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
