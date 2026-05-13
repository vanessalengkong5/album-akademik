/** biome-ignore-all lint/performance/noImgElement: explanation */
/** biome-ignore-all assist/source/organizeImports: explanation */
/** biome-ignore-all assist/source/useSortedAttributes: explanation */
"use client";

import { useEffect, useState, useCallback } from "react";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFRendererProps {
	url: string;
	title: string;
	/** Called when all pages have been rendered to images */
	onImagesReady?: (images: string[]) => void;
}

export function PDFRenderer({ url, title, onImagesReady }: PDFRendererProps) {
	const [images, setImages] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const notifyParent = useCallback(
		(imgs: string[]) => {
			onImagesReady?.(imgs);
		},
		[onImagesReady],
	);

	useEffect(() => {
		let isMounted = true;

		async function loadPDF() {
			try {
				setLoading(true);
				const normalizedUrl = encodeURI(decodeURI(url));
				const pdf = await pdfjs.getDocument(normalizedUrl).promise;
				const pageImages: string[] = [];

				for (let i = 1; i <= pdf.numPages; i++) {
					if (!isMounted) break;
					const page = await pdf.getPage(i);
					const viewport = page.getViewport({ scale: 2 });
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					if (!ctx) continue;
					canvas.width = viewport.width;
					canvas.height = viewport.height;
					await page.render({
						canvasContext: ctx,
						canvas,
						viewport,
						intent: "print",
					}).promise;
					if (!isMounted) break;
					pageImages.push(canvas.toDataURL("image/jpeg", 0.92));
					canvas.width = 0;
					canvas.height = 0;
				}

				if (isMounted) {
					setImages(pageImages);
					setError(null);
					notifyParent(pageImages);
				}
			} catch (err) {
				console.error("Error rendering PDF:", err);
				if (isMounted) setError("Gagal merender PDF");
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadPDF();
		return () => {
			isMounted = false;
		};
	}, [url, notifyParent]);

	if (loading)
		return (
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
					flexDirection: "column",
					gap: 8,
				}}
			>
				<div
					style={{
						height: 12,
						width: 160,
						borderRadius: 4,
						background: "#e5e7eb",
					}}
				/>
				<span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>
					Memproses {title}...
				</span>
			</div>
		);

	if (error)
		return (
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
					flexDirection: "column",
					gap: 6,
				}}
			>
				<span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
					Gagal merender PDF
				</span>
				<span style={{ fontSize: 11, color: "#f87171" }}>{title}</span>
			</div>
		);

	return (
		<>
			{images.map((src, idx) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: index is stable
					key={idx}
					style={{
						width: "210mm",
						height: "297mm",
						margin: "0 auto 12px",
						background: "white",
						boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
						overflow: "hidden",
						position: "relative",
					}}
				>
					{idx === 0 && (
						<div
							style={{
								position: "absolute",
								top: "6mm",
								left: "8mm",
								background: "rgba(255,255,255,0.88)",
								color: "#374151",
								fontSize: 8,
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.1em",
								padding: "2px 7px",
								borderRadius: 3,
								zIndex: 1,
							}}
						>
							{title}
						</div>
					)}
					<img
						src={src}
						alt={`${title} - Halaman ${idx + 1}`}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain",
							objectPosition: "top",
							display: "block",
						}}
					/>
				</div>
			))}
		</>
	);
}
