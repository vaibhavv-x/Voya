const Trip = require('../models/Trip');
const User = require('../models/User');
const extraTrips = require('./extraTrips');

const TRIPS = [
  {
    title: 'Bali Soul Journey', slug: 'bali-soul-journey',
    tagline: 'Rituals, rice terraces and raw beauty',
    description: 'Seven days of the real Bali. Hidden temples at dawn, rice terrace walks in mist, healing ceremonies, and a surf lesson at an empty break.',
    destination: 'Ubud and Canggu, Bali', country: 'Indonesia', continent: 'Asia',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'],
    pricePerPerson: 42999, originalPrice: 52000, currency: 'INR',
    days: 7, nights: 6, category: 'Cultural', difficulty: 'Easy',
    tags: ['beach', 'temples', 'surfing', 'wellness'],
    maxGroupSize: 14, minGroupSize: 2, departureFrom: 'Mumbai or Delhi',
    bestTimeToVisit: 'April to October', climate: 'Tropical 26-32C',
    language: 'Balinese, Indonesian', currency_local: 'IDR', visaRequired: false,
    highlights: ['Tegallalang rice terraces at 6am', 'Tirta Empul temple blessing', 'Balinese cooking class', 'Beginner surf lesson', 'Tanah Lot sunset'],
    included: ['Villa accommodation', 'Daily breakfast', 'Temple entry fees', 'Cooking class', 'Surf lesson', 'Airport transfers'],
    excluded: ['International flights', 'Visa on arrival USD 35', 'Most dinners', 'Travel insurance'],
    itinerary: [
      { day: 1, title: 'Arrival in Ubud', description: 'Arrive at Ngurah Rai, transfer to Ubud jungle villa. Evening welcome dinner in a rice field restaurant.', activities: ['Airport pickup', 'Villa check-in', 'Welcome dinner'], meals: { breakfast: false, lunch: false, dinner: true }, accommodation: 'Komaneka at Bisma, Ubud' },
      { day: 2, title: 'Temples and Rice Terraces', description: 'Up at 5:30am for Tegallalang before the tourists arrive. Monkey Forest, Ubud Palace, Ubud market.', activities: ['Tegallalang sunrise', 'Sacred Monkey Forest', 'Ubud Palace and market'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Komaneka at Bisma, Ubud' },
      { day: 3, title: 'Cooking Class and Temple Ceremony', description: 'Morning cooking class with a local grandmother. Afternoon Tirta Empul blessing ceremony.', activities: ['Balinese cooking class', 'Tirta Empul ceremony', 'Goa Gajah cave'], meals: { breakfast: true, lunch: true, dinner: false }, accommodation: 'Komaneka at Bisma, Ubud' },
      { day: 4, title: 'Mount Batur Sunrise', description: 'Optional 3am volcano trek. Watch sunrise from the crater rim above the clouds.', activities: ['Mount Batur hike optional', 'Coffee plantation', 'Kintamani views'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Komaneka at Bisma, Ubud' },
      { day: 5, title: 'Transfer to Canggu', description: 'Check out of Ubud. Afternoon beginner surf lesson. Tanah Lot sunset.', activities: ['Transfer to Canggu', 'Beginner surf lesson', 'Tanah Lot sunset'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Dojo Bali Surf Camp' },
      { day: 6, title: 'Canggu Free Day', description: 'Full free day. Yoga, surf, spa, or simply do nothing by the pool. Farewell dinner.', activities: ['Free day', 'Farewell group dinner'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Dojo Bali Surf Camp' },
      { day: 7, title: 'Departure', description: 'Transfer to Ngurah Rai airport.', activities: ['Airport transfer'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: '' },
    ],
    faqs: [
      { question: 'Do I need to know how to surf?', answer: 'Not at all. The lesson is designed for complete beginners.' },
      { question: 'Is the temple ceremony for non-Hindus?', answer: 'Yes, the Balinese are incredibly welcoming to all faiths.' },
    ],
    accommodationKind: 'Villa and Surf Camp',
    accommodationName: 'Komaneka at Bisma Ubud plus Dojo Bali Surf Camp',
    accommodationDetails: 'Private pool villa in Ubud, surf camp in Canggu.',
    transportTo: 'Fly to Ngurah Rai International Airport Bali',
    transportLocal: 'Private AC van throughout',
    location: { lat: -8.5069, lng: 115.2625 },
    isFeatured: true, rating: 4.8, reviewCount: 143,
  },
  {
    title: 'Ladakh High Altitude Circuit', slug: 'ladakh-high-altitude-circuit',
    tagline: 'Where silence is the loudest sound',
    description: 'Nine days through the roof of the world. Nubra Valley moonscapes, the azure stillness of Pangong Tso, and passes that scrape the sky at 18,000 feet.',
    destination: 'Leh, Ladakh', country: 'India', continent: 'Asia',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    pricePerPerson: 28999, originalPrice: 34999, currency: 'INR',
    days: 9, nights: 8, category: 'Adventure', difficulty: 'Challenging',
    tags: ['mountains', 'high altitude', 'offbeat', 'camping'],
    maxGroupSize: 12, minGroupSize: 4, departureFrom: 'Delhi',
    bestTimeToVisit: 'June to September', climate: 'Cold desert 15-25C days 0C nights',
    language: 'Ladakhi, Hindi', currency_local: 'INR', visaRequired: false,
    highlights: ['Khardung La at 18380 ft', 'Nubra Valley camel safari', 'Pangong Tso sunrise', 'Thiksey Monastery', 'Magnetic Hill'],
    included: ['All accommodation', 'Breakfast and dinner daily', 'Inner Line Permits', 'Local guide', 'Oxygen cylinders'],
    excluded: ['Flights to Leh', 'Travel insurance', 'Lunch', 'Personal gear'],
    itinerary: [
      { day: 1, title: 'Arrival in Leh', description: 'Land at 3500m. Complete rest is mandatory. Evening orientation walk.', activities: ['Airport pickup', 'Leh Palace overview', 'Group briefing'], meals: { breakfast: false, lunch: false, dinner: true }, accommodation: 'The Zen Guesthouse, Leh' },
      { day: 2, title: 'Leh Acclimatisation', description: 'Light exploration. Shanti Stupa, Magnetic Hill, Indus Zanskar confluence.', activities: ['Shanti Stupa', 'Magnetic Hill', 'Indus Zanskar Confluence'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'The Zen Guesthouse, Leh' },
      { day: 3, title: 'Leh to Nubra via Khardung La', description: 'Cross Khardung La at 18380 ft. Descend into Nubra Valley. Camel safari at Hunder dunes.', activities: ['Khardung La pass', 'Diskit Monastery', 'Camel safari at Hunder'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Nubra Organic Retreat' },
      { day: 4, title: 'Turtuk Village', description: 'Drive to Turtuk, the last Indian village before Pakistan. Apricot orchards and warm locals.', activities: ['Turtuk village walk', 'Apricot orchards', 'Local family visit'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Nubra Organic Retreat' },
      { day: 5, title: 'Nubra to Pangong Tso', description: 'Beautiful Shyok river route. Arrive at Pangong and watch the lake shift colours at sunset.', activities: ['Shyok Valley drive', 'Pangong Tso arrival', 'Sunset by the lake'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Pangong Himalayan Camp' },
      { day: 6, title: 'Pangong Sunrise', description: 'Wake at 5am for sunrise. The lake changes from turquoise to cobalt to ink blue.', activities: ['Sunrise photography', 'South bank walk', 'Free afternoon'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Pangong Himalayan Camp' },
      { day: 7, title: 'Pangong to Leh via Chang La', description: 'Return over Chang La at 17690 ft. Visit Druk White Lotus School.', activities: ['Chang La pass', 'Druk White Lotus School', 'Thiksey Monastery'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'The Zen Guesthouse, Leh' },
      { day: 8, title: 'Hemis and Leh', description: 'Hemis Monastery. Afternoon free for shopping in Leh Bazaar.', activities: ['Hemis Monastery', 'Leh Bazaar shopping', 'Farewell dinner'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'The Zen Guesthouse, Leh' },
      { day: 9, title: 'Departure', description: 'Early morning transfer to Leh airport.', activities: ['Airport transfer'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: '' },
    ],
    faqs: [
      { question: 'Do I need biking experience?', answer: 'Not mandatory. Most of the circuit uses SUVs.' },
      { question: 'What about altitude sickness?', answer: 'We build in a full acclimatisation day and carry oxygen cylinders.' },
    ],
    accommodationKind: 'Guesthouse and Camp',
    accommodationName: 'Local guesthouses and Himalayan tented camps',
    accommodationDetails: 'Warm comfortable local stays. Authentic not luxurious.',
    transportTo: 'Fly to Leh Kushok Bakula Rimpochee Airport',
    transportLocal: 'Toyota Innova SUV throughout',
    location: { lat: 34.1526, lng: 77.5771 },
    isFeatured: true, rating: 4.9, reviewCount: 87,
  },
  {
    title: 'Maldives Stillwater Retreat', slug: 'maldives-stillwater-retreat',
    tagline: 'Glass water, endless sky, pure stillness',
    description: 'Five days in a place that makes you question whether you have arrived somewhere better. Overwater villa, house reef with turtles, and a private sandbank dinner under stars.',
    destination: 'North Male Atoll', country: 'Maldives', continent: 'Asia',
    coverImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800'],
    pricePerPerson: 74999, originalPrice: 90000, currency: 'INR',
    days: 5, nights: 4, category: 'Luxury', difficulty: 'Easy',
    tags: ['overwater', 'snorkelling', 'honeymoon', 'diving', 'luxury', 'couples'],
    maxGroupSize: 8, minGroupSize: 2, departureFrom: 'Mumbai or Delhi',
    bestTimeToVisit: 'November to April', climate: 'Tropical 28-32C year round',
    language: 'Dhivehi, English', currency_local: 'MVR', visaRequired: false,
    highlights: ['Overwater villa with lagoon access', 'Private sandbank dinner', 'Snorkelling with turtles', 'Dolphin cruise', 'Discover Scuba diving'],
    included: ['Overwater villa 4 nights', 'All meals', 'Seaplane transfers', 'Snorkelling gear', 'Discover Scuba', 'Dolphin cruise', 'Sandbank dinner'],
    excluded: ['International flights', 'Alcohol', 'Spa treatments', 'Travel insurance'],
    itinerary: [
      { day: 1, title: 'Arrival and Seaplane', description: 'Land in Male, board seaplane for 35 minute flight over atolls. Arrive to overwater villa.', activities: ['Seaplane transfer', 'Villa check-in', 'Sunset from deck'], meals: { breakfast: false, lunch: false, dinner: true }, accommodation: 'Overwater Villa, Hurawalhi Island Resort' },
      { day: 2, title: 'Reef Snorkelling and Scuba', description: 'Morning guided snorkel on house reef with turtles. Afternoon Discover Scuba session.', activities: ['House reef snorkel', 'Discover Scuba diving', 'Sunset kayaking'], meals: { breakfast: true, lunch: true, dinner: true }, accommodation: 'Overwater Villa' },
      { day: 3, title: 'Dolphin Cruise and Sandbank Dinner', description: 'Afternoon dolphin cruise. Private boat to deserted sandbank for sunset dinner.', activities: ['Dolphin cruise', 'Private sandbank dinner'], meals: { breakfast: true, lunch: true, dinner: true }, accommodation: 'Overwater Villa' },
      { day: 4, title: 'Pure Free Day', description: 'Nothing on the agenda. Paddleboard, hammock over water, underwater restaurant.', activities: ['Paddleboarding', 'Underwater restaurant optional', 'Stargazing from deck'], meals: { breakfast: true, lunch: true, dinner: true }, accommodation: 'Overwater Villa' },
      { day: 5, title: 'Departure', description: 'Final breakfast on your deck. Seaplane back to Male airport.', activities: ['Last swim', 'Seaplane to Male airport'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: '' },
    ],
    faqs: [
      { question: 'Is this suitable for non-swimmers?', answer: 'Yes. Snorkelling and scuba are optional extras.' },
      { question: 'Good for honeymoons?', answer: 'It is essentially designed for them.' },
    ],
    accommodationKind: 'Overwater Villa',
    accommodationName: 'Hurawalhi Island Resort',
    accommodationDetails: '5 star overwater bungalow with glass floor and direct lagoon ladder.',
    transportTo: 'Fly to Velana International Airport Male',
    transportLocal: 'Seaplane transfer to resort',
    location: { lat: 5.6841, lng: 73.3822 },
    isFeatured: true, rating: 5.0, reviewCount: 62,
  },
  {
    title: 'Kyoto and Tokyo Cultural Immersion', slug: 'kyoto-tokyo-cultural-immersion',
    tagline: 'Time bends here. Let it.',
    description: 'Eight days across Japan two great cities. Tea ceremonies, bamboo forest walks, ramen that ruins all other ramen, bullet trains, and a country where everything just works.',
    destination: 'Kyoto and Tokyo', country: 'Japan', continent: 'Asia',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'],
    pricePerPerson: 89999, originalPrice: 105000, currency: 'INR',
    days: 8, nights: 7, category: 'Cultural', difficulty: 'Easy',
    tags: ['temples', 'food', 'bullet train', 'zen', 'tea ceremony', 'cherry blossom'],
    maxGroupSize: 10, minGroupSize: 2, departureFrom: 'Mumbai or Delhi',
    bestTimeToVisit: 'March April cherry blossom or October November autumn',
    climate: 'Temperate spring 10-20C autumn 12-22C',
    language: 'Japanese', currency_local: 'JPY',
    visaRequired: true, visaInfo: 'Tourist visa required for Indian passport holders. Processing 5-7 working days. We assist with documentation.',
    highlights: ['Fushimi Inari 10000 torii gates at dawn', 'Private tea ceremony', 'Arashiyama bamboo grove', 'Shibuya crossing at night', 'Shinkansen bullet train at 320kmh'],
    included: ['7 nights accommodation', 'Daily breakfast plus 2 group dinners', 'JR Pass 7 day', 'Private tea ceremony', 'All guided tours', 'Airport transfers'],
    excluded: ['International flights', 'Japan tourist visa', 'Most lunches and dinners', 'Travel insurance'],
    itinerary: [
      { day: 1, title: 'Arrive Tokyo', description: 'Land at Narita or Haneda. Check into Shinjuku hotel. Evening walk through neon Tokyo.', activities: ['Airport transfer', 'Hotel check-in', 'Shinjuku evening walk'], meals: { breakfast: false, lunch: false, dinner: false }, accommodation: 'Keio Plaza Hotel, Shinjuku' },
      { day: 2, title: 'Tokyo Deep Dive', description: 'Senso-ji at 6am before the crowds. Harajuku. Meiji Jingu shrine. Shibuya crossing at dusk.', activities: ['Senso-ji at dawn', 'Harajuku', 'Meiji Jingu shrine', 'Shibuya crossing'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Keio Plaza Hotel' },
      { day: 3, title: 'Tsukiji Akihabara and TeamLab', description: 'Tsukiji outer market breakfast sushi. Akihabara electronics. TeamLab Planets digital art.', activities: ['Tsukiji market', 'Akihabara', 'TeamLab Planets'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Keio Plaza Hotel' },
      { day: 4, title: 'Shinkansen to Kyoto', description: 'Nozomi bullet train 2h15m at 320kmh. Check into ryokan. Nishiki Market.', activities: ['Shinkansen to Kyoto', 'Ryokan check-in', 'Nishiki Market walk'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Tawaraya Ryokan, Kyoto' },
      { day: 5, title: 'Fushimi Inari and Tea Ceremony', description: '5:30am at Fushimi Inari alone in the mist. Private tea ceremony with a master.', activities: ['Fushimi Inari dawn walk', 'Private tea ceremony', 'Gion district'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Tawaraya Ryokan' },
      { day: 6, title: 'Arashiyama and Nara', description: 'Arashiyama bamboo grove. Bullet to Nara for the Great Buddha and deer who steal your snacks.', activities: ['Arashiyama bamboo grove', 'Nara deer park', 'Todai-ji Buddha'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Tawaraya Ryokan' },
      { day: 7, title: 'Kyoto Free Day and Farewell', description: 'Philosophers Path. Kinkaku-ji Golden Pavilion. Kaiseki farewell dinner.', activities: ['Kinkaku-ji', 'Philosophers Path', 'Kaiseki farewell dinner'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Tawaraya Ryokan' },
      { day: 8, title: 'Return and Departure', description: 'Shinkansen back to Tokyo for onward flight.', activities: ['Shinkansen to Tokyo', 'Airport transfer'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: '' },
    ],
    faqs: [
      { question: 'How hard is the Japan visa?', answer: 'Straightforward with correct documents. We provide a full checklist and support.' },
      { question: 'Is Japan expensive on the ground?', answer: 'Less than people think. Convenience store meals are excellent and very affordable.' },
    ],
    accommodationKind: 'Ryokan and City Hotel',
    accommodationName: 'Tawaraya Ryokan Kyoto and Keio Plaza Hotel Tokyo',
    accommodationDetails: 'Traditional futon inn in Kyoto, modern comfort in Tokyo.',
    transportTo: 'Fly to Narita or Haneda Airport Tokyo',
    transportLocal: 'JR Pass bullet trains plus city metro',
    location: { lat: 35.0116, lng: 135.7681 },
    isFeatured: true, rating: 4.9, reviewCount: 94,
  },
  {
    title: 'Santorini and Athens Escape', slug: 'santorini-athens-escape',
    tagline: 'Caldera sunsets that rewrite you',
    description: 'Six days across ancient Athens and the impossible blue of Santorini. Sunsets over the caldera, wine from volcanic vineyards, and a private catamaran sail past clifftops.',
    destination: 'Athens and Santorini', country: 'Greece', continent: 'Europe',
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'],
    pricePerPerson: 95999, originalPrice: 115000, currency: 'INR',
    days: 6, nights: 5, category: 'Luxury', difficulty: 'Easy',
    tags: ['greece', 'mediterranean', 'honeymoon', 'sailing', 'wine', 'sunset', 'history'],
    maxGroupSize: 10, minGroupSize: 2, departureFrom: 'Mumbai or Delhi',
    bestTimeToVisit: 'May June or September October',
    climate: 'Mediterranean 24-30C dry sunny',
    language: 'Greek English widely spoken', currency_local: 'Euro',
    visaRequired: true, visaInfo: 'Schengen visa required. Apply at Greek Consulate. Processing 10-15 days. We assist with documentation.',
    highlights: ['Oia sunset at caldera castle', 'Private catamaran sail with dinner', 'Acropolis at sunrise', 'Volcanic black sand beach', 'Santo Wines tasting on caldera cliff'],
    included: ['5 nights including cave suite in Oia', 'Daily breakfast', 'Private catamaran cruise with dinner', 'Acropolis guided tour', 'Wine tasting', 'All inter-Greece flights and ferry'],
    excluded: ['International flights to Athens', 'Schengen visa', 'Most lunches and dinners', 'Travel insurance'],
    itinerary: [
      { day: 1, title: 'Arrive Athens', description: 'Arrive at Athens airport. Transfer to Monastiraki boutique hotel at the foot of the Acropolis.', activities: ['Airport transfer', 'Hotel check-in', 'Plaka evening walk'], meals: { breakfast: false, lunch: false, dinner: false }, accommodation: 'The Zillers Boutique Hotel, Athens' },
      { day: 2, title: 'Acropolis and Flight to Santorini', description: '7am Acropolis visit before the tour buses arrive. Ancient Agora. Evening flight to Santorini.', activities: ['Acropolis guided tour', 'Ancient Agora', 'Flight to Santorini'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Mystique Cave Suite, Oia, Santorini' },
      { day: 3, title: 'Oia Exploration', description: 'Check into cave suite carved into the caldera cliff. Walk Oia village. Castle sunset.', activities: ['Cave suite check-in', 'Oia village walk', 'Oia castle sunset'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Mystique Cave Suite, Oia' },
      { day: 4, title: 'Catamaran Sail and Sandbank Dinner', description: 'Full day private catamaran. Volcanic hot springs, red beach swim. Sunset dinner on board.', activities: ['Catamaran sail', 'Volcanic hot springs', 'Red Beach swim', 'Sunset dinner at sea'], meals: { breakfast: true, lunch: true, dinner: true }, accommodation: 'Mystique Cave Suite, Oia' },
      { day: 5, title: 'Fira to Oia Walk and Wine Tasting', description: '12km caldera cliff walk from Fira to Oia. Afternoon wine tasting at Santo Wines.', activities: ['Fira to Oia cliff walk', 'Santo Wines tasting', 'Perissa black beach'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Mystique Cave Suite, Oia' },
      { day: 6, title: 'Departure', description: 'Final breakfast on caldera terrace. Ferry or flight to Athens for return.', activities: ['Caldera breakfast', 'Ferry to Athens airport', 'Departure'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: '' },
    ],
    faqs: [
      { question: 'When is best for Oia sunset?', answer: 'April to October. Arrive at the castle 90 minutes early in peak season.' },
      { question: 'Can we add other Greek islands?', answer: 'Yes. Mykonos is a 2-hour ferry from Santorini. We can extend the trip.' },
    ],
    accommodationKind: 'Cave Suite and Boutique Hotel',
    accommodationName: 'Mystique a Luxury Collection Hotel Oia and The Zillers Athens',
    accommodationDetails: 'Cliff-carved cave suite in Oia with private plunge pool and caldera view.',
    transportTo: 'Fly to Athens International Airport',
    transportLocal: 'Internal Greek flight plus ferry plus private transfers',
    location: { lat: 36.4618, lng: 25.3753 },
    isFeatured: true, rating: 4.8, reviewCount: 71,
  },
  {
    title: 'Rajasthan Royal Heritage Circuit', slug: 'rajasthan-royal-heritage-circuit',
    tagline: 'The land that time curated for you',
    description: 'Eight days across Rajasthan. Jaipur pink walls, Jodhpur blue city, Jaisalmer desert camp under stars, and Udaipur lake palaces. India at its most theatrical.',
    destination: 'Jaipur Jodhpur Jaisalmer and Udaipur', country: 'India', continent: 'Asia',
    coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80',
    images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'],
    pricePerPerson: 34999, originalPrice: 42000, currency: 'INR',
    days: 8, nights: 7, category: 'Cultural', difficulty: 'Easy',
    tags: ['forts', 'palaces', 'desert', 'heritage', 'rajasthani food', 'camels'],
    maxGroupSize: 14, minGroupSize: 4, departureFrom: 'Delhi',
    bestTimeToVisit: 'October to March', climate: 'Semi-arid Oct-Feb 15-28C very pleasant',
    language: 'Rajasthani, Hindi', currency_local: 'INR', visaRequired: false,
    highlights: ['Amber Fort at dawn', 'Desert camp under stars at Sam dunes', 'Mehrangarh Fort sunrise', 'Lake Pichola boat ride', 'Camel safari in the dunes'],
    included: ['All accommodation heritage havelis and desert camp', 'Daily breakfast plus 3 group dinners', 'All fort and palace entry fees', 'AC private vehicle', 'Camel safari', 'Local guide'],
    excluded: ['Flights Delhi to Jaipur and Udaipur to Delhi', 'Elephant ride optional extra', 'Lunch', 'Shopping budget varies wildly'],
    itinerary: [
      { day: 1, title: 'Arrive Jaipur', description: 'Fly into Jaipur. Check into heritage haveli. Evening in the pink city with street food tour.', activities: ['Jaipur arrival', 'Hawa Mahal', 'Old city walk', 'Street food tour'], meals: { breakfast: false, lunch: false, dinner: false }, accommodation: 'Samode Haveli, Jaipur' },
      { day: 2, title: 'Jaipur Forts and Palaces', description: 'Dawn at Amber Fort. City Palace. Jantar Mantar UNESCO observatory. Jal Mahal water palace.', activities: ['Amber Fort at dawn', 'City Palace', 'Jantar Mantar', 'Jal Mahal'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Samode Haveli, Jaipur' },
      { day: 3, title: 'Jaipur to Jaisalmer', description: 'Long drive or train to Jaisalmer the golden city. Check into fort hotel.', activities: ['Travel day', 'Jaisalmer Fort arrival', 'Patwon ki Haveli'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'Suryagarh Palace, Jaisalmer' },
      { day: 4, title: 'Jaisalmer and Sam Sand Dunes', description: 'Morning in Jaisalmer Fort. Afternoon camel safari to desert camp. Dinner under the stars.', activities: ['Jaisalmer Fort', 'Gadisar Lake', 'Camel safari at Sam', 'Desert camp dinner under stars'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Royal Desert Camp, Sam Sand Dunes' },
      { day: 5, title: 'Desert to Jodhpur Blue City', description: 'Sunrise in the dunes. Drive to Jodhpur. Evening walk under Mehrangarh.', activities: ['Sunrise at dunes', 'Travel to Jodhpur', 'Blue city walk'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'RAAS Jodhpur' },
      { day: 6, title: 'Jodhpur Mehrangarh', description: 'Mehrangarh Fort sunrise - the most dramatic fort in India. Umaid Bhawan Palace. Sardar Market.', activities: ['Mehrangarh Fort sunrise', 'Umaid Bhawan Palace', 'Sardar Market'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: 'RAAS Jodhpur' },
      { day: 7, title: 'Jodhpur to Udaipur', description: 'Drive through Aravalli hills. Evening boat ride on Lake Pichola. Farewell dinner.', activities: ['Jodhpur Udaipur drive', 'Lake Pichola sunset boat', 'Farewell dinner'], meals: { breakfast: true, lunch: false, dinner: true }, accommodation: 'Taj Lake Palace, Udaipur' },
      { day: 8, title: 'Udaipur and Departure', description: 'Morning stroll through old city. City Palace museum. Airport transfer.', activities: ['Udaipur old city walk', 'City Palace Museum', 'Airport transfer'], meals: { breakfast: true, lunch: false, dinner: false }, accommodation: '' },
    ],
    faqs: [
      { question: 'How hot is Rajasthan?', answer: 'In October to March it is 15 to 28C and perfect. Avoid May to August when it exceeds 45C.' },
      { question: 'Is it safe?', answer: 'Rajasthan is one of the safest and most hospitable tourist regions in India.' },
    ],
    accommodationKind: 'Heritage Havelis and Palaces',
    accommodationName: 'Samode Haveli, Suryagarh, RAAS Jodhpur, Taj Lake Palace',
    accommodationDetails: 'Every hotel is a heritage property. You sleep inside the history.',
    transportTo: 'Fly Delhi to Jaipur, return Udaipur to Delhi',
    transportLocal: 'Private AC vehicle throughout',
    location: { lat: 26.9124, lng: 75.7873 },
    isFeatured: false, rating: 4.7, reviewCount: 112,
  },
];

// Generate 5 monthly future departures for a trip.
// `seed` (derived per-trip) spreads the day-of-month around so departures
// don't all land on the same date.
function makeDepartures(maxGroupSize, seed = 0) {
  const now = new Date();
  const seatsTotal = maxGroupSize || 14;
  // A varied set of days; rotate the starting point by the trip's seed so
  // different trips get different dates, and each departure differs too.
  const dayCycle = [4, 9, 14, 18, 23, 27, 7, 20, 11, 25];
  return Array.from({ length: 5 }, (_, i) => {
    const day = dayCycle[(seed + i * 2) % dayCycle.length];
    return {
      date: new Date(now.getFullYear(), now.getMonth() + i + 1, day),
      seatsTotal,
      seatsBooked: i === 0 ? Math.max(0, seatsTotal - 3) : (i === 1 ? Math.floor(seatsTotal / 2) : 0),
    };
  });
}

// Deterministic small seed from a string (trip title/slug)
function seedFrom(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 10;
}

module.exports = async (req, res) => {
  try {
    await Trip.deleteMany({});
    const withDepartures = [...TRIPS, ...extraTrips].map(t => ({ ...t, departures: makeDepartures(t.maxGroupSize, seedFrom(t.slug || t.title)) }));
    const trips = await Trip.insertMany(withDepartures);

    const adminExists = await User.findOne({ email: 'admin@voya.travel' });
    if (!adminExists) {
      await User.create({
        name: 'Voya Admin',
        email: 'admin@voya.travel',
        password: 'voya_admin_2026',
        role: 'admin',
        isVerified: true,
      });
    }

    res.json({
      success: true,
      message: 'Seeded ' + trips.length + ' trips. Admin: admin@voya.travel / voya_admin_2026',
      trips: trips.map(t => ({ slug: t.slug, title: t.title })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
