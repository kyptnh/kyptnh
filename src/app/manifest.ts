import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Career Command Center",
    short_name: "Command",
    description: "Personal academic and career operating system",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f3ee",
    theme_color: "#1b1b18",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
