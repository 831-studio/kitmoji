// Map URL-friendly category slugs to actual database category names
export const CATEGORY_MAP: Record<string, string> = {
  'smileys-emotion': 'Smileys & Emotion',
  'people-body': 'People & Body',
  'animals-nature': 'Animals & Nature',
  'food-drink': 'Food & Drink',
  'travel-places': 'Travel & Places',
  'activities': 'Activities',
  'objects': 'Objects',
  'symbols': 'Symbols',
  'flags': 'Flags'
};

export const getCategoryFromSlug = (slug: string): string => {
  return CATEGORY_MAP[slug] || slug.replace(/-/g, ' ');
};

export const getSlugFromCategory = (category: string): string => {
  // Find the slug for a given category name
  const entry = Object.entries(CATEGORY_MAP).find(([_, value]) => value === category);
  if (entry) {
    return entry[0];
  }
  // Fallback: convert to URL-friendly slug
  return category.toLowerCase().replace(/[&\s]+/g, '-');
};