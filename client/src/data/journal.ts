export interface Article {
  slug: string
  title: string
  excerpt: string
  cover: string
  author: string
  date: string
  readTime: string
  category: string
  content: { heading?: string; text: string }[]
}

const img = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80`

export const ARTICLES: Article[] = [
  {
    slug: 'how-to-pick-your-first-solo-trip',
    title: 'How to Pick Your First Solo Trip',
    excerpt: 'Nervous about travelling alone? Here is our field-tested framework for choosing a first solo destination you will actually love.',
    cover: img('photo-1504829857797-ddff29c27927'),
    author: 'Priya Iyer',
    date: '2026-05-18',
    readTime: '6 min read',
    category: 'Solo Travel',
    content: [
      { text: 'The hardest part of solo travel is not the trip itself — it is deciding to go. Once you have committed, the destination almost picks itself. Almost. Here is how we help first-timers choose.' },
      { heading: 'Start with ease, not adventure', text: 'Your first solo trip is about building confidence, not conquering a mountain. Pick a place with good infrastructure, walkable neighbourhoods, and a strong traveller community. Bali, Sri Lanka, and Georgia are perennial first-timer favourites for exactly this reason.' },
      { heading: 'Follow the food', text: 'A destination where you look forward to every meal is a destination where you will never feel truly alone. Eating well solo is one of travel\'s quiet joys — a bowl of pho in Hanoi, a plate of khachapuri in Tbilisi, a thali in Kerala.' },
      { heading: 'Choose a place with a rhythm', text: 'Somewhere with a natural daily flow — morning markets, afternoon rests, evening strolls — gives structure to solo days. It keeps you moving and makes it easy to fall into step with locals and fellow travellers.' },
      { text: 'When in doubt, join a small-group departure for your first outing. You keep the independence of solo travel with the safety net of a crew — and often make friends you will travel with for years.' },
    ],
  },
  {
    slug: 'the-art-of-slow-travel-in-kerala',
    title: 'The Art of Slow Travel in Kerala',
    excerpt: 'Kerala rewards those who slow down. A love letter to backwaters, tea hills, and the fine art of doing very little.',
    cover: img('photo-1602216056096-3b40cc0c9944'),
    author: 'Arjun Mehta',
    date: '2026-04-30',
    readTime: '5 min read',
    category: 'Destinations',
    content: [
      { text: 'There is a particular kind of stillness you only find drifting through the Kerala backwaters at dawn, when the water is glass and the only sound is a distant temple bell. Kerala is not a place you rush.' },
      { heading: 'Let the houseboat set the pace', text: 'A night on an Alleppey houseboat is the antidote to the modern itinerary. No wifi to check, no queue to join. Just palm-lined canals, a cook making fresh appam, and time to simply watch the world go by.' },
      { heading: 'Tea country teaches patience', text: 'Up in Munnar, the tea estates roll on forever, combed into impossibly neat rows. Walk them slowly. Pick a viewpoint, sit, and let the mist do its thing. The hills are not going anywhere.' },
      { text: 'Slow travel is not laziness — it is attention. Kerala, more than anywhere in India, teaches you to pay it.' },
    ],
  },
  {
    slug: 'packing-light-the-7kg-challenge',
    title: 'Packing Light: The 7kg Carry-On Challenge',
    excerpt: 'Everything you need for a two-week trip in a single carry-on. Yes, really. Our editors put it to the test.',
    cover: img('photo-1528127269322-539801943592'),
    author: 'Rohan Das',
    date: '2026-04-12',
    readTime: '4 min read',
    category: 'Travel Tips',
    content: [
      { text: 'Checked bags are where trips go to slow down — lost luggage, baggage belts, the extra hour at every airport. We challenged ourselves to pack two weeks into 7kg. Here is what survived the cut.' },
      { heading: 'The rule of three', text: 'Three tops, three bottoms, three days between laundry. Everything mixes and matches, everything is a neutral that plays well together. You will re-wear more than you think, and nobody will notice.' },
      { heading: 'Merino is magic', text: 'A good merino tee resists odour for days, dries overnight, and works from a temple visit to a mountain trek. Two of them will carry an entire trip.' },
      { heading: 'Digitise everything', text: 'Tickets, guides, books — all on your phone. The heaviest thing most people pack is paper they never open.' },
      { text: 'Pack for the trip you are taking, not the six hypothetical trips your anxiety is planning. Light bags make for light days.' },
    ],
  },
  {
    slug: 'why-shoulder-season-is-the-best-kept-secret',
    title: 'Why Shoulder Season Is the Best-Kept Secret',
    excerpt: 'Fewer crowds, softer prices, better light. Why the weeks either side of peak season are when destinations are at their best.',
    cover: img('photo-1570077188670-e3a8d69ac5ff'),
    author: 'Sneha Kapoor',
    date: '2026-03-22',
    readTime: '5 min read',
    category: 'Planning',
    content: [
      { text: 'Everyone wants to travel in July. Which is exactly why you should not. The travellers who consistently have the best trips have learned to love the shoulder season — the quiet weeks that bookend the crowds.' },
      { heading: 'The crowds thin, the magic does not', text: 'Santorini in early October has the same impossible blue and caldera sunsets as August — minus half the people and a third off the price. The Instagram shot looks identical. The experience is far better.' },
      { heading: 'Better light for photographers', text: 'Shoulder months often bring dramatic skies — the soft gold of autumn, the crisp clarity after monsoon. Peak summer haze flattens everything; shoulder season gives it depth.' },
      { text: 'Ask us when the shoulder season falls for any destination. It is almost always the answer to "when should I go?"' },
    ],
  },
  {
    slug: 'ladakh-a-first-timers-altitude-guide',
    title: 'Ladakh: A First-Timer\'s Altitude Survival Guide',
    excerpt: 'The roof of the world is closer than you think — if you respect the altitude. Everything we tell first-time Ladakh travellers.',
    cover: img('photo-1506905925346-21bda4d32df4'),
    author: 'Arjun Mehta',
    date: '2026-02-28',
    readTime: '7 min read',
    category: 'Adventure',
    content: [
      { text: 'Ladakh is one of the most breathtaking places on earth — literally. At 3,500 metres and climbing, the altitude is the one thing that separates a magical trip from a miserable one. The good news: it is entirely manageable.' },
      { heading: 'The golden 48 hours', text: 'Do nothing for your first two days in Leh. We mean it. No monasteries, no shopping, no "quick" drives. Rest, hydrate, and let your body build red blood cells. Every itinerary we design begins with this buffer.' },
      { heading: 'Hydrate more than feels reasonable', text: 'Four litres of water a day, minimum. Skip the alcohol for the first few days. The dry mountain air dehydrates you faster than you notice.' },
      { heading: 'Go high, sleep low', text: 'The oldest rule in mountaineering applies to travellers too. You can visit Khardung La at 5,300m — just come back down to sleep. Our routes are built around this principle.' },
      { text: 'Respect the mountain and it rewards you with the clearest skies, the bluest lakes, and the kind of silence you did not know still existed. Ladakh is worth every careful step.' },
    ],
  },
]

export const getArticle = (slug: string) => ARTICLES.find(a => a.slug === slug)
