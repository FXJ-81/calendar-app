import AuthPanel from "@/components/AuthPanel";
import CalendarApp from "@/components/CalendarApp";

export default function Home() {
  return (
    <main className="p-4 flex flex-col gap-4">
      <AuthPanel />
      <CalendarApp />
    </main>
  );
}