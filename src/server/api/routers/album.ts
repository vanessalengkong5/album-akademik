import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { album, mahasiswa } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export const albumRouter = createTRPCRouter({
	getSemesterFiles: protectedProcedure
		.input(z.object({ semester: z.number() }))
		.query(async ({ ctx, input }) => {
			const mhs = await ctx.db.query.mahasiswa.findFirst({
				where: eq(mahasiswa.mahasiswa_id, ctx.session.user.id),
			});

			if (!mhs) return [];

			return ctx.db.query.album.findMany({
				where: and(
					eq(album.mahasiswa_id, mhs.id),
					eq(album.semester, input.semester),
				),
			});
		}),

	uploadFile: protectedProcedure
		.input(
			z.object({
				semester: z.number(),
				type: z.enum(["KRS", "KHS", "KARTU_UJIAN", "KMK"]),
				filePath: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			let mhs = await ctx.db.query.mahasiswa.findFirst({
				where: eq(mahasiswa.mahasiswa_id, ctx.session.user.id),
			});

			if (!mhs) {
				// Auto create mahasiswa entry for now if it doesn't exist
				const [newMhs] = await ctx.db
					.insert(mahasiswa)
					.values({
						mahasiswa_id: ctx.session.user.id,
					})
					.returning();
				mhs = newMhs;
			}

			if (!mhs) throw new Error("Mahasiswa not found");

			// Check if exists
			const existing = await ctx.db.query.album.findFirst({
				where: and(
					eq(album.mahasiswa_id, mhs.id),
					eq(album.semester, input.semester),
					eq(album.type, input.type),
				),
			});

			if (existing) {
				return ctx.db
					.update(album)
					.set({
						file_path: input.filePath,
						updatedAt: new Date(),
					})
					.where(eq(album.id, existing.id))
					.returning();
			}

			return ctx.db
				.insert(album)
				.values({
					mahasiswa_id: mhs.id,
					semester: input.semester,
					type: input.type,
					file_path: input.filePath,
				})
				.returning();
		}),

	deleteFile: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.delete(album).where(eq(album.id, input.id)).returning();
		}),

	getAllFiles: protectedProcedure.query(async ({ ctx }) => {
		const mhs = await ctx.db.query.mahasiswa.findFirst({
			where: eq(mahasiswa.mahasiswa_id, ctx.session.user.id),
		});

		if (!mhs) return [];

		return ctx.db.query.album.findMany({
			where: eq(album.mahasiswa_id, mhs.id),
			orderBy: (album, { asc }) => [asc(album.semester)],
		});
	}),
});
