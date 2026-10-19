-- ============================================================================
-- Migration: 20261019225000_dots_onboarding_state.sql
-- Description: Add onboarding_state column to dots_users for Telegram conversational setup
-- ============================================================================

ALTER TABLE public.dots_users 
ADD COLUMN IF NOT EXISTS onboarding_state JSONB DEFAULT NULL;
