import { usePlayground } from '@/hooks/use-playground'
import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { ExplorerRoute, BreadcrumbItem } from '../../router/types'
import { SquareTerminal, Home } from 'lucide-react'
import { ExplorerRouteKeyValues } from '../../router/route-item'
import { ROUTES } from "../../router/route-item"

const useLayout = () => {
  const { playgroundList } = usePlayground()
  const location = useLocation()

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

  // Create a flat map of all routes for easy lookup
  const allRoutes = useMemo(() => {
    const flatRoutes = new Map<string, ExplorerRoute<string | ExplorerRouteKeyValues>>()

    // Add all main routes
    ROUTES.forEach(route => {
      flatRoutes.set(route.path, route)
    })

    // Add playground routes
    playgroundList.forEach(playground => {
      flatRoutes.set(`/playground/${playground.id}`, {
        key: playground.id.toString(),
        title: playground.name,
        icon: playground.icon,
        path: `/playground/${playground.id}`,
        breadcrumb: {
          title: playground.name,
          showInBreadcrumb: true,
          parent: '/create-contract'
        }
      })
    })

    return flatRoutes
  }, [playgroundList])

  // Generate breadcrumb items based on current location
  const breadcrumbItems = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = []
    const currentPath = location.pathname

    // Always start with Contract Creation as root
    items.push({
      title: 'Contract Creation',
      path: '/create-contract',
      icon: Home,
      isActive: false
    })

    // Find current route
    const currentRoute = allRoutes.get(currentPath)

    if (currentRoute?.breadcrumb?.showInBreadcrumb) {
      // If route has a parent, add it first
      if (currentRoute.breadcrumb.parent) {
        const parentRoute = allRoutes.get(currentRoute.breadcrumb.parent)
        if (parentRoute?.breadcrumb?.showInBreadcrumb) {
          items.push({
            title: parentRoute.breadcrumb.title,
            path: parentRoute.path,
            icon: typeof parentRoute.icon === 'string' ? undefined : parentRoute.icon,
            isActive: false
          })
        }
      }

      // Add current route
      items.push({
        title: currentRoute.breadcrumb.title,
        path: currentRoute.path,
        icon: typeof currentRoute.icon === 'string' ? undefined : currentRoute.icon,
        isActive: true
      })
    } else {
      // Fallback for routes without breadcrumb config
      if (currentPath.startsWith('/explorer')) {
        items.push({
          title: 'Explorer',
          path: '/explorer',
          isActive: currentPath === '/explorer'
        })

        if (currentPath !== '/explorer') {
          const pathSegments = currentPath.split('/').filter(Boolean)
          const lastSegment = pathSegments[pathSegments.length - 1]
          items.push({
            title: lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1),
            path: currentPath,
            isActive: true
          })
        }
      }
    }

    return items
  }, [location.pathname, allRoutes])

  return {
    menuList,
    breadcrumbItems,
    currentPath: location.pathname
  }
}

export default useLayout