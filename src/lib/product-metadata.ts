export type ProductMetadata = {
  source: string;
  productTitle: string;
  productImageUrl: string | null;
  price: string | null;
  category: string | null;
};

export type ProductMetadataErrorCode =
  | "UNSUPPORTED_SOURCE"
  | "METADATA_UNAVAILABLE"
  | "FETCH_BLOCKED";

export class ProductMetadataError extends Error {
  code: ProductMetadataErrorCode;

  constructor(code: ProductMetadataErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const supportedSources = [
  ["Amazon", ["amazon.", "amzn.in"]],
  ["Flipkart", ["flipkart.", "fkrt.it"]],
  ["Meesho", ["meesho."]],
  ["Myntra", ["myntra."]],
  ["Ajio", ["ajio."]],
] as const;

export const detectProductSource = (productUrl: string) => {
  const normalized = productUrl.toLowerCase();
  const source = supportedSources.find(([, markers]) =>
    markers.some((marker) => normalized.includes(marker)),
  );

  return source?.[0] ?? null;
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

const getMetaContent = (html: string, property: string) => {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${escapedProperty}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+name=["']${escapedProperty}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${escapedProperty}["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapedProperty}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtmlEntities(match[1]);
    }
  }

  return null;
};

const getPageTitle = (html: string) => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  return match?.[1] ? decodeHtmlEntities(match[1].replace(/\s+/g, " ")) : null;
};

const extractAmazonAsin = (productUrl: string) => {
  const patterns = [/\/dp\/([A-Z0-9]{10})(?:[/?]|$)/i, /\/gp\/product\/([A-Z0-9]{10})(?:[/?]|$)/i];
  const pattern = patterns.find((item) => item.test(productUrl));
  const match = pattern ? productUrl.match(pattern) : null;

  return match?.[1]?.toUpperCase() ?? null;
};

const getCleanHostname = (productUrl: string) => {
  try {
    return new URL(productUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Product";
  }
};

export const createUrlFallbackTitle = (productUrl: string, category?: string | null) => {
  const hostname = getCleanHostname(productUrl);
  const categoryText = category ? ` - ${category}` : "";

  return `${hostname} Product${categoryText}`;
};

const isWeakTitle = (title: string, source: string) => {
  const normalized = title.trim().toLowerCase();
  const weakTitles = new Set([
    "amazon.in",
    "amazon",
    "online shopping site in india: shop online for mobiles, books, watches, shoes and more - amazon.in",
  ]);

  return (
    weakTitles.has(normalized) ||
    normalized === source.toLowerCase() ||
    normalized.length < 4
  );
};

const createFallbackTitle = (
  productUrl: string,
  source: string,
  category?: string | null,
) => {
  const asin = source === "Amazon" ? extractAmazonAsin(productUrl) : null;

  if (asin) {
    return `Amazon Product - ASIN ${asin}`;
  }

  return createUrlFallbackTitle(productUrl, category);
};

export const fetchProductMetadata = async (
  productUrl: string,
): Promise<ProductMetadata> => {
  let url: URL;

  try {
    url = new URL(productUrl);
  } catch {
    throw new ProductMetadataError(
      "METADATA_UNAVAILABLE",
      "Product URL is invalid.",
    );
  }

  const initialSource = detectProductSource(url.toString());

  if (!initialSource) {
    throw new ProductMetadataError(
      "UNSUPPORTED_SOURCE",
      "Unsupported source. Supported sources are Amazon, Flipkart, Meesho, Myntra, and Ajio.",
    );
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
  } catch {
    throw new ProductMetadataError(
      "FETCH_BLOCKED",
      "Could not fetch the product page. The site may be blocking server requests.",
    );
  }

  if (!response.ok) {
    throw new ProductMetadataError(
      "FETCH_BLOCKED",
      `Could not fetch the product page. The site returned ${response.status}.`,
    );
  }

  const resolvedUrl = response.url || url.toString();
  const source = detectProductSource(resolvedUrl) || initialSource;
  const html = await response.text();
  const rawProductTitle =
    getMetaContent(html, "og:title") ||
    getMetaContent(html, "twitter:title") ||
    getPageTitle(html);
  const productTitle =
    rawProductTitle && !isWeakTitle(rawProductTitle, source)
      ? rawProductTitle
      : createFallbackTitle(resolvedUrl, source);

  return {
    source,
    productTitle,
    productImageUrl:
      getMetaContent(html, "og:image") || getMetaContent(html, "twitter:image"),
    price: getMetaContent(html, "product:price:amount"),
    category: null,
  };
};
