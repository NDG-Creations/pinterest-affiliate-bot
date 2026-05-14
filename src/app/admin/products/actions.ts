"use server";

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CanvasRenderingContext2D } from "canvas";
import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

export type ProductFormState = {
  success?: string;
  errors?: {
    source?: string;
    productUrl?: string;
    productTitle?: string;
    form?: string;
  };
};

export type GeneratePinTextState = {
  success?: string;
  error?: string;
};

export type GeneratePinImageState = {
  success?: string;
  error?: string;
};

export type ProcessNextProductState = {
  success?: string;
  error?: string;
};

export type ProductProcessingSummary = {
  processed: number;
  failed: number;
  skipped: number;
};

export type BulkImportProductsState = {
  importedCount?: number;
  skippedDuplicatesCount?: number;
  failedRowsCount?: number;
  error?: string;
};

type ProductPinInput = {
  id: string;
  productTitle: string;
  category: string | null;
  source: string;
  price: string | null;
};

type ProductPinImageInput = {
  id: string;
  productTitle: string;
  productImageUrl: string | null;
  source: string;
  price: string | null;
};

type ProductQueueCandidate = ProductPinInput &
  ProductPinImageInput & {
    pinTitle: string | null;
    pinDescription: string | null;
    pinImageUrl: string | null;
    status: ProductStatus;
    updatedAt: Date;
  };

type GeneratedPinText = {
  pinTitle: string;
  pinDescription: string;
};

type AiProvider = "fallback" | "gemini" | "openai";

const getOptionalValue = (formData: FormData, key: string) => {
  const value = formData.get(key)?.toString().trim();

  return value ? value : null;
};

const detectProductSource = (value: string) => {
  const normalized = value.toLowerCase();

  if (normalized.includes("amazon")) {
    return "Amazon";
  }

  if (normalized.includes("flipkart")) {
    return "Flipkart";
  }

  if (normalized.includes("meesho")) {
    return "Meesho";
  }

  if (normalized.includes("myntra")) {
    return "Myntra";
  }

  if (normalized.includes("ajio")) {
    return "Ajio";
  }

  return "Unknown";
};

const isValidUrl = (value: string) => {
  try {
    new URL(value);

    return true;
  } catch {
    return false;
  }
};

const parseBulkProductRow = (row: string) => {
  const parts = row.split("|").map((part) => part.trim());

  if (parts.length >= 3) {
    const [source, productTitle, productUrl, price, category] = parts;

    if (!productTitle || !productUrl || !isValidUrl(productUrl)) {
      return null;
    }

    return {
      source: source || detectProductSource(productUrl),
      productTitle,
      productUrl,
      price: price || null,
      category: category || null,
    };
  }

  const productUrl = row.trim();

  if (!isValidUrl(productUrl)) {
    return null;
  }

  return {
    source: detectProductSource(productUrl),
    productTitle: productUrl,
    productUrl,
    price: null,
    category: null,
  };
};

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const source = formData.get("source")?.toString().trim() ?? "";
  const productUrl = formData.get("productUrl")?.toString().trim() ?? "";
  const productTitle = formData.get("productTitle")?.toString().trim() ?? "";

  const errors: ProductFormState["errors"] = {};

  if (!source) {
    errors.source = "Source is required.";
  }

  if (!productUrl) {
    errors.productUrl = "Product URL is required.";
  }

  if (!productTitle) {
    errors.productTitle = "Product title is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const existingProduct = await prisma.product.findUnique({
    where: { productUrl },
    select: { id: true },
  });

  if (existingProduct) {
    return {
      errors: {
        productUrl: "A product with this URL already exists.",
      },
    };
  }

  try {
    await prisma.product.create({
      data: {
        source,
        productUrl,
        productTitle,
        affiliateUrl: getOptionalValue(formData, "affiliateUrl"),
        productImageUrl: getOptionalValue(formData, "productImageUrl"),
        price: getOptionalValue(formData, "price"),
        category: getOptionalValue(formData, "category"),
        status: ProductStatus.NEW,
      },
    });

    return {
      success: "Product saved successfully.",
    };
  } catch {
    return {
      errors: {
        form: "Unable to save product. Please check your database connection and try again.",
      },
    };
  }
}

