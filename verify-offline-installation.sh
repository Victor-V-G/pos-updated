#!/usr/bin/env bash
# Script de verificación - Todos los archivos offline están en su lugar

echo "🔍 Verificando instalación del sistema offline..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
total=0
found=0

check_file() {
  local file=$1
  local description=$2
  
  total=$((total + 1))
  
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅${NC} $description"
    echo "   📁 $file"
    found=$((found + 1))
  else
    echo -e "${RED}❌${NC} $description"
    echo "   📁 $file (NO ENCONTRADO)"
  fi
  echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 INFRAESTRUCTURA OFFLINE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "src/core/infrastructure/offline/offlineStorage.ts" "IndexedDB Wrapper"
check_file "src/core/infrastructure/offline/offlineSync.ts" "Gestor de datos offline"
check_file "src/core/infrastructure/offline/autoSync.ts" "Sincronización automática"
check_file "src/core/infrastructure/offline/OfflineSyncProvider.tsx" "Provider React"
check_file "src/core/infrastructure/offline/offlineConfig.ts" "Configuración"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎣 HOOKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "src/core/infrastructure/offline/useOnlineStatus.ts" "Hook - Detectar conexión"
check_file "src/core/infrastructure/offline/useOfflineSync.ts" "Hook - Principal (simple)"
check_file "src/core/infrastructure/offline/useSyncStatus.ts" "Hook - Avanzado (detalles)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 INTEGRACIONES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "src/core/infrastructure/offline/offlineWrapper.ts" "Wrappers Firebase"
check_file "src/core/infrastructure/offline/index.ts" "Barrel exports"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 COMPONENTES UI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "src/shared/components/ConnectionIndicator.tsx" "Indicador simple"
check_file "src/shared/components/SyncStatusPanel.tsx" "Panel avanzado"
check_file "src/shared/components/ProductosOfflineExample.tsx" "Ejemplo completo"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 DOCUMENTACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "OFFLINE_QUICK_START.md" "Guía rápida"
check_file "OFFLINE_EXAMPLES.md" "Ejemplos de código"
check_file "OFFLINE_INTEGRATION_GUIDE.md" "Guía completa"
check_file "INTEGRATION_CHECKLIST.md" "Plan de integración"
check_file "SYSTEM_OVERVIEW.md" "Descripción técnica"
check_file "README_OFFLINE.txt" "Este resumen"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $found -eq $total ]; then
  echo -e "${GREEN}✅ ¡TODO INSTALADO CORRECTAMENTE!${NC}"
  echo ""
  echo "Archivos verificados: $found / $total"
  echo ""
  echo "Próximos pasos:"
  echo "1. Lee: OFFLINE_QUICK_START.md"
  echo "2. Mira: ProductosOfflineExample.tsx"
  echo "3. Integra en tus componentes"
  echo "4. Prueba offline en DevTools"
  echo ""
else
  echo -e "${RED}❌ FALTAN ALGUNOS ARCHIVOS${NC}"
  echo ""
  echo "Archivos encontrados: $found / $total"
  echo ""
  echo -e "${YELLOW}Revisa los archivos marcados con ❌ arriba${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
