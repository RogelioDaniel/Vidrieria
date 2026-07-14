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

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <Catalog />
        <QuoteCalculator />
        <Projects />
        <Process />
        <Testimonials />
        <Appointments />
        <Contact />
      </main>
      <SiteFooter />
      <LiveChat />
    </div>
  )
}
