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
  error?: string;
}

// Convenience type for a partial metadata object while we gather data.
type MetadataAccumulator = {
  title: string | null;
  price: string | null;
  images: Set<string>;
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
 * Fetch and parse product metadata from the provided URL.
 */
export async function fetchProductMetadata(url: string): Promise<ProductMetadata> {
  const metadata: MetadataAccumulator = {
    title: null,
    price: null,
    images: new Set<string>(),
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

    const images = extractImages($);
    images.forEach((imageUrl) => metadata.images.add(imageUrl));

    if (!metadata.price) {
      return {
        url,
        title: metadata.title,
        price: metadata.price,
        images: Array.from(metadata.images),
        error: "Price could not be determined from the page content.",
      };
    }

    return {
      url,
      title: metadata.title,
      price: metadata.price,
      images: Array.from(metadata.images),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred while fetching the page.";

    return {
      url,
      title: metadata.title,
      price: metadata.price,
      images: Array.from(metadata.images),
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
