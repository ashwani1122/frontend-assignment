
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="roboto-fstyle">
     
      <body>
        
        <TooltipProvider>{children}</TooltipProvider>
        
        </body>
    </html>
  );
}
