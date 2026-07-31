import { HiShieldCheck, HiCurrencyRupee, HiSupport, HiLightningBolt, HiCheckCircle } from 'react-icons/hi';

const About = () => (
  <div className="min-h-screen bg-[#F8FAFC]">
    {/* Hero Section */}
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] pt-24 pb-32">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5B4BFF] rounded-full blur-[128px] opacity-20"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold tracking-wide uppercase mb-6">
          <HiLightningBolt className="w-4 h-4 text-[#A78BFA]" />
          About Streamkart
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
          Redefining Digital <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#818CF8]">
            Subscriptions
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Streamkart is a premium digital subscription marketplace that connects buyers with sellers of top-tier digital services. From OTT platforms to AI tools, VPNs to educational resources — we bring the absolute best to your fingertips.
        </p>
      </div>
    </div>

    {/* Content Section */}
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Mission Card */}
        <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10 transition-transform duration-500 group-hover:scale-110"></div>
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <HiShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed text-[17px]">
            To democratize access to premium digital subscriptions by creating a trusted, completely secure marketplace where unrivaled quality meets absolute affordability.
          </p>
        </div>

        {/* Why Streamkart Card */}
        <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] -z-10 transition-transform duration-500 group-hover:scale-110"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            Why Choose Us?
          </h2>
          <div className="space-y-4">
            {[
              { icon: HiShieldCheck, text: "Verified sellers and authentic subscriptions", color: "text-emerald-500", bg: "bg-emerald-50" },
              { icon: HiCurrencyRupee, text: "Competitive pricing with exclusive deals", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: HiCheckCircle, text: "Secure payments via Razorpay", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: HiSupport, text: "24/7 dedicated customer support", color: "text-purple-500", bg: "bg-purple-50" },
              { icon: HiLightningBolt, text: "Lightning-fast, easy-to-use interface", color: "text-rose-500", bg: "bg-rose-50" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 group/item">
                <div className={`w-10 h-10 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-slate-700 font-medium text-[15px]">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default About;
