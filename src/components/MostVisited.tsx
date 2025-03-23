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
        
        // Process the sites to add direct favicon URLs
        const processedSites: TopSite[] = sites.map(site => {
          const url = new URL(site.url);
          return {
            url: site.url,
            title: site.title || url.hostname,
            favicon: `${url.origin}/favicon.ico` // Direct path to favicon
          };
        });
        
        setTopSites(processedSites);
      } catch (error) {
        console.error('Error loading top sites:', error);
        // Demo sites for development
        setTopSites([
          { url: 'https://www.github.com', title: 'GitHub', favicon: 'https://github.com/favicon.ico' },
          { url: 'https://www.google.com', title: 'Google', favicon: 'https://www.google.com/favicon.ico' },
          { url: 'https://www.youtube.com', title: 'YouTube', favicon: 'https://www.youtube.com/favicon.ico' },
          { url: 'https://www.openai.com', title: 'OpenAI', favicon: 'https://www.openai.com/favicon.ico' },
          { url: 'https://www.stackoverflow.com', title: 'Stack Overflow', favicon: 'https://www.stackoverflow.com/favicon.ico' },
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

  // Group sites into rows of 10 for full width display
  const rows = [];
  for (let i = 0; i < 30; i += 10) {
    rows.push(topSites.slice(i, i + 10));
  }

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg w-full">
      <h2 className="text-xl font-semibold text-neutral-200 mb-4 font-sans">Most Visited</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid gap-y-6">
          {rows.slice(0, 3).map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-10 gap-4">
              {row.map((site, index) => (
                <a
                  key={`${rowIndex}-${index}`}
                  href={site.url}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    site.favicon ? 'bg-neutral-800' : getColorFromURL(site.url)
                  }`}>
                    {site.favicon ? (
                      <img 
                        src={site.favicon} 
                        alt="" 
                        className="w-8 h-8" 
                        onError={(e) => {
                          // Fallback to Google's service if direct favicon fails
                          const target = e.target as HTMLImageElement;
                          target.src = `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`;
                        }}
                      />
                    ) : (
                      <span className="text-white text-lg font-medium font-sans">{site.title[0]}</span>
                    )}
                  </div>
                  <span className="text-sm text-neutral-400 text-center truncate w-full group-hover:text-neutral-200 font-sans">
                    {site.title}
                  </span>
                </a>
              ))}
              
              {/* Fill empty slots in the row */}
              {Array.from({ length: Math.max(0, 10 - row.length) }).map((_, index) => (
                <div key={`empty-${index}`} className="w-12 h-12" />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MostVisited; 