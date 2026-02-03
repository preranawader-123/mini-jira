import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          <main className="p-6 md:p-8">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
