import { usePlayground } from '@/hooks/use-playground'
import { useMemo } from 'react'
import { ExplorerRoute } from '../../router/types'
import { SquareTerminal } from 'lucide-react'
import { ExplorerRouteKeyValues } from '../../router/route-item'
import { ROUTES } from "../../router/route-item"

const useLayout = () => {
  const { playgroundList } = usePlayground()

  const menuList = useMemo(() => {
    const result = [] as ExplorerRoute<string | ExplorerRouteKeyValues>[]

    const playgroundMenu: ExplorerRoute<string> = {
      key: "playground",
      title: "Playground",
      icon: SquareTerminal,
      isActive: false,
      path: "#",
      child: []
    }

    playgroundList.forEach(v => {
      playgroundMenu.child?.push({
      icon: v.icon,
      key: v.id.toString(),
      path: `/playground/${v.id}`,
      title: v.name,
    } as ExplorerRoute<string>)
    })

    result.push(playgroundMenu)

    return [...result, ...ROUTES,]
  }, [playgroundList])

  return {
    menuList
  }
}

export default useLayout