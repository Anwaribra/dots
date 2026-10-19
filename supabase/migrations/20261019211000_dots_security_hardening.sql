-- ============================================================================
-- Migration: 20261019211000_dots_security_hardening.sql
-- Description: Security hardening for Telegram account linking & user isolation
-- ============================================================================

-- Replace dots_claim_telegram_account with strict single-use code verification
CREATE OR REPLACE FUNCTION public.dots_claim_telegram_account(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_chat_id BIGINT;
    v_user_id UUID;
    v_existing_auth UUID;
    v_auth_uid UUID;
    v_trimmed_code TEXT;
BEGIN
    -- 1. Must be authenticated in Supabase Auth
    v_auth_uid := auth.uid();
    IF v_auth_uid IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'unauthenticated',
            'message', 'You must be signed in to link a Telegram account.'
        );
    END IF;

    -- 2. Validate input code
    v_trimmed_code := trim(p_code);
    IF v_trimmed_code IS NULL OR length(v_trimmed_code) = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'invalid_code',
            'message', 'A valid link code is required.'
        );
    END IF;

    -- 3. Strict verification against dots_link_codes ONLY (NO fallback to raw chat IDs!)
    SELECT telegram_chat_id INTO v_chat_id
    FROM public.dots_link_codes
    WHERE code = v_trimmed_code AND expires_at > now()
    FOR UPDATE;

    IF v_chat_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'invalid_code',
            'message', 'Invalid or expired sync code. Please send /link to @DotsPersonalPlannerBot on Telegram to get a fresh code.'
        );
    END IF;

    -- 4. Check if Telegram user exists
    SELECT id, auth_user_id INTO v_user_id, v_existing_auth
    FROM public.dots_users
    WHERE telegram_chat_id = v_chat_id;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'user_not_found',
            'message', 'No Dots account found for this Telegram account.'
        );
    END IF;

    -- 5. Anti-Takeover: Prevent claiming an account already linked to another auth user
    IF v_existing_auth IS NOT NULL AND v_existing_auth <> v_auth_uid THEN
        RETURN jsonb_build_object(
            'success', false,
            'status', 'already_claimed',
            'message', 'This Telegram account is already linked to another user account.'
        );
    END IF;

    -- 6. Atomically link account
    UPDATE public.dots_users
    SET auth_user_id = v_auth_uid, updated_at = now()
    WHERE id = v_user_id;

    -- 7. Immediately invalidate the code (single-use enforcement)
    UPDATE public.dots_link_codes
    SET expires_at = now() - INTERVAL '1 hour'
    WHERE code = v_trimmed_code;

    RETURN jsonb_build_object(
        'success', true,
        'status', 'linked',
        'message', 'Telegram account linked successfully!',
        'userId', v_user_id
    );
END;
$$;
