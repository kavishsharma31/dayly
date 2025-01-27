import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutDashboard, LineChart, Target, User } from "lucide-react";
import { useState } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { ProgressContent } from "@/components/dashboard/ProgressContent";
import { GoalContent } from "@/components/dashboard/GoalContent";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "progress",
      title: "Progress",
      icon: LineChart,
    },
    {
      id: "goal",
      title: "Goal",
      icon: Target,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {tabs.map((tab) => (
                    <SidebarMenuItem key={tab.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(tab.id)}
                        isActive={activeTab === tab.id}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1">
          <div className="p-4 border-b flex justify-end">
            <ProfileMenu />
          </div>
          <main className="p-6">
            {activeTab === "dashboard" && <DashboardContent />}
            {activeTab === "progress" && <ProgressContent />}
            {activeTab === "goal" && <GoalContent />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;