export async function bulkImportProducts(
  _previousState: BulkImportProductsState,
  formData: FormData,
): Promise<BulkImportProductsState> {
  const bulkInput = formData.get("bulkInput")?.toString() ?? "";
  const rows = bulkInput
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return { error: "Add at least one product row to import." };
  }

  let importedCount = 0;
  let skippedDuplicatesCount = 0;
  let failedRowsCount = 0;
  const seenUrls = new Set<string>();

  for (const row of rows) {
    const parsed = parseBulkProductRow(row);

    if (!parsed) {
      failedRowsCount += 1;
      continue;
    }

    if (seenUrls.has(parsed.productUrl)) {
      skippedDuplicatesCount += 1;
      continue;
    }

    seenUrls.add(parsed.productUrl);

    try {
      await prisma.product.create({
        data: {
          source: parsed.source,
          productUrl: parsed.productUrl,
          productTitle: parsed.productTitle,
          price: parsed.price,
          category: parsed.category,
          status: ProductStatus.NEW,
        },
      });
      importedCount += 1;
    } catch (error) {
      const message = getErrorMessage(error).toLowerCase();

      if (
        message.includes("unique") ||
        message.includes("producturl") ||
        message.includes("unique constraint")
      ) {
        skippedDuplicatesCount += 1;
      } else {
        console.error("Bulk import row failed:", error);
        failedRowsCount += 1;
      }
    }
  }

  revalidatePath("/admin/products");

  return {
    importedCount,
    skippedDuplicatesCount,
    failedRowsCount,
  };
}

const cleanGeneratedJson = (value: string) =>
  value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

const ensureAffiliateDisclosure = (description: string) => {
  if (description.toLowerCase().includes("affiliate link")) {
    return description;
  }

  return `${description.trim()} Affiliate link`;
};

const clampDescription = (description: string) => {
  const descriptionWithDisclosure = ensureAffiliateDisclosure(description);

  if (descriptionWithDisclosure.length <= 800) {
    return descriptionWithDisclosure;
  }

  const suffix = " Affiliate link";
  const maxBodyLength = 800 - suffix.length;
  const body = descriptionWithDisclosure
    .replace(/affiliate link/gi, "")
    .trim()
    .slice(0, maxBodyLength)
    .trim();

  return `${body}${suffix}`;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
};

const getAiProvider = (): AiProvider => {
  const provider = process.env.AI_PROVIDER?.toLowerCase();

  if (provider === "gemini" || provider === "openai") {
    return provider;
  }

  return "fallback";
};

const isQuotaOrRateLimitError = (error: unknown) => {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("rate-limit") ||
    message.includes("resource_exhausted")
  );
};

const createHashtag = (value: string) =>
  `#${value
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("")}`;

const generateFallbackPinText = (product: ProductPinInput): GeneratedPinText => {
  const category = product.category?.trim() || "must-have finds";
  const price = product.price?.trim();
  const priceText = price ? ` at ${price}` : "";
  const hashtags = [
    createHashtag(category),
    "#PinterestFinds",
    "#ShoppingInspo",
    "#AffiliateLink",
  ].join(" ");

  return {
    pinTitle: `${product.productTitle} for ${category}`,
    pinDescription: clampDescription(
      `Fresh find from ${product.source}: ${product.productTitle}${priceText}. A polished pick for ${category} with a trendy, practical feel. Affiliate link ${hashtags}`,
    ),
  };
};

const getPinTextPrompt = (product: ProductPinInput) => `
Create Pinterest pin text for an affiliate product.

Product details:
- Product title: ${product.productTitle}
- Category: ${product.category ?? "Not provided"}
- Source: ${product.source}
- Price: ${product.price ?? "Not provided"}

Requirements:
- Tone: trendy, professional, Pinterest-friendly.
- Return only JSON with these exact string fields: pinTitle, pinDescription.
- pinTitle should be concise and compelling.
- pinDescription must include relevant hashtags.
- pinDescription must be under 800 characters.
- pinDescription must include the exact disclosure text: "Affiliate link".
- Do not mention Pinterest API, scraping, or image generation.
`;

