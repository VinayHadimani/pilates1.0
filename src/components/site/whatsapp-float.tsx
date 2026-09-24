import { MessageCircle } from "lucide-react";

/**
 * Floating WhatsApp chat button — fixed at the bottom-right corner of the
 * screen, above every other element. The number is hardcoded per spec; in a
 * production build this would come from settings.whatsappNumber.
 */
export function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform duration-200 hover:scale-110 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-7 w-7 text-white" fill="white" strokeWidth={0} />
    </a>
  );
}
