import { useLocation, Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

export function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <footer className={cn("border-t transition-colors duration-300", isHome ? "border-white/5 bg-gray-950 text-white" : "border-gray-200 bg-white")}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
             <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", isHome ? "bg-white text-black" : "bg-black text-white")}>
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
             </div>
             <p className={cn("text-sm", isHome ? "text-gray-500" : "text-gray-500")}>
               &copy; {new Date().getFullYear()} HUSTLR. Campus Marketplace.
             </p>
          </div>
          <div className="flex gap-6 text-sm">
             <Link to="/admin" className={cn("transition-colors", isHome ? "text-purple-400 hover:text-purple-300" : "text-purple-600 hover:text-purple-800")}>Admin</Link>
             <a href="#" className={cn("transition-colors", isHome ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>Privacy</a>
             <a href="#" className={cn("transition-colors", isHome ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>Terms</a>
             <a href="#" className={cn("transition-colors", isHome ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
