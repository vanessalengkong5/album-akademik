/** biome-ignore-all assist/source/organizeImports: explanation */
/** biome-ignore-all assist/source/useSortedAttributes: explanation */
"use client";

import type * as React from "react";
import {
	BookOpen,
	LayoutDashboard,
	LogOut,
	ChevronsUpDown,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const user = session?.user;

	const semesters = Array.from({ length: 14 }, (_, i) => ({
		title: `Semester ${i + 1}`,
		url: `/semester/${i + 1}`,
		icon: BookOpen,
	}));

	const handleLogout = async () => {
		await authClient.signOut();
		router.push("/login");
		router.refresh();
	};

	return (
		<Sidebar collapsible="icon" className="border-r-0 bg-background" {...props}>
			<SidebarHeader className="h-16 justify-center border-b">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
									<LayoutDashboard className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="font-bold text-primary tracking-tight">
										Album Akademik
									</span>
									<span className="truncate text-xs opacity-60">Mahasiswa</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<ScrollArea className="h-full">
					<SidebarGroup>
						<SidebarGroupContent className="px-2 pt-4">
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton
										asChild
										isActive={pathname === "/"}
										className="hover:bg-primary/5 active:bg-primary/10"
									>
										<Link href="/">
											<LayoutDashboard className="size-4" />
											<span className="font-medium">Dashboard</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarGroup>
						<SidebarGroupLabel className="px-4 font-bold text-[10px] uppercase tracking-widest opacity-50">
							Akademik
						</SidebarGroupLabel>
						<SidebarGroupContent className="px-2">
							<SidebarMenu>
								{semesters.map((item) => (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={pathname === item.url}
											className="transition-all hover:bg-primary/5"
										>
											<Link href={item.url}>
												<item.icon className="size-4" />
												<span className="font-medium">{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</ScrollArea>
			</SidebarContent>
			<SidebarFooter className="border-t p-2">
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={user?.image || ""}
											alt={user?.name || "User"}
										/>
										<AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
											{user?.name?.[0] || "U"}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{user?.name || "Mahasiswa"}
										</span>
										<span className="truncate text-xs opacity-60">
											{user?.email || ""}
										</span>
									</div>
									<ChevronsUpDown className="ml-auto size-4 opacity-50" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
								side="bottom"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage
												src={user?.image || ""}
												alt={user?.name || "User"}
											/>
											<AvatarFallback className="rounded-lg">
												{user?.name?.[0] || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{user?.name}
											</span>
											<span className="truncate text-xs opacity-60">
												{user?.email}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="gap-2 text-destructive focus:bg-destructive/5 focus:text-destructive"
									onClick={handleLogout}
								>
									<LogOut className="size-4" />
									Keluar
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
