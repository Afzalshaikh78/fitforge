import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["stronger", "leaner", "faster", "unstoppable", "legendary"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="secondary"
              size="sm"
              className="gap-3 bg-[rgba(232,255,69,0.1)] text-[#e8ff45] border border-[rgba(232,255,69,0.25)] hover:bg-[rgba(232,255,69,0.18)] rounded-full px-5 font-semibold tracking-widest uppercase text-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-[#e8ff45]" />
              The ultimate fitness platform
            </Button>
          </motion.div>

          {/* Headline */}
          <motion.div
            className="flex gap-3 flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-[110px] max-w-4xl tracking-tighter text-center font-display leading-none uppercase text-[#f0f0f0]">
              <span className="block">Forge your</span>

              {/* Animated cycling word */}
              <span className="relative flex w-full justify-center overflow-hidden text-center pb-3 pt-1 h-[1.1em]">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-display text-[#e8ff45]"
                    initial={{ opacity: 0, y: 80 }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : {
                            y: titleNumber > index ? -100 : 100,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>

              <span className="block">body</span>
            </h1>

            <motion.p
              className="text-lg md:text-xl leading-relaxed tracking-tight text-[#666] max-w-2xl text-center mx-auto mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Track calories, crush workouts, and follow expert meal plans —
              all in one platform built for serious athletes.
            </motion.p>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-row gap-3 flex-wrap justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-3 border-[#2a2a2a] text-[#888] hover:text-[#f0f0f0] hover:border-[#444] bg-transparent hover:bg-[#111] h-12 px-7"
            >
              <Link to="/pricing">
                View plans <MoveRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              className="gap-3 bg-[#e8ff45] text-[#0a0a0a] hover:bg-[#d4eb3a] font-semibold h-12 px-7 rounded-md"
            >
              <Link to="/register">
                Start training free <MoveRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Fine print */}
          <motion.p
            className="text-xs text-[#444] tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            No credit card required · Free forever plan available
          </motion.p>

          {/* Stats row */}
          <motion.div
            className="flex gap-12 flex-wrap justify-center mt-4 pt-10 border-t border-[#1a1a1a] w-full max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {[
              { value: "50K+", label: "Active athletes" },
              { value: "2M+", label: "Workouts logged" },
              { value: "98%", label: "Goal achievement" },
              { value: "4.9★", label: "User rating" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-4xl text-[#e8ff45] tracking-wide leading-none">
                  {value}
                </div>
                <div className="text-[11px] text-[#444] uppercase tracking-widest mt-1.5">
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
