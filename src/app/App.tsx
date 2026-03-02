import { RouterProvider } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { router } from './routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { INVENTORY_VERSION, VEHICLES_VERSION, EVENTS_VERSION, WORKERS_VERSION } from './data/initialData';

function AppContent() {
  const { isAuthenticated } = useAuth();

  // Limpiar base de datos al cargar la aplicación
  useEffect(() => {
    // Verificar si necesitamos limpiar los datos
    const currentEventsVersion = localStorage.getItem('allegra_events_version');
    const currentInventoryVersion = localStorage.getItem('allegra_inventory_version');
    const currentVehiclesVersion = localStorage.getItem('allegra_vehicles_version');
    const currentWorkersVersion = localStorage.getItem('allegra_workers_version');

    // Si las versiones han cambiado, limpiar los datos
    if (
      currentEventsVersion !== EVENTS_VERSION.toString() ||
      currentInventoryVersion !== INVENTORY_VERSION.toString() ||
      currentVehiclesVersion !== VEHICLES_VERSION.toString() ||
      currentWorkersVersion !== WORKERS_VERSION.toString()
    ) {
      // Limpiar todos los datos del sistema
      localStorage.removeItem('allegra_events');
      localStorage.removeItem('allegra_inventory');
      localStorage.removeItem('allegra_vehicles');
      localStorage.removeItem('allegra_workers');
      
      // Actualizar las versiones
      localStorage.setItem('allegra_events_version', EVENTS_VERSION.toString());
      localStorage.setItem('allegra_inventory_version', INVENTORY_VERSION.toString());
      localStorage.setItem('allegra_vehicles_version', VEHICLES_VERSION.toString());
      localStorage.setItem('allegra_workers_version', WORKERS_VERSION.toString());
      
      console.log('Base de datos limpiada - Iniciando con datos vacíos');
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}