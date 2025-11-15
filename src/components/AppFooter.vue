<script setup lang="ts">
const openLink = async (url: string) => {
  // Use the opener plugin to open URLs
  const { openUrl } = await import("@tauri-apps/plugin-opener");
  await openUrl(url);
};
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-links">
        <button
          class="footer-link"
          title="Open Logbook+ Repository"
          @click="openLink('https://github.com/juddisjudd/logbook-overlay')"
        >
          Logbook+
        </button>
        <span class="footer-divider">•</span>
        <button
          class="footer-link"
          title="Open Arc Raiders Data Source"
          @click="openLink('https://github.com/RaidTheory/arcraiders-data')"
        >
          Data Source
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  height: 28px;
  flex-shrink: 0;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-link {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  padding: 0;
  transition: color 0.2s;
  font-family: "Barlow", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-decoration: none;
}

.footer-link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

.footer-divider {
  color: var(--color-text-secondary);
  font-size: 8px;
}
</style>
