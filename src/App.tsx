import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Routes, Route, Link, Navigate, useParams, useLocation, useNavigate } from "react-router-dom"
import Hero05 from "@/components/ui/hero-05"
import cleanserImage from "./assets/cleanser.png.jpeg"
import serumImage from "./assets/serum.png.jpeg"
import moisturizerImage from "./assets/moisturizer.png.jpeg"
import logo from "./assets/logo.png"
import { supabase } from "./supabaseClient"
import AuthPage from "./AuthPage"
import type { Session } from "@supabase/supabase-js"

/* ---------- brand tokens ----------
  ink      #24261F  – warm near-black for text
  cream    #F6F1E7  – base background
  sage     #4B5D3A  – primary brand accent (botanical)
  gold     #B08D57  – premium CTA accent (matches product caps)
  blush    #EFE6D8  – badge / highlight surface
------------------------------------ */

type AvailableProduct = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  badge: string
  image: string
}

type ComingSoonProduct = {
  id: string
  name: string
}

type CategoryItem = AvailableProduct | ComingSoonProduct

function isAvailable(item: CategoryItem): item is AvailableProduct {
  return "price" in item
}

type Category = {
  id: string
  label: string
  items: CategoryItem[]
}

const CATEGORIES: Category[] = [
  {
    id: "face-wash",
    label: "Face Wash",
    items: [
      {
        id: "gentle-cleanser",
        name: "Gentle Cleanser",
        description: "A gentle daily cleanser for fresh, balanced skin.",
        price: 799,
        originalPrice: 899,
        badge: "Bestseller",
        image: cleanserImage,
      },
      { id: "vitamin-c-face-wash", name: "Vitamin C Face Wash" },
      { id: "charcoal-face-wash", name: "Charcoal Face Wash" },
      { id: "salicylic-acid-face-wash", name: "Salicylic Acid Face Wash" },
    ],
  },
  {
    id: "serums",
    label: "Serums",
    items: [
      {
        id: "hydrating-serum",
        name: "Hydrating Serum",
        description: "Lightweight hydration for soft, healthy-looking skin.",
        price: 999,
        originalPrice: 1199,
        badge: "Most Gifted",
        image: serumImage,
      },
      { id: "vitamin-c-serum", name: "Vitamin C Serum" },
      { id: "niacinamide-serum", name: "Niacinamide Serum" },
      { id: "hyaluronic-acid-serum", name: "Hyaluronic Acid" },
    ],
  },
  {
    id: "moisturizers",
    label: "Moisturizers",
    items: [
      {
        id: "barrier-moisturizer",
        name: "Barrier Moisturizer",
        description: "Rich, comforting moisture to support your skin barrier.",
        price: 899,
        originalPrice: 1049,
        badge: "Featured",
        image: moisturizerImage,
      },
      { id: "oil-free-moisturizer", name: "Oil-Free Moisturizer" },
      { id: "advanced-glow-moisturizer", name: "Advanced Glow Moisturizer" },
    ],
  },
  {
    id: "body-care",
    label: "Body Care",
    items: [
      { id: "sun-protection", name: "Sun Protection" },
      { id: "spf-sunscreen", name: "SPF Sunscreen" },
      { id: "body-lotion", name: "Body Lotion" },
    ],
  },
]

const ALL_AVAILABLE_PRODUCTS: AvailableProduct[] = CATEGORIES.flatMap((c) =>
  c.items.filter(isAvailable)
)

const WHY_CHOOSE = [
  { title: "Premium-quality formulations", icon: "star" },
  { title: "Doctor approved", icon: "shield" },
  { title: "Carefully selected ingredients", icon: "leaf" },
  { title: "Suitable for daily skincare", icon: "drop" },
  { title: "Quality-focused manufacturing", icon: "gear" },
  { title: "Customer-centric approach", icon: "heart" },
  { title: "Elegant, modern packaging", icon: "box" },
] as const

type CartItem = AvailableProduct & { qty: number }

function LeafMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20c8-1 14-7 15-15C10 6 4 12 4 20Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 18C10 13 14 9 19 5.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 8h12l-1 12.5a1 1 0 0 1-1 .9H8a1 1 0 0 1-1-.9L6 8Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function DropIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3c4 5 6.5 8.6 6.5 11.5A6.5 6.5 0 1 1 5.5 14.5C5.5 11.6 8 8 12 3Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3.5 19 6.5v5c0 5-3 8.4-7 9.5-4-1.1-7-4.5-7-9.5v-5L12 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3.5 14.5 9.5 21 10.3 16.2 14.6 17.6 21 12 17.7 6.4 21 7.8 14.6 3 10.3 9.5 9.5 12 3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}
function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 20.5s-7.5-4.6-9.5-9.3C1.2 7.8 3 5 6.2 5c2 0 3.4 1.1 5.8 3.6C14.4 6.1 15.8 5 17.8 5c3.2 0 5 2.8 3.7 6.2C19.5 15.9 12 20.5 12 20.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
function BoxIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3.5 8v8L12 20l8.5-4V8M12 12v8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}
function GearIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5M17.7 17.7l-1.5-1.5M7.8 7.8 6.3 6.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}
function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7 12 12.5 19.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M7 4h2.3l1 4-1.8 1.4a11 11 0 0 0 5.1 5.1l1.4-1.8 4 1V17a2 2 0 0 1-2.2 2C10.5 18.6 5.4 13.5 5 7.2A2 2 0 0 1 7 4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function ArrowLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const WHY_ICONS: Record<string, (p: { className?: string }) => React.JSX.Element> = {
  star: StarIcon,
  shield: ShieldIcon,
  leaf: LeafMark,
  drop: DropIcon,
  gear: GearIcon,
  heart: HeartIcon,
  box: BoxIcon,
}

/** Scrolls to top on every route change, or to the matching #section when a link carries a hash. Mirrors real page-load behavior. */
function ScrollManager() {
  const location = useLocation()
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: "auto", block: "start" }))
        return
      }
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])
  return null
}

/* ---------------- HOME PAGE ---------------- */

