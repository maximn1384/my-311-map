import { FluentAppProvider } from "@/providers/FluentAppProvider"
import { QueryProvider } from "@/providers/query-provider"
import { RouterProvider } from "react-router-dom"
import { router } from "@/router"

export default function App() {
  return (
    <FluentAppProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </FluentAppProvider>
  )
}
