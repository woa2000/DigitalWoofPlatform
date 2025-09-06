import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuração do localizer para português brasileiro
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'pt-BR': ptBR,
  },
});

// Tipos para os eventos do calendário
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    contentType: string;
    status: string;
    priority: string;
    channels: string[];
    campaignId?: string;
  };
}

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Carregar eventos do calendário
  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada para API
      const response = await fetch('/api/calendar/items?account_id=test-account');
      const data = await response.json();

      if (data.success) {
        const calendarEvents = data.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          start: new Date(item.scheduled_for),
          end: new Date(new Date(item.scheduled_for).getTime() + 60 * 60 * 1000), // 1 hora de duração
          resource: {
            contentType: item.content_type,
            status: item.status,
            priority: item.priority,
            channels: item.channels,
            campaignId: item.campaign_id,
          },
        }));
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos do calendário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para seleção de evento
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Handler para seleção de slot (criar novo evento)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setShowCreateModal(true);
  };

  // Estilos customizados para os eventos
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad'; // Cor padrão

    // Cores baseadas no tipo de conteúdo
    switch (event.resource.contentType) {
      case 'educativo':
        backgroundColor = '#10b981'; // Verde
        break;
      case 'promocional':
        backgroundColor = '#f59e0b'; // Amarelo
        break;
      case 'recall':
        backgroundColor = '#ef4444'; // Vermelho
        break;
      case 'engajamento':
        backgroundColor = '#8b5cf6'; // Roxo
        break;
      case 'awareness':
        backgroundColor = '#06b6d4'; // Ciano
        break;
    }

    // Opacidade baseada no status
    let opacity = 1;
    if (event.resource.status === 'draft') {
      opacity = 0.6;
    } else if (event.resource.status === 'cancelled') {
      opacity = 0.3;
    }

    return {
      style: {
        backgroundColor,
        opacity,
        borderRadius: '4px',
        border: 'none',
        color: 'white',
        fontSize: '12px',
        padding: '2px 6px',
      },
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendário Editorial</h1>
        <p className="text-gray-600 mt-2">
          Planeje e organize seu conteúdo de marketing para pets
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            messages={{
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
              date: 'Data',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'Não há eventos neste período.',
              showMore: (total: number) => `+ Ver mais ${total}`,
            }}
            culture="pt-BR"
          />
        </div>
      </div>

      {/* Modal de detalhes do evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selectedEvent.title}</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Tipo:</strong> {selectedEvent.resource.contentType}</p>
              <p><strong>Status:</strong> {selectedEvent.resource.status}</p>
              <p><strong>Prioridade:</strong> {selectedEvent.resource.priority}</p>
              <p><strong>Canais:</strong> {selectedEvent.resource.channels.join(', ')}</p>
              <p><strong>Data/Hora:</strong> {selectedEvent.start.toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;