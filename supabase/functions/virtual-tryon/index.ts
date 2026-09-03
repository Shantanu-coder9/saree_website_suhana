const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TryOnRequest {
  humanImage: string;
  garmentImage: string;
  garmentDescription?: string;
}

const json = (body: unknown, status = 200): Response => new Response(
  JSON.stringify(body),
  { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  const url = new URL(req.url);
  if (req.method === "GET" && url.searchParams.has("prediction")) {
    return pollFashnPrediction(url.searchParams.get("prediction")!);
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const apiKey = Deno.env.get("FASHN_API_KEY");
    if (!apiKey) {
      console.error("FASHN_API_KEY is not configured");
      return json({ error: "The AI try-on service is not configured yet." }, 503);
    }

    const body = await req.json() as TryOnRequest;
    if (!body.humanImage || !body.garmentImage) {
      return json({ error: "A person photo and saree image are required." }, 400);
    }

    validateImageInput(body.humanImage, "person photo");
    validateImageInput(body.garmentImage, "saree image");

    const response = await fetch("https://api.fashn.ai/v1/run", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model_name: "tryon-max",
        inputs: {
          model_image: body.humanImage,
          product_image: body.garmentImage,
          prompt: body.garmentDescription || "A traditional Indian saree, draped naturally from the shoulder across the body with the blouse and pallu visible. Preserve the person's face, identity, pose, hair, hands, jewelry, and background.",
          resolution: "1k",
          generation_mode: "quality",
          num_images: 1,
          output_format: "png",
          return_base64: false,
        },
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.id) {
      console.error("FASHN request failed:", result);
      return json({ error: "The AI could not start this try-on. Please use a clear, full-body photo and try again." }, 502);
    }

    return json({ predictionId: result.id, status: "processing" }, 202);
  } catch (error) {
    console.error("Try-on request failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("image") || message.includes("size")) {
      return json({ error: "Please use a JPG, PNG, or WebP image under 30 MB." }, 400);
    }
    return json({ error: "Something went wrong while starting the AI try-on." }, 500);
  }
});

async function pollFashnPrediction(predictionId: string): Promise<Response> {
  const apiKey = Deno.env.get("FASHN_API_KEY");
  if (!apiKey) return json({ error: "The AI try-on service is not configured yet." }, 503);

  if (!/^[a-zA-Z0-9_-]{8,120}$/.test(predictionId)) {
    return json({ error: "Invalid prediction." }, 400);
  }

  try {
    const response = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    const result = await response.json();

    if (!response.ok) {
      console.error("FASHN status failed:", result);
      return json({ status: "failed", error: "Could not check the AI result." }, 502);
    }

    if (result.status === "completed" && Array.isArray(result.output) && result.output[0]) {
      return json({ status: "completed", resultUrl: result.output[0] });
    }

    if (result.status === "failed" || result.status === "canceled") {
      console.error("FASHN prediction failed:", result);
      return json({ status: "failed", error: "The AI could not create a natural try-on from this photo." }, 200);
    }

    return json({ status: result.status || "processing" }, 202);
  } catch (error) {
    console.error("Prediction polling failed:", error);
    return json({ status: "failed", error: "Could not check the AI result." }, 502);
  }
}

function validateImageInput(value: string, label: string): void {
  if (value.startsWith("data:")) {
    if (!/^data:image\/(png|jpeg|jpg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)) {
      throw new Error(`Invalid ${label}`);
    }
    if (value.length > 40_000_000) throw new Error(`${label} size exceeds limit`);
    return;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") throw new Error(`Invalid ${label}`);
  } catch {
    throw new Error(`Invalid ${label}`);
  }
}
