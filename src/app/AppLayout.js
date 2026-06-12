import "./app.css";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <main className="app-shell__content">{children}</main>
    </div>
  );
}

export default AppLayout;
