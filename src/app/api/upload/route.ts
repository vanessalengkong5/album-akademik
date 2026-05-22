import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";
import { db } from "@/server/db";
import { mahasiswa } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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

		const type = (formData.get("type") as string) || "dokumen";
		const semester = (formData.get("semester") as string) || "0";

		const mhs = await db.query.mahasiswa.findFirst({
			where: eq(mahasiswa.mahasiswa_id, session.user.id),
		});

		const id = mhs?.nim ?? session.user.id;
		const timestamp = Date.now();

		const typeStr = type.toLowerCase().replace(/_/g, "-");
		const filename = `${id}-${typeStr}-semester-${semester}-${timestamp}.pdf`;
		const uploadsDir = join(process.cwd(), "public", "uploads");
		const path = join(uploadsDir, filename);

		await mkdir(uploadsDir, { recursive: true });

		await writeFile(path, buffer);

		const publicPath = `/uploads/${filename}`;

		return NextResponse.json({ path: publicPath });
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
