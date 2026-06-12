<template>
  <div class="topbar">
    <div class="topbar-actions">
      <button class="btn-primary">
        <i class="fas fa-plus"></i>
        New Download
      </button>
      <button class="btn-secondary">
        <i class="fas fa-magnet"></i>
        Add Torrent
      </button>
    </div>

    <div class="topbar-middle">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Search"
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="topbar-right">
      <button class="btn-icon-subtle" title="User menu">
        <i class="fas fa-user-circle"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  search: [query: string];
}>();

const handleSearch = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit('search', value);
};
</script>

<style scoped>
.topbar {
  height: var(--topbar-height);
  background-color: white;
  border-bottom: 1px solid var(--border-gray);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-lg);
  gap: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.topbar-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.btn-primary {
  background-color: var(--primary-blue);
  color: white;
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-blue-hover);
}

.btn-secondary {
  background-color: var(--light-blue);
  color: var(--primary-blue);
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #c4e3ff;
}

.topbar-middle {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 400px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background-color: var(--bg-gray);
  border: 1px solid var(--border-gray);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-md);
  flex: 1;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--primary-blue);
  background-color: white;
}

.search-box i {
  color: var(--neutral-gray);
  font-size: 14px;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--spacing-sm) 0;
  font-size: 14px;
  outline: none;
}

.search-box input::placeholder {
  color: var(--neutral-gray);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.btn-icon-subtle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--neutral-gray);
  font-size: 20px;
  transition: all 0.2s ease;
}

.btn-icon-subtle:hover {
  background-color: var(--bg-gray);
  color: var(--primary-blue);
}
</style>
