export interface Site {
  url: string;
  title: string;
  favicon?: string;
  isPinned?: boolean;
  pinnedIndex?: number;
}

export interface PinnedSite extends Site {
  isPinned: true;
  pinnedIndex: number;
}

export interface EditingSite {
  index: number;
  site: Site;
}

export interface MostVisitedData {
  pinnedSites: PinnedSite[];
  customSites: Site[];
}