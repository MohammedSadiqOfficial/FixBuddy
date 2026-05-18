import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Briefcase, CheckCircle2, ShieldCheck, LayoutDashboard, ArrowRight, Sparkles, WalletCards, Wrench } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { BrandWordmark } from "../components/BrandWordmark";

export default function Landing() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-in fade-in duration-700">
      <header className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-md transition-all">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <BrandWordmark subtitle="Captain Network" compact />
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button variant="outline" asChild className="gap-2 rounded-full font-semibold shadow-lg transition-all hover:shadow-xl">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">Log In</Link>
                <Button asChild className="h-12 rounded-full px-4 font-semibold shadow-lg transition-all hover:shadow-xl">
                  <Link to="/signup">Become a Captain</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
        <div className="absolute inset-0 dot-pattern opacity-70" />
        <div className="absolute left-1/2 top-0 h-[520px] w-full max-w-5xl -translate-x-1/2 rounded-full bg-primary/10 blur-[100px] pointer-events-none -z-10" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <Badge className="mb-6 border-none bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
            Premium demand for trusted local pros
          </Badge>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tighter md:text-7xl">
            Turn skilled work into <span className="bg-gradient-to-r from-primary to-[#22c55e] bg-clip-text text-transparent">a sharper, steadier business.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Join FixBuddy&apos;s professional network to receive verified requests, manage your schedule, and present your work with a cleaner customer-facing profile.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg shadow-xl shadow-primary/20 transition-transform duration-300 hover:scale-105">
              <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                {isAuthenticated ? "Go to Dashboard" : "Become a Captain"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-2 px-8 text-lg transition-colors duration-300 hover:bg-secondary">
              <a href="#how-it-works">Learn How It Works</a>
            </Button>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 text-left shadow-sm">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="mt-4 text-3xl font-black">Faster</p>
              <p className="mt-2 text-sm text-muted-foreground">Cleaner intake, quicker review, and less time spent chasing leads.</p>
            </div>
            <div className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 text-left shadow-sm">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="mt-4 text-3xl font-black">Verified</p>
              <p className="mt-2 text-sm text-muted-foreground">Professional profiles and customer requests stay organized in one trusted flow.</p>
            </div>
            <div className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 text-left shadow-sm">
              <WalletCards className="h-5 w-5 text-primary" />
              <p className="mt-4 text-3xl font-black">Clearer</p>
              <p className="mt-2 text-sm text-muted-foreground">Know what needs attention, what is completed, and where your next earning opportunity is.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative bg-secondary/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Why partner with FixBuddy?</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">We handle the marketing, booking, and payments so you can focus on what you do best.</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-border/50 bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Be Your Own Boss</h3>
              <p className="leading-relaxed text-muted-foreground">Toggle your availability instantly. Work when you want, where you want, and only accept the jobs that fit your schedule.</p>
            </div>
            <div className="rounded-[1.75rem] border border-border/50 bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Guaranteed Payments</h3>
              <p className="leading-relaxed text-muted-foreground">No more chasing invoices. FixBuddy ensures secure, immediate transactions directly to your bank account after every completed job.</p>
            </div>
            <div className="rounded-[1.75rem] border border-border/50 bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Premium Clientele</h3>
              <p className="leading-relaxed text-muted-foreground">We connect you with high-intent customers who value quality craftsmanship and are willing to pay for professional-grade services.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
        <div className="container relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 md:flex-row">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Introducing FixBuddy Pro Kits</h2>
            <p className="max-w-lg text-lg leading-relaxed text-primary-foreground/80">
              Equip yourself with the industry standard. Buy or rent premium FixBuddy-branded tool kits specifically curated for electricians, plumbers, and carpenters.
            </p>
            <ul className="space-y-3 pt-2">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="font-medium">Exclusive discounts for active captains</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="font-medium">Durable, enterprise-grade tools</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <span className="font-medium">Free replacement on wear and tear</span>
              </li>
            </ul>
            <div className="pt-4">
              <Button size="lg" variant="secondary" className="rounded-full font-bold text-primary shadow-lg transition-transform hover:scale-105">
                Explore Tool Kits
              </Button>
            </div>
          </div>
          <div className="flex w-full flex-1 justify-center">
            <div className="group relative aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-foreground/5 to-transparent pointer-events-none" />
              <div className="flex h-full items-center justify-center">
                <Wrench className="h-32 w-32 text-primary-foreground/50 transition-transform duration-500 ease-in-out group-hover:scale-110" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground">Everything you need to know about becoming a FixBuddy Captain.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1" className="rounded-[1.25rem] border bg-card px-6 transition-all data-[state=open]:shadow-md">
            <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">What are the requirements to join?</AccordionTrigger>
            <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
              You must have documented experience in your specific trade, pass a standard background check, and possess valid identification.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="rounded-[1.25rem] border bg-card px-6 transition-all data-[state=open]:shadow-md">
            <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">How and when do I get paid?</AccordionTrigger>
            <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
              Payments are processed after job completion, with earnings deposited to your linked account based on the platform payout schedule.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="rounded-[1.25rem] border bg-card px-6 transition-all data-[state=open]:shadow-md">
            <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">Do I pay a fee to use the platform?</AccordionTrigger>
            <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
              FixBuddy takes a commission on completed jobs only. There are no monthly subscription fees or hidden lead costs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="rounded-[1.25rem] border bg-card px-6 transition-all data-[state=open]:shadow-md">
            <AccordionTrigger className="py-6 text-left text-lg font-semibold hover:no-underline">Can I choose which jobs to accept?</AccordionTrigger>
            <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">
              Yes. You stay in control of your availability and can review incoming work before deciding whether to accept it.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <footer className="border-t border-border/50 bg-secondary/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-2xl font-bold">Ready to upgrade your career?</h2>
          <Button asChild size="lg" className="h-14 rounded-full px-8 font-semibold shadow-md">
            <Link to="/signup" className="inline-flex items-center gap-2">Apply Now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <p className="mt-8 text-sm text-muted-foreground">� 2026 FixBuddy Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Badge({ className, children }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
