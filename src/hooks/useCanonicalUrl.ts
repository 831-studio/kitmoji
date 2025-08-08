import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useCanonicalUrl = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove any existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create canonical URL (always use https://kitmoji.net without www)
    const canonicalUrl = `https://kitmoji.net${location.pathname}${location.search}`;
    
    // Create and add new canonical link
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;
    document.head.appendChild(canonicalLink);

    // Also update Open Graph URL if it exists
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }

  }, [location.pathname, location.search]);
};