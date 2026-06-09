// ============================================================
// CONFLICT ENGINE – Last Write Wins com timestamp
// ============================================================

export const conflict = {
  // Compara versões (usando updated_at e sync_version)
  resolve(cloudRecord, localRecord) {
    if (!localRecord) return 'cloud'; // só existe na nuvem
    if (!cloudRecord) return 'local'; // só existe local
    
    const cloudTime = new Date(cloudRecord.updated_at || cloudRecord.ultimaAtualizacao);
    const localTime = new Date(localRecord.ultimaAtualizacao || localRecord.updated_at);
    
    if (cloudTime > localTime) return 'cloud';
    if (localTime > cloudTime) return 'local';
    return 'equal';
  },
  
  // Decide se deve enviar registro local para nuvem
  shouldPush(localRecord, cloudRecord) {
    if (!cloudRecord) return true;
    const localTime = new Date(localRecord.ultimaAtualizacao);
    const cloudTime = new Date(cloudRecord.updated_at);
    return localTime > cloudTime;
  },
  
  // Merge inteligente (exemplo para campos que não sobrescrevem tudo)
  merge(cloud, local) {
    // Prioriza dados não conflitantes – para simplificar, usamos Last Write Wins
    const cloudTime = new Date(cloud.updated_at);
    const localTime = new Date(local.ultimaAtualizacao);
    return cloudTime > localTime ? cloud : local;
  }
};