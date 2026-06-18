import Image from "next/image";
import { getCountryCode } from "@/utils/countryCodes";

type TeamLogoProps = {
  teamName: string;
  size?: number;
  className?: string;
};

export const TeamLogo = ({ teamName, size = 48, className = "" }: TeamLogoProps) => {
  const countryCode = getCountryCode(teamName);
  const isEmoji = teamName.match(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/);

  // If the string starts with an emoji, we can still fall back to text if we want,
  // but since we want to optimize with next/image, we extract the name if possible.
  const cleanName = isEmoji ? teamName.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]\s*/g, '').trim() : teamName;
  const code = getCountryCode(cleanName);

  return (
    <div 
      className={`relative rounded-full overflow-hidden border border-border shadow-sm flex items-center justify-center bg-card ${className}`}
      style={{ width: size, height: size }}
    >
      <Image 
        src={`https://flagcdn.com/w80/${code}.png`} 
        alt={`علم ${cleanName}`}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  );
};
