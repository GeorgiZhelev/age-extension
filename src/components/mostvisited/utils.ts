import browser from 'webextension-polyfill';
import { Site, PinnedSite, MostVisitedData } from './types';

const STORAGE_KEY = 'mostVisited';
const GRID_SIZE = 24; // 4x6 grid

export const getColorFromURL = (url: string): string => {
  const colors = [
    'bg-blue-700', 'bg-green-700', 'bg-red-700', 
    'bg-purple-700', 'bg-yellow-700', 'bg-pink-700',
    'bg-indigo-700', 'bg-cyan-700', 'bg-emerald-700'
  ];
  
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash) + url.charCodeAt(i);
    hash |= 0;
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return '';
  }
};

export const getDuckDuckGoFavicon = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `https://icons.duckduckgo.com/ip3/${urlObj.hostname}.ico`;
  } catch {
    return '';
  }
};

export const loadStoredData = async (): Promise<MostVisitedData> => {
  try {
    const result = await browser.storage.sync.get(STORAGE_KEY);
    const data = result[STORAGE_KEY] as MostVisitedData | undefined;
    return data || { pinnedSites: [], customSites: [] };
  } catch (error) {
    console.error('Error loading stored data:', error);
    return { pinnedSites: [], customSites: [] };
  }
};

export const saveStoredData = async (data: MostVisitedData): Promise<void> => {
  try {
    await browser.storage.sync.set({ [STORAGE_KEY]: data });
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const mergeSitesWithPinned = (
  topSites: Site[], 
  pinnedSites: PinnedSite[], 
  customSites: Site[]
): Site[] => {
  const result: Site[] = new Array(GRID_SIZE).fill(null);
  
  // Place pinned sites at their specified indices
  pinnedSites.forEach(site => {
    if (site.pinnedIndex < GRID_SIZE) {
      result[site.pinnedIndex] = site;
    }
  });
  
  // Get URLs of pinned sites to avoid duplicates
  const pinnedUrls = new Set(pinnedSites.map(site => site.url));
  
  // Combine custom sites and top sites, removing duplicates
  const customUrls = new Set(customSites.map(site => site.url));
  const availableSites = [
    ...customSites,
    ...topSites.filter(site => !customUrls.has(site.url) && !pinnedUrls.has(site.url))
  ];
  
  // Fill empty slots with available sites
  let siteIndex = 0;
  for (let i = 0; i < GRID_SIZE && siteIndex < availableSites.length; i++) {
    if (!result[i]) {
      result[i] = availableSites[siteIndex++];
    }
  }
  
  // Filter out null values for the final result
  return result.filter(Boolean);
};