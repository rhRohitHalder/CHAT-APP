import NavBar from "./NavBar";
import SideBaar from "./SideBaar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <SideBaar />}
        <div>
          <SideBaar />
        </div>
        <div className="flex-1 flex flex-col">
          <NavBar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
    // <div className="min-h-screen bg-base-100">
    //   <div className="flex min-h-screen">
    //     {showSidebar && (
    //       <aside className="hidden lg:block">
    //         <SideBaar />
    //       </aside>
    //     )

    //     <div className="flex-1 flex flex-col">
    //       <NavBar />
    //       <main className="flex-1 overflow-y-auto p-6">{children}</main>
    //     </div>
    //   </div>
    // </div>
  );
};
export default Layout;
// import NavBar from "./NavBar";
// import SideBaar from "./SideBaar";

// const Layout = ({ children, showSidebar = true }) => {
//   return (
//     <div className="min-h-screen flex bg-base-100">
//       {/* Sidebar (visible only if showSidebar = true) */}
//       {showSidebar && (
//         <aside className="hidden lg:flex">
//           <SideBaar />
//         </aside>
//       )}

//       {/* Main content area */}
//       <div
//         className={`flex flex-col flex-1 ${
//           showSidebar ? "lg:ml-64" : ""
//         }`} // leaves space for sidebar
//       >
//         <NavBar />
//         <main className="flex-1 overflow-y-auto p-4">{children}</main>
//       </div>
//     </div>
//   );
// };

// export default Layout;