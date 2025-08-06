// Utility function to generate consistent emoji slugs for URLs
export const generateEmojiSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[:\s]+/g, '-')      // Replace colons and spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')    // Remove any non-alphanumeric characters except hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
};
