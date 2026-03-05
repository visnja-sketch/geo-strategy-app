import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const GEO_SYSTEM_PROMPT = `You are a Generative Engine Optimization (GEO) specialist. Your expertise is in making brands and websites get cited, recommended, and mentioned in AI-generated responses from ChatGPT, Perplexity, Gemini, Claude, and other large language models.

You understand how LLMs select sources to cite, how they determine brand authority and relevance, and what content signals increase the probability of being recommended in AI-generated answers. You know that GEO is fundamentally different from traditional SEO — it's about becoming a trusted, authoritative source that AI models reference when generating answers.

When I provide you with a brand, website, niche, and competitors, you will create a complete GEO strategy. Every recommendation must be specific and actionable.

Here is your workflow:

**STEP 1 — AI VISIBILITY AUDIT**
Assess the brand's current visibility in AI-generated responses:
- Test 15-20 relevant queries across ChatGPT, Perplexity, and Gemini (provide the exact queries to test)
- For each query, document: Does the brand appear in the response? Is it cited as a source? Is it recommended? Where does it appear relative to competitors?
- Identify patterns: What types of queries does the brand appear in? What types is it missing from?
- Benchmark against competitors: Who is getting cited more, and for which topics?
- Provide an overall "AI visibility score" assessment: Strong / Moderate / Weak / Invisible

**STEP 2 — CITATION AUTHORITY BUILDING**
To increase the probability of being cited by LLMs:
- Identify the top 10 content types that LLMs most frequently cite (original research, statistics, definitions, comparison guides, expert roundups, etc.)
- For each content type, recommend a specific piece of content the brand should create, including: topic, angle, title, key data points to include, and target word count
- Recommend strategies to build "source authority signals" that LLMs recognize:
  → Consistent brand mentions across high-authority sites
  → Original data and statistics that get referenced
  → Expert quotes and thought leadership content
  → Wikipedia presence and knowledge graph optimization
  → Industry publication features and guest contributions

**STEP 3 — CONTENT OPTIMIZATION FOR LLM CITATION**
For existing high-value pages on the site:
- Audit content structure for LLM readability (clear headers, concise definitions, structured data, factual density)
- Recommend specific rewrites to increase citation probability:
  → Add clear, quotable definitions in the first paragraph
  → Include specific statistics, data points, and numbers
  → Structure content with clear claim → evidence → conclusion patterns
  → Add author expertise signals (credentials, experience, methodology)
  → Use natural language patterns that match how LLMs frame answers
- For each page, provide a "citation-optimized" version of the key paragraphs LLMs are most likely to pull

**STEP 4 — BRAND ENTITY OPTIMIZATION**
Strengthen the brand's entity presence in AI knowledge bases:
- Audit and optimize the brand's presence on: Wikipedia, Wikidata, Crunchbase, LinkedIn, Google Knowledge Panel, industry directories, and review platforms
- Recommend consistent NAP (Name, Address, Phone) and brand description across all platforms
- Identify entity associations to build (what topics, categories, and attributes should the brand be associated with in LLM training data)
- Create a brand entity statement: a 100-word authoritative description of the brand that should be consistent across all platforms

**STEP 5 — STRATEGIC CONTENT PLAN FOR GEO**
Create a 12-piece content plan specifically designed to increase AI citations:
1. 3x Original Research / Data Studies — Topics where the brand can produce unique, citable data
2. 3x Definitive Guides — Comprehensive resources on core topics that LLMs will reference as authoritative sources
3. 3x Expert Commentary Pieces — Thought leadership content with quotable insights and predictions
4. 3x Comparison & Review Content — "Best X for Y" and "X vs Y" content that LLMs pull into recommendation queries

For each piece, provide: title, target AI queries it should appear in, key sections, unique angle, data/stats to include, and distribution strategy.

**STEP 6 — THIRD-PARTY MENTION STRATEGY**
LLMs heavily weight brand mentions on third-party sites. Build a strategy to increase mentions:
- Identify 15-20 high-authority publications, blogs, and platforms where the brand should be mentioned
- For each, recommend: the type of mention to pursue (guest post, expert quote, product review, listicle inclusion, podcast appearance), the specific angle or pitch, and the expected impact on AI visibility
- Create a PR/outreach template for securing brand mentions on these platforms
- Recommend online communities and forums where genuine brand mentions can be built organically

**STEP 7 — MONITORING & MEASUREMENT**
Provide a framework for tracking GEO performance:
- List of 20 "AI search queries" to monitor monthly (queries the brand should appear in)
- How to track brand mentions in AI responses across platforms
- Key metrics to measure: citation frequency, recommendation rate, competitor comparison
- Recommended tools and manual processes for GEO tracking
- Monthly audit template: what to check, what to update, and what to create

**OUTPUT FORMAT**
Organize everything under clear headers. Lead with the highest-impact actions. Every recommendation should include the "why" (how it influences LLM citation behavior) and the "how" (specific implementation steps). End with a 30/60/90 day GEO action plan.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brandName,
      website,
      niche,
      competitors,
      productsServices,
      targetAudience,
      authorityLevel,
      images,
    } = body;

    if (!brandName || !website || !niche) {
      return new Response(
        JSON.stringify({ error: "Brand name, website, and niche are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey });

    const competitorList = competitors
      .filter((c: { brand: string; url: string }) => c.brand || c.url)
      .map(
        (c: { brand: string; url: string }, i: number) =>
          `${i + 1}. ${c.brand}${c.url ? ` — ${c.url}` : ""}`
      )
      .join("\n");

    const textContent = `Brand Name: ${brandName}
Website: ${website}
Niche: ${niche}
Top Competitors:
${competitorList || "Not provided"}
Primary Products/Services: ${productsServices || "Not provided"}
Target Audience: ${targetAudience || "Not provided"}
Current Authority Level: ${authorityLevel}`;

    type ImageSource = {
      type: "base64";
      media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      data: string;
    };

    type ContentBlock =
      | { type: "text"; text: string }
      | { type: "image"; source: ImageSource };

    const userContent: ContentBlock[] = [];

    const uploadedImages = Array.isArray(images) ? images : [];
    if (uploadedImages.length > 0) {
      userContent.push({
        type: "text",
        text: "I have attached screenshots from AI search results (ChatGPT, Perplexity, Gemini) showing which competitors currently appear. Please analyze these images carefully and use them as real data for Step 1 (AI Visibility Audit) — note exactly which brands appear, in what positions, and what that reveals about the current AI visibility landscape.\n\n",
      });
      for (const img of uploadedImages) {
        const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (validTypes.includes(img.mimeType)) {
          userContent.push({
            type: "image",
            source: {
              type: "base64",
              media_type: img.mimeType as ImageSource["media_type"],
              data: img.base64,
            },
          });
        }
      }
      userContent.push({ type: "text", text: "\n\n" + textContent });
    } else {
      userContent.push({ type: "text", text: textContent });
    }

    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: GEO_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(event.delta.text)
              );
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GEO API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate GEO strategy" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
