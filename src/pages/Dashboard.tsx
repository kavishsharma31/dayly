import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, LineChart, Target, ListTodo } from "lucide-react";
import { useState } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { ProgressContent } from "@/components/dashboard/ProgressContent";
import { GoalContent } from "@/components/dashboard/GoalContent";
import { ProfileMenu } from "@/components/dashboard/ProfileMenu";
import { CompletedGoalsContent } from "@/components/dashboard/CompletedGoalsContent";

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
      id: "current-goal",
      title: "Current Goal",
      icon: Target,
    },
    {
      id: "my-goals",
      title: "My Goals",
      icon: ListTodo,
    },
  ];

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <Sidebar className="bg-background">
          <SidebarContent className="bg-white">
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
          <div className="p-4 border-b flex items-center justify-between bg-white">
            <SidebarTrigger className="md:hidden" />
            <ProfileMenu />
          </div>
          <main className="p-6">
            {activeTab === "dashboard" && <DashboardContent />}
            {activeTab === "progress" && <ProgressContent />}
            {activeTab === "current-goal" && <GoalContent />}
            {activeTab === "my-goals" && <CompletedGoalsContent />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;