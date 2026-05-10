/** biome-ignore-all assist/source/organizeImports: explanation */
/** biome-ignore-all assist/source/useSortedAttributes: explanation */
"use client";

import { api } from "@/trpc/react";
import { FileText, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const PDFRenderer = dynamic(
	() => import("@/components/pdf-renderer").then((mod) => mod.PDFRenderer),
	{
		ssr: false,
		loading: () => (
			<div
				style={{
					width: "210mm",
					height: "297mm",
					margin: "0 auto 12px",
					background: "white",
					boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 8,
				}}
			>
				<Loader2
					style={{ width: 16, height: 16 }}
					className="animate-spin text-muted-foreground"
				/>
				<span className="text-muted-foreground text-xs">
					Menyiapkan penampil PDF...
				</span>
			</div>
		),
	},
);

export default function PrintPage() {
	const { data: allFiles, isLoading } = api.album.getAllFiles.useQuery();
	const { data: session } = authClient.useSession();
	const router = useRouter();
	const summaryRef = useRef<HTMLDivElement>(null);
	const [generating, setGenerating] = useState(false);

	const renderedImagesRef = useRef<Map<string, string[]>>(new Map());

	const semesters = Array.from({ length: 14 }, (_, i) => {
		const semester = i + 1;
		const files = allFiles?.filter((f) => f.semester === semester) || [];
		return { semester, files };
	});

	const filesWithContent = allFiles?.filter((f) => f.file_path) || [];

	const handleImagesReady = useCallback(
		(fileId: string) => (images: string[]) => {
			renderedImagesRef.current.set(fileId, images);
		},
		[],
	);

	async function generatePDF() {
		setGenerating(true);
		try {
			const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
				import("jspdf"),
				import("html2canvas-pro"),
			]);

			const pdf = new jsPDF({
				orientation: "portrait",
				unit: "mm",
				format: "a4",
			});
			const pageW = 210;
			const pageH = 297;

			if (summaryRef.current) {
				const canvas = await html2canvas(summaryRef.current, {
					scale: 2,
					useCORS: true,
					backgroundColor: "#ffffff",
					logging: false,
				});

				const imgData = canvas.toDataURL("image/jpeg", 0.95);
				const imgW = pageW;
				const imgH = (canvas.height / canvas.width) * imgW;
				pdf.addImage(imgData, "JPEG", 0, 0, imgW, Math.min(imgH, pageH));
			}

			const margin = 10; // mm margin on all sides
			const headerH = 12; // mm reserved for header (inside margin)
			const typeLabels: Record<string, string> = {
				KRS: "KRS",
				KHS: "KHS",
				KARTU_UJIAN: "Kartu Ujian",
			};

			for (const file of filesWithContent) {
				const images = renderedImagesRef.current.get(file.id);
				if (!images) continue;

				const fileType = file.type ?? "Dokumen";
				const label = typeLabels[fileType] || fileType;
				const headerText = `${label} — Semester ${file.semester}`;

				const contentW = pageW - margin * 2;
				const contentTop = margin + headerH;
				const contentH = pageH - contentTop - margin;

				for (let i = 0; i < images.length; i++) {
					const imgSrc = images[i];
					pdf.addPage("a4", "portrait");

					pdf.setFillColor(245, 245, 245);
					pdf.rect(margin, margin, contentW, headerH, "F");

					pdf.setDrawColor(200, 200, 200);
					pdf.setLineWidth(0.3);
					pdf.line(
						margin,
						margin + headerH,
						margin + contentW,
						margin + headerH,
					);

					pdf.setFont("helvetica", "bold");
					pdf.setFontSize(9);
					pdf.setTextColor(55, 65, 81);
					pdf.text(headerText, margin + 5, margin + 7.5);

					if (images.length > 1) {
						pdf.setFont("helvetica", "normal");
						pdf.setFontSize(7);
						pdf.setTextColor(156, 163, 175);
						pdf.text(
							`Halaman ${i + 1} / ${images.length}`,
							margin + contentW - 5,
							margin + 7.5,
							{ align: "right" },
						);
					}

					const img = await loadImage(imgSrc ?? "");
					const imgAspect = img.width / img.height;
					const areaAspect = contentW / contentH;

					let drawW: number;
					let drawH: number;
					let drawX: number;
					let drawY: number;

					if (imgAspect > areaAspect) {
						drawW = contentW;
						drawH = contentW / imgAspect;
						drawX = margin;
						drawY = contentTop;
					} else {
						drawH = contentH;
						drawW = contentH * imgAspect;
						drawX = margin + (contentW - drawW) / 2;
						drawY = contentTop;
					}

					pdf.addImage(imgSrc ?? "", "JPEG", drawX, drawY, drawW, drawH);
				}
			}

			pdf.save("Album Akademik.pdf");
		} catch (err) {
			console.error("Error generating PDF:", err);
			alert("Gagal membuat PDF. Silakan coba lagi.");
		} finally {
			setGenerating(false);
		}
	}

	if (isLoading)
		return (
			<div className="flex h-screen items-center justify-center gap-2">
				<Loader2 className="size-6 animate-spin text-primary" />
				<span>Menyiapkan data album...</span>
			</div>
		);

	return (
		<div
			style={{ minHeight: "100vh", background: "#ffffff", padding: "40px 0" }}
		>
			<div
				ref={summaryRef}
				style={{
					width: "210mm",
					minHeight: "297mm",
					background: "white",
					margin: "0 auto 12px",
					padding: "20mm",
					boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
					boxSizing: "border-box",
				}}
			>
				<div className="mb-8 border-black border-b-2 pb-4 text-center">
					<h1 className="mb-1 font-bold text-4xl uppercase tracking-[0.2em]">
						Album Akademik
					</h1>
					<h2 className="mb-3 font-bold text-primary text-xl uppercase">
						{session?.user.name}
					</h2>
					<div className="mx-auto mb-3 h-1 w-20 bg-primary" />
					<p className="text-gray-500 text-sm uppercase tracking-widest">
						Ringkasan Berkas Mahasiswa (Semester 1 – 14)
					</p>
				</div>

				<table className="w-full border-collapse border border-gray-300 text-[11px]">
					<thead>
						<tr className="bg-gray-100">
							<th className="w-14 border border-gray-300 p-2 text-center font-bold uppercase">
								Smt
							</th>
							<th className="border border-gray-300 p-2 text-left font-bold uppercase">
								KRS
							</th>
							<th className="border border-gray-300 p-2 text-left font-bold uppercase">
								KHS
							</th>
							<th className="border border-gray-300 p-2 text-left font-bold uppercase">
								Kartu Ujian
							</th>
							<th className="w-20 border border-gray-300 p-2 text-center font-bold uppercase">
								Status
							</th>
						</tr>
					</thead>
					<tbody>
						{semesters.map((s) => {
							const krs = s.files.find((f) => f.type === "KRS");
							const khs = s.files.find((f) => f.type === "KHS");
							const kartu = s.files.find((f) => f.type === "KARTU_UJIAN");
							const isComplete = krs && khs && kartu;

							return (
								<tr
									key={s.semester}
									className="transition-colors hover:bg-gray-50"
								>
									<td className="border border-gray-300 bg-gray-50 p-2 text-center font-bold">
										{s.semester}
									</td>
									<td className="border border-gray-300 p-2">
										{krs ? (
											<div className="flex items-center gap-1">
												<FileText className="size-3 shrink-0 text-blue-500" />
												<span className="max-w-[140px] truncate">
													{krs.file_path?.split("/").pop()}
												</span>
											</div>
										) : (
											<span className="text-gray-300 italic">Kosong</span>
										)}
									</td>
									<td className="border border-gray-300 p-2">
										{khs ? (
											<div className="flex items-center gap-1">
												<FileText className="size-3 shrink-0 text-green-500" />
												<span className="max-w-[140px] truncate">
													{khs.file_path?.split("/").pop()}
												</span>
											</div>
										) : (
											<span className="text-gray-300 italic">Kosong</span>
										)}
									</td>
									<td className="border border-gray-300 p-2">
										{kartu ? (
											<div className="flex items-center gap-1">
												<FileText className="size-3 shrink-0 text-orange-500" />
												<span className="max-w-[140px] truncate">
													{kartu.file_path?.split("/").pop()}
												</span>
											</div>
										) : (
											<span className="text-gray-300 italic">Kosong</span>
										)}
									</td>
									<td className="border border-gray-300 p-2 text-center">
										{isComplete ? (
											<span className="font-bold text-[10px] text-green-600">
												LENGKAP
											</span>
										) : (
											<span className="text-[10px] text-red-400 italic">
												BELUM
											</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>

				<div
					style={{
						marginTop: 32,
						paddingTop: 10,
						borderTop: "1px solid #d1d5db",
						display: "flex",
						justifyContent: "space-between",
						fontSize: 9,
						color: "#9ca3af",
						textTransform: "uppercase",
						letterSpacing: "0.1em",
					}}
				>
					<span>Dicetak pada: {new Date().toLocaleString("id-ID")}</span>
					<span>Sistem Album Akademik Digital</span>
				</div>
			</div>

			{filesWithContent.map((file) => (
				<PDFRenderer
					key={file.id}
					url={file.file_path ?? ""}
					title={`${file.type} — Semester ${file.semester}`}
					onImagesReady={handleImagesReady(file.id)}
				/>
			))}

			<div className="fixed right-10 bottom-10 flex gap-4">
				<Button
					className="rounded-full px-8 py-6 text-lg shadow-xl transition-transform hover:scale-105"
					onClick={generatePDF}
					type="button"
					disabled={generating}
				>
					{generating ? (
						<>
							<Loader2 className="mr-2 size-5 animate-spin" />
							Membuat PDF...
						</>
					) : (
						<>
							<Download className="mr-2 size-5" />
							Cetak Album (PDF)
						</>
					)}
				</Button>
				<Button
					className="rounded-full px-8 py-6 text-lg shadow-xl transition-transform hover:scale-105"
					onClick={() => router.back()}
					type="button"
					variant="secondary"
				>
					Kembali
				</Button>
			</div>
		</div>
	);
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}
