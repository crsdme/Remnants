import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

function useCheckboxTree(initialTree: any) {
  const initialCheckedNodes = useMemo(() => {
    const checkedSet = new Set<string>()
    const initializeCheckedNodes = (node: any) => {
      if (node.defaultChecked) {
        checkedSet.add(node.id)
      }
      node.children?.forEach(initializeCheckedNodes)
    }
    initializeCheckedNodes(initialTree)
    return checkedSet
  }, [initialTree])

  const [checkedNodes, setCheckedNodes] = useState<Set<string>>(initialCheckedNodes)

  const isChecked = useCallback(
    (node: any) => {
      if (!node.children) {
        return checkedNodes.has(node.id)
      }

      const childrenChecked = node.children.map((child: any) => isChecked(child))
      if (childrenChecked.every((status: any) => status === true)) {
        return true
      }
      if (childrenChecked.some((status: any) => status === true || status === 'indeterminate')) {
        return 'indeterminate'
      }
      return false
    },
    [checkedNodes],
  )

  const handleCheck = useCallback(
    (node: any) => {
      const newCheckedNodes = new Set(checkedNodes)

      const toggleNode = (n: any, check: boolean) => {
        if (check) {
          newCheckedNodes.add(n.id)
        }
        else {
          newCheckedNodes.delete(n.id)
        }
        n.children?.forEach((child: any) => toggleNode(child, check))
      }

      const currentStatus = isChecked(node)
      const newCheck = currentStatus !== true

      toggleNode(node, newCheck)
      setCheckedNodes(newCheckedNodes)
    },
    [checkedNodes, isChecked],
  )

  return { isChecked, handleCheck }
}

interface CheckboxTreeProps {
  tree: any
  renderNode: (props: {
    node: any
    isChecked: boolean | 'indeterminate'
    onCheckedChange: () => void
    children: Awaited<React.ReactNode>
    isExpanded: boolean
    onToggleExpand: () => void
  }) => Awaited<React.ReactNode>
}

export function CheckboxTree({ tree, renderNode }: CheckboxTreeProps): Awaited<React.ReactNode> {
  const { isChecked, handleCheck } = useCheckboxTree(tree)

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      }
      else {
        next.add(id)
      }
      return next
    })
  }, [])

  const renderTreeNode = (node: any): Awaited<React.ReactNode> => {
    const isExpanded = expandedIds.has(node.id)
    const hasChildren = !!node.children?.length
    const children = hasChildren && isExpanded
      ? node.children.map(renderTreeNode)
      : null

    return renderNode({
      node,
      isChecked: isChecked(node),
      onCheckedChange: () => handleCheck(node),
      children,
      isExpanded,
      onToggleExpand: () => toggleExpand(node.id),
    })
  }

  return renderTreeNode(tree)
}
