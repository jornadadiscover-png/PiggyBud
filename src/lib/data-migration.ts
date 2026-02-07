/**
 * Migra dados do localStorage de FinFunny para Piggy Bud.
 * Deve ser chamado antes do React renderizar para garantir que os stores 
 * do Zustand encontrem os dados nas chaves corretas.
 */
export function migrateLocalStorage() {
  const migrations: [string, string][] = [
    ['finfunny-transactions', 'piggy-bud-transactions'],
    ['finfunny-settings', 'piggy-bud-settings'],
  ];

  for (const [oldKey, newKey] of migrations) {
    const oldData = localStorage.getItem(oldKey);
    const newData = localStorage.getItem(newKey);

    // Only migrate if old data exists and new data doesn't
    if (oldData && !newData) {
      localStorage.setItem(newKey, oldData);
      localStorage.removeItem(oldKey);
      console.log(`[Piggy Bud] Migrated ${oldKey} → ${newKey}`);
    }
  }
}
