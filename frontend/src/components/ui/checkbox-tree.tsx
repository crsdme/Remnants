import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

function useCheckboxTree(initialTree) {
  const initialCheckedNodes = useMemo(() => {
    const checkedSet = new Set<string>()
    const initializeCheckedNodes = (node) => {
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
    (node) => {
      if (!node.children) {
        return checkedNodes.has(node.id)
      }

      const childrenChecked = node.children.map(child => isChecked(child))
      if (childrenChecked.every(status => status === true)) {
        return true
      }
      if (childrenChecked.some(status => status === true || status === 'indeterminate')) {
        return 'indeterminate'
      }
      return false
    },
    [checkedNodes],
  )

  const handleCheck = useCallback(
    (node) => {
      const newCheckedNodes = new Set(checkedNodes)

      const toggleNode = (n, check) => {
        if (check) {
          newCheckedNodes.add(n.id)
        }
        else {
          newCheckedNodes.delete(n.id)
        }
        n.children?.forEach(child => toggleNode(child, check))
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
  tree
  renderNode: (props: {
    node
    isChecked: boolean | 'indeterminate'
    onCheckedChange: () => void
    children: React.ReactNode
    isExpanded: boolean
    onToggleExpand: () => void
  }) => React.ReactNode
}

export function CheckboxTree({ tree, renderNode }: CheckboxTreeProps) {
  const { isChecked, handleCheck } = useCheckboxTree(tree)
  // eslint-disable-next-line react-hooks-extra/prefer-use-state-lazy-initialization
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

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

  const renderTreeNode = (node): React.ReactNode => {
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