const parseGeneratedPinText = (text: string): GeneratedPinText => {
  const parsed = JSON.parse(cleanGeneratedJson(text)) as {
    pinTitle?: unknown;
    pinDescription?: unknown;
  };

  const pinTitle =
    typeof parsed.pinTitle === "string" ? parsed.pinTitle.trim() : "";
  const pinDescription =
    typeof parsed.pinDescription === "string"
      ? clampDescription(parsed.pinDescription.trim())
      : "";

  if (!pinTitle || !pinDescription) {
    throw new Error("Missing pinTitle or pinDescription");
  }

  return { pinTitle, pinDescription };
};

const generateGeminiPinText = async (
  product: ProductPinInput,
): Promise<GeneratedPinText> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(getPinTextPrompt(product));

  return parseGeneratedPinText(result.response.text());
};

const generateOpenAiPinText = async (
  product: ProductPinInput,
): Promise<GeneratedPinText> => {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: getPinTextPrompt(product),
      },
    ],
    response_format: {
      type: "json_object",
    },
    temperature: 0.7,
  });
  const text = completion.choices[0]?.message.content;

  if (!text) {
    throw new Error("OpenAI returned an empty response");
  }

  return parseGeneratedPinText(text);
};

const saveGeneratedPinText = async (
  productId: string,
  generatedPinText: GeneratedPinText,
) => {
  await prisma.product.update({
    where: { id: productId },
    data: {
      pinTitle: generatedPinText.pinTitle,
      pinDescription: generatedPinText.pinDescription,
      status: ProductStatus.GENERATED,
    },
  });

  revalidatePath("/admin/products");
};

const markProductGenerationFailed = async (productId: string) => {
  await prisma.product.update({
    where: { id: productId },
    data: {
      status: ProductStatus.FAILED,
    },
  });

  revalidatePath("/admin/products");
};

const generatePinTextForProduct = async (
  product: ProductPinInput,
): Promise<GeneratedPinText> => {
  const provider = getAiProvider();

  if (provider === "fallback") {
    console.info("AI provider used: fallback");

    return generateFallbackPinText(product);
  }

  if (provider === "gemini") {
    try {
      const generatedPinText = await generateGeminiPinText(product);

      console.info("AI provider used: gemini");

      return generatedPinText;
    } catch (error) {
      console.error("Gemini pin text generation failed:", error);

      if (isQuotaOrRateLimitError(error)) {
        console.info("AI provider used: fallback");
        console.info("Fallback pin text generator used.");

        return generateFallbackPinText(product);
      }

      throw new Error(`Gemini API request failed: ${getErrorMessage(error)}`);
    }
  }

  try {
    const generatedPinText = await generateOpenAiPinText(product);

    console.info("AI provider used: openai");

    return generatedPinText;
  } catch (error) {
    console.error("OpenAI pin text generation failed:", error);
    console.info("AI provider used: fallback");
    console.info("Fallback pin text generator used.");

    return generateFallbackPinText(product);
  }
};

