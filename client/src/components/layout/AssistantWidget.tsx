import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, X, Send } from 'lucide-react'
import { assistantAPI } from '../../services/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Something adventurous under ₹40k?',
  'Best honeymoon spot?',
  '8-day trip in Japan?',
  'A relaxing beach escape?',
]

function renderWithLinks(text: string) {
  const parts: (string | React.ReactNode)[] = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(
      <Link key={key++} to={match[2]} className="text-amber underline hover:no-underline font-medium">
        {match[1]}
      </Link>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    try {
      const { data } = await assistantAPI.chat(text, nextMessages.slice(0, -1))
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
    } catch (e: any) {
      const fallback = e.response?.data?.reply || "Sorry, I'm having trouble responding right now. Please try again."
      setMessages(m => [...m, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="group fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-amber text-cream shadow-xl shadow-amber/30 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Voya AI assistant"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
        {!open && (
          <span className="absolute right-full mr-3 whitespace-nowrap bg-ink text-cream text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Voya AI
          </span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-cream dark:bg-[#141414] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-black/6 dark:border-white/10 flex items-center gap-2 flex-shrink-0">
            <Sparkles size={16} className="text-amber" />
            <div>
              <p className="font-serif text-lg leading-none text-ink dark:text-cream" style={{ fontFamily: '"Instrument Serif", serif' }}>Voya AI</p>
              <p className="text-[10px] text-mist mt-0.5">Ask me about any journey</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div>
                <p className="text-xs text-mist mb-3">Try asking:</p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="text-left text-xs bg-surface dark:bg-white/5 hover:bg-amber/10 hover:text-amber text-mist px-3 py-2.5 rounded-xl transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                  m.role === 'user' ? 'bg-ink text-cream rounded-br-sm' : 'bg-surface dark:bg-white/5 text-ink dark:text-cream rounded-bl-sm'
                }`}>
                  {renderWithLinks(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface dark:bg-white/5 px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-mist/50 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={e => { e.preventDefault(); send(input) }}
            className="flex-shrink-0 p-3 border-t border-black/6 dark:border-white/10 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask about a destination..."
              className="input-base text-sm flex-1 py-2.5" />
            <button type="submit" disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-amber text-cream flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
