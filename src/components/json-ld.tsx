import { getJsonLd } from "@/lib/site";

export function JsonLd() {
  return (
    <script type="application/ld+json">{JSON.stringify(getJsonLd())}</script>
  );
}

