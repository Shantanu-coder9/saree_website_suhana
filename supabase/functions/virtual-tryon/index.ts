const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const HF_SPACE_URL = "https://yisol-idm-vton.hf.space";

interface TryOnRequest {
  humanImage: string;
  garmentImage: string;
  garmentDescription?: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (req.method === "GET" && url.searchParams.has("prediction")) {
    return pollHFEvent(url.searchParams.get("prediction")!);
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { humanImage, garmentImage, garmentDescription }: TryOnRequest =
      await req.json();

    if (!humanImage || !garmentImage) {
      return json(
        { error: "Both a person photo and a saree image are required." },
        400,
      );
    }

    const humanBase64 = humanImage.split(",")[1] || humanImage;
    const garmentBase64 = garmentImage.split(",")[1] || garmentImage;
    const humanBytes = Uint8Array.from(atob(humanBase64), (c) =>
      c.charCodeAt(0),
    );
    const garmentBytes = Uint8Array.from(atob(garmentBase64), (c) =>
      c.charCodeAt(0),
    );

    // Upload both images to the HF Space
    const formData = new FormData();
    formData.append(
      "files",
      new Blob([humanBytes], { type: "image/png" }),
      "human.png",
    );
    formData.append(
      "files",
      new Blob([garmentBytes], { type: "image/png" }),
      "garment.png",
    );

    let uploadRes = await fetch(`${HF_SPACE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    // Fall back to alternate Gradio upload path on older/newer SDK versions
    if (!uploadRes.ok) {
      uploadRes = await fetch(`${HF_SPACE_URL}/gradio_api/upload`, {
        method: "POST",
        body: formData,
      });
    }

    if (!uploadRes.ok) {
      console.error(
        "HF Space upload failed:",
        uploadRes.status,
        await uploadRes.text(),
      );
      return json(
        {
          error:
            "The AI service is waking up. Please try again in a few seconds.",
        },
        502,
      );
    }

    const uploaded: string[] = await uploadRes.json();
    if (!Array.isArray(uploaded) || uploaded.length < 2) {
      return json(
        { error: "Could not upload images to the AI service." },
        502,
      );
    }

    // Call the tryon Gradio endpoint (api_name="tryon")
    const apiRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/tryon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          // ImageEditor input: { background, layers, composite }
          { background: uploaded[0], layers: [], composite: null },
          // Garment image
          uploaded[1],
          // Garment description
          garmentDescription || "saree",
          // is_checked — auto-generated mask
          true,
          // is_checked_crop — no auto-crop
          false,
          // denoise_steps
          30,
          // seed
          42,
        ],
      }),
    });

    if (!apiRes.ok) {
      console.error("HF Space API call failed:", await apiRes.text());
      return json(
        { error: "Could not start the AI try-on. Please try again." },
        502,
      );
    }

    const apiResult = await apiRes.json();
    if (!apiResult.event_id) {
      return json(
        { error: "No event ID received from the AI service." },
        502,
      );
    }

    return json(
      { predictionId: apiResult.event_id, status: "processing" },
      202,
    );
  } catch (err) {
    console.error("Try-on error:", err);
    return json(
      { error: "Something went wrong while starting the AI try-on." },
      500,
    );
  }
});

/**
 * Poll a Hugging Face Space Gradio event via its SSE stream.
 * The stream emits `complete` (with output data) or `error` events.
 */
async function pollHFEvent(eventId: string): Promise<Response> {
  if (!/^[a-zA-Z0-9_-]+$/.test(eventId)) {
    return json({ error: "Invalid prediction ID." }, 400);
  }

  try {
    const sseRes = await fetch(
      `${HF_SPACE_URL}/gradio_api/call/tryon/${eventId}`,
    );

    if (!sseRes.ok || !sseRes.body) {
      // Space might be sleeping or the event expired — tell client to retry
      return json({ status: "processing" }, 202);
    }

    const reader = sseRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent = "";
    const deadline = Date.now() + 120_000;

    while (true) {
      if (Date.now() > deadline) {
        return json({ status: "processing" }, 202);
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith("data:") && currentEvent === "complete") {
          try {
            const data = JSON.parse(line.slice(5).trim());
            if (Array.isArray(data) && data[0]) {
              const img = data[0];
              const resultUrl = typeof img === "string"
                ? img
                : img.url || `${HF_SPACE_URL}/file=${img.path}`;
              return json({ status: "completed", resultUrl });
            }
          } catch {
            // JSON parse error — keep reading
          }
        } else if (line.startsWith("data:") && currentEvent === "error") {
          return json(
            {
              status: "failed",
              error:
                "The AI model encountered an error. Please try a clearer photo.",
            },
            200,
          );
        }
      }
    }

    // Stream ended without a complete event — still processing
    return json({ status: "processing" }, 202);
  } catch (err) {
    console.error("Poll error:", err);
    return json(
      { status: "failed", error: "Could not check the AI result." },
      502,
    );
  }
}
