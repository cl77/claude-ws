'use client';

import { Network, X, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflow-store';
import { TeamTreeSidebar } from './team-tree-sidebar';
import { TeamChatTab } from './team-chat-tab';
import { AgentDetailTab } from './agent-detail-tab';
import { TaskListTab } from './task-list-tab';
import { cn } from '@/lib/utils';

interface TeamViewProps {
  className?: string;
}

export function TeamView({ className }: TeamViewProps) {
  const {
    isOpen,
    closePanel,
    workflows,
    selectedAgentId,
    activeTab,
    selectAgent,
    setActiveTab,
    getActiveAgentCount,
    clearHistory,
  } = useWorkflowStore();

  const hasWorkflows = workflows.size > 0;
  const activeAgentCount = getActiveAgentCount();

  if (!isOpen || !hasWorkflows) return null;

  // Find selected agent node
  let selectedAgent = null;
  if (selectedAgentId) {
    for (const entry of workflows.values()) {
      const found = entry.nodes.find((n) => n.id === selectedAgentId);
      if (found) {
        selectedAgent = found;
        break;
      }
    }
  }

  // Check if there are any tasks across workflows
  let totalTasks = 0;
  for (const entry of workflows.values()) {
    totalTasks += entry.tasks.length;
  }

  const tabs = [
    { id: 'chat' as const, label: 'Team Chat' },
    { id: 'agent' as const, label: 'Agent', disabled: !selectedAgent },
    { id: 'tasks' as const, label: `Tasks${totalTasks > 0 ? ` (${totalTasks})` : ''}` },
  ];

  const handleClearAll = () => {
    for (const attemptId of workflows.keys()) {
      clearHistory(attemptId);
    }
  };

  // Only show clear button when no agents are active
  const canClear = activeAgentCount === 0;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/50 z-40 sm:hidden"
        onClick={closePanel}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-[50vw] min-w-[400px] max-w-[800px] bg-background border-l shadow-lg z-50 flex flex-col',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Network className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Agent Team</h2>
            {activeAgentCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {activeAgentCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {canClear && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearAll}
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                title="Clear history"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={closePanel}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body: tree + content */}
        <div className="flex flex-1 min-h-0">
          {/* Tree sidebar */}
          <TeamTreeSidebar
            workflows={workflows}
            selectedAgentId={selectedAgentId}
            onSelectAgent={selectAgent}
          />

          {/* Content area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tab bar */}
            <div className="flex border-b border-border shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={cn(
                    'px-3 py-2 text-xs font-medium transition-colors border-b-2',
                    activeTab === tab.id
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                    tab.disabled && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-h-0">
              {activeTab === 'chat' && <TeamChatTab workflows={workflows} />}
              {activeTab === 'agent' && selectedAgent && (
                <AgentDetailTab agent={selectedAgent} />
              )}
              {activeTab === 'agent' && !selectedAgent && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">Select an agent from the tree</p>
                </div>
              )}
              {activeTab === 'tasks' && <TaskListTab workflows={workflows} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
