import { Link } from "react-router-dom";
import { ArrowRight, Cpu, ShieldCheck, Zap, Monitor } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen-75">
        <div
          className="absolute top-0 w-full h-full bg-center bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
          }}
        >
          <span
            id="blackOverlay"
            className="w-full h-full absolute opacity-75 bg-black"
          ></span>
        </div>
        <div className="container relative mx-auto ">
          <div className="items-center flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
              <div className="pr-12">
                <h1 className="text-white font-semibold text-5xl">
                  Craft Your Perfect Machine
                </h1>
                <p className="mt-4 text-lg text-gray-200">
                  Experience unparalleled performance with custom-built PCs
                  tailored to your needs. Quality components, expert support.
                </p>
                <div className="mt-8">
                  <Link
                    to="/products"
                    className="bg-gray-900 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110"
                  >
                    Build Your Dream PC
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="pb-20 bg-gray-50 -mt-24 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-gray-900">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h6 className="text-xl font-semibold">
                    AI-Powered Recommendations
                  </h6>
                  <p className="mt-2 mb-4 text-gray-500">
                    Our smart assistant suggests the best components based on
                    your needs and budget.
                  </p>
                  <Link
                    to="/ai-assistant"
                    className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
                  >
                    Try AI Assistant &rarr;
                  </Link>
                </div>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-gray-900">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h6 className="text-xl font-semibold">
                    Real-Time Compatibility
                  </h6>
                  <p className="mt-2 mb-4 text-gray-500">
                    Instantly verify that all your chosen parts work together
                    seamlessly.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                <div className="px-4 py-5 flex-auto">
                  <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-gray-900">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <h6 className="text-xl font-semibold">
                    Expert Support & Guidance
                  </h6>
                  <p className="mt-2 mb-4 text-gray-500">
                    Get help from our team of experienced builders every step of
                    the way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center mt-16">
            <div className="w-full md:w-5/12 px-4 mr-auto ml-auto">
              <div className="text-gray-500 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-gray-100">
                <Cpu className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-3xl mb-2 font-semibold leading-normal">
                Not Ready to Build? Discover Your Perfect PC.
              </h3>
              <p className="text-lg font-light leading-relaxed mt-4 mb-4 text-gray-600">
                Explore our curated selection of high-performance pre-built
                systems or get inspired by builds from our community.
              </p>
              <div className="flex gap-4 mt-8">
                <Link
                  to="/products"
                  className="bg-gray-900 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
                >
                  Explore Pre-Built
                </Link>
                <Link
                  to="/community"
                  className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
                >
                  See Community Builds
                </Link>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 mr-auto ml-auto">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-900">
                <img
                  alt="..."
                  src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  className="w-full align-middle rounded-t-lg"
                />
                <blockquote className="relative p-8 mb-4">
                  <svg
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 583 95"
                    className="absolute left-0 w-full block h-95-px top-28"
                  >
                    <polygon
                      points="-30,95 583,95 583,65"
                      className="text-gray-100 fill-current"
                    ></polygon>
                  </svg>
                  <h4 className="text-xl font-bold text-white">
                    Top Notch Services
                  </h4>
                  <p className="text-md font-light mt-2 text-white">
                    The Arctic Ocean freezes every winter and much of the
                    sea-ice then thaws every summer, and that process will
                    continue whatever happens.
                  </p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
