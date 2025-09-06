import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function SidebarTest() {
  return (
    <DashboardLayout
      title="Sidebar Test"
      subtitle="Testing the new sidebar design"
    >
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Sidebar Test Page</h1>
        <p>This page is used to test the sidebar design without authentication.</p>
      </div>
    </DashboardLayout>
  );
}