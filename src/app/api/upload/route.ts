import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const timestamp = Date.now();
		// Sanitize filename: replace spaces with underscores, remove special chars that cause issues on Windows
		const sanitizedName = file.name
			.replace(/\s+/g, "_")
			.replace(/[()\[\]{}#%&!@^=+~`'";<>,]/g, "");
		const filename = `${timestamp}-${sanitizedName}`;
		const path = join(process.cwd(), "public", "uploads", filename);

		await mkdir(join(process.cwd(), "public", "uploads"), { recursive: true });

		await writeFile(path, buffer);

		const publicPath = `/uploads/${filename}`;

		return NextResponse.json({ path: publicPath });
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
