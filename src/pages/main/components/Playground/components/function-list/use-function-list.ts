import { AbiValidator } from '@/service/evm-analyzer/abi'
import useEVMStore from '@/store/evm'
import { useMemo } from 'react'
import { MenuAction, MenuItem, MenuItemChild } from './types'
import { BookText, PencilLine, Zap } from 'lucide-react'

const useFunctionList = () => {
  const abi = useEVMStore(store => store.abi)

  const handleClickFunction = (action: MenuAction) => {
    console.log(action)
  }

  const functions = useMemo(() => {
    const abiValidator = new AbiValidator(abi)
    const readFunctions = abiValidator.getReadFunctions()
    const writeFunctions = abiValidator.getWriteFunctions()
    const events = abiValidator.getEvents()

    const readFunctionsMenu: MenuItemChild[] = readFunctions.map(f => ({
      id: f.name,
      title: f.name,
      onClick: handleClickFunction
    }))

    const writeFunctionsMenu: MenuItemChild[] = writeFunctions.map(f => ({
      id: f.name,
      title: f.name,
      onClick: handleClickFunction
    }))

    const eventsMenu: MenuItemChild[] = events.map(f => ({
      id: f.name,
      title: f.name,
      onClick: handleClickFunction
    }))

    return [
      {
        icon: BookText,
        title: "Read Functions",
        isActive: false,
        items: readFunctionsMenu,
      },
      {
        icon: PencilLine,
        title: "Write Functions",
        isActive: false,
        items: writeFunctionsMenu,
      },
      {
        icon: Zap,
        title: "Events",
        isActive: false,
        items: eventsMenu,
      }
    ] as MenuItem[]
  }, [abi])

  return {
    functions
  }
}

export default useFunctionList;
