-- PostgreSQL schema for Kitmoji emoji database
-- This matches the SQLite structure with PostgreSQL-specific improvements

CREATE TABLE IF NOT EXISTS emojis (
    id SERIAL PRIMARY KEY,
    emoji TEXT NOT NULL,
    name TEXT NOT NULL,
    keywords TEXT DEFAULT '',
    category TEXT NOT NULL,
    subcategory TEXT DEFAULT '',
    unicode TEXT NOT NULL UNIQUE,
    unicode_version TEXT DEFAULT 'unknown',
    status TEXT DEFAULT 'fully-qualified',
    emoji_type TEXT DEFAULT 'standard',
    base_unicode TEXT DEFAULT '',
    has_variations BOOLEAN DEFAULT FALSE,
    skin_tone TEXT DEFAULT '',
    hair_style TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emojis_category ON emojis(category);
CREATE INDEX IF NOT EXISTS idx_emojis_name ON emojis(name);
CREATE INDEX IF NOT EXISTS idx_emojis_keywords ON emojis USING gin(to_tsvector('english', keywords));
CREATE INDEX IF NOT EXISTS idx_emojis_unicode ON emojis(unicode);
CREATE INDEX IF NOT EXISTS idx_emojis_status ON emojis(status);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_emojis_updated_at BEFORE UPDATE ON emojis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();