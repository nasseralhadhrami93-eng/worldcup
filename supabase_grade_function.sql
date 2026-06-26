-- Please run this in your Supabase SQL Editor to enable the grading logic

CREATE OR REPLACE FUNCTION public.grade_match(match_uuid UUID, results JSON)
RETURNS VOID AS $$
DECLARE
  q_id TEXT;
  ans_idx TEXT;
  pred RECORD;
BEGIN
  -- Check if admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- loop over the JSON object { "question_id": "selected_option_index" }
  FOR q_id, ans_idx IN SELECT * FROM json_each_text(results)
  LOOP
    -- update question correct answer
    UPDATE public.questions 
    SET correct_option_index = ans_idx::int 
    WHERE id = q_id::uuid AND match_id = match_uuid;

    -- Update points for everyone who got this correct
    FOR pred IN 
      SELECT user_id FROM public.predictions 
      WHERE question_id = q_id::uuid AND selected_option_index = ans_idx::int
    LOOP
      UPDATE public.profiles
      SET total_points = total_points + 1
      WHERE id = pred.user_id;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
