export const cityAlbums = [
  { slug: 'guangzhou', name: '广州', title: 'Guangzhou', color: '#28171f', ink: '#d0a58f', motif: 'A little warmth, kept on paper.' },
  { slug: 'shenzhen', name: '深圳', title: 'Shenzhen', color: '#191d1e', ink: '#c6a78e', motif: 'Between the city and the sea.' },
  { slug: 'qingdao', name: '青岛', title: 'Qingdao', color: '#211a26', ink: '#c9a1a0', motif: 'Salt in the air. Light in the days.' },
  { slug: 'shanghai', name: '上海', title: 'Shanghai', color: '#2c1823', ink: '#dbab9e', motif: 'Little stories around the corner.' },
  { slug: 'beijing', name: '北京', title: 'Beijing', color: '#241c19', ink: '#cbb096', motif: 'Old streets, new memories.' },
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
