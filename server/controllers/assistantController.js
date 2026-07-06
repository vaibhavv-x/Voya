const Trip = require('../models/Trip');

// Google Gemini — free tier (no billing required). Get a key at:
// https://aistudio.google.com/app/apikey
const GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_HISTORY = 10;

function keyConfigured() {
  const k = process.env.GEMINI_API_KEY;
  return !!k && k !== 'your_gemini_api_key';
}

function buildSystemPrompt(trips) {
  const tripSummaries = trips.map(t =>
    `- ${t.title} (slug: ${t.slug}) | ${t.destination} | ${t.category} | ₹${t.pricePerPerson}/person | ${t.days}D/${t.nights}N | rating ${t.rating} | "${t.tagline}"`
  ).join('\n');

  return `You are the Voya° travel assistant — warm, concise, and knowledgeable about the trips Voya offers.

Here are all the trips currently available on Voya°:
${tripSummaries}

Guidelines:
- When a trip from the list fits the user's ask, recommend it by name with a markdown link in the form [Trip Title](/trips/slug).
- Never invent trips, prices, destinations, or dates that aren't in the list above.
- Keep replies short and conversational — a couple of sentences, not an essay.
- If the user asks something unrelated to travel or Voya's trips, politely steer the conversation back to travel planning.`;
}

// POST /api/assistant/chat
exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!keyConfigured()) {
      return res.status(503).json({
        reply: "The Voya AI assistant isn't configured yet — a free GEMINI_API_KEY needs to be added on the server (get one at aistudio.google.com/app/apikey). In the meantime, browse our journeys or reach out via the Contact page and a human planner will help!",
        notConfigured: true,
      });
    }

    const trips = await Trip.find({ isActive: true })
      .select('title slug destination category pricePerPerson days nights tagline rating');

    // Map prior turns into Gemini's format (user / model roles)
    const contents = history.slice(-MAX_HISTORY).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(h.content || '') }],
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const gemRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt(trips) }] },
        contents,
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 0 }, // disable "thinking" for a fast, cheap chat reply
        },
      }),
    });

    if (!gemRes.ok) {
      const errText = await gemRes.text();
      const friendly = gemRes.status === 429
        ? "I'm getting a lot of questions right now — please try again in a minute!"
        : `AI service error: ${errText.slice(0, 200)}`;
      return res.status(gemRes.status === 429 ? 429 : 502).json({ reply: friendly });
    }

    const data = await gemRes.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const reply = parts.filter(p => p.text).map(p => p.text).join('').trim() ||
      "Sorry, I couldn't come up with a reply — try asking again.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/assistant/design — AI Trip Designer: bespoke itinerary from preferences
exports.design = async (req, res) => {
  try {
    const { destination, days, budget, month, interests, groupSize } = req.body;

    if (!keyConfigured()) {
      return res.status(503).json({ message: 'The AI Trip Designer needs a GEMINI_API_KEY on the server.' });
    }

    const trips = await Trip.find({ isActive: true })
      .select('title slug destination country category pricePerPerson days nights tagline');

    const tripList = trips.map(t =>
      `- ${t.title} (slug: ${t.slug}) | ${t.destination}, ${t.country} | ${t.category} | ₹${t.pricePerPerson}/person | ${t.days}D/${t.nights}N`
    ).join('\n');

    const prompt = `You are Voya°'s expert trip designer. Create a bespoke day-by-day travel itinerary based on the traveller's brief below. Ground it in reality and Voya's actual trips where they fit.

Traveller's brief:
- Destination / region interest: ${destination || 'open to suggestions'}
- Trip length: ${days || 'flexible'} days
- Budget per person: ${budget ? '₹' + budget : 'flexible'}
- Preferred month: ${month || 'flexible'}
- Interests: ${(interests && interests.length) ? interests.join(', ') : 'general'}
- Group size: ${groupSize || 2}

Voya's real trips (recommend the closest match by slug if one fits):
${tripList}

Design a realistic, inspiring itinerary. If one of Voya's real trips is a strong match, set matchedTripSlug to its slug. Keep day descriptions concise (1-2 sentences). Give a realistic per-person estimate in INR.`;

    const schema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
        intro: { type: 'string' },
        matchedTripSlug: { type: 'string' },
        days: {
          type: 'array',
          items: {
            type: 'object',
            properties: { day: { type: 'integer' }, title: { type: 'string' }, description: { type: 'string' } },
            required: ['day', 'title', 'description'],
          },
        },
        estimatePerPerson: { type: 'integer' },
        tips: { type: 'array', items: { type: 'string' } },
      },
      required: ['title', 'intro', 'days', 'estimatePerPerson', 'tips'],
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const gemRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.8,
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      }),
    });

    if (!gemRes.ok) {
      const errText = await gemRes.text();
      const msg = gemRes.status === 429
        ? "Our trip designer is busy right now — please try again in a minute!"
        : `AI service error: ${errText.slice(0, 200)}`;
      return res.status(gemRes.status === 429 ? 429 : 502).json({ message: msg });
    }

    const data = await gemRes.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const raw = parts.filter(p => p.text).map(p => p.text).join('').trim();
    let plan;
    try { plan = JSON.parse(raw); }
    catch { return res.status(502).json({ message: 'The designer returned an unexpected format. Please try again.' }); }

    // Attach the matched trip's real details if present
    if (plan.matchedTripSlug) {
      const match = trips.find(t => t.slug === plan.matchedTripSlug);
      plan.matchedTrip = match ? { slug: match.slug, title: match.title, pricePerPerson: match.pricePerPerson } : null;
    }
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
