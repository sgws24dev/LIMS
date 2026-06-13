import { useNavigate } from "react-router-dom"
import { Button } from "@/shared/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground/30">404</h1>
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <p className="text-sm text-muted-foreground">The page you are looking for does not exist.</p>
      <Button variant="outline" onClick={() => navigate("/dashboard")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go to Dashboard
      </Button>
    </div>
  )
}
