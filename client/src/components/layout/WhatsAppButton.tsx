// Floating WhatsApp enquiry button. Change the number via VITE_WHATSAPP_NUMBER
// in client/.env (format: country code + number, no + or spaces, e.g. 919876543210).
const NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string) || '919876543210'
const MESSAGE = 'Hi Voya°! I would like to know more about your journeys.'

export default function WhatsAppButton() {
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 flex items-center justify-center hover:scale-105 transition-transform"
    >
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M16.003 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.257.59 4.46 1.712 6.402L3.2 28.8l6.56-1.68a12.74 12.74 0 0 0 6.243 1.63h.005c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.8-12.805-12.75Zm0 23.36h-.004a10.55 10.55 0 0 1-5.38-1.472l-.386-.23-3.893.996 1.04-3.79-.252-.39a10.55 10.55 0 0 1-1.617-5.634c0-5.86 4.77-10.63 10.635-10.63 2.84 0 5.51 1.107 7.52 3.117a10.56 10.56 0 0 1 3.113 7.52c0 5.86-4.77 10.63-10.63 10.63Zm5.83-7.96c-.32-.16-1.89-.933-2.183-1.04-.293-.107-.507-.16-.72.16-.213.32-.826 1.04-1.013 1.253-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.57-1.586-.95-.847-1.59-1.893-1.777-2.213-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.733-.986-2.373-.26-.624-.524-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667 0 1.573 1.146 3.093 1.306 3.306.16.213 2.253 3.44 5.46 4.826.763.33 1.36.526 1.824.674.767.244 1.464.21 2.016.127.615-.092 1.89-.773 2.157-1.52.267-.746.267-1.386.187-1.52-.08-.133-.293-.213-.613-.373Z"/>
      </svg>
      <span className="absolute left-full ml-3 whitespace-nowrap bg-ink text-cream text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat on WhatsApp
      </span>
    </a>
  )
}