function HomePage({
  activeCategory,
  setActiveCategory,
  addToCart,
  justAdded,
  form,
  formErrors,
  formSubmitted,
  handleFormChange,
  handleFormSubmit,
  setFormSubmitted,
}: {
  activeCategory: string
  setActiveCategory: (id: string) => void
  addToCart: (product: AvailableProduct) => void
  justAdded: string | null
  form: { name: string; email: string; message: string }
  formErrors: { [k: string]: string }
  formSubmitted: boolean
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleFormSubmit: (e: React.FormEvent) => void
  setFormSubmitted: (v: boolean) => void
}) {
  const activeItems = CATEGORIES.find((c) => c.id === activeCategory)?.items ?? []

  return (
    <>
      {/* HERO */}
      <main>
        <Hero05
          tagline="MEDICRUISE™ Premium Skincare"
          title="Beautiful Skin Starts with Healthy Care"
          description="MEDICRUISE offers premium skincare solutions designed to cleanse, hydrate, nourish, and protect your skin. Our carefully developed formulations combine trusted cosmetic ingredients with a commitment to quality, helping you build an effective daily skincare routine."
          landscapeImage=""
          animation="subtle"
          primaryCTA={{ ctaEnabled: false, label: "Shop Now", href: "#products", variant: "default" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-6 mt-2 pb-6"
        >
          <a
            href="#products"
            className="inline-block bg-[#24261F] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#4B5D3A] transition-colors"
          >
            Shop Now
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto px-6 pt-2 pb-4"
        >
          <p className="text-center text-[10px] tracking-[0.25em] uppercase text-[#4B5D3A] mb-4">
            Shop Our Bestsellers
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {ALL_AVAILABLE_PRODUCTS.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white border border-[#24261F]/10 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square flex items-center justify-center bg-[#EFE6D8]/40 p-4 sm:p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="px-3 sm:px-4 py-3 border-t border-[#24261F]/10">
                  <p className="text-xs sm:text-sm font-serif truncate">{product.name}</p>
                  <p className="text-sm font-semibold mt-0.5">₹{product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-6"
        >
          <p className="text-center text-sm uppercase tracking-[0.25em] text-[#4B5D3A] py-4">
            Your Skin. Our Commitment.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-6 pb-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-b border-[#24261F]/10"
        >
          <div className="flex items-center gap-2 text-sm text-[#24261F]/60">
            <ShieldIcon className="h-4 w-4 text-[#4B5D3A]" />
            Dermatologically tested
          </div>
          <div className="flex items-center gap-2 text-sm text-[#24261F]/60">
            <LeafMark className="h-4 w-4 text-[#4B5D3A]" />
            Cruelty-free formulas
          </div>
          <div className="flex items-center gap-2 text-sm text-[#24261F]/60">
            <DropIcon className="h-4 w-4 text-[#4B5D3A]" />
            10,000+ happy customers
          </div>
        </motion.div>
      </main>

      {/* ABOUT */}
      <section id="about" className="px-6 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
            <p className="text-sm uppercase tracking-[0.2em] text-[#4B5D3A]">About Us</p>
            <h2 className="mt-4 max-w-xl text-4xl font-serif font-normal tracking-tight sm:text-5xl">
              Your Skin. Our Commitment.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-xl"
          >
            <p className="text-lg leading-relaxed text-[#24261F]/70">
              At MEDICRUISE, we believe healthy-looking skin starts with consistent care and quality products.
              Our goal is to provide skincare that is effective, thoughtfully formulated, and suitable for everyday use.
            </p>
            <p className="mt-6 leading-relaxed text-[#24261F]/70">
              We focus on innovation, quality, and customer satisfaction while creating products that fit modern
              skincare needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="border-t border-[#24261F]/10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[#4B5D3A] mb-3">Our Products</p>
            <h2 className="text-4xl md:text-5xl font-serif font-normal tracking-tight">
              Skincare made for your skin.
            </h2>
          </motion.div>

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-5 py-2 text-sm rounded-full border transition-colors ${
                  activeCategory === category.id
                    ? "bg-[#24261F] text-white border-[#24261F]"
                    : "border-[#24261F]/15 text-[#24261F]/70 hover:border-[#4B5D3A] hover:text-[#4B5D3A]"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {activeItems.map((item) =>
              isAvailable(item) ? (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group cursor-pointer border border-[#24261F]/10 rounded-xl overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
                >
                  <div className="relative aspect-square bg-white flex items-center justify-center p-6">
                    <span className="absolute top-3 left-3 text-[10px] tracking-wider uppercase bg-[#EFE6D8] text-[#4B5D3A] px-2 py-1 rounded">
                      {item.badge}
                    </span>
                    <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                  </div>

                  <div className="px-5 pb-5 pt-1">
                    <h3 className="text-base font-serif">{item.name}</h3>
                    <p className="text-xs text-[#24261F]/60 mt-1 leading-relaxed">{item.description}</p>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-base font-semibold">₹{item.price}</span>
                      <span className="text-sm text-[#24261F]/40 line-through">₹{item.originalPrice}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToCart(item)
                      }}
                      className="mt-4 w-full bg-[#24261F] text-white text-sm py-2.5 rounded-md hover:bg-[#4B5D3A] transition-colors"
                    >
                      {justAdded === item.id ? "Added ✓" : "Add to Bag"}
                    </button>
                  </div>
                </Link>
              ) : (
                <div
                  key={item.id}
                  className="border border-dashed border-[#24261F]/15 rounded-xl bg-white/40 flex flex-col items-center justify-center text-center p-6 aspect-square"
                >
                  <DropIcon className="h-6 w-6 text-[#4B5D3A]/60 mb-3" />
                  <h3 className="text-sm font-medium">{item.name}</h3>
                  <span className="mt-3 text-[10px] tracking-wider uppercase text-[#24261F]/40 border border-[#24261F]/15 rounded-full px-2.5 py-1">
                    Coming Soon
                  </span>
                </div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="border-t border-[#24261F]/10 px-6 py-24 bg-white/40">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[#4B5D3A] mb-3">Why MEDICRUISE</p>
            <h2 className="text-4xl md:text-5xl font-serif font-normal tracking-tight">Why Choose MEDICRUISE?</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE.map((reason, i) => {
              const Icon = WHY_ICONS[reason.icon]
              return (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white border border-[#24261F]/10 rounded-xl p-6 flex flex-col items-start gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-[#EFE6D8] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#4B5D3A]" />
                  </div>
                  <p className="text-sm font-medium leading-snug">{reason.title}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="border-t border-[#24261F]/10 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
              <p className="text-sm uppercase tracking-[0.2em] text-[#4B5D3A]">Contact Us</p>
              <h2 className="mt-4 max-w-lg text-4xl font-serif font-normal tracking-tight sm:text-5xl">
                Let's talk about your skincare routine.
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-[#24261F]/60">
                Have a question about MEDICRUISE products or your skincare routine? We would love to hear from you.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <MailIcon className="h-4 w-4 text-[#4B5D3A]" />
                  {/* TODO: replace with your real email address */}
                  <span>hello@medicruise.in</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <PhoneIcon className="h-4 w-4 text-[#4B5D3A]" />
                  <span>+91-9654618797</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ClockIcon className="h-4 w-4 text-[#4B5D3A]" />
                  <span>Monday–Saturday, 9:00 AM–6:00 PM</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: 0.1 }}>
              {formSubmitted ? (
                <div className="border border-[#4B5D3A]/30 bg-[#4B5D3A]/5 rounded-lg p-8 text-center">
                  <LeafMark className="h-8 w-8 text-[#4B5D3A] mx-auto mb-3" />
                  <p className="text-lg font-serif">Message sent.</p>
                  <p className="text-sm text-[#24261F]/60 mt-2">We'll get back to you within 1 business day.</p>
                  <button onClick={() => setFormSubmitted(false)} className="mt-5 text-sm underline hover:text-[#4B5D3A]">
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleFormSubmit} noValidate>
                  <div>
                    <label className="mb-2 block text-sm">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="Your name"
                      className="w-full border border-[#24261F]/15 bg-transparent px-4 py-3 outline-none transition focus:border-[#4B5D3A] rounded-md"
                    />
                    {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      placeholder="you@example.com"
                      className="w-full border border-[#24261F]/15 bg-transparent px-4 py-3 outline-none transition focus:border-[#4B5D3A] rounded-md"
                    />
                    {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm">Message</label>
                    <textarea
                      rows={5}
                      name="message"
                      value={form.message}
                      onChange={handleFormChange}
                      placeholder="How can we help?"
                      className="w-full resize-none border border-[#24261F]/15 bg-transparent px-4 py-3 outline-none transition focus:border-[#4B5D3A] rounded-md"
                    />
                    {formErrors.message && <p className="mt-1 text-xs text-red-600">{formErrors.message}</p>}
                  </div>

                  <button type="submit" className="w-full bg-[#24261F] px-6 py-3 text-sm text-white rounded-md transition hover:bg-[#4B5D3A]">
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

/* ---------------- PRODUCT PAGE (own URL: /product/:productId) ---------------- */

function ProductPage({
  addToCartWithQty,
}: {
  addToCartWithQty: (product: AvailableProduct, qty: number) => void
}) {
  const { productId } = useParams()
  const product = ALL_AVAILABLE_PRODUCTS.find((p) => p.id === productId)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    setQty(1)
  }, [productId])

  if (!product) {
    return <Navigate to="/" replace />
  }

  const related = ALL_AVAILABLE_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4)
  const category = CATEGORIES.find((c) => c.items.some((i) => i.id === product.id))

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <nav className="flex items-center flex-wrap gap-1 text-xs text-[#24261F]/50 mb-6">
        <Link to="/" className="hover:text-[#4B5D3A] transition-colors">Home</Link>
        <span>/</span>
        {category && (
          <>
            <Link to={`/#products`} className="hover:text-[#4B5D3A] transition-colors">{category.label}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#24261F]/70">{product.name}</span>
      </nav>

      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-[#24261F]/60 hover:text-[#4B5D3A] transition-colors mb-8"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white border border-[#24261F]/10 rounded-2xl flex items-center justify-center p-10 sm:p-16">
          <img src={product.image} alt={product.name} className="h-72 sm:h-96 w-auto object-contain" />
        </div>

        <div>
          <span className="text-[10px] tracking-wider uppercase bg-[#EFE6D8] text-[#4B5D3A] px-2 py-1 rounded">
            {product.badge}
          </span>

          <h1 className="mt-4 text-3xl sm:text-4xl font-serif">{product.name}</h1>
          <p className="mt-1 text-sm text-[#4B5D3A]">In Stock</p>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-2xl font-semibold">₹{product.price}</span>
            <span className="text-base text-[#24261F]/40 line-through">₹{product.originalPrice}</span>
            <span className="text-sm text-[#4B5D3A]">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Off
            </span>
          </div>
          <p className="text-xs text-[#24261F]/50 mt-1">Inclusive of all taxes</p>

          <p className="mt-6 text-base leading-relaxed text-[#24261F]/70 max-w-xl">
            {product.description}
          </p>

          <div className="mt-8">
            <p className="text-sm font-medium mb-3">Highlights</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-[#24261F]/60">
                <ShieldIcon className="h-4 w-4 text-[#4B5D3A]" />
                Dermatologically tested
              </div>
              <div className="flex items-center gap-3 text-sm text-[#24261F]/60">
                <LeafMark className="h-4 w-4 text-[#4B5D3A]" />
                Cruelty-free formula
              </div>
              <div className="flex items-center gap-3 text-sm text-[#24261F]/60">
                <DropIcon className="h-4 w-4 text-[#4B5D3A]" />
                Suitable for daily use
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm text-[#24261F]/60">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-9 w-9 border border-[#24261F]/15 rounded-md hover:border-[#4B5D3A]"
              >
                −
              </button>
              <span className="text-sm w-4 text-center">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="h-9 w-9 border border-[#24261F]/15 rounded-md hover:border-[#4B5D3A]"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={() => addToCartWithQty(product, qty)}
            className="mt-6 w-full sm:w-auto sm:px-16 bg-[#24261F] text-white text-sm py-3.5 rounded-md hover:bg-[#4B5D3A] transition-colors"
          >
            Add to Bag — ₹{product.price * qty}
          </button>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#24261F]/50 border-t border-[#24261F]/10 pt-5">
            <span>Free shipping over ₹999</span>
            <span>·</span>
            <span>7-day easy returns</span>
            <span>·</span>
            <span>100% genuine products</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20 border-t border-[#24261F]/10 pt-12">
          <h2 className="text-2xl font-serif mb-8">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="group cursor-pointer border border-[#24261F]/10 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 block"
              >
                <div className="aspect-square bg-white flex items-center justify-center p-6">
                  <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                </div>
                <div className="px-4 pb-4">
                  <h3 className="text-sm font-serif">{item.name}</h3>
                  <span className="text-sm font-semibold">₹{item.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

/* ---------------- APP SHELL (navbar, footer, cart — persistent across routes) ---------------- */

function App() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id)

  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({})
  const [formSubmitted, setFormSubmitted] = useState(false)

  const [session, setSession] = useState<Session | null>(null)
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleCheckout(navigate: (path: string) => void) {
    if (!session) {
      setCartOpen(false)
      navigate("/login")
      return
    }
    setCheckoutStatus("saving")
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: session.user.id, total: subtotal })
      .select()
      .single()

    if (orderError || !order) {
      console.error(orderError)
      setCheckoutStatus("error")
      return
    }

    const items = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.qty,
    }))
    const { error: itemsError } = await supabase.from("order_items").insert(items)

    if (itemsError) {
      console.error(itemsError)
      setCheckoutStatus("error")
      return
    }

    setCheckoutStatus("success")
    setCart([])
  }

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0)

  function addToCart(product: AvailableProduct) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setJustAdded(product.id)
    setCartOpen(true)
    window.setTimeout(() => setJustAdded(null), 1400)
  }

  function addToCartWithQty(product: AvailableProduct, qty: number) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + qty } : item))
      }
      return [...prev, { ...product, qty }]
    })
    setCartOpen(true)
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item)).filter((item) => item.qty > 0)
    )
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errors: { [k: string]: string } = {}
    if (!form.name.trim()) errors.name = "Enter your name."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email."
    if (!form.message.trim()) errors.message = "Write a short message."
    setFormErrors(errors)
    if (Object.keys(errors).length === 0) {
      setFormSubmitted(true)
      setForm({ name: "", email: "", message: "" })
    }
  }

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/#products" },
    { label: "About", to: "/#about" },
    { label: "Contact", to: "/#contact" },
  ]

  return (
    <div className="bg-[#F6F1E7] text-[#24261F]">
      <ScrollManager />

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-[#24261F]/10 bg-[#F6F1E7]/85 backdrop-blur-md">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="MEDICRUISE — Care for All" className="h-16 sm:h-20 w-auto object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} className="hover:text-[#4B5D3A] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block text-sm text-[#24261F]/70 hover:text-[#4B5D3A] transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-block text-sm text-[#24261F]/70 hover:text-[#4B5D3A] transition-colors"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative border border-[#24261F]/15 rounded-full p-2.5 hover:border-[#4B5D3A] hover:text-[#4B5D3A] transition-colors"
            >
              <CartIcon className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-[18px] px-1 rounded-full bg-[#B08D57] text-white text-[10px] leading-[18px] text-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>

            <Link
              to="/#products"
              className="hidden sm:inline-block bg-[#24261F] text-[#F6F1E7] px-5 py-2.5 text-sm rounded-full hover:bg-[#4B5D3A] transition-colors"
            >
              Shop Now
            </Link>

            <button onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu" className="md:hidden p-2">
              {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-[#24261F]/10"
            >
              <div className="flex flex-col px-6 py-4 gap-4 text-sm">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-[#4B5D3A] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              addToCart={addToCart}
              justAdded={justAdded}
              form={form}
              formErrors={formErrors}
              formSubmitted={formSubmitted}
              handleFormChange={handleFormChange}
              handleFormSubmit={handleFormSubmit}
              setFormSubmitted={setFormSubmitted}
            />
          }
        />
        <Route path="/product/:productId" element={<ProductPage addToCartWithQty={addToCartWithQty} />} />
        <Route path="/login" element={<AuthPage onAuthed={() => {}} />} />
      </Routes>

      {/* FOOTER */}
      <footer className="border-t border-[#24261F]/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <img src={logo} alt="MEDICRUISE — Care for All" className="h-14 w-auto object-contain" />
            <p className="mt-3 text-sm text-[#24261F]/60">Premium skincare, thoughtfully formulated.</p>
          </div>

          <div className="flex gap-6 text-sm">
            <Link to="/#products" className="hover:text-[#4B5D3A] transition-colors">Products</Link>
            <Link to="/#about" className="hover:text-[#4B5D3A] transition-colors">About</Link>
            <Link to="/#contact" className="hover:text-[#4B5D3A] transition-colors">Contact</Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-[#24261F]/10 pt-6">
          <p className="text-xs text-[#24261F]/50">© 2026 MEDICRUISE. All rights reserved.</p>
        </div>
      </footer>

      {/* CART DRAWER */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/40 z-50" />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#F6F1E7] z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#24261F]/10">
                <h3 className="text-lg font-serif">Your Bag ({itemCount})</h3>
                <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="p-1 hover:text-[#4B5D3A]">
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                    <LeafMark className="h-8 w-8 text-[#4B5D3A]/50" />
                    <p className="text-sm text-[#24261F]/60">Your bag is empty. Explore our collection to get started.</p>
                    <Link
                      to="/#products"
                      onClick={() => setCartOpen(false)}
                      className="mt-2 text-sm underline hover:text-[#4B5D3A]"
                    >
                      Browse products
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-5">
                    {cart.map((item) => (
                      <li key={item.id} className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 bg-white border border-[#24261F]/10 rounded-md p-2">
                          <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium">{item.name}</p>
                            <button onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="text-[#24261F]/40 hover:text-red-600 transition-colors">
                              <CloseIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <p className="text-sm text-[#24261F]/60 mt-1">₹{item.price}</p>

                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => updateQty(item.id, -1)} className="h-7 w-7 border border-[#24261F]/15 rounded-md hover:border-[#4B5D3A]">
                              −
                            </button>
                            <span className="text-sm w-4 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="h-7 w-7 border border-[#24261F]/15 rounded-md hover:border-[#4B5D3A]">
                              +
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && checkoutStatus !== "success" && (
                <div className="border-t border-[#24261F]/10 px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#24261F]/60">Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  {checkoutStatus === "error" && (
                    <p className="text-xs text-red-600">Something went wrong saving your order. Please try again.</p>
                  )}
                  <button
                    onClick={() => handleCheckout(navigate)}
                    disabled={checkoutStatus === "saving"}
                    className="w-full bg-[#24261F] text-white text-sm py-3 rounded-md hover:bg-[#4B5D3A] transition-colors disabled:opacity-60"
                  >
                    {checkoutStatus === "saving"
                      ? "Placing order…"
                      : session
                      ? "Proceed to Checkout"
                      : "Login to Checkout"}
                  </button>
                </div>
              )}

              {checkoutStatus === "success" && (
                <div className="border-t border-[#24261F]/10 px-6 py-8 text-center space-y-3">
                  <LeafMark className="h-8 w-8 text-[#4B5D3A] mx-auto" />
                  <p className="text-lg font-serif">Order placed!</p>
                  <p className="text-sm text-[#24261F]/60">Thank you for shopping with MEDICRUISE.</p>
                  <button
                    onClick={() => {
                      setCheckoutStatus("idle")
                      setCartOpen(false)
                    }}
                    className="text-sm underline hover:text-[#4B5D3A]"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