const wrapCanvasText = (
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = context.measureText(testLine).width;

    if (width <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) => {
  const lines = wrapCanvasText(context, text, maxWidth).slice(0, maxLines);

  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
};

const drawProductImage = async (
  context: CanvasRenderingContext2D,
  productImageUrl: string,
) => {
  try {
    const { loadImage } = await import("canvas");
    const response = await fetch(productImageUrl);

    if (!response.ok) {
      return false;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const image = await loadImage(imageBuffer);
    const frame = { x: 120, y: 470, width: 760, height: 560 };
    const scale = Math.min(frame.width / image.width, frame.height / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const x = frame.x + (frame.width - width) / 2;
    const y = frame.y + (frame.height - height) / 2;

    context.save();
    drawRoundedRect(context, frame.x, frame.y, frame.width, frame.height, 42);
    context.clip();
    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
    context.drawImage(image, x, y, width, height);
    context.restore();

    return true;
  } catch (error) {
    console.error("Product image could not be loaded for pin image:", error);

    return false;
  }
};

const generatePinImageForProduct = async (product: ProductPinImageInput) => {
  const { createCanvas } = await import("canvas");
  const width = 1000;
  const height = 1500;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, width, height);

  gradient.addColorStop(0, "#17151f");
  gradient.addColorStop(0.45, "#3b1f4f");
  gradient.addColorStop(1, "#0f172a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalAlpha = 0.35;
  context.fillStyle = "#ff6fb1";
  context.beginPath();
  context.ellipse(790, 190, 310, 190, -0.35, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#38bdf8";
  context.beginPath();
  context.ellipse(130, 960, 260, 420, 0.45, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#facc15";
  context.beginPath();
  context.ellipse(780, 1180, 210, 160, 0.2, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.strokeStyle = "rgba(255, 255, 255, 0.16)";
  context.lineWidth = 4;
  for (let index = -3; index < 8; index += 1) {
    context.beginPath();
    context.moveTo(index * 180, 0);
    context.lineTo(index * 180 + 760, height);
    context.stroke();
  }

  const hasProductImage = product.productImageUrl
    ? await drawProductImage(context, product.productImageUrl)
    : false;

  if (!hasProductImage) {
    context.save();
    drawRoundedRect(context, 120, 470, 760, 560, 42);
    context.fillStyle = "rgba(255, 255, 255, 0.12)";
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.28)";
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = "rgba(255, 255, 255, 0.86)";
    context.font = "700 54px Arial";
    context.textAlign = "center";
    drawWrappedText(context, product.productTitle, width / 2, 710, 620, 66, 4);
    context.restore();
  }

  context.textAlign = "left";
  context.fillStyle = "#ffffff";
  context.font = "700 76px Arial";
  drawWrappedText(context, product.productTitle, 90, 150, 820, 88, 4);

  context.fillStyle = "rgba(255, 255, 255, 0.78)";
  context.font = "600 34px Arial";
  context.fillText(product.source, 90, 1100);

  if (product.price) {
    context.fillStyle = "#ffffff";
    context.font = "700 58px Arial";
    context.fillText(product.price, 90, 1170);
  }

  drawRoundedRect(context, 90, 1260, 360, 112, 56);
  context.fillStyle = "#ffffff";
  context.fill();
  context.fillStyle = "#15151f";
  context.font = "700 42px Arial";
  context.textAlign = "center";
  context.fillText("Shop Now", 270, 1330);

  const outputDirectory = path.join(process.cwd(), "public", "generated-pins");
  const fileName = `${product.id}-${Date.now()}-${randomUUID()}.png`;
  const publicPath = `/generated-pins/${fileName}`;

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    path.join(outputDirectory, fileName),
    canvas.toBuffer("image/png"),
  );

  return publicPath;
};

export async function generatePinText(
  _previousState: GeneratePinTextState,
  formData: FormData,
): Promise<GeneratePinTextState> {
  const productId = formData.get("productId")?.toString();

  if (!productId) {
    return { error: "Product id is required." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      productTitle: true,
      category: true,
      source: true,
      price: true,
    },
  });

  if (!product) {
    return { error: "Product not found." };
  }

  try {
    const generatedPinText = await generatePinTextForProduct(product);

    await saveGeneratedPinText(product.id, generatedPinText);

    return { success: "Pin text generated." };
  } catch (error) {
    console.error("Pin text generation failed:", error);
    await markProductGenerationFailed(product.id);

    return { error: getErrorMessage(error) };
  }
}

export async function generatePinImage(
  _previousState: GeneratePinImageState,
  formData: FormData,
): Promise<GeneratePinImageState> {
  const productId = formData.get("productId")?.toString();

  if (!productId) {
    return { error: "Product id is required." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      productTitle: true,
      productImageUrl: true,
      source: true,
      price: true,
    },
  });

  if (!product) {
    return { error: "Product not found." };
  }

  try {
    const publicPath = await generatePinImageForProduct(product);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        pinImageUrl: publicPath,
      },
    });

    revalidatePath("/admin/products");

    return { success: "Pin image generated." };
  } catch (error) {
    console.error("Pin image generation failed:", error);

    return { error: "Unable to generate pin image." };
  }
}

