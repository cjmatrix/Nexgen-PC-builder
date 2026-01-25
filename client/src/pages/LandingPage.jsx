import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Cpu,
  ShieldCheck,
  Zap,
  Monitor,
  Settings,
  PenTool,
  Truck,
  Gamepad2,
  Briefcase,
  ChevronRight,
  Sparkles,
  Users,
  Star,
} from "lucide-react";
import Navbar from "./customer/components/Navbar";
import Footer from "../components/Footer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from(".hero-badge", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          ".hero-title",
          { y: 50, opacity: 0, duration: 1, ease: "power4.out" },
          "-=0.4",
        )
        .from(
          ".hero-text",
          { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" },
          "-=0.6",
        )
        .from(
          ".hero-btns",
          { y: 20, opacity: 0, duration: 0.8, ease: "back.out(1.7)" },
          "-=0.6",
        );

      // Features Scroll Trigger
      gsap.utils.toArray(".feature-card").forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: "power3.out",
        });
      });

      // AI Section Parallax
      gsap.from(".ai-content", {
        scrollTrigger: {
          trigger: ".ai-section",
          start: "top 70%",
        },
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".ai-visual", {
        scrollTrigger: {
          trigger: ".ai-section",
          start: "top 70%",
        },
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden"
    >
      <Navbar />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 via-white to-white"></div>
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-100/40 to-transparent blur-[120px]"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/40 rounded-full blur-[128px]"></div>
          <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-200/40 rounded-full blur-[128px]"></div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-soft-light"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        <div className="container relative z-10 px-6 mx-auto text-center max-w-5xl">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white border border-gray-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-gray-600 text-xs font-bold tracking-widest uppercase">
              Nexgen 2.0 Live
            </span>
          </div>

          <h1 className="hero-title text-6xl md:text-8xl font-black mb-8 leading-[1.05] tracking-tight text-gray-900">
            BUILD YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              LEGEND
            </span>
          </h1>

          <p className="hero-text text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience the future of PC building. AI-driven configurations,
            surgical precision, and performance that breaks boundaries.
          </p>

          <div className="hero-btns flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/ai-assistant"
              className="group relative px-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:bg-black transition-all duration-300 w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                Ask AI Architect
              </span>
            </Link>

            <Link
              to="/builder"
              className="group px-8 py-4 bg-white border border-gray-200 text-gray-900 font-bold text-lg rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
            >
              Custom Build
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 relative z-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Cpu size={32} className="text-blue-600" />}
              title="Extreme Performance"
              desc="Access Tier-S components from trusted manufacturers. We verify every part for maximum throughput."
              gradient="from-blue-50 to-transparent"
              border="border-blue-100"
            />
            <FeatureCard
              icon={<ShieldCheck size={32} className="text-green-600" />}
              title="Military-Grade Testing"
              desc="Every rig undergoes a 48-hour burn-in stress test. Stability is non-negotiable."
              gradient="from-green-50 to-transparent"
              border="border-green-100"
            />
            <FeatureCard
              icon={<Users size={32} className="text-pink-600" />}
              title="Elite Community"
              desc="Join thousands of enthusiasts. Share builds, get feedback, and climb the leaderboards."
              gradient="from-pink-50 to-transparent"
              border="border-pink-100"
            />
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="ai-section py-32 relative overflow-hidden bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="ai-content lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-purple-100 text-purple-600 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                <Sparkles size={14} />
                Gemini Powered
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
                Meet Your New <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  System Architect
                </span>
              </h2>
              <p className="text-gray-600 text-xl leading-relaxed mb-8">
                Stop guessing compatibility. Our advanced AI analyzes millions
                of combinations to design the perfect rig for your specific
                workflow—whether it's 8K rendering or competitive gaming.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-green-500" /> Instant
                  Compatibility Checks
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-green-500" /> Budget Maximization
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-green-500" /> Aesthetic Matching
                </li>
              </ul>
              <Link
                to="/ai-assistant"
                className="inline-flex items-center gap-2 text-blue-600 font-bold border-b-2 border-blue-600 pb-1 hover:text-blue-700 hover:border-blue-700 transition-colors"
              >
                Try the AI Architect <ArrowRight size={18} />
              </Link>
            </div>

            <div className="ai-visual lg:w-1/2 relative">
              <div className="aspect-square rounded-full bg-gradient-to-tr from-purple-200 to-blue-200 blur-[80px] absolute inset-0 animate-pulse opacity-60"></div>
              <div className="relative bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">
                        Nexgen AI
                      </div>
                      <div className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                        Online
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="space-y-4 text-sm">
                  {/* User Msg */}
                  <div className="flex justify-end">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-tr-sm max-w-[85%]">
                      I want a white aesthetic PC for 4K gaming and streaming.
                      Budget is around ₹2.5L.
                    </div>
                  </div>

                  {/* AI Msg */}
                  <div className="flex justify-start">
                    <div className="bg-blue-50 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[95%] shadow-sm border border-blue-100">
                      <p className="mb-2 text-blue-800 font-medium">
                        I've designed the perfect "Snow White" build for you:
                      </p>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100">
                          <Cpu size={16} className="text-blue-500" />
                          <span className="font-bold">
                            Intel Core i9-14900K
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-100">
                          <Monitor size={16} className="text-purple-500" />
                          <span className="font-bold">RTX 4090 White OC</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <CheckCircle className="text-green-500" /> 100%
                        Compatible · 4K Ready
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="mt-2 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce delay-75"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce delay-150"></div>
                    <span className="ml-1">
                      AI is analyzing current prices...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Builder Section */}
      <section className="builder-section py-32 relative overflow-hidden bg-white">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="builder-content lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
                <Settings size={14} />
                Master Builder
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-gray-900">
                Total Control. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Limitless Possibilities.
                </span>
              </h2>
              <p className="text-gray-600 text-xl leading-relaxed mb-8">
                For the enthusiast who knows exactly what they want. Hand-pick
                every component from our curated selection of top-tier hardware.
                Our real-time engine ensures everything fits perfectly.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-blue-500" /> Over 500+ Premium
                  Parts
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-blue-500" /> Visual Assembly
                  Guide
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-blue-500" /> Real-time Wattage
                  Calculation
                </li>
              </ul>
              <Link
                to="/builder"
                className="inline-flex items-center gap-2 text-gray-900 font-bold border-b-2 border-gray-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors"
              >
                Open Custom Builder <ArrowRight size={18} />
              </Link>
            </div>

            <div className="builder-visual lg:w-1/2 relative">
              <div className="aspect-square rounded-full bg-gradient-to-tl from-blue-200 to-cyan-200 blur-[80px] absolute inset-0 animate-pulse opacity-60"></div>
              <div className="relative bg-white border border-gray-100 rounded-3xl p-6 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="font-bold text-gray-900">
                    Custom Configurator
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    ₹3,45,000
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                        <Cpu size={20} className="text-red-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          AMD Ryzen 9 7950X3D
                        </div>
                        <div className="text-xs text-gray-500">
                          16 Cores, 5.7 GHz
                        </div>
                      </div>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <CheckCircle
                        size={12}
                        fill="white"
                        className="text-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                        <Monitor size={20} className="text-green-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          ASUS ROG Strix RTX 4090
                        </div>
                        <div className="text-xs text-gray-500">24GB GDDR6X</div>
                      </div>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <CheckCircle
                        size={12}
                        fill="white"
                        className="text-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                        <Zap size={20} className="text-yellow-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          G.Skill Trident Z5 RGB
                        </div>
                        <div className="text-xs text-gray-500">
                          64GB (2x32GB) DDR5-6000
                        </div>
                      </div>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <CheckCircle
                        size={12}
                        fill="white"
                        className="text-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 bg-green-50 text-green-700 text-xs font-bold px-3 py-2 rounded-lg text-center border border-green-100">
                  All Parts Compatible
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4 text-gray-900">
              Crafted for Excellence
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Choose your path. We have specialized configurations for every
              discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CategoryCard
              title="Pro Gamer"
              image="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop"
              icon={<Gamepad2 className="text-white" />}
              color="from-blue-500 to-cyan-500"
            />
            <CategoryCard
              title="Content Creator"
              image="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop"
              icon={<PenTool className="text-white" />}
              color="from-purple-500 to-pink-500"
            />
            <CategoryCard
              title="Workstation"
              image="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2000&auto=format&fit=crop"
              icon={<Briefcase className="text-white" />}
              color="from-emerald-500 to-teal-500"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const CheckCircle = ({ className }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const FeatureCard = ({ icon, title, desc, gradient, border }) => (
  <div
    className={`feature-card p-8 rounded-3xl bg-white ${border ? border : "border-gray-100"} border hover:border-blue-200 transition-all duration-300 shadow-xl shadow-gray-200/50 relative overflow-hidden group hover:-translate-y-1`}
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
    ></div>
    <div className="relative z-10">
      <div className="mb-6 p-4 rounded-2xl bg-gray-50 inline-block border border-gray-100 shadow-sm text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm font-medium">
        {desc}
      </p>
    </div>
  </div>
);

const CategoryCard = ({ title, image, icon, color }) => (
  <div className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-2xl">
    <div className="absolute inset-0">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
    </div>
    <div className="absolute bottom-0 left-0 p-8 w-full">
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg text-white`}
      >
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1 transform group-hover:-translate-y-2 transition-transform duration-300">
        {title}
      </h3>
      <div className="h-1 w-12 bg-white/20 rounded-full group-hover:bg-white transition-colors duration-300"></div>
    </div>
  </div>
);

export default LandingPage;
