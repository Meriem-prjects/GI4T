-- Add Arabic welcome message so the Assistant Virtuel greeting matches
-- the user's language (previously only French was stored).
ALTER TABLE "chatbot_config" ADD COLUMN "welcome_message_ar" TEXT;
