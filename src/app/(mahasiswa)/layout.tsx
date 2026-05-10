import { AppSidebar } from "@/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function MahasiswaLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 supports-[backdrop-filter]:bg-background/60">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text font-bold text-lg text-transparent">
							Album Akademik
						</h1>
					</div>
				</header>
				<main className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
