# Sistema de Gestión de Casos - intechlab

## 🎯 Funcionalidades Implementadas

### Para Administradores

Los usuarios con rol de **administrador** tienen acceso completo al sistema:

#### Página de Administración (`/admin`)

- ✅ **Crear nuevos casos**: Formulario completo para registrar trabajos
  - Nombre del paciente
  - Tratamiento (carillas, coronas, prótesis, etc.)
  - Dentista solicitante
  - Fecha y hora de entrega comprometida
  - Técnico asignado
  - Prioridad (alta, media, baja)
  - Notas adicionales opcionales

- ✅ **Vista global en tiempo real**: Panel con todos los casos activos
  - Estadísticas por estado (pendiente, en-proceso, listo, entregado)
  - Lista completa de trabajos con todos los detalles
  - Indicadores visuales de prioridad (🔴 Alta, 🟠 Media, 🟢 Baja)
  - Sincronización automática con Firebase

### Para Usuarios (Técnicos)

Los usuarios normales ven solo los casos asignados a ellos:

#### Dashboard Personal (`/dashboard`)

- ✅ **Vista filtrada automáticamente**: Solo muestra trabajos asignados al usuario actual
- ✅ **Organización por estados**: Columnas separadas para cada etapa
  - Pendiente
  - En proceso
  - Listo
  - Entregado

- ✅ **Actualización de progreso**: Cada tarjeta incluye un botón para avanzar el estado
  - Pendiente → En proceso
  - En proceso → Listo
  - Listo → Entregado

- ✅ **Información completa del caso**:
  - Nombre del paciente
  - Tipo de tratamiento
  - Dentista solicitante
  - Fecha de entrega
  - Notas del administrador
  - Badge visual del estado actual

## 🚀 Cómo Usar el Sistema

### Paso 1: Configurar Firebase

1. **Crear proyecto en Firebase**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Crea un nuevo proyecto
   - Habilita Authentication (Email/Password)
   - Habilita Firestore Database

2. **Configurar variables de entorno**
   - Copia las credenciales de Firebase
   - Crea/edita el archivo `.env.local` en la raíz del proyecto
   - Agrega todas las variables (ver `FIREBASE_SETUP.md`)

3. **Configurar reglas de seguridad de Firestore**
   - En Firebase Console, ve a Firestore → Rules
   - Copia y pega las reglas del archivo `FIREBASE_SETUP.md`
   - Publica los cambios

### Paso 2: Crear Usuarios

1. **Registrar usuarios** en Firebase Authentication
   - Firebase Console → Authentication → Add user
   - O permite registro desde tu app (si implementas esa funcionalidad)

2. **Asignar roles** (ver `FIREBASE_SETUP.md` para métodos detallados)
   - Usa Firebase Admin SDK o Functions
   - Asigna custom claim `role: "admin"` al primer administrador
   - Los usuarios sin este claim son técnicos normales

### Paso 3: Flujo de Trabajo

#### Como Administrador:

1. **Accede a** `/admin`
2. **Completa el formulario** con la información del caso
3. **Asigna el caso** a un técnico específico (escribe su nombre exacto)
4. **Establece la prioridad** y fecha de entrega
5. **Registra el caso** - Se guarda automáticamente en Firebase
6. **Monitorea en tiempo real** todos los casos desde el panel lateral

#### Como Técnico:

1. **Accede a** `/dashboard`
2. **Visualiza tus casos asignados** organizados por estado
3. **Trabaja en cada caso** según la prioridad
4. **Actualiza el progreso** haciendo clic en el botón de cada tarjeta:
   - "Avanzar a En proceso" cuando comiences
   - "Avanzar a Listo" cuando termines
   - "Avanzar a Entregado" cuando entregues
5. **Los cambios se sincronizan** instantáneamente con el dashboard del admin

## 📊 Estructura de Datos

Cada caso se guarda en Firestore con esta estructura:

```typescript
{
  patientName: "Andrea Tapia",
  treatment: "Carillas 11-21",
  dentist: "Dr. Contreras",
  dueDate: Timestamp, // Fecha y hora de entrega
  assignedTo: "Juan Pérez", // Nombre del técnico
  status: "pendiente", // pendiente | en-proceso | listo | entregado
  priority: "alta", // alta | media | baja
  notes: "Control cromático especial", // Opcional
  createdAt: Timestamp // Fecha de creación automática
}
```

## 🔒 Seguridad

El sistema implementa reglas de seguridad en Firestore:

- ✅ **Administradores**: Acceso total (crear, leer, actualizar, eliminar)
- ✅ **Técnicos**:
  - Solo pueden leer casos asignados a ellos
  - Solo pueden actualizar el campo `status` de sus casos
  - No pueden crear ni eliminar casos

## 🎨 Características de UI/UX

- ✅ **Sincronización en tiempo real**: Los cambios se reflejan instantáneamente
- ✅ **Estados visuales claros**: Colores distintivos para cada etapa
- ✅ **Prioridades visibles**: Emojis de color según urgencia
- ✅ **Responsive**: Funciona en desktop, tablet y móvil
- ✅ **Feedback inmediato**: Mensajes de éxito/error en operaciones
- ✅ **Loading states**: Indicadores mientras se cargan datos

## 📝 Próximas Mejoras Sugeridas

1. **Sistema de notificaciones**: Alertar cuando se asigna un nuevo caso
2. **Historial de cambios**: Log de quién cambió qué y cuándo
3. **Filtros avanzados**: Por fecha, dentista, prioridad
4. **Búsqueda**: Encontrar casos por nombre de paciente
5. **Estadísticas**: Métricas de productividad y tiempos promedio
6. **Comentarios**: Comunicación entre admin y técnico en cada caso
7. **Archivos adjuntos**: Subir fotos, escaneos, documentos
8. **Vista de calendario**: Visualizar entregas en calendario
9. **Exportar reportes**: PDF o Excel con casos completados
10. **Notificaciones push**: Alertas en el navegador o móvil

## 🐛 Solución de Problemas

### "No puedo crear casos"

- Verifica que tu usuario tenga el claim `role: "admin"`
- Revisa las reglas de Firestore
- Confirma que Firebase esté configurado en `.env.local`

### "No veo mis casos asignados"

- Asegúrate de que el nombre en `assignedTo` coincida EXACTAMENTE con tu nombre en Firebase Auth (displayName)
- Verifica que estés autenticado correctamente

### "Los cambios no se sincronizan"

- Revisa la consola del navegador en busca de errores
- Confirma que las reglas de Firestore estén publicadas
- Verifica tu conexión a internet

## 📚 Archivos Clave

- `/src/app/(portal)/admin/page.tsx` - Página de administración
- `/src/app/(portal)/dashboard/page.tsx` - Dashboard de técnicos
- `/src/lib/jobs/mutations.ts` - Creación de casos
- `/src/lib/jobs/actions.ts` - Actualización de estados
- `/src/hooks/use-jobs.ts` - Hook para leer casos
- `/src/types/job.ts` - Tipos TypeScript
- `FIREBASE_SETUP.md` - Configuración detallada de Firebase
