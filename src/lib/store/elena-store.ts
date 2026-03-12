import { create } from 'zustand';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
export type ElenaState = 'idle' | 'listening' | 'speaking' | 'thinking';
export type ContextSection = 'hero' | 'tecnologia' | 'tratamientos' | 'experiencia' | 'testimonios' | 'footer';

interface TranscriptMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ElenaStore {
  // Widget visibility
  isVisible: boolean;
  isExpanded: boolean;
  hasGreeted: boolean;
  
  // Connection state
  connectionStatus: ConnectionStatus;
  
  // Interaction state
  elenaState: ElenaState;
  currentSection: ContextSection;
  
  // Transcripts
  transcripts: TranscriptMessage[];
  
  // Audio state
  isMuted: boolean;
  
  // Actions
  setVisible: (visible: boolean) => void;
  setExpanded: (expanded: boolean) => void;
  setHasGreeted: (greeted: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setElenaState: (state: ElenaState) => void;
  setCurrentSection: (section: ContextSection) => void;
  addTranscript: (role: 'user' | 'assistant', content: string) => void;
  clearTranscripts: () => void;
  toggleMute: () => void;
  toggleExpanded: () => void;
}

export const useElenaStore = create<ElenaStore>((set) => ({
  // Initial state
  isVisible: false,
  isExpanded: false,
  hasGreeted: false,
  connectionStatus: 'disconnected',
  elenaState: 'idle',
  currentSection: 'hero',
  transcripts: [],
  isMuted: false,
  
  // Actions
  setVisible: (visible) => set({ isVisible: visible }),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  setHasGreeted: (greeted) => set({ hasGreeted: greeted }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setElenaState: (state) => set({ elenaState: state }),
  setCurrentSection: (section) => set({ currentSection: section }),
  addTranscript: (role, content) => set((state) => ({
    transcripts: [
      ...state.transcripts,
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date(),
      },
    ],
  })),
  clearTranscripts: () => set({ transcripts: [] }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
}));

// System prompts based on context
export const getSystemPrompt = (section: ContextSection): string => {
  const basePrompt = `Eres Elena, la asistente virtual de la Clínica Dental Sonrisa Perfecta en Madrid. 
Eres dulce, profesional, experta en odontología y muy tranquilizadora. 
Tu objetivo es convertir las dudas de los pacientes en citas de valoración.
Hablas español de México de manera cálida y cercana.
Siempre eres amable, empática y paciente. Usas un tono suave y reconfortante.
Si el usuario quiere agendar una cita, solicita su nombre, teléfono y fecha/hora preferida.`;

  const sectionPrompts: Record<ContextSection, string> = {
    hero: `${basePrompt}
El usuario está viendo la página principal. Puedes saludar y presentar los servicios de la clínica.`,
    
    tecnologia: `${basePrompt}
El usuario está explorando la sección de Tecnología. Eres experta en equipos médicos dentales.
Explica con entusiasmo pero sin tecnicismos complicados:
- Escáner 3D: Diagnóstico preciso en minutos, sin molestias
- Láser Dental: Tratamientos sin dolor, recuperación rápida
- Radiografía Digital: 90% menos radiación, resultados instantáneos
Resalta cómo esta tecnología hace la experiencia más cómoda.`,
    
    tratamientos: `${basePrompt}
El usuario está viendo los tratamientos. Enfócate en beneficios estéticos y de salud:
- Diseño de Sonrisa: Transformación personalizada con tecnología digital
- Ortodoncia Invisible: Alineadores transparentes, resultados en 6-18 meses
- Implantes Dentales: Solución permanente, aspecto natural
Si muestra interés, ofrece agendar una cita de valoración gratuita.`,
    
    experiencia: `${basePrompt}
El usuario está en la sección de Experiencia. Aquí se habla de eliminar el miedo al dentista.
Sé especialmente empática y reconfortante. Menciona:
- Ambiente relajado y spa dental
- Música personalizada durante tratamiento
- Anestesia indolora con técnica especial
- Equipo entrenado en atención a pacientes ansiosos
Si expresa temor, reconforta y ofrece una cita de valoración sin compromiso.`,
    
    testimonios: `${basePrompt}
El usuario está viendo testimonios de otros pacientes.
Puedes mencionar que tenemos más de 2000 pacientes satisfechos y una calificación de 4.9/5.
Los pacientes destacan nuestra atención personalizada y ambiente relajado.`,
    
    footer: `${basePrompt}
El usuario está al final de la página. Puede estar buscando información de contacto.
Horarios: Lunes a Viernes 9:00-20:00, Sábados 10:00-14:00
Ubicación: Calle Serrano 123, Salamanca, Madrid
Teléfono: +34 91 123 45 67
Ofrece agendar una cita si aún no lo ha hecho.`,
  };
  
  return sectionPrompts[section];
};
