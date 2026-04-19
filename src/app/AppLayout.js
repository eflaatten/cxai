import "./app.css";

function AppLayout({
  children,
  header,
  isSidebarOpen,
  onCloseSidebar,
  sidebar,
}) {
  return (
    <div className={`app-shell${isSidebarOpen ? " sidebar-open" : ""}`}>
      <div className="app-shell__sidebar">{sidebar}</div>
      <div className="app-shell__main">
        {header}
        <main className="app-shell__content">{children}</main>
      </div>
      <button
        type="button"
        className="app-shell__backdrop"
        aria-label="Close sidebar"
        onClick={onCloseSidebar}
      />
    </div>
  );
}

export default AppLayout;

