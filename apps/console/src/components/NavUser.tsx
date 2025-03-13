"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";
import { graphql, useFragment } from "react-relay";
import { useParams } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser_viewer$key } from "./__generated__/NavUser_viewer.graphql";
import { NavUserSkeleton } from "./NavUserSkeleton";
import { buildEndpoint } from "@/utils";

export const navUserFragment = graphql`
  fragment NavUser_viewer on User {
    id
    fullName
    email
  }
`;

export function NavUser({ viewer }: { viewer: NavUser_viewer$key }) {
  const { isMobile } = useSidebar();
  const currentUser = useFragment(navUserFragment, viewer);
  const { organizationId } = useParams();

  const handleLogout = async () => {
    fetch(buildEndpoint("/api/console/v1/auth/logout"), {
      method: "DELETE",
      credentials: "include",
    }).then(() => {
      window.location.href = "https://www.getprobo.com";
    });
  };

  if (!organizationId) {
    return <NavUserSkeleton />;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              isActive
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-slate-400 text-gray-100">
                  {currentUser.fullName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentUser.fullName}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {currentUser.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {currentUser.fullName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {currentUser.fullName}
                  </span>
                  <span className="truncate text-xs">{currentUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
