import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LayoutDashboard, LineChart, Target } from "lucide-react";
import { useState } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { ProgressContent } from "@/components/dashboard/ProgressContent";
import { GoalContent } from "@/components/dashboard/GoalContent";

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
                      className={activeTab === tab.id ? "bg-sidebar-accent" : ""}
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
      
      <main className="flex-1 p-6">
        {activeTab === "dashboard" && <DashboardContent />}
        {activeTab === "progress" && <ProgressContent />}
        {activeTab === "goal" && <GoalContent />}
      </main>
    </div>
  );
};

export default Dashboard;