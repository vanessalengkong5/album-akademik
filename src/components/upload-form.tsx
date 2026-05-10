/** biome-ignore-all assist/source/useSortedAttributes: explanation */
/** biome-ignore-all assist/source/organizeImports: explanation */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, X, CheckCircle2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface UploadFormProps {
	semester: number;
	type: "KRS" | "KHS" | "KARTU_UJIAN";
	existingFile?: {
		id: string | null;
		file_path: string | null;
	};
	onSuccess: () => void;
}

export function UploadForm({
	semester,
	type,
	existingFile,
	onSuccess,
}: UploadFormProps) {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const uploadMutation = api.album.uploadFile.useMutation({
		onSuccess: () => {
			toast.success(`${type} berhasil diunggah`);
			setFile(null);
			onSuccess();
		},
		onError: (error) => {
			toast.error(`Gagal menyimpan data: ${error.message}`);
		},
		onSettled: () => {
			setIsUploading(false);
		},
	});

	const deleteMutation = api.album.deleteFile.useMutation({
		onSuccess: () => {
			toast.success(`${type} berhasil dihapus`);
			onSuccess();
		},
		onError: (error) => {
			toast.error(`Gagal menghapus: ${error.message}`);
		},
	});

	const handleUpload = async () => {
		if (!file) return;

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Gagal mengunggah file ke server");
			}

			const data = await response.json();

			if (!data.path) {
				throw new Error("Server tidak mengembalikan path file");
			}

			uploadMutation.mutate({
				semester,
				type,
				filePath: data.path,
			});
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Terjadi kesalahan saat mengunggah",
			);
			setIsUploading(false);
		}
	};

	const handleDelete = () => {
		if (existingFile?.id) {
			deleteMutation.mutate({ id: existingFile.id });
		}
	};

	return (
		<Card className="relative overflow-hidden border-primary/10 transition-all hover:shadow-md">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 font-semibold text-sm">
					<FileText className="size-4 text-primary" />
					{type}
				</CardTitle>
				<CardDescription>
					Unggah {type} Semester {semester}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{existingFile ? (
					<div className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 overflow-hidden">
								<CheckCircle2 className="size-4 shrink-0 text-green-500" />
								<span className="truncate font-medium text-xs">
									{existingFile.file_path?.split("/").pop() ?? "Berkas"}
								</span>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
								onClick={handleDelete}
								disabled={deleteMutation.isPending}
							>
								<X className="size-3" />
							</Button>
						</div>
					</div>
				) : (
					<div className="grid w-full items-center gap-1.5">
						<Label htmlFor={`${type}-file`} className="text-xs">
							Berkas PDF
						</Label>
						<Input
							id={`${type}-file`}
							type="file"
							accept=".pdf"
							className="h-9 cursor-pointer text-xs"
							onChange={(e) => setFile(e.target.files?.[0] || null)}
						/>
					</div>
				)}
			</CardContent>
			<CardFooter className="pt-2">
				{!existingFile && (
					<Button
						className="h-8 w-full gap-2 text-xs"
						disabled={!file || isUploading}
						onClick={handleUpload}
					>
						{isUploading ? (
							<span className="flex items-center gap-2">
								<div className="size-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
								Mengunggah...
							</span>
						) : (
							<>
								<Upload className="size-3" />
								Unggah {type}
							</>
						)}
					</Button>
				)}
				{existingFile && (
					<div className="flex w-full gap-2">
						<Button variant="outline" className="h-8 flex-1 text-xs" asChild>
							<a
								href={existingFile.file_path ?? "#"}
								target="_blank"
								rel="noreferrer"
							>
								Buka Berkas
							</a>
						</Button>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
