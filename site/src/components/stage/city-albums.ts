export const cityAlbums = [
  { slug: 'guangzhou', name: '广州', title: 'Guangzhou', color: '#b87b91', ink: '#62384c', motif: 'A little warmth, kept on paper.' },
  { slug: 'shenzhen', name: '深圳', title: 'Shenzhen', color: '#a9b5a0', ink: '#40564b', motif: 'Between the city and the sea.' },
  { slug: 'qingdao', name: '青岛', title: 'Qingdao', color: '#a5b6c6', ink: '#40566c', motif: 'Salt in the air. Light in the days.' },
  { slug: 'shanghai', name: '上海', title: 'Shanghai', color: '#c5a3b0', ink: '#694353', motif: 'Little stories around the corner.' },
  { slug: 'beijing', name: '北京', title: 'Beijing', color: '#b9a18a', ink: '#644736', motif: 'Old streets, new memories.' },
] as const;
export type CityAlbumData = typeof cityAlbums[number];
export type CityPhoto = { src: string; alt: string; caption: string; category: 'portrait' | 'scenery' | 'food' };
export const albumCategories = [{ key: 'all', label: '全部 / ALL' }, { key: 'portrait', label: '个人照 / PORTRAITS' }, { key: 'scenery', label: '风景照 / SCENERY' }, { key: 'food', label: '美食照 / FOOD' }] as const;
export function placeholderCityPhotos(city: CityAlbumData): CityPhoto[] {
  return Array.from({ length: 6 }, (_, index) => ({
    src: `/images/life/placeholders/photo-${index + 1}.svg`,
    alt: `${city.name}生活照片占位 ${index + 1}`,
    caption: `${city.name} · ${['A little portrait', 'A view to keep', 'At the table'][index % 3]}`,
    category: (['portrait', 'scenery', 'food'] as const)[index % 3],
  }));
}
