import { createBrowserRouter, RouteObject } from 'react-router';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { EventsPage } from './pages/EventsPage';
import { InventoryPage } from './pages/InventoryPage';
import { MontajePage } from './pages/MontajePage';
import { DesmontajePage } from './pages/DesmontajePage';
import { VehiclesPage } from './pages/VehiclesPage';
import { WorkersPage } from './pages/WorkersPage';
import { ClientsPage } from './pages/ClientsPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { EventDetailPage } from './pages/EventDetailPage';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout><Dashboard /></MainLayout>,
  },
  {
    path: '/eventos',
    element: <MainLayout><EventsPage /></MainLayout>,
  },
  {
    path: '/eventos/:eventId',
    element: <MainLayout><EventDetailPage /></MainLayout>,
  },
  {
    path: '/inventario',
    element: <MainLayout><InventoryPage /></MainLayout>,
  },
  {
    path: '/montaje',
    element: <MainLayout><MontajePage /></MainLayout>,
  },
  {
    path: '/desmontaje',
    element: <MainLayout><DesmontajePage /></MainLayout>,
  },
  {
    path: '/vehiculos',
    element: <MainLayout><VehiclesPage /></MainLayout>,
  },
  {
    path: '/trabajadores',
    element: <MainLayout><WorkersPage /></MainLayout>,
  },
  {
    path: '/clientes',
    element: <MainLayout><ClientsPage /></MainLayout>,
  },
  {
    path: '/configuracion',
    element: <MainLayout><ConfigurationPage /></MainLayout>,
  },
];

export const router = createBrowserRouter(routes);