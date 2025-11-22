// Plugin para registrar iconos globalmente
import * as TablerIcons from '@tabler/icons-vue'
import * as LucideIcons from 'lucide-vue-next'

export default {
  install(app) {
    // Registrar todos los iconos de Tabler con prefijo Icon
    Object.entries(TablerIcons).forEach(([name, component]) => {
      if (name.startsWith('Icon')) {
        app.component(name, component)
      }
    })

    // Registrar todos los iconos de Lucide directamente
    Object.entries(LucideIcons).forEach(([name, component]) => {
      // Solo registrar componentes válidos de Vue
      if (typeof component === 'object' && component !== null) {
        app.component(name, component)
      }
    })
  }
}
