export type Project = {
  id: string;
  name: string;
  category: string;
  text: string;
  image: string;
  liveUrl: string | null;
};

export type ProjectAnalytics = {
  projectId: string;
  opens: number;
  uniqueVisitors: number;
  repeatOpens: number;
  untrackedOpens: number;
  mobileOpens: number;
  mobileUniqueVisitors: number;
  tabletOpens: number;
  tabletUniqueVisitors: number;
  desktopOpens: number;
  desktopUniqueVisitors: number;
  unknownOpens: number;
  unknownUniqueVisitors: number;
};

export type AnalyticsSummary = {
  projects: ProjectAnalytics[];
  niches: { niche: string; opens: number; uniqueVisitors: number }[];
  inquiriesByNiche: Record<string, number>;
  totalInquiries: number;
};

export const projectCategories = [
  "Boutique Fashion",
  "Watches & Accessories",
  "Restaurants & Cafes",
  "Dental & Clinics",
  "Real Estate",
  "Salons & Beauty",
  "Furniture & Decor",
];
