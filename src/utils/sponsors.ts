export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
}

export const sponsors: Sponsor[] = [
  {
    id: "absher",
    name: "أبشر",
    logoUrl: "/sponsors/absher.png",
    websiteUrl: "#"
  },
  {
    id: "remontada",
    name: "ريمونتادا",
    logoUrl: "/sponsors/remontada.png",
    websiteUrl: "#"
  }
];
