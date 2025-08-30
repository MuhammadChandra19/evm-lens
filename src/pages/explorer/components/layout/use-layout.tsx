import { usePlayground } from '@/hooks/use-playground'
import { useMemo } from 'react'
import { NavItem, NavItemChild } from './types'
import { SquareTerminal } from 'lucide-react'

const useLayout = () => {
  const { playgroundList } = usePlayground()

  const menuList = useMemo(() => {
    const result = [] as NavItem[]
    const playgroundMenu: NavItem = {
      title: "Playground",
      icon: SquareTerminal,
      isActive: false,
      path: "#",
      child: []
    }

    playgroundList.forEach(v => {
      playgroundMenu.child?.push({
      icon: v.icon,
      id: v.id.toString(),
      path: `/playground/${v.id}`,
      title: v.name,
    } as NavItemChild)
    })

    result.push(playgroundMenu)

    console.log(result)
    return result
  }, [playgroundList])

  return {
    menuList
  }
}

export default useLayout