"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { FaReact, FaFigma } from "react-icons/fa";
import {
  TbBrandNextjs,
  TbBrandJavascript,
  TbBrandTailwind,
} from "react-icons/tb";
import { SiThreedotjs, SiTypescript, SiBlender } from "react-icons/si";

const sectionIds = ["intro", "work", "toolkit", "connect"];

// حالا آرایه رو اینجوری آپدیت کن
const toolkit = [
  { name: "React", icon: <FaReact /> },
  { name: "Next.js", icon: <TbBrandNextjs /> },
  { name: "Three.js", icon: <SiThreedotjs /> },
  { name: "TypeScript", icon: <SiTypescript /> },
  { name: "Blender", icon: <SiBlender /> },
  { name: "Figma", icon: <FaFigma /> },
  { name: "JavaScript", icon: <TbBrandJavascript /> },
  { name: "Tailwind CSS", icon: <TbBrandTailwind /> },
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const isAnimating = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const scrollThreshold = useRef(0);

  useEffect(() => {
    // یک تایمر درست می‌کنیم که هر ۲۵ میلی‌ثانیه اجرا بشه
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        // اگه به ۱۰۰ رسیدیم، تایمر رو متوقف کن
        if (oldProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        // در غیر این صورت، یکی به درصد اضافه کن
        return Math.min(oldProgress + 1, 100);
      });
    }, 25); // این عدد سرعت لود رو کنترل میکنه. کمترش کنی سریع‌تر میشه

    // این تابع موقعی که کامپوننت بسته بشه اجرا میشه تا از مصرف بیهوده منابع جلوگیری کنه
    return () => {
      clearInterval(timer);
    };
  }, []); // [] یعنی این افکت فقط یک بار بعد از اولین رندر اجرا بشه

  // یک افکت دیگه برای اینکه بعد از رسیدن به ۱۰۰٪، صفحه لودینگ محو بشه
  useEffect(() => {
    if (progress === 100) {
      // یه نیم ثانیه صبر می‌کنیم تا کاربر عدد ۱۰۰ رو ببینه، بعد صفحه اصلی رو نشون میدیم
      setTimeout(() => setLoading(false), 500);
    }
  }, [progress]);
  // تابع انیمیشن سریع و بدون تاخیر
  const animateToSection = useCallback(
    (targetIndex: number) => {
      if (
        targetIndex === currentSection ||
        targetIndex < 0 ||
        targetIndex >= sectionIds.length
      ) {
        return;
      }

      // اینجا از isAnimating.current استفاده می‌کنیم
      isAnimating.current = true;
      setCurrentSection(targetIndex);

      const container = containerRef.current;
      if (!container) return;

      const translateY = -targetIndex * 100;
      container.style.transform = `translateY(${translateY}vh)`;

      setTimeout(() => {
        // و اینجا هم همینطور
        isAnimating.current = false;
      }, 700); // زمان انیمیشن رو ۷۰۰ میلی‌ثانیه در نظر گرفتیم
    },
    [currentSection],
  ); // دیگه به isAnimating وابسته نیست

  // تشخیص سریع scroll direction
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (isAnimating.current) return;

      const now = performance.now();
      const timeDelta = now - lastScrollTime.current;

      // Reset threshold اگر زمان زیادی گذشته
      if (timeDelta > 100) {
        scrollThreshold.current = 0;
      }

      scrollThreshold.current += e.deltaY;
      lastScrollTime.current = now;

      // Threshold کوچکتر برای واکنش سریع‌تر
      const threshold = 160;

      if (Math.abs(scrollThreshold.current) > threshold) {
        if (scrollThreshold.current > 0) {
          animateToSection(currentSection + 1);
        } else {
          animateToSection(currentSection - 1);
        }
        scrollThreshold.current = 0;
      }
    },
    [currentSection, isAnimating, animateToSection],
  );

  // Touch handling سریع
  const [touchStart, setTouchStart] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart || isAnimating.current) return;

    const touchEnd = e.changedTouches[0].clientY;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 30; // کمتر کردم

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        animateToSection(currentSection + 1);
      } else {
        animateToSection(currentSection - 1);
      }
    }

    setTouchStart(0);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isAnimating.current) return;

      switch (e.key) {
        case "ArrowDown":
        case " ":
          e.preventDefault();
          animateToSection(currentSection + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          animateToSection(currentSection - 1);
          break;
        case "Home":
          e.preventDefault();
          animateToSection(0);
          break;
        case "End":
          e.preventDefault();
          animateToSection(sectionIds.length - 1);
          break;
      }
    },
    [currentSection, isAnimating, animateToSection],
  );

  // Event listeners
  useEffect(() => {
    const container = document.body;

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  // Theme toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // تنظیم ارتفاع و overflow
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
  }, [isDark]);

  const scrollToSection = useCallback(
    (sectionIndex: number) => {
      animateToSection(sectionIndex);
    },
    [animateToSection],
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 transition-opacity duration-500">
        <div className="text-5xl lg:text-7xl font-light tracking-tighter text-foreground">
          {progress}
          <span className="text-2xl lg:text-4xl text-muted-foreground">%</span>
        </div>
        <div className="w-48 h-1 mt-4 bg-muted-foreground/20 rounded-full overflow-hidden">
          <div
            className="h-1 bg-foreground rounded-full transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-transparent text-foreground">
      {/* Navigation */}
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {sectionIds.map((section, index) => (
            <button
              key={section}
              onClick={() => scrollToSection(index)}
              className={`w-2 h-12 rounded-full transition-all duration-300 hover:scale-110 ${
                currentSection === index
                  ? "bg-foreground shadow-lg transform scale-110"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Navigate to ${section}`}
            >
              <span className="sr-only">{section}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Container که slide میکنه */}
      <div
        ref={containerRef}
        className="w-full transition-transform duration-700 ease-in-out"
        style={{
          height: `${sectionIds.length * 100}vh`,
          transform: `translateY(-${currentSection * 100}vh)`,
        }}
      >
        {/* Header Section */}
        <section className="h-screen flex items-center max-w-4xl mx-auto px-8 lg:px-16">
          <div className="grid lg:grid-cols-5 gap-16 w-full">
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground font-mono tracking-wider animate-pulse">
                  PORTFOLIO / 2025
                </div>
                <h1 className="text-6xl lg:text-7xl font-normal tracking-tight">
                  Pouya
                  <br />
                  <span className="text-muted-foreground hover:text-foreground transition-colors duration-700">
                    Sadeghpoor
                  </span>
                </h1>
              </div>
              <div className="space-y-6 max-w-md">
                <p className="text-xl text-justify text-muted-foreground leading-relaxed">
                  Front End Developer and 3d Artist , I Want To Make Web To A
                  Better Place , I Use
                  <span className="text-foreground font-semibold"> Three</span>,
                  <span className="text-foreground font-semibold"> Js</span>,
                  and
                  <span className="text-foreground font-semibold">
                    {" "}
                    React Js
                  </span>
                  .
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Available for work
                  </div>
                  <div>Dubai, UAE</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col justify-end space-y-8">
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">
                  CURRENTLY
                </div>
                <div className="space-y-2">
                  <div className="text-foreground">
                    Senior Frontend Engineer
                  </div>
                  <div className="text-muted-foreground">@FreeLancer</div>
                  <div className="text-xs text-muted-foreground">
                    2021 — FreeLancer
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground font-mono">
                  FOCUS
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "TypeScript",
                    "Next.js",
                    "3D and CGI",
                    "AI/ML",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs border border-border rounded-full bg-transparent hover:border-muted-foreground/50 hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Work Section */}
        <section className="h-screen flex items-center max-w-4xl mx-auto px-8 lg:px-16">
          <div className="space-y-16 w-full">
            <div className="flex items-end justify-between">
              <h2 className="text-4xl font-light">Selected Work</h2>
              <div className="text-sm text-muted-foreground font-mono">
                2021 — 2025
              </div>
            </div>
            <div className="space-y-12">
              {[
                {
                  year: "2023",
                  role: "Senior Frontend Engineer",
                  company: "AmixCGI",
                  description:
                    "Leading frontend architecture for developer tools and AI-powered features For Local Tools.",
                  tech: ["React", "TypeScript", "Next.js"],
                },
                {
                  year: "2021",
                  role: "3D Artist and CGI Maker",
                  company: "Freelancer",
                  description:
                    "Built Interactive CGI and 3D Projects For Brands And Advertisement Videos In Social Medias.",
                  tech: ["Unreal", "Blender", "Syntheye"],
                },
              ].map((job, index) => (
                <div
                  key={index}
                  className="group grid lg:grid-cols-12 gap-8 py-8 border-b border-border/50 hover:border-border transition-all duration-700 bg-transparent hover:bg-muted/5 rounded-lg hover:px-4"
                >
                  <div className="lg:col-span-2">
                    <div className="text-2xl font-light text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all duration-700">
                      {job.year}
                    </div>
                  </div>
                  <div className="lg:col-span-6 space-y-3">
                    <div>
                      <h3 className="text-xl font-medium group-hover:text-primary transition-colors duration-500">
                        {job.role}
                      </h3>
                      <div className="text-muted-foreground">{job.company}</div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-lg group-hover:text-foreground/80 transition-colors duration-500">
                      {job.description}
                    </p>
                  </div>
                  <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end">
                    {job.tech.map((tech, techIndex) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs text-muted-foreground h-max rounded bg-transparent group-hover:border border-muted-foreground/30 group-hover:scale-105 transition-all duration-500"
                        style={{ transitionDelay: `${techIndex * 100}ms` }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Toolkit Section */}
        <section
          id="toolkit"
          className="h-screen flex items-center max-w-4xl mx-auto px-8 lg:px-16"
        >
          <div className="space-y-16 w-full">
            <h2 className="text-4xl font-light">My Toolkit</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {toolkit.map((tool) => (
                <div
                  key={tool.name}
                  className="group flex flex-col items-center justify-center gap-4 p-6 border border-border rounded-lg bg-transparent hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:scale-105"
                >
                  <div className="text-4xl text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    {tool.icon}
                  </div>
                  <span className="text-foreground font-medium">
                    {tool.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Connect Section */}
        <section className="h-screen flex items-center max-w-4xl mx-auto px-8 lg:px-16">
          <div className="w-full">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <h2 className="text-4xl font-light">Let's Connect</h2>
                <div className="space-y-6">
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Always interested in new opportunities, collaborations, and
                    conversations about technology and design.
                  </p>
                  <div className="space-y-4">
                    <Link
                      href="mailto:pouyasadeghpoor@outlook.com"
                      className="group flex items-center gap-3 text-foreground hover:text-primary transition-all duration-500 hover:scale-105"
                    >
                      <span className="text-lg">
                        pouyasadeghpoor@outlook.com
                      </span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-2 group-hover:scale-110 transition-all duration-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="text-sm text-muted-foreground font-mono">
                  ELSEWHERE
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "GitHub", handle: "@Pouya_sadeghpoor", url: "#" },
                    { name: "Twitter", handle: "@Pouya_sadeghpoor", url: "#" },
                    { name: "LinkedIn", handle: "Pouya_sadeghpoor", url: "#" },
                    { name: "Dribbble", handle: "Pouya_sadeghpoor", url: "#" },
                  ].map((social, index) => (
                    <Link
                      key={social.name}
                      href={social.url}
                      className="group p-4 border border-border rounded-lg bg-transparent hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 hover:scale-105"
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="space-y-2">
                        <div className="text-foreground group-hover:text-primary transition-colors duration-500">
                          {social.name}
                        </div>
                        <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-500">
                          {social.handle}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-16 mt-16 border-t border-border">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    © 2025 Pouya Sadeghpoor. All rights reserved.
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Built with Next.js and deployed on Vercel
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="https://t.me/PouyaSadeghpoor"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Connect on Telegram" // برای دسترسی‌پذیری بهتر
                  >
                    <div className="group p-3 rounded-lg border border-border bg-transparent hover:border-primary/50 hover:shadow-lg transition-all duration-500 hover:scale-110 cursor-pointer">
                      <svg
                        className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </div>
  );
}
