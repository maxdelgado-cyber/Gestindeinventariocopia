import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Activity, Package, Truck, Users, Filter, ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Event, InventoryItem, Vehicle, Worker } from '../types/allegra';
import { eventsAPI, inventoryAPI, vehiclesAPI, workersAPI } from '../lib/api';
import { INITIAL_EVENTS, INITIAL_INVENTORY, INITIAL_VEHICLES, INITIAL_WORKERS } from '../data/initialData';
import { Button } from '../components/ui/button';

export function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para filtro de mes
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsData, inventoryData, vehiclesData, workersData] = await Promise.all([
        eventsAPI.getAll().catch(() => null),
        inventoryAPI.getAll().catch(() => null),
        vehiclesAPI.getAll().catch(() => null),
        workersAPI.getAll().catch(() => null),
      ]);

      const loadedEvents = eventsData && eventsData.length > 0 
        ? eventsData 
        : JSON.parse(localStorage.getItem('allegra_events') || 'null') || INITIAL_EVENTS;
      
      const loadedInventory = inventoryData && inventoryData.length > 0
        ? inventoryData
        : JSON.parse(localStorage.getItem('allegra_inventory') || 'null') || INITIAL_INVENTORY;
      
      const loadedVehicles = vehiclesData && vehiclesData.length > 0
        ? vehiclesData
        : JSON.parse(localStorage.getItem('allegra_vehicles') || 'null') || INITIAL_VEHICLES;
      
      const loadedWorkers = workersData && workersData.length > 0
        ? workersData
        : JSON.parse(localStorage.getItem('allegra_workers') || 'null') || INITIAL_WORKERS;

      setEvents(loadedEvents);
      setInventory(loadedInventory);
      setVehicles(loadedVehicles);
      setWorkers(loadedWorkers);

      localStorage.setItem('allegra_events', JSON.stringify(loadedEvents));
      localStorage.setItem('allegra_inventory', JSON.stringify(loadedInventory));
      localStorage.setItem('allegra_vehicles', JSON.stringify(loadedVehicles));
      localStorage.setItem('allegra_workers', JSON.stringify(loadedWorkers));

    } catch (error: any) {
      if (error.message !== 'BACKEND_OFFLINE') {
        console.error('Error cargando datos del dashboard:', error);
      }
      
      const localEvents = JSON.parse(localStorage.getItem('allegra_events') || 'null') || INITIAL_EVENTS;
      const localInventory = JSON.parse(localStorage.getItem('allegra_inventory') || 'null') || INITIAL_INVENTORY;
      const localVehicles = JSON.parse(localStorage.getItem('allegra_vehicles') || 'null') || INITIAL_VEHICLES;
      const localWorkers = JSON.parse(localStorage.getItem('allegra_workers') || 'null') || INITIAL_WORKERS;
      
      setEvents(localEvents);
      setInventory(localInventory);
      setVehicles(localVehicles);
      setWorkers(localWorkers);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para navegar entre meses
  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Filtrar eventos por mes seleccionado
  const eventosDelMes = events.filter(event => {
    const fechaEvento = new Date(event.fechaInicio);
    return fechaEvento.getMonth() === selectedMonth && fechaEvento.getFullYear() === selectedYear;
  });

  // Calcular estadísticas del mes
  const statsDelMes = {
    totalEventos: eventosDelMes.length,
    eventosCerrados: eventosDelMes.filter(e => e.estado === 'Cerrado').length,
    
    // Solo contadores de estado de pago (sin montos)
    eventosPagados: eventosDelMes.filter(e => e.estadoPago === 'Pagado').length,
    eventosAbonados: eventosDelMes.filter(e => e.estadoPago === 'Abonado').length,
    eventosPendientes: eventosDelMes.filter(e => e.estadoPago === 'Pendiente de pago' || !e.estadoPago).length,
  };

  // Estadísticas generales (sin filtro)
  const statsGenerales = {
    equipoDisponible: inventory.filter(i => i.estado === 'Disponible').reduce((sum, i) => sum + i.cantidad, 0),
    equipoReservado: inventory.filter(i => i.estado === 'Reservado').reduce((sum, i) => sum + i.cantidad, 0),
    equipoDañado: inventory.filter(i => i.estado === 'Dañado').reduce((sum, i) => sum + i.cantidad, 0),
    vehiculosDisponibles: vehicles.filter(v => v.estado === 'Disponible').length,
    trabajadoresActivos: workers.filter(w => w.estado === 'Activo').length,
  };

  // Eventos por tipo del mes con estados de pago
  const eventosPorTipo = eventosDelMes.reduce((acc, event) => {
    if (!acc[event.tipoEvento]) {
      acc[event.tipoEvento] = { 
        total: 0, 
        pagados: 0, 
        abonados: 0, 
        pendientes: 0 
      };
    }
    acc[event.tipoEvento].total += 1;
    if (event.estadoPago === 'Pagado') acc[event.tipoEvento].pagados += 1;
    else if (event.estadoPago === 'Abonado') acc[event.tipoEvento].abonados += 1;
    else acc[event.tipoEvento].pendientes += 1;
    return acc;
  }, {} as Record<string, { total: number; pagados: number; abonados: number; pendientes: number }>);

  const capacidadOperativa = Math.round(
    ((statsGenerales.equipoDisponible / (statsGenerales.equipoDisponible + statsGenerales.equipoReservado + statsGenerales.equipoDañado)) * 100) || 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-1">Análisis detallado mensual - Sistema Allegra</p>
        </div>
      </div>

      {/* Filtro de Mes */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-6 w-6" />
              <span className="text-sm font-medium">Filtrar por mes:</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePreviousMonth}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {meses[selectedMonth]} {selectedYear}
                </div>
                <div className="text-xs opacity-90">
                  {eventosDelMes.length} evento{eventosDelMes.length !== 1 ? 's' : ''} en este mes
                </div>
              </div>
              
              <Button
                onClick={handleNextMonth}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <Button
              onClick={() => {
                setSelectedMonth(new Date().getMonth());
                setSelectedYear(new Date().getFullYear());
              }}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 border border-white/30"
            >
              Mes Actual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estados de Pago del Mes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Eventos Pagados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {statsDelMes.eventosPagados}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {statsDelMes.totalEventos > 0 ? Math.round((statsDelMes.eventosPagados / statsDelMes.totalEventos) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Eventos Abonados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">
              {statsDelMes.eventosAbonados}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {statsDelMes.totalEventos > 0 ? Math.round((statsDelMes.eventosAbonados / statsDelMes.totalEventos) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Pendientes de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">
              {statsDelMes.eventosPendientes}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {statsDelMes.totalEventos > 0 ? Math.round((statsDelMes.eventosPendientes / statsDelMes.totalEventos) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              Total del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600">
              {statsDelMes.totalEventos}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {statsDelMes.eventosCerrados} cerrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Eventos por Tipo con Estados de Pago */}
      {Object.keys(eventosPorTipo).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Eventos por Tipo - {meses[selectedMonth]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(eventosPorTipo)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([tipo, data]) => {
                  const porcentajePagadosTipo = data.total > 0 ? Math.round((data.pagados / data.total) * 100) : 0;
                  return (
                    <div key={tipo} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{tipo}</h4>
                          <p className="text-sm text-gray-600">{data.total} evento{data.total !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="text-center">
                            <div className="text-xs text-green-600 mb-1">Pagado</div>
                            <div className="text-xl font-bold text-green-700">{data.pagados}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-yellow-600 mb-1">Abonado</div>
                            <div className="text-xl font-bold text-yellow-700">{data.abonados}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-red-600 mb-1">Pendiente</div>
                            <div className="text-xl font-bold text-red-700">{data.pendientes}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            porcentajePagadosTipo >= 80 ? 'bg-green-500' :
                            porcentajePagadosTipo >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${porcentajePagadosTipo}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1 text-center">
                        {porcentajePagadosTipo}% pagados completamente
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recursos Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Equipos Disponibles
              <Package className="h-5 w-5 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{statsGenerales.equipoDisponible}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Equipos Reservados
              <Package className="h-5 w-5 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{statsGenerales.equipoReservado}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Vehículos Disponibles
              <Truck className="h-5 w-5 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{statsGenerales.vehiculosDisponibles}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Trabajadores Activos
              <Users className="h-5 w-5 text-cyan-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{statsGenerales.trabajadoresActivos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Capacidad Operativa */}
      <Card>
        <CardHeader>
          <CardTitle>Capacidad Operativa General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Disponibilidad de Equipos</span>
                <span className="text-sm font-bold">{capacidadOperativa}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    capacidadOperativa >= 70 ? 'bg-green-600' :
                    capacidadOperativa >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${capacidadOperativa}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Disponible</p>
                <p className="text-2xl font-bold text-green-600">{statsGenerales.equipoDisponible}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reservado</p>
                <p className="text-2xl font-bold text-orange-600">{statsGenerales.equipoReservado}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dañado</p>
                <p className="text-2xl font-bold text-red-600">{statsGenerales.equipoDañado}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eventos del Mes */}
      {eventosDelMes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Eventos de {meses[selectedMonth]} {selectedYear} ({eventosDelMes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventosDelMes
                .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
                .map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border-l-4 border-l-purple-500">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{event.nombre}</p>
                      <p className="text-sm text-gray-600">{event.cliente} · {event.tipoEvento}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.estado === 'Agendado' || event.estado === 'Próximamente' ? 'bg-blue-100 text-blue-800' :
                          event.estado === 'En Montaje' ? 'bg-orange-100 text-orange-800' :
                          event.estado === 'Montado' ? 'bg-purple-100 text-purple-800' :
                          event.estado === 'En Desmontaje' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {event.estado}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.estadoPago === 'Pagado' ? 'bg-green-100 text-green-800' :
                          event.estadoPago === 'Abonado' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.estadoPago || 'Pendiente de pago'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(event.fechaInicio).toLocaleDateString('es-CL')}
                      </p>
                      <p className="text-xs text-gray-600">{event.horaInicio}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensaje si no hay eventos */}
      {eventosDelMes.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay eventos en {meses[selectedMonth]} {selectedYear}</p>
              <p className="text-sm mt-2">Selecciona otro mes para ver los eventos</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
