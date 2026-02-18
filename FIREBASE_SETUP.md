# Configuración de Firebase para intechlab-app

## Estructura de la colección `jobs`

Cada documento en la colección `jobs` tiene la siguiente estructura:

```javascript
{
  patientName: string,      // Nombre del paciente
  treatment: string,        // Tipo de tratamiento
  dentist: string,          // Nombre del dentista
  dueDate: Timestamp,       // Fecha límite de entrega
  assignedTo: string,       // Nombre del técnico asignado
  status: string,           // pendiente | en-proceso | listo | entregado
  priority: string,         // alta | media | baja
  notes: string (opcional), // Notas adicionales
  createdAt: Timestamp      // Fecha de creación
}
```

## Paso a paso para configurar Firestore

1. **Habilita Firestore**

- Firebase Console → _Build_ → _Firestore Database_.
- Haz clic en **Create database**.
- Elige **Production mode** (habilita las reglas que definiremos abajo).
- Selecciona la ubicación más cercana a tus usuarios y confirma.

2. **Crea la colección `jobs`**

- Una vez creado Firestore, pulsa **Start collection**.
- Nombre: `jobs`.
- Para el documento inicial puedes ingresar datos de prueba siguiendo la estructura anterior (o deja los campos vacíos y luego eliminas el doc).
- Confirma para que la colección quede creada; el documento se puede borrar después.

3. **Configura las reglas de seguridad**

- En Firestore → pestaña **Rules**.
- Reemplaza todo con el bloque de reglas que encontrarás en la siguiente sección y pulsa **Publish**.
- Esto asegura que solo administradores puedan crear/eliminar y que cada técnico lea sus casos.

4. **Crea índices cuando Firestore lo solicite**

- Al ejecutar la app, si ves el error "FAILED_PRECONDITION: The query requires an index", haz clic en el enlace que genera Firebase para crear el índice automáticamente.
- Suele necesitar los índices listados más abajo (assignedTo + dueDate, status + dueDate).
- La creación toma unos segundos/minutos y solo se hace una vez por combinación.

5. **Verifica las lecturas/escrituras**

- Desde Firebase Console → _Firestore_ podrás ver cómo se insertan documentos nuevos cuando creas casos desde `/admin`.
- Cada documento debe actualizar su `status` conforme los técnicos cambian el progreso desde `/dashboard`.

6. **(Opcional) Semilla de datos**

- Puedes utilizar el formulario de `/admin` para ingresar 2 o 3 casos de ejemplo y confirmar que se sincronizan con el dashboard de técnicos.
- Si prefieres hacerlo manualmente, usa **Add document** dentro de la colección `jobs` y rellena los campos.

## Reglas de seguridad de Firestore

Copia y pega estas reglas en Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función helper para verificar si el usuario está autenticado
    function isSignedIn() {
      return request.auth != null;
    }

    // Función helper para verificar si el usuario es administrador
    function isAdmin() {
      return isSignedIn() &&
             request.auth.token.role == "admin";
    }

    // Función helper para verificar si el trabajo está asignado al usuario actual
    function isAssignedToMe(jobData) {
      return isSignedIn() &&
             jobData.assignedTo == request.auth.token.name;
    }

    // Reglas para la colección 'jobs'
    match /jobs/{jobId} {

      // Lectura:
      // - Admins pueden leer todo
      // - Usuarios normales solo pueden leer trabajos asignados a ellos
      allow read: if isAdmin() ||
                     isAssignedToMe(resource.data);

      // Creación:
      // - Solo admins pueden crear nuevos trabajos
      allow create: if isAdmin() &&
                       request.resource.data.keys().hasAll([
                         'patientName',
                         'treatment',
                         'dentist',
                         'dueDate',
                         'assignedTo',
                         'status',
                         'priority'
                       ]) &&
                       request.resource.data.status == 'pendiente';

      // Actualización:
      // - Admins pueden actualizar cualquier campo
      // - Usuarios normales solo pueden actualizar el campo 'status' de sus trabajos asignados
      allow update: if isAdmin() ||
                       (isAssignedToMe(resource.data) &&
                        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']));

      // Eliminación:
      // - Solo admins pueden eliminar trabajos
      allow delete: if isAdmin();
    }
  }
}
```

## Configuración de Custom Claims (Admin Role)

Para asignar el rol de administrador a un usuario, necesitas usar Firebase Admin SDK o Functions.

### Opción 1: Usando Firebase Functions (Recomendado para producción)

Crea una función en Firebase Functions:

```javascript
const admin = require("firebase-admin");
admin.initializeApp();

exports.setAdminRole = functions.https.onCall(async (data, context) => {
  // Solo un admin existente puede hacer esto (o hazlo manualmente la primera vez)
  if (!context.auth.token.role === "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Solo administradores pueden asignar roles.",
    );
  }

  const userEmail = data.email;

  try {
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    return { message: `Rol admin asignado a ${userEmail}` };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
```

### Opción 2: Usando Firebase Admin SDK (Manual - Para desarrollo)

Puedes ejecutar este script en Node.js localmente:

```javascript
const admin = require("firebase-admin");
const serviceAccount = require("./path-to-your-service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function setAdminRole(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });
    console.log(`✅ Usuario ${email} ahora es admin`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Reemplaza con el email del usuario que quieres hacer admin
setAdminRole("admin@intechlab.com");
```

### Opción 3: Usando Firebase Console + Extension

También puedes usar la extensión "Set User Roles" disponible en Firebase Extensions.

## Índices compuestos (Composite Indexes)

Si experimentas errores de índices faltantes, Firebase te dará un enlace directo para crearlos. Típicamente necesitarás:

1. **jobs**: `assignedTo` (Ascending) + `dueDate` (Ascending)
2. **jobs**: `status` (Ascending) + `dueDate` (Ascending)

Estos se crean automáticamente cuando Firebase detecta la consulta por primera vez.

## Configuración del archivo .env.local

Asegúrate de tener todas estas variables en tu archivo `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Funcionalidades implementadas

### Para Administradores:

- ✅ Crear nuevos casos (trabajos)
- ✅ Ver todos los casos en tiempo real
- ✅ Ver estadísticas por estado
- ✅ Asignar casos a técnicos
- ✅ Establecer prioridades

### Para Usuarios (Técnicos):

- ✅ Ver solo sus casos asignados
- ✅ Actualizar el estado de sus trabajos (pendiente → en-proceso → listo → entregado)
- ✅ Ver detalles completos de cada caso
- ✅ Filtrado automático por usuario

## Próximos pasos sugeridos

1. **Notificaciones**: Implementar notificaciones cuando se asigna un nuevo caso
2. **Historial**: Agregar un log de cambios de estado
3. **Filtros avanzados**: Permitir filtrar por fecha, prioridad, dentista
4. **Comentarios**: Sistema de comentarios en cada caso
5. **Archivos adjuntos**: Subir fotos o documentos relacionados a cada caso
6. **Calendario**: Vista de calendario con las fechas de entrega
