import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import EditSiteModal from './mostvisited/EditSiteModal';
import { Site, PinnedSite, EditingSite } from './mostvisited/types';
import { 
  getColorFromURL, 
  getFaviconUrl, 
  getDuckDuckGoFavicon,
  loadStoredData,
  saveStoredData,
  mergeSitesWithPinned
} from './mostvisited/utils';

const MostVisited: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [pinnedSites, setPinnedSites] = useState<PinnedSite[]>([]);
  const [customSites, setCustomSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSite, setEditingSite] = useState<EditingSite | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load stored data (pinned and custom sites)
      const storedData = await loadStoredData();
      setPinnedSites(storedData.pinnedSites || []);
      setCustomSites(storedData.customSites || []);
      
      // Load top sites from browser
      const topSites = await browser.topSites.get();
      const processedTopSites: Site[] = topSites.map(site => ({
        url: site.url,
        title: site.title || new URL(site.url).hostname,
        favicon: getFaviconUrl(site.url)
      }));
      
      // Merge all sites
      const mergedSites = mergeSitesWithPinned(
        processedTopSites,
        storedData.pinnedSites || [],
        storedData.customSites || []
      );
      
      setSites(mergedSites);
    } catch (error) {
      console.error('Error loading sites:', error);
      // Fallback demo sites
      setSites([
        { url: 'https://www.github.com', title: 'GitHub', favicon: 'https://github.com/favicon.ico' },
        { url: 'https://www.google.com', title: 'Google', favicon: 'https://www.google.com/favicon.ico' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePin = async (index: number) => {
    const site = sites[index];
    if (!site) return;
    
    const newPinnedSite: PinnedSite = {
      ...site,
      isPinned: true,
      pinnedIndex: index
    };
    
    const updatedPinnedSites = [...pinnedSites, newPinnedSite];
    setPinnedSites(updatedPinnedSites);
    
    await saveStoredData({
      pinnedSites: updatedPinnedSites,
      customSites
    });
    
    await loadData();
  };

  const handleUnpin = async (index: number) => {
    const site = sites[index];
    if (!site || !site.isPinned) return;
    
    const updatedPinnedSites = pinnedSites.filter(
      pinned => pinned.pinnedIndex !== index
    );
    setPinnedSites(updatedPinnedSites);
    
    await saveStoredData({
      pinnedSites: updatedPinnedSites,
      customSites
    });
    
    await loadData();
  };

  const handleEdit = (index: number) => {
    const site = sites[index];
    if (site) {
      setEditingSite({ index, site });
    }
  };

  const handleSaveEdit = async (updatedSite: Site) => {
    if (!editingSite) return;
    
    const { index } = editingSite;
    const originalSite = sites[index];
    
    // If it's a pinned site, update in pinned sites
    if (originalSite?.isPinned) {
      const updatedPinnedSites = pinnedSites.map(pinned => 
        pinned.pinnedIndex === index 
          ? { ...updatedSite, isPinned: true, pinnedIndex: index } as PinnedSite
          : pinned
      );
      setPinnedSites(updatedPinnedSites);
      await saveStoredData({ pinnedSites: updatedPinnedSites, customSites });
    } else {
      // Otherwise, add/update in custom sites
      const existingCustomIndex = customSites.findIndex(s => s.url === originalSite?.url);
      let updatedCustomSites: Site[];
      
      if (existingCustomIndex >= 0) {
        updatedCustomSites = customSites.map((s, i) => 
          i === existingCustomIndex ? updatedSite : s
        );
      } else {
        updatedCustomSites = [...customSites, updatedSite];
      }
      
      setCustomSites(updatedCustomSites);
      await saveStoredData({ pinnedSites, customSites: updatedCustomSites });
    }
    
    setEditingSite(null);
    await loadData();
  };

  const handleSaveNew = async (newSite: Site) => {
    const updatedCustomSites = [...customSites, newSite];
    setCustomSites(updatedCustomSites);
    await saveStoredData({ pinnedSites, customSites: updatedCustomSites });
    setIsAddingNew(false);
    await loadData();
  };

  const handleRemove = async () => {
    if (!editingSite) return;
    
    const { index } = editingSite;
    const site = sites[index];
    
    if (site?.isPinned) {
      // Remove from pinned sites
      const updatedPinnedSites = pinnedSites.filter(
        pinned => pinned.pinnedIndex !== index
      );
      setPinnedSites(updatedPinnedSites);
      await saveStoredData({ pinnedSites: updatedPinnedSites, customSites });
    } else {
      // Remove from custom sites
      const updatedCustomSites = customSites.filter(s => s.url !== site?.url);
      setCustomSites(updatedCustomSites);
      await saveStoredData({ pinnedSites, customSites: updatedCustomSites });
    }
    
    setEditingSite(null);
    await loadData();
  };

  // Create 4x6 grid
  const gridSlots = Array(24).fill(null).map((_, index) => sites[index] || null);

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg h-full relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neutral-200 font-sans">Top Sites</h2>
        <button
          onClick={() => setIsAddingNew(true)}
          className="text-neutral-400 hover:text-neutral-200 transition-colors"
          title="Add site"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-3">
          {gridSlots.map((site, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {site ? (
                <a
                  href={site.url}
                  className="flex flex-col items-center p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      handleEdit(index);
                    }
                  }}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${
                    site.favicon ? 'bg-neutral-800' : getColorFromURL(site.url)
                  }`}>
                    {site.favicon ? (
                      <img 
                        src={site.favicon} 
                        alt="" 
                        className="w-8 h-8" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getDuckDuckGoFavicon(site.url);
                        }}
                      />
                    ) : (
                      <span className="text-white text-lg font-medium font-sans">
                        {site.title[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 text-center truncate w-full font-sans">
                    {site.title}
                  </span>
                  
                  {/* Pin indicator (always visible for pinned sites) */}
                  {site.isPinned && (
                    <div className="absolute top-0 right-0 p-1">
                      <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16a1 1 0 11-2 0V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Action buttons on hover */}
                  {hoveredIndex === index && (
                    <>
                      {/* Pin/Unpin button (top right) */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (site.isPinned) {
                            handleUnpin(index);
                          } else {
                            handlePin(index);
                          }
                        }}
                        className="absolute top-0 right-0 p-1 bg-neutral-700 rounded hover:bg-neutral-600 transition-colors"
                        title={site.isPinned ? "Unpin" : "Pin"}
                      >
                        <svg className="w-3 h-3 text-neutral-300" fill="currentColor" viewBox="0 0 20 20">
                          {site.isPinned ? (
                            <path d="M6 18L18 6M6 6l12 12" />
                          ) : (
                            <path d="M11 3a1 1 0 10-2 0v1.447l-3.954 1.58-1.599-.798a1 1 0 00-.894 1.788l1.233.617-1.738 5.42a1 1 0 00.285 1.05A3.989 3.989 0 005 15a3.989 3.989 0 002.667-1.019 1 1 0 00.285-1.05L6.237 7.582 9 6.477V16a1 1 0 102 0V6.477l2.763 1.105-1.715 5.349a1 1 0 00.285 1.05A3.989 3.989 0 0015 15a3.989 3.989 0 002.667-1.019 1 1 0 00.285-1.05l-1.738-5.42 1.233-.616a1 1 0 00-.894-1.79l-1.599.8L11 4.323V3z" />
                          )}
                        </svg>
                      </button>
                      
                      {/* Edit button (bottom right) */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(index);
                        }}
                        className="absolute bottom-0 right-0 p-1 bg-neutral-700 rounded hover:bg-neutral-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3 h-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </>
                  )}
                </a>
              ) : (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="w-full h-full flex flex-col items-center justify-center p-2 rounded-lg border-2 border-dashed border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-xs text-neutral-600">Add site</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Edit Modal */}
      <EditSiteModal
        site={editingSite?.site || null}
        isOpen={!!editingSite}
        onClose={() => setEditingSite(null)}
        onSave={handleSaveEdit}
        onRemove={handleRemove}
      />
      
      {/* Add New Modal */}
      <EditSiteModal
        site={null}
        isOpen={isAddingNew}
        onClose={() => setIsAddingNew(false)}
        onSave={handleSaveNew}
      />
    </div>
  );
};

export default MostVisited;