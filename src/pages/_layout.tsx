import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  )
}