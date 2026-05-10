/** biome-ignore-all assist/source/useSortedAttributes: explanation */
/** biome-ignore-all assist/source/organizeImports: explanation */

"use client";

import { use } from "react";
import { UploadForm } from "@/components/upload-form";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SemesterPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const semester = parseInt(id);

	const {
		data: files,
		isLoading,
		refetch,
	} = api.album.getSemesterFiles.useQuery({
		semester,
	});

	const getFileByType = (type: "KRS" | "KHS" | "KARTU_UJIAN") => {
		return files?.find((f) => f.type === type);
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex flex-col gap-2">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-4 w-64" />
				</div>
				<div className="grid gap-6 md:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-48 w-full rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	const isComplete = files?.length === 3;

	return (
		<div className="fade-in animate-in space-y-8 duration-500">
			<div className="flex flex-col gap-2">
				<h2 className="font-bold text-3xl text-primary tracking-tight">
					Semester {semester}
				</h2>
				<p className="text-muted-foreground">
					Kelola berkas akademik Anda untuk semester {semester}.
				</p>
			</div>

			{isComplete ? (
				<Alert className="border-green-500/20 bg-green-500/10 text-green-700">
					<CheckCircle2 className="size-4" />
					<AlertTitle className="font-bold">Semua berkas lengkap!</AlertTitle>
					<AlertDescription className="text-xs">
						Anda telah mengunggah KRS, KHS, dan Kartu Ujian untuk semester ini.
					</AlertDescription>
				</Alert>
			) : (
				<Alert
					variant="destructive"
					className="border-destructive/20 bg-destructive/5 text-destructive"
				>
					<AlertCircle className="size-4" />
					<AlertTitle className="font-bold">Berkas belum lengkap</AlertTitle>
					<AlertDescription className="text-xs">
						Silakan unggah berkas yang masih kosong untuk melengkapi data
						semester {semester}.
					</AlertDescription>
				</Alert>
			)}

			<div className="grid gap-6 md:grid-cols-3">
				<UploadForm
					existingFile={getFileByType("KRS")}
					semester={semester}
					type="KRS"
					onSuccess={refetch}
				/>
				<UploadForm
					existingFile={getFileByType("KHS")}
					semester={semester}
					type="KHS"
					onSuccess={refetch}
				/>
				<UploadForm
					existingFile={getFileByType("KARTU_UJIAN")}
					semester={semester}
					type="KARTU_UJIAN"
					onSuccess={refetch}
				/>
			</div>
		</div>
	);
}
