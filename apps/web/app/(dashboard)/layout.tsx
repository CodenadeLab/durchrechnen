export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session validation is handled by middleware

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Durchrechnen</h1>
            <nav className="flex space-x-4">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </a>
              <a href="/settings" className="text-gray-600 hover:text-gray-900">
                Einstellungen
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
