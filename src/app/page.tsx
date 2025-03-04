'use client'

import { logout } from '../app/login/actions'
import { Button } from '@/components/ui/button'

export default function LogoutButton() {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <Button onClick={handleLogout}>
      Log out
    </Button>
  )
}