import { SiteHeader } from '@/components/sections/site-header'
import { Hero } from '@/components/sections/hero'
import { Marquee } from '@/components/sections/marquee'
import { Catalog } from '@/components/sections/catalog'
import { QuoteCalculator } from '@/components/sections/quote-calculator'
import { Projects } from '@/components/sections/projects'
import { Process } from '@/components/sections/process'
import { Testimonials } from '@/components/sections/testimonials'
import { Appointments } from '@/components/sections/appointments'
import { Contact } from '@/components/sections/contact'
import { SiteFooter } from '@/components/sections/site-footer'
import { LiveChat } from '@/components/live-chat'
import { SnapNavigation } from '@/components/snap-navigation'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      {/* Each wrapper is a snap target: scrolling settles section-by-section
          (html has scroll-snap-type — see globals.css). Marquee is a thin
          divider strip, so it rides along with catálogo instead of snapping. */}
      <main className="flex-1">
        <div className="snap-start"><Hero /></div>
        <Marquee />
        <div className="snap-start"><Catalog /></div>
        <div className="snap-start"><QuoteCalculator /></div>
        <div className="snap-start"><Projects /></div>
        <div className="snap-start"><Process /></div>
        <div className="snap-start"><Testimonials /></div>
        <div className="snap-start"><Appointments /></div>
        <div className="snap-start"><Contact /></div>
      </main>
      <div className="snap-end"><SiteFooter /></div>
      <SnapNavigation />
      <LiveChat />
    </div>
  )
}
