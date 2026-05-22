import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "@/styles/globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "Album Akademik",
	description: "Aplikasi Album Akademik Mahasiswa",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={cn(geist.variable, "font-sans", inter.variable)} lang="en">
			<body>
				<TRPCReactProvider>
					<TooltipProvider>
						{children}
						<Toaster position="top-center" richColors />
					</TooltipProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
