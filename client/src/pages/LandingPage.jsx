import { useRef } from "react";
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
  CheckCircle,
  Gamepad2,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const categoriesRef = useRef(null);
  const howItWorksRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.from(".hero-content > *", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
      });

      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      gsap.from(".category-card", {
        scrollTrigger: {
          trigger: categoriesRef.current,
          start: "top 75%",
        },
        scale: 0.9,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "back.out(1.7)",
      });

      gsap.from(".step-item", {
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-500 selection:text-white"
    >
      <Navbar />

      <div
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?q=80&w=2832&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-50 z-10"></div>
        </div>

        <div className="container relative z-20 px-4 mx-auto text-center hero-content">
          <div className="inline-block px-4 py-2 mb-6 border border-blue-500/30 rounded-full bg-blue-50/50 backdrop-blur-sm">
            <span className="text-blue-600 font-medium tracking-wide uppercase text-xs md:text-sm">
              Next Generation Performance
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
            BUILD YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              LEGACY
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-200 md:leading-relaxed mb-10 font-light">
            Experience the pinnacle of custom PC engineering. Meticulously
            crafted for gamers, creators, and professionals who demand nothing
            but the best.
          </p>
          <div className="flex flex-col md:flex-row gap-5 justify-center">
            <Link
              to="/products"
              className="group relative px-8 py-4 bg-gray-900 text-white font-bold text-lg rounded-xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Build{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </Link>
            <Link
              to="/ai-assistant"
              className="group px-8 py-4 bg-transparent border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 text-yellow-400" /> AI Recommendation
            </Link>
          </div>
        </div>
      </div>

      <section ref={featuresRef} className="py-24 bg-gray-50 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The Nexgen Advantage
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We don't just assemble parts. We engineer performance systems
              designed to last.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Cpu className="w-8 h-8 text-blue-600" />}
              title="Premium Components"
              desc="We strictly strictly use Tier-A components from trusted brands like ASUS, Corsair, and Samsung. No cheap knock-offs."
            />
            <FeatureCard
              icon={<Settings className="w-8 h-8 text-purple-600" />}
              title="Pro Assembly"
              desc="Expert cable management and thermal paste application ensures optimal airflow and lower temperatures."
            />
            <FeatureCard
              icon={<Monitor className="w-8 h-8 text-green-600" />}
              title="Stress Tested"
              desc="Every build undergoes a 24-hour rigorous burn-in test to guarantee stability under heavy loads."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-8 h-8 text-red-600" />}
              title="2-Year Warranty"
              desc="Comprehensive coverage for parts and labor. We stand behind our craftsmanship 100%."
            />
          </div>
        </div>
      </section>

      <section ref={categoriesRef} className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <span className="text-purple-600 font-semibold tracking-wider uppercase text-sm">
              Choose your weapon
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">
              Tailored for Every User
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CategoryCard
              title="The Pro Gamer"
              subtitle="Dominate the Leaderboard"
              icon={<Gamepad2 className="w-12 h-12 text-white" />}
              desc="Optimized for high refresh rates and ray-tracing. Experience your favorite AAA titles at ultra settings without dropping a frame."
              image="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop"
              accent="from-blue-600 to-cyan-500"
            />
            <CategoryCard
              title="The Creator"
              subtitle="Render Reality"
              icon={<PenTool className="w-12 h-12 text-white" />}
              desc="Multitasking beasts with high-core counts and massive RAM. Perfect for video editing, 3D modeling, and compiling code."
              image="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop"
              accent="from-purple-600 to-pink-500"
            />
            <CategoryCard
              title="The Office Core"
              subtitle="Efficient Reliability"
              icon={<Briefcase className="w-12 h-12 text-white" />}
              desc="Silent, energy-efficient, and reliable. Built to handle productivity tasks, spreadsheets, and meetings with zero downtime."
              image="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop"
              accent="from-emerald-600 to-teal-500"
            />
          </div>
        </div>
      </section>

      <section
        ref={howItWorksRef}
        className="py-24 bg-gray-50 border-t border-gray-200"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center relative space-y-12 md:space-y-0">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

            <StepItem
              n="1"
              title="Pick Your Parts"
              desc="Choose from our curated list or use our Builder."
              icon={<Cpu />}
            />
            <StepItem
              n="2"
              title="AI Optimization"
              desc="Our AI ensures 100% compatibility and value."
              icon={<Zap />}
            />
            <StepItem
              n="3"
              title="We Build"
              desc="Our experts assemble and test your machine."
              icon={<Settings />}
            />
            <StepItem
              n="4"
              title="Ship to You"
              desc="Securely packed and delivered to your doorstep."
              icon={<Truck />}
            />
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-blue-50/50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
            Ready to Ascend?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied builders who have elevated their setup
            with Nexgen.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gray-900 text-white font-bold text-xl rounded-full shadow-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
          >
            Start Your Configuration <ChevronRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:border-blue-100 transition-all duration-300">
    <div className="mb-6 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

const CategoryCard = ({ title, subtitle, icon, desc, image, accent }) => (
  <div className="category-card group relative h-[500px] rounded-3xl overflow-hidden cursor-pointer shadow-lg">
    <div className="absolute inset-0">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80"></div>
    </div>
    <div className="absolute inset-0 p-8 flex flex-col justify-end">
      <div
        className={
          "w-16 h-16 rounded-2xl bg-gradient-to-br " +
          accent +
          " flex items-center justify-center mb-6 transform group-hover:-translate-y-2 transition-transform duration-300 shadow-lg"
        }
      >
        {icon}
      </div>
      <h3 className="text-3xl font-bold text-white mb-1 group-hover:translate-x-2 transition-transform duration-300 drop-shadow-md">
        {title}
      </h3>
      <p
        className={
          "text-lg bg-clip-text text-transparent bg-gradient-to-r " +
          accent +
          " font-medium mb-4 drop-shadow-sm"
        }
      >
        {subtitle}
      </p>
      <p className="text-gray-200 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-100 font-medium drops-shadow-sm">
        {desc}
      </p>
    </div>
  </div>
);

const StepItem = ({ n, title, desc, icon }) => (
  <div className="step-item relative z-10 flex flex-col items-center text-center max-w-[250px]">
    <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-100 shadow-lg flex items-center justify-center text-gray-900 mb-6 group-hover:border-blue-500 transition-colors">
      {icon}
    </div>
    <div className="text-5xl font-black text-gray-200 absolute -top-10 -right-4 z-0 opacity-50 select-none">
      0{n}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">
      {title}
    </h3>
    <p className="text-sm text-gray-600 relative z-10">{desc}</p>
  </div>
);

export default LandingPage;
