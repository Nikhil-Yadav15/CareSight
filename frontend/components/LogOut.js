"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { signOut } from '@/lib/supabase';


export function SignOutButton({ darkMode }) {
    const router = useRouter();
    async function handleSignOut(){
        try {
            await signOut();
            router.push('/');
          } catch (error) {
            console.error('Error signing out:', error);
          }
    }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="lg"
        className={cn(
          " cursor-pointer group relative overflow-hidden transition-all duration-200",
          "hover:shadow-sm active:shadow-xs",
          "rounded-[10px]",
          "border-2", // Slightly thicker border
          darkMode
            ? "border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 hover:text-white"
            : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900",
          "focus-visible:ring-2 focus-visible:ring-offset-2", // Better focus state
          darkMode ? "focus-visible:ring-neutral-500" : "focus-visible:ring-neutral-400"
        )}
      >
        {/* Subtle background highlight on hover */}
        <span className={cn(
          "absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          darkMode 
            ? "bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.05),transparent)]"
            : "bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.02),transparent)]"
        )} />
        
        <LogOut className={cn(
          "w-4 h-4 mr-2 transition-all duration-200",
          darkMode 
            ? "group-hover:text-rose-300" 
            : "group-hover:text-rose-500"
        )} />
        <span className="font-medium">Sign Out</span>
      </Button>
    </motion.div>
  );
}