export async function processNextProduct(
  _previousState?: ProcessNextProductState,
): Promise<ProcessNextProductState> {
  void _previousState;
  console.info("Product queue: looking for next product.");

  const candidate = await prisma.product.findFirst({
    where: {
      status: {
        notIn: [ProductStatus.READY, ProductStatus.PUBLISHED],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      productTitle: true,
      productImageUrl: true,
      category: true,
      source: true,
      price: true,
      pinTitle: true,
      pinDescription: true,
      pinImageUrl: true,
      status: true,
      updatedAt: true,
    },
  });

  if (!candidate) {
    console.info("Product queue: no products need processing.");

    return { success: "No products need processing." };
  }

  const result = await processProductCandidate(candidate);

  if (result === "failed") {
    return { error: `Product processing failed: ${candidate.id}` };
  }

  if (result === "skipped") {
    return { success: "Another process already claimed the next product." };
  }

  revalidatePath("/admin/products");

  return { success: `Processed product ${candidate.id}.` };
}

const processProductCandidate = async (
  candidate: ProductQueueCandidate,
): Promise<"processed" | "failed" | "skipped"> => {
  console.info(`Product queue: checking product ${candidate.id}.`);

  const claim = await prisma.product.updateMany({
    where: {
      id: candidate.id,
      updatedAt: candidate.updatedAt,
    },
    data: {
      status:
        candidate.status === ProductStatus.NEW ||
        candidate.status === ProductStatus.FAILED
          ? ProductStatus.GENERATED
          : candidate.status,
    },
  });

  if (claim.count === 0) {
    console.info(`Product queue: product ${candidate.id} was already claimed.`);

    return "skipped";
  }

  console.info(`Product queue: claimed product ${candidate.id}.`);

  let pinTitle = candidate.pinTitle;
  let pinDescription = candidate.pinDescription;
  let pinImageUrl = candidate.pinImageUrl;

  try {
    if (!pinTitle || !pinDescription) {
      console.info(`Product queue: generating pin text for ${candidate.id}.`);
      const generatedPinText = await generatePinTextForProduct(candidate);

      pinTitle = generatedPinText.pinTitle;
      pinDescription = generatedPinText.pinDescription;

      await prisma.product.update({
        where: { id: candidate.id },
        data: {
          pinTitle,
          pinDescription,
          status: ProductStatus.GENERATED,
        },
      });
      console.info(`Product queue: pin text saved for ${candidate.id}.`);
    } else {
      console.info(`Product queue: pin text already exists for ${candidate.id}.`);
    }

    if (!pinImageUrl) {
      console.info(`Product queue: generating pin image for ${candidate.id}.`);
      pinImageUrl = await generatePinImageForProduct(candidate);

      await prisma.product.update({
        where: { id: candidate.id },
        data: {
          pinImageUrl,
        },
      });
      console.info(`Product queue: pin image saved for ${candidate.id}.`);
    } else {
      console.info(`Product queue: pin image already exists for ${candidate.id}.`);
    }

    if (pinTitle && pinDescription && pinImageUrl) {
      await prisma.product.update({
        where: { id: candidate.id },
        data: {
          status: ProductStatus.READY,
        },
      });
      console.info(`Product queue: product ${candidate.id} marked READY.`);
      console.info("Product marked READY");
    }

    return "processed";
  } catch (error) {
    console.error(`Product queue: processing failed for ${candidate.id}.`, error);
    await markProductGenerationFailed(candidate.id);

    return "failed";
  }
};

export async function processProductBatch(
  limit = 3,
): Promise<ProductProcessingSummary> {
  console.info(`Product queue: processing up to ${limit} products.`);

  const candidates = await prisma.product.findMany({
    where: {
      status: {
        notIn: [ProductStatus.READY, ProductStatus.PUBLISHED],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take: limit,
    select: {
      id: true,
      productTitle: true,
      productImageUrl: true,
      category: true,
      source: true,
      price: true,
      pinTitle: true,
      pinDescription: true,
      pinImageUrl: true,
      status: true,
      updatedAt: true,
    },
  });

  const summary: ProductProcessingSummary = {
    processed: 0,
    failed: 0,
    skipped: 0,
  };

  if (candidates.length === 0) {
    console.info("Product queue: no products need batch processing.");

    return summary;
  }

  for (const candidate of candidates) {
    const result = await processProductCandidate(candidate);

    if (result === "processed") {
      summary.processed += 1;
    }

    if (result === "failed") {
      summary.failed += 1;
    }

    if (result === "skipped") {
      summary.skipped += 1;
    }
  }

  console.info("Product queue: batch summary.", summary);
  revalidatePath("/admin/products");

  return summary;
}
