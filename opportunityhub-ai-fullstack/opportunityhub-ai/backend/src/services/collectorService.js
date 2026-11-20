/**
 * Integration boundary for approved opportunity sources.
 * Add one adapter per provider. Respect API terms, rate limits and attribution.
 * Never scrape pages in ways prohibited by the source.
 */
export async function collectFromConfiguredSources() {
  // Example future adapter contract:
  // return [{ type, title, organization, sourceUrl, applicationUrl, publishedAt, ... }]
  return {
    collected: 0,
    message: "No live source adapters configured. Demo opportunities are not live listings."
  };
}
