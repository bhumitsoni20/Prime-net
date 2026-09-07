import { useEffect } from "react";
import { motion } from "framer-motion";
import DotField from "../../components/ui/DotField";

/**
 * StreamKart Production Maintenance Mode Page
 * Completely unscrollable single-viewport design, true transparent /repair.gif animation,
 * dark defined DotField background, and SEO noindex tags.
 */
const Maintenance = () => {
  // Update Document Title and SEO robots tag on mount and cleanup on unmount
  useEffect(() => {
    const originalTitle = document.title;
    document.title = "StreamKart — Under Maintenance";

    // Set or update meta description
    let descMeta = document.querySelector('meta[name="description"]');
    const originalDesc = descMeta ? descMeta.getAttribute("content") : "";
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute(
      "content",
      "StreamKart is currently undergoing maintenance. We'll be back soon with something big.",
    );

    // Set or update meta robots tag to prevent indexing during maintenance
    let robotsMeta = document.querySelector('meta[name="robots"]');
    const createdRobotsMeta = !robotsMeta;
    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }
    const originalRobots = robotsMeta.getAttribute("content") || "";
    robotsMeta.setAttribute("content", "noindex, nofollow");

    return () => {
      document.title = originalTitle;
      if (descMeta && originalDesc) {
        descMeta.setAttribute("content", originalDesc);
      }
      if (robotsMeta) {
        if (createdRobotsMeta) {
          robotsMeta.remove();
        } else {
          robotsMeta.setAttribute("content", originalRobots);
        }
      }
    };
  }, []);

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-between bg-[#FFFFFF] text-[#0F172A] overflow-hidden font-['Inter',sans-serif] px-4 sm:px-6 lg:px-8 py-4 sm:py-6 selection:bg-[#EDE9FE] selection:text-[#5B4BFF]">
      {/* React Bits Interactive Dot Field Canvas Background with darker defined dots */}
      <DotField
        dotRadius={1.4}
        dotSpacing={18}
        cursorRadius={280}
        bulgeStrength={28}
        glowRadius={100}
        sparkle={false}
        waveAmplitude={0}
        gradientFrom="rgba(109, 40, 217, 0.45)"
        gradientTo="rgba(91, 75, 255, 0.40)"
      />

      {/* Spacer */}
      <div className="w-full h-1" aria-hidden="true" />

      {/* Main Central Content Area - Centered & Compact */}
      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center my-auto py-2">
        {/* Central Repair Animation (repair.gif) with native transparent background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-3 sm:mb-4 flex items-center justify-center"
        >
          <img
            src="/repair.gif"
            alt="StreamKart is under maintenance"
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 object-contain select-none pointer-events-none"
            loading="eager"
          />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-snug mb-1.5 sm:mb-2"
        >
          StreamKart is under maintenance
        </motion.h1>

        {/* Highlight Text */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#5B4BFF] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent mb-2 sm:mb-2.5 max-w-lg"
        >
          We'll be back soon with something big.
        </motion.p>

        {/* Supporting Description */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: "easeOut" }}
          className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-sm sm:max-w-md md:max-w-lg px-2"
        >
          We're making a few improvements behind the scenes to bring you a
          better StreamKart experience.
        </motion.p>
      </div>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full text-center text-[11px] text-[#94A3B8] font-medium pb-1">
        &copy; {new Date().getFullYear()} StreamKart. All rights reserved.
      </footer>
    </main>
  );
};

export default Maintenance;
