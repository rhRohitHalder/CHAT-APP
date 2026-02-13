import NavBar from "./NavBar";
import SideBaar from "./SideBaar";

const Layout = ({ children, showNavbar = true }) => {
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="hidden lg:block h-full">
          <SideBaar />
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {showNavbar && <NavBar />}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;