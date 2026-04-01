import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// Allow larger request bodies for image uploads
export const maxDuration = 60;

const TRIPO_API_KEY = process.env.TRIPO_API_KEY || "";
const TRIPO_BASE = "https://api.tripo3d.ai/v2/openapi";

// POST — create a new scan via Tripo AI
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageBase64, name } = await req.json();

  if (!imageBase64) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (!TRIPO_API_KEY) {
    return NextResponse.json({ error: "Tripo API key not configured" }, { status: 500 });
  }

  try {
    // Step 1: Upload image to Tripo to get an image_token
    // Convert base64 data URL to a Buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch?.[1] || "image/png";
    const ext = mimeType.split("/")[1] || "png";

    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append("file", blob, `upload.${ext}`);

    const uploadRes = await fetch(`${TRIPO_BASE}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TRIPO_API_KEY}`,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      console.error("Tripo upload error:", err);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 502 }
      );
    }

    const uploadData = await uploadRes.json();
    const imageToken = uploadData.data?.image_token;

    if (!imageToken) {
      console.error("No image_token in Tripo response:", uploadData);
      return NextResponse.json(
        { error: "Failed to process image" },
        { status: 502 }
      );
    }

    // Step 2: Create image-to-3D task
    const taskRes = await fetch(`${TRIPO_BASE}/task`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TRIPO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "image_to_model",
        file: {
          type: "png",
          file_token: imageToken,
        },
      }),
    });

    if (!taskRes.ok) {
      const err = await taskRes.text();
      console.error("Tripo task error:", err);
      return NextResponse.json(
        { error: "Failed to start 3D generation" },
        { status: 502 }
      );
    }

    const taskData = await taskRes.json();
    const taskId = taskData.data?.task_id;

    if (!taskId) {
      console.error("No task_id in Tripo response:", taskData);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 502 }
      );
    }

    // Step 3: Save to Supabase (store truncated image for thumbnail)
    // Truncate base64 to ~100KB for DB storage (just for preview thumbnail)
    const thumbData = imageBase64.length > 100000
      ? imageBase64.substring(0, 100000)
      : imageBase64;

    const { data, error } = await supabase
      .from("scanned_models")
      .insert({
        user_id: user.id,
        name: name || "My Furniture",
        image_data: thumbData,
        meshy_task_id: taskId, // reusing column name for Tripo task ID
        status: "processing",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save scan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, taskId });
  } catch (err) {
    console.error("Snap-to-3D error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET — check status of a scan
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    // Return all scans for this user
    const { data, error } = await supabase
      .from("scanned_models")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ scans: data });
  }

  // Get specific scan
  const { data: scan, error } = await supabase
    .from("scanned_models")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }

  // If still processing, check Tripo status
  if (scan.status === "processing" && scan.meshy_task_id) {
    try {
      const statusRes = await fetch(
        `${TRIPO_BASE}/task/${scan.meshy_task_id}`,
        {
          headers: { Authorization: `Bearer ${TRIPO_API_KEY}` },
        }
      );

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        const taskStatus = statusData.data?.status;

        if (taskStatus === "success") {
          // Get the GLB model URL from output
          const modelUrl =
            statusData.data?.output?.model ||
            statusData.data?.output?.pbr_model ||
            statusData.data?.output?.rendered_image;

          await supabase
            .from("scanned_models")
            .update({ status: "succeeded", model_url: modelUrl })
            .eq("id", id);

          return NextResponse.json({
            ...scan,
            status: "succeeded",
            model_url: modelUrl,
          });
        } else if (taskStatus === "failed") {
          await supabase
            .from("scanned_models")
            .update({ status: "failed" })
            .eq("id", id);

          return NextResponse.json({ ...scan, status: "failed" });
        }

        // Still processing — return progress
        return NextResponse.json({
          ...scan,
          progress: statusData.data?.progress || 0,
        });
      }
    } catch (err) {
      console.error("Tripo status check error:", err);
    }
  }

  return NextResponse.json(scan);
}
