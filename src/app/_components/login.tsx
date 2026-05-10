/** biome-ignore-all assist/source/useSortedAttributes: stfu */
/** biome-ignore-all assist/source/organizeImports: ignore shit */

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/server/better-auth/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isPending, setIsPending] = useState(false);
	const [isRegister, setIsRegister] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsPending(true);

		try {
			if (isRegister) {
				const { error } = await authClient.signUp.email({
					email,
					password,
					name,
				});

				if (error) {
					toast.error(
						error.message || "Gagal membuat akun. Silakan coba lagi.",
					);
				} else {
					toast.success("Akun berhasil dibuat! Mengalihkan...");
					router.push("/");
					router.refresh();
				}
			} else {
				const { error } = await authClient.signIn.email({
					email,
					password,
				});

				if (error) {
					let msg = "Gagal masuk. Periksa email dan kata sandi Anda.";
					if (
						error.message?.includes("Invalid email or password") ||
						error.status === 401
					) {
						msg = "Email atau kata sandi salah.";
					} else if (error.message?.includes("User not found")) {
						msg = "Pengguna tidak ditemukan.";
					} else if (error.message) {
						msg = error.message;
					}
					toast.error(msg);
				} else {
					toast.success("Selamat datang kembali!");
					router.push("/");
					router.refresh();
				}
			}
		} catch (err) {
			console.error("Unexpected error:", err);
			toast.error("Terjadi kesalahan yang tidak terduga.");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="border-primary/10 shadow-primary/5 shadow-xl">
				<CardHeader className="space-y-1">
					<CardTitle className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-bold text-2xl text-transparent">
						Album Akademik
					</CardTitle>
					<CardDescription>
						{isRegister
							? "Buat akun baru Anda"
							: "Masukan email dan kata sandi"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						{isRegister && (
							<div className="space-y-2">
								<Label htmlFor="name">Nama Lengkap</Label>
								<Input
									id="name"
									onChange={(e) => setName(e.target.value)}
									placeholder="John Doe"
									required
									value={name}
								/>
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								onChange={(e) => setEmail(e.target.value)}
								placeholder="m@example.com"
								required
								type="email"
								value={email}
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center">
								<Label htmlFor="password">Kata Sandi</Label>
							</div>
							<Input
								id="password"
								onChange={(e) => setPassword(e.target.value)}
								required
								type="password"
								value={password}
							/>
						</div>
						<div className="flex flex-col gap-3 pt-2">
							<Button disabled={isPending} type="submit" className="w-full">
								{isPending ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
							</Button>
							<Button
								className="w-full border-primary/20 hover:bg-primary/5"
								onClick={() => setIsRegister(!isRegister)}
								type="button"
								variant="outline"
							>
								{isRegister
									? "Sudah punya akun? Masuk"
									: "Belum punya akun? Daftar"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
