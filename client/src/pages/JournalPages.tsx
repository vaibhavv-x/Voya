import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Clock } from 'lucide-react'
import { ARTICLES, getArticle } from '../data/journal'

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL LISTING
// ─────────────────────────────────────────────────────────────────────────────
export function JournalPage() {
  const CATEGORIES = ['All', ...Array.from(new Set(ARTICLES.map(a => a.category)))]
  const [cat, setCat] = useState('All')
  const filtered = cat === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === cat)
  const [featured, ...rest] = filtered

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <Helmet>
        <title>The Voya° Journal — Travel Stories & Guides</title>
        <meta name="description" content="Field-tested travel guides, destination stories, and planning tips from the Voya° team." />
      </Helmet>

      {/* Header */}
      <div className="bg-ink py-20 px-5 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top,#C8853A,transparent_60%)]" />
        <div className="relative z-10 max-w-3xl">
          <p className="section-eyebrow text-amber/70">The Journal</p>
          <h1 className="font-serif font-normal text-5xl md:text-6xl text-cream leading-tight"
            style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '-2px' }}>
            Stories from <em className="text-fog italic">the road.</em>
          </h1>
          <p className="text-sm text-fog mt-4 max-w-lg">Guides, destination deep-dives, and hard-won travel wisdom from the people who plan your journeys.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-14">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-10">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                cat === c ? 'bg-ink text-cream border-ink' : 'bg-cream text-mist border-black/10 hover:border-ink hover:text-ink'
              }`}>{c}</button>
          ))}
        </div>

        {/* Featured */}
        {featured && (
          <Link to={`/journal/${featured.slug}`} className="group grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-center">
            <div className="rounded-2xl overflow-hidden h-72 lg:h-96">
              <img src={featured.cover} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div>
              <span className="text-xs text-amber font-medium tracking-widest uppercase">{featured.category}</span>
              <h2 className="font-serif text-3xl md:text-4xl text-ink mt-2 mb-3 leading-tight" style={{ fontFamily: '"Instrument Serif", serif' }}>
                {featured.title}
              </h2>
              <p className="text-sm text-mist leading-relaxed mb-4">{featured.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-mist">
                <span>{featured.author}</span><span>·</span>
                <span>{fmtDate(featured.date)}</span><span>·</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {featured.readTime}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map(a => (
            <Link key={a.slug} to={`/journal/${a.slug}`} className="group block">
              <div className="rounded-2xl overflow-hidden h-52 mb-4">
                <img src={a.cover} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <span className="text-[10px] text-amber font-medium tracking-widest uppercase">{a.category}</span>
              <h3 className="font-serif text-xl text-ink mt-1 mb-2 leading-snug" style={{ fontFamily: '"Instrument Serif", serif' }}>{a.title}</h3>
              <p className="text-xs text-mist leading-relaxed line-clamp-2 mb-3">{a.excerpt}</p>
              <div className="flex items-center gap-2 text-[10px] text-mist">
                <span>{a.author}</span><span>·</span><span>{a.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTICLE DETAIL
// ─────────────────────────────────────────────────────────────────────────────
export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug ? getArticle(slug) : undefined

  if (!article) {
    return (
      <div className="pt-32 min-h-screen bg-cream text-center px-4">
        <p className="text-4xl mb-4">📖</p>
        <h1 className="font-serif text-3xl text-ink mb-3" style={{ fontFamily: '"Instrument Serif", serif' }}>Article not found</h1>
        <Link to="/journal" className="btn-primary">Back to the Journal</Link>
      </div>
    )
  }

  const related = ARTICLES.filter(a => a.slug !== article.slug).slice(0, 3)

  return (
    <div className="pt-20 min-h-screen bg-cream">
      <Helmet>
        <title>{`${article.title} — Voya° Journal`}</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:image" content={article.cover} />
      </Helmet>

      <article className="max-w-3xl mx-auto px-5 md:px-10 py-10">
        <Link to="/journal" className="flex w-fit items-center gap-2 text-sm text-mist hover:text-ink transition-colors mb-8">
          <ArrowLeft size={15} /> The Journal
        </Link>

        <span className="text-xs text-amber font-medium tracking-widest uppercase">{article.category}</span>
        <h1 className="font-serif font-normal text-4xl md:text-5xl text-ink mt-2 mb-4 leading-tight" style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '-1px' }}>
          {article.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-mist mb-8">
          <span>{article.author}</span><span>·</span>
          <span>{fmtDate(article.date)}</span><span>·</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {article.readTime}</span>
        </div>

        <div className="rounded-2xl overflow-hidden h-64 md:h-96 mb-10">
          <img src={article.cover} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-6">
          {article.content.map((block, i) => (
            <div key={i}>
              {block.heading && (
                <h2 className="font-serif text-2xl text-ink mb-2 mt-4" style={{ fontFamily: '"Instrument Serif", serif' }}>{block.heading}</h2>
              )}
              <p className="text-base text-mist leading-relaxed">{block.text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-surface rounded-2xl p-8 text-center border border-black/6">
          <h3 className="font-serif text-2xl text-ink mb-2" style={{ fontFamily: '"Instrument Serif", serif' }}>Ready to write your own story?</h3>
          <p className="text-sm text-mist mb-5">Browse our curated journeys or talk to a planner.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/trips" className="btn-primary">Browse journeys</Link>
            <Link to="/contact" className="btn-outline">Talk to a planner</Link>
          </div>
        </div>
      </article>

      {/* Related */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 pb-20">
        <h2 className="font-serif text-2xl text-ink mb-6" style={{ fontFamily: '"Instrument Serif", serif' }}>More from the Journal</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {related.map(a => (
            <Link key={a.slug} to={`/journal/${a.slug}`} className="group block">
              <div className="rounded-2xl overflow-hidden h-44 mb-3">
                <img src={a.cover} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-serif text-lg text-ink leading-snug" style={{ fontFamily: '"Instrument Serif", serif' }}>{a.title}</h3>
              <p className="text-[10px] text-mist mt-1">{a.readTime}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
