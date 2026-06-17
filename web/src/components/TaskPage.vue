<template>
  
</template>

<script setup lang="ts">

</script>

<style scoped>
.task-list {
  background-color: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background-color: var(--bg-gray);
  border-bottom: 1px solid var(--border-gray);
  font-weight: 600;
  color: var(--neutral-gray);
  font-size: 13px;
  position: sticky;
  top: 0;
}

.col-file,
.col-progress,
.col-speed,
.col-eta,
.col-actions {
  display: flex;
  align-items: center;
}

.col-actions {
  justify-content: flex-end;
}

.tasks-container {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}

.empty-state {
  padding: var(--spacing-2xl);
  text-align: center;
  color: var(--neutral-gray);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}

@media (max-width: 1200px) {
  .table-header {
    grid-template-columns: 1fr 1.5fr 1fr 1fr;
  }

  .col-speed {
    display: none;
  }
}

@media (max-width: 768px) {
  .table-header {
    grid-template-columns: 1fr 1fr;
  }

  .col-eta,
  .col-actions {
    display: none;
  }
}
</style>
