"use client";
import { motion } from "framer-motion";

export type PartnerLogo = { id: string; name: string; logoUrl: string };

export function LogoWall({ logos }: { logos: PartnerLogo[] }) {
  if (logos.length === 0) return null;

  return (
    <section className="relative py-0 md:py-1" data-testid="logo-wall">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <p className="text-left text-xl font-black text-zinc-900 mb-10">
          Top companies hiring on Jobtake
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
          <motion.div
            className="flex gap-14 pr-14 w-max items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 40, repeat: Infinity }}
          >
            {[...logos, ...logos].map((logo, i) => (
              <div key={`${logo.id}-${i}`} className="flex items-center justify-center h-11 flex-shrink-0">
                <img
                  src={logo.logoUrl}
                  alt={logo.name}
                  className="h-8 w-auto max-w-[150px] object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
