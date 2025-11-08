/*
 * Utility to fetch and parse product metadata from a given URL.
 * Uses axios for HTTP requests and cheerio for HTML parsing.
 */
import axios from "axios";
import * as cheerio from "cheerio";

// Define the shape of the metadata we return.
export interface ProductMetadata {
  url: string;
  title: string | null;
  price: string | null;
  images: string[];
  store: string | null;
  storeLogo: string | null;
  error?: string;
}

// Convenience type for a partial metadata object while we gather data.
type MetadataAccumulator = {
  title: string | null;
  price: string | null;
  images: Set<string>;
  store: string | null;
  storeLogo: string | null;
};

/**
 * Extract the most relevant title from the provided Cheerio document.
 */
function extractTitle($: cheerio.CheerioAPI): string | null {
  const ogTitle = $('meta[property="og:title"]').attr("content");
  if (ogTitle && ogTitle.trim()) {
    return ogTitle.trim();
  }

  const twitterTitle = $('meta[name="twitter:title"]').attr("content");
  if (twitterTitle && twitterTitle.trim()) {
    return twitterTitle.trim();
  }

  const documentTitle = $("title").first().text();
  if (documentTitle && documentTitle.trim()) {
    return documentTitle.trim();
  }

  return null;
}

/**
 * Extract the product price by checking common metadata fields and text patterns.
 */
function extractPrice($: cheerio.CheerioAPI): string | null {
  const priceMetaSelectors = [
    'meta[property="product:price:amount"]',
    'meta[itemprop="price"]',
    'meta[name="price"]',
    'meta[property="og:price:amount"]',
  ];

  for (const selector of priceMetaSelectors) {
    const content = $(selector).attr("content");
    if (content && content.trim()) {
      const currency =
        $('meta[property="product:price:currency"]').attr("content") ||
        $('meta[itemprop="priceCurrency"]').attr("content") ||
        $('meta[property="og:price:currency"]').attr("content") ||
        "";
      const formattedCurrency = currency ? `${currency} ` : "";
      return `${formattedCurrency}${content.trim()}`.trim();
    }
  }

  const priceElementSelectors = [
    '[itemprop="price"]',
    '[class*="price"]',
    '[id*="price"]',
    '[data-price]'
  ];

  for (const selector of priceElementSelectors) {
    const elements = $(selector);
    for (const element of elements.toArray()) {
      const priceCandidate =
        $(element).attr("content") ||
        $(element).attr("data-price") ||
        $(element).text();

      if (!priceCandidate) {
        continue;
      }

      const match = priceCandidate
        .replace(/\s+/g, " ")
        .match(/[€£$¥₹]\s*\d+[\d,.\s]*/);
      if (match) {
        return match[0].trim();
      }

      // Fallback: detect plain numeric values when a currency symbol is not present
      const plainNumberMatch = priceCandidate
        .replace(/\s+/g, " ")
        .match(/\d+[\d,.]*/);
      if (plainNumberMatch && plainNumberMatch[0]) {
        return plainNumberMatch[0].trim();
      }
    }
  }

  const bodyText = $("body").text();
  const bodyMatch = bodyText.match(/[€£$¥₹]\s*\d+[\d,.\s]*/);
  if (bodyMatch) {
    return bodyMatch[0].trim();
  }

  return null;
}

/**
 * Extract image URLs from Open Graph metadata and large <img> elements.
 */
function extractImages($: cheerio.CheerioAPI): string[] {
  const images = new Set<string>();

  const ogImageSelectors = [
    'meta[property="og:image"]',
    'meta[property="og:image:url"]',
    'meta[property="og:image:secure_url"]'
  ];

  for (const selector of ogImageSelectors) {
    const content = $(selector).attr("content");
    if (content) {
      images.add(content);
    }
  }

  $("img").each((_, element) => {
    const src = $(element).attr("src") || $(element).attr("data-src");
    if (!src) {
      return;
    }

    const width = Number($(element).attr("width"));
    const height = Number($(element).attr("height"));
    const isLarge = !Number.isNaN(width) && !Number.isNaN(height)
      ? width >= 300 || height >= 300
      : true;

    if (isLarge) {
      images.add(src);
    }
  });

  return Array.from(images);
}

/**
 * Extract store/site name from the URL and metadata.
 */
function extractStoreName($: cheerio.CheerioAPI, url: string): string | null {
  // Try Open Graph site name
  const ogSiteName = $('meta[property="og:site_name"]').attr("content");
  if (ogSiteName && ogSiteName.trim()) {
    return ogSiteName.trim();
  }

  // Try application name
  const appName = $('meta[name="application-name"]').attr("content");
  if (appName && appName.trim()) {
    return appName.trim();
  }

  // Extract from domain
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // Capitalize first letter
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  } catch {
    // Invalid URL, continue
  }

  return null;
}

/**
 * Extract store logo from the page.
 */
function extractStoreLogo($: cheerio.CheerioAPI, url: string): string | null {
  // Try various logo selectors
  const logoSelectors = [
    'meta[property="og:logo"]',
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'img[class*="logo"]',
    'img[id*="logo"]',
    '.logo img',
    '#logo img'
  ];

  for (const selector of logoSelectors) {
    const element = $(selector).first();
    const logoUrl = element.attr("content") || element.attr("href") || element.attr("src");

    if (logoUrl && logoUrl.trim()) {
      // Make absolute URL if relative
      try {
        const absoluteUrl = new URL(logoUrl, url).href;
        return absoluteUrl;
      } catch {
        // If URL construction fails, return as is if it looks like a valid URL
        if (logoUrl.startsWith('http')) {
          return logoUrl;
        }
      }
    }
  }

  return null;
}

/**
 * Fetch and parse product metadata from the provided URL.
 */
export async function fetchProductMetadata(url: string): Promise<ProductMetadata> {
  const metadata: MetadataAccumulator = {
    title: null,
    price: null,
    images: new Set<string>(),
    store: null,
    storeLogo: null,
  };

  try {
    const response = await axios.get<string>(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    metadata.title = extractTitle($);
    metadata.price = extractPrice($);
    metadata.store = extractStoreName($, url);
    metadata.storeLogo = extractStoreLogo($, url);

    const images = extractImages($);
    images.forEach((imageUrl) => metadata.images.add(imageUrl));

    if (!metadata.price) {
      return {
        url,
        title: metadata.title,
        price: metadata.price,
        images: Array.from(metadata.images),
        store: metadata.store,
        storeLogo: metadata.storeLogo,
        error: "Price could not be determined from the page content.",
      };
    }

    return {
      url,
      title: metadata.title,
      price: metadata.price,
      images: Array.from(metadata.images),
      store: metadata.store,
      storeLogo: metadata.storeLogo,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred while fetching the page.";

    return {
      url,
      title: metadata.title,
      price: metadata.price,
      images: Array.from(metadata.images),
      store: metadata.store,
      storeLogo: metadata.storeLogo,
      error: message,
    };
  }
}

// Allow running the script directly via the command line.
if (require.main === module) {
  const [, , inputUrl] = process.argv;

  if (!inputUrl) {
    console.error("Usage: ts-node fetchProductMetadata.ts <product-url>");
    process.exit(1);
  }

  fetchProductMetadata(inputUrl)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error("Error fetching product metadata:", err instanceof Error ? err.message : err);
      process.exit(1);
    });
}
