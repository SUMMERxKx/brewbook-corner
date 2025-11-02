import { Post, User } from '@/types';

export const mockUser: User = {
  _id: 'u1',
  username: 'Samar',
  email: 'samar@brewbook.com',
  side: 'coffee',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samar'
};

export const mockPosts: Post[] = [
  {
    _id: 'p1',
    title: 'Iced Caramel Latte',
    description: 'Cold brew coffee with caramel syrup and milk. Perfect for hot summer days! The secret is using quality cold brew and real caramel.',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    side: 'coffee',
    user: { username: 'Samar', side: 'coffee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Samar' },
    likes: 12,
    likedBy: [],
    comments: [
      { _id: 'c1', user: { username: 'Manik', side: 'tea' }, text: 'Looks amazing! I need to try this.', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'p2',
    title: 'Matcha Latte with Honey',
    description: 'Traditional Japanese matcha whisked to perfection with steamed milk and a touch of honey. A perfect balance of earthy and sweet.',
    imageUrl: 'https://images.unsplash.com/photo-1536013564361-f00c4c1dd4ad?w=800&q=80',
    side: 'tea',
    user: { username: 'Emma', side: 'tea', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    likes: 18,
    likedBy: [],
    comments: [
      { _id: 'c2', user: { username: 'Alex', side: 'coffee' }, text: 'The color is so vibrant!', createdAt: new Date().toISOString() },
      { _id: 'c3', user: { username: 'Sarah', side: 'tea' }, text: 'What brand of matcha do you use?', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    _id: 'p3',
    title: 'Classic Espresso Shot',
    description: 'The foundation of all great coffee drinks. Perfectly pulled espresso with a rich crema on top. 18g in, 36g out, 25-30 seconds.',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80',
    side: 'coffee',
    user: { username: 'Marco', side: 'coffee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marco' },
    likes: 25,
    likedBy: [],
    comments: [],
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    _id: 'p4',
    title: 'Chamomile Lavender Tea',
    description: 'A soothing blend of chamomile and lavender, perfect for evening relaxation. Add a slice of lemon for extra brightness.',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
    side: 'tea',
    user: { username: 'Lily', side: 'tea', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily' },
    likes: 9,
    likedBy: [],
    comments: [
      { _id: 'c4', user: { username: 'Nina', side: 'tea' }, text: 'This helped me sleep so much better!', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 345600000).toISOString()
  },
  {
    _id: 'p5',
    title: 'Dalgona Coffee',
    description: 'Whipped coffee that went viral! Equal parts instant coffee, sugar, and hot water whipped until fluffy, served over milk.',
    imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80',
    side: 'coffee',
    user: { username: 'Mia', side: 'coffee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia' },
    likes: 31,
    likedBy: [],
    comments: [
      { _id: 'c5', user: { username: 'Jake', side: 'coffee' }, text: 'My arm got tired but so worth it!', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date(Date.now() - 432000000).toISOString()
  },
  {
    _id: 'p6',
    title: 'Earl Grey with Bergamot',
    description: 'Classic black tea infused with bergamot oil. Best enjoyed with a splash of milk and a cube of sugar.',
    imageUrl: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=800&q=80',
    side: 'tea',
    user: { username: 'Oliver', side: 'tea', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
    likes: 14,
    likedBy: [],
    comments: [],
    createdAt: new Date(Date.now() - 518400000).toISOString()
  }
];

// Helper to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
