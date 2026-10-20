export const cityAlbums = [
  { slug: 'guangzhou', name: 'Guangzhou', title: 'Guangzhou', color: '#28171f', ink: '#f4b8ce', motif: 'A little warmth, kept on paper.' },
  { slug: 'shenzhen', name: 'Shenzhen', title: 'Shenzhen', color: '#191d1e', ink: '#f4b8ce', motif: 'Between the city and the sea.' },
  { slug: 'qingdao', name: 'Qingdao', title: 'Qingdao', color: '#211a26', ink: '#f4b8ce', motif: 'Salt in the air. Light in the days.' },
  { slug: 'shanghai', name: 'Shanghai', title: 'Shanghai', color: '#2c1823', ink: '#f4b8ce', motif: 'Little stories around the corner.' },
  { slug: 'beijing', name: 'Beijing', title: 'Beijing', color: '#241c19', ink: '#f4b8ce', motif: 'Old streets, new memories.' },
] as const;
export type CityAlbumData = Omit<import('@/content/site-content').StudioCity,'photos'>;
export type CityPhoto = { src: string; alt: string; caption: string; category: 'portrait' | 'scenery' | 'food' };
export const albumCategories = [{ key: 'all', label: 'ALL' }, { key: 'portrait', label: 'PORTRAITS' }, { key: 'scenery', label: 'SCENERY' }, { key: 'food', label: 'FOOD' }] as const;
export function placeholderCityPhotos(city: CityAlbumData): CityPhoto[] {
  return Array.from({ length: 6 }, (_, index) => ({
    src: `/images/life/placeholders/photo-${index + 1}.svg`,
    alt: `${city.name} photo placeholder ${index + 1}`,
    caption: `${city.name} · ${['A little portrait', 'A view to keep', 'At the table'][index % 3]}`,
    category: (['portrait', 'scenery', 'food'] as const)[index % 3],
  }));
}
