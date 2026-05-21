
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hooks (Polls) table
CREATE TABLE hooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  category TEXT DEFAULT 'For You',
  type TEXT CHECK (type IN ('visual', 'text')) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_votes INT DEFAULT 0
);

-- Hook Options table
CREATE TABLE hook_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hook_id UUID REFERENCES hooks(id) ON DELETE CASCADE NOT NULL,
  label TEXT,
  image_url TEXT,
  vote_count INT DEFAULT 0
);

-- Votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hook_id UUID REFERENCES hooks(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES hook_options(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hook_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hook_id UUID REFERENCES hooks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Row Level Security)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hooks are viewable by everyone" ON hooks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create hooks" ON hooks FOR INSERT WITH CHECK (auth.uid() = creator_id AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own hooks" ON hooks FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own hooks" ON hooks FOR DELETE USING (auth.uid() = creator_id);

ALTER TABLE hook_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Options are viewable by everyone" ON hook_options FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create options" ON hook_options FOR INSERT WITH CHECK (auth.role() = 'authenticated');

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.role() = 'authenticated');

-- Function to handle voting and increment counts
CREATE OR REPLACE FUNCTION handle_vote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE hook_options SET vote_count = vote_count + 1 WHERE id = NEW.option_id;
  UPDATE hooks SET total_votes = total_votes + 1 WHERE id = NEW.hook_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_added
AFTER INSERT ON votes
FOR EACH ROW EXECUTE FUNCTION handle_vote();
