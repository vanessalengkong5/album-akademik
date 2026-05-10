"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { CheckCircle2, FileText, Printer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
	const { data: allFiles } = api.album.getAllFiles.useQuery();
	const router = useRouter();

	const totalRequired = 14 * 3;
	const uploadedCount = allFiles?.length ?? 0;
	const progress = (uploadedCount / totalRequired) * 100;

	const semesterStatus = Array.from({ length: 14 }, (_, i) => {
		const semester = i + 1;
		const count = allFiles?.filter((f) => f.semester === semester).length ?? 0;
		return { semester, count };
	});

	return (
		<div className="fade-in animate-in space-y-8 duration-500">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div className="flex flex-col gap-2">
					<h2 className="font-bold text-3xl tracking-tight">
						Dashboard Mahasiswa
					</h2>
					<p className="text-muted-foreground">
						Selamat datang kembali! Berikut ringkasan berkas akademik Anda.
					</p>
				</div>
				<Button
					className="gap-2 bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90"
					onClick={() => router.push("/print")}
				>
					<Printer className="size-4" />
					Cetak Album PDF
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="border-primary/20 bg-primary/5">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Total Berkas</CardTitle>
						<FileText className="size-4 text-primary" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{uploadedCount} / {totalRequired}
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							{totalRequired - uploadedCount} berkas tersisa
						</p>
						<Progress value={progress} className="mt-3 h-1.5" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Semester Selesai
						</CardTitle>
						<CheckCircle2 className="size-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{semesterStatus.filter((s) => s.count === 3).length}
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Dari 14 semester
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Dalam Proses</CardTitle>
						<Clock className="size-4 text-orange-500" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{semesterStatus.filter((s) => s.count > 0 && s.count < 3).length}
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							Semester dengan berkas parsial
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card className="col-span-full">
					<CardHeader>
						<CardTitle>Ringkasan Semester</CardTitle>
						<CardDescription>
							Klik pada semester untuk mengelola berkas.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
							{semesterStatus.map((s) => (
								<Link key={s.semester} href={`/semester/${s.semester}`}>
									<div
										className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all hover:scale-105${
											s.count === 3
												? "border-green-500/20 bg-green-500/10 text-green-700"
												: s.count > 0
													? "border-orange-500/20 bg-orange-500/10 text-orange-700"
													: "border-border bg-muted/50 text-muted-foreground"
										}
									`}
									>
										<span className="font-bold text-xs uppercase opacity-70">
											Smt
										</span>
										<span className="font-bold text-xl">{s.semester}</span>
										<div className="mt-1 flex gap-0.5">
											{[1, 2, 3].map((i) => (
												<div
													key={i}
													className={`size-1 rounded-full ${i <= s.count ? "bg-current" : "bg-current/20"}`}
												/>
											))}
										</div>
									</div>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
