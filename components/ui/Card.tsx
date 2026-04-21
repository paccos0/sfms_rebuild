import { cn } from "@/lib/utils";

export default function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("glass rounded-3xl p-5", className)}>{children}</div>;
}
