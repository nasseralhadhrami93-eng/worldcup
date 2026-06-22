import Image from "next/image";
import { sponsors } from "@/utils/sponsors";

export function Sponsors() {
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="w-full py-8 mt-12 relative">
      {/* Background soft glow for the entire section */}
      <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 uppercase tracking-widest text-center">
            شركاء النجاح
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-2 opacity-50 rounded-full"></div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-yellow-400/30 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] w-40 h-40 md:w-48 md:h-48"
            >
              {/* Image Container with inner glow */}
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <Image
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  width={150}
                  height={150}
                  className="object-contain filter transition-all duration-500 opacity-90 group-hover:opacity-100 group-hover:scale-105"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
