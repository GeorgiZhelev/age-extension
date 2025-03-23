import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

interface TopSite {
  url: string;
  title: string;
  favicon?: string;
}

const MostVisited: React.FC = () => {
  const [topSites, setTopSites] = useState<TopSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopSites = async () => {
      try {
        setIsLoading(true);
        const sites = await browser.topSites.get();
        
        // Process the sites to add favicon URLs
        const processedSites: TopSite[] = sites.map(site => ({
          url: site.url,
          title: site.title || new URL(site.url).hostname,
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`
        }));
        
        setTopSites(processedSites);
      } catch (error) {
        console.error('Error loading top sites:', error);
        // Demo sites for development
        setTopSites([
          { url: 'https://www.github.com', title: 'GitHub', favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=64' },
          { url: 'https://www.google.com', title: 'Google', favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=64' },
          { url: 'https://www.youtube.com', title: 'YouTube', favicon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64' },
          { url: 'https://www.openai.com', title: 'OpenAI', favicon: 'https://www.google.com/s2/favicons?domain=openai.com&sz=64' },
          { url: 'https://www.stackoverflow.com', title: 'Stack Overflow', favicon: 'https://www.google.com/s2/favicons?domain=stackoverflow.com&sz=64' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTopSites();
  }, []);

  // Function to get a colored background based on the URL
  const getColorFromURL = (url: string): string => {
    const colors = [
      'bg-blue-700', 'bg-green-700', 'bg-red-700', 
      'bg-purple-700', 'bg-yellow-700', 'bg-pink-700',
      'bg-indigo-700', 'bg-cyan-700', 'bg-emerald-700'
    ];
    
    // Simple hash function to get a consistent color for a given URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = ((hash << 5) - hash) + url.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Group sites into rows of 6
  const rows = [];
  for (let i = 0; i < 30; i += 6) {
    rows.push(topSites.slice(i, i + 6));
  }

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-neutral-200 mb-4">Most Visited</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid gap-y-6">
          {rows.slice(0, 5).map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-6 gap-4">
              {row.map((site, index) => (
                <a
                  key={`${rowIndex}-${index}`}
                  href={site.url}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    site.favicon ? 'bg-neutral-800' : getColorFromURL(site.url)
                  }`}>
                    {site.favicon ? (
                      <img src={site.favicon} alt="" className="w-6 h-6" />
                    ) : (
                      <span className="text-white font-medium">{site.title[0]}</span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 text-center truncate w-full group-hover:text-neutral-200">
                    {site.title}
                  </span>
                </a>
              ))}
              
              {/* Fill empty slots in the row */}
              {Array.from({ length: Math.max(0, 6 - row.length) }).map((_, index) => (
                <div key={`empty-${index}`} className="w-10 h-10" />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MostVisited; 