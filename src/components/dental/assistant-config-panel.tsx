'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Save, Loader2, CheckCircle, AlertCircle, 
  MessageCircle, Bot, Palette, Wand2, Sparkles, Heart, Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface AssistantConfig {
  name: string;
  title: string;
  welcomeMessage: string;
  headerColor: string;
  buttonColor: string;
  buttonIcon: string;
  avatar: string;
  position: string;
  isActive: boolean;
}

const ICON_OPTIONS = [
  { value: 'message-circle', label: 'Chat', icon: MessageCircle },
  { value: 'bot', label: 'Robot', icon: Bot },
  { value: 'wand-2', label: 'Varita', icon: Wand2 },
  { value: 'sparkles', label: 'Estrella', icon: Sparkles },
  { value: 'heart', label: 'Corazón', icon: Heart },
  { value: 'stethoscope', label: 'Médico', icon: Stethoscope },
];

const AVATAR_OPTIONS = [
  { value: 'bot', label: 'Robot', emoji: '🤖' },
  { value: 'woman-doctor', label: 'Doctora', emoji: '👩‍⚕️' },
  { value: 'man-doctor', label: 'Doctor', emoji: '👨‍⚕️' },
  { value: 'nurse', label: 'Enfermera', emoji: '👩‍⚕️' },
  { value: 'tooth', label: 'Diente', emoji: '🦷' },
  { value: 'sparkles', label: 'Mágico', emoji: '✨' },
  { value: 'star', label: 'Estrella', emoji: '⭐' },
  { value: 'health', label: 'Salud', emoji: '💚' },
];

const POSITION_OPTIONS = [
  { value: 'bottom-right', label: 'Esquina derecha' },
  { value: 'bottom-left', label: 'Esquina izquierda' },
];

export function AssistantConfigPanel() {
  const [config, setConfig] = useState<AssistantConfig>({
    name: 'Elena',
    title: 'Asistente Virtual',
    welcomeMessage: '¡Hola! ¿En qué puedo ayudarte?',
    headerColor: '#0077B6',
    buttonColor: '#0077B6',
    buttonIcon: 'message-circle',
    avatar: 'woman-doctor',
    position: 'bottom-right',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/elena/chat');
      const result = await response.json();
      if (result) {
        setConfig({
          name: result.name || 'Elena',
          title: result.title || 'Asistente Virtual',
          welcomeMessage: result.welcomeMessage || '¡Hola! ¿En qué puedo ayudarte?',
          headerColor: result.headerColor || '#0077B6',
          buttonColor: result.buttonColor || '#0077B6',
          buttonIcon: result.buttonIcon || 'message-circle',
          avatar: result.avatar || 'woman-doctor',
          position: result.position || 'bottom-right',
          isActive: result.isActive ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      showMessage('error', 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/elena/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      const result = await response.json();
      
      if (result.success) {
        showMessage('success', '✅ Configuración guardada correctamente');
      } else {
        showMessage('error', result.error || 'Error al guardar');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field: keyof AssistantConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const getAvatarEmoji = () => {
    const found = AVATAR_OPTIONS.find(a => a.value === config.avatar);
    return found?.emoji || '👩‍⚕️';
  };

  const getIcon = () => {
    const found = ICON_OPTIONS.find(i => i.value === config.buttonIcon);
    return found?.icon || MessageCircle;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0077B6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-4 rounded-lg flex items-center gap-2 font-medium',
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            )}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">
            Configuración del Asistente
          </h2>
          <p className="text-gray-600 mt-1">
            Personaliza el nombre, apariencia y comportamiento.
          </p>
        </div>
        
        <Button onClick={handleSave} disabled={saving} className="bg-[#0077B6] hover:bg-[#005a8c]">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar Cambios
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#0077B6]" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Asistente</Label>
                  <Input
                    value={config.name}
                    onChange={(e) => updateConfig('name', e.target.value)}
                    placeholder="Elena"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={config.title}
                    onChange={(e) => updateConfig('title', e.target.value)}
                    placeholder="Asistente Virtual"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Mensaje de Bienvenida</Label>
                <Textarea
                  value={config.welcomeMessage}
                  onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label>Asistente Activo</Label>
                  <p className="text-xs text-gray-500">Mostrar en el sitio</p>
                </div>
                <Switch
                  checked={config.isActive}
                  onCheckedChange={(checked) => updateConfig('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Avatar Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">👤</span>
                Avatar del Asistente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateConfig('avatar', option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                      config.avatar === option.value
                        ? 'border-[#0077B6] bg-[#0077B6]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="text-xs text-gray-600">{option.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#0077B6]" />
                Colores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color del Header</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.headerColor}
                      onChange={(e) => updateConfig('headerColor', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={config.headerColor}
                      onChange={(e) => updateConfig('headerColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color del Botón</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.buttonColor}
                      onChange={(e) => updateConfig('buttonColor', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={config.buttonColor}
                      onChange={(e) => updateConfig('buttonColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {['#0077B6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      updateConfig('headerColor', color);
                      updateConfig('buttonColor', color);
                    }}
                    className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#0077B6]" />
                Posición e Icono del Botón
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Posición</Label>
                <div className="flex gap-2">
                  {POSITION_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateConfig('position', option.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg border-2 transition-all',
                        config.position === option.value
                          ? 'border-[#0077B6] bg-[#0077B6]/10 text-[#0077B6]'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Icono del Botón</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ICON_OPTIONS.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => updateConfig('buttonIcon', option.value)}
                        className={cn(
                          'px-3 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2',
                          config.buttonIcon === option.value
                            ? 'border-[#0077B6] bg-[#0077B6]/10 text-[#0077B6]'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">Vista Previa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-xl p-4 min-h-[400px] relative">
              <div className="text-center text-gray-400 text-sm mb-4">Página del sitio</div>
              
              <div className={cn("absolute", config.position === 'bottom-right' ? 'right-4 bottom-4' : 'left-4 bottom-4')}>
                <div className="w-72 bg-white rounded-2xl shadow-2xl overflow-hidden mb-3">
                  <div className="p-4 text-white" style={{ backgroundColor: config.headerColor }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                        {getAvatarEmoji()}
                      </div>
                      <div>
                        <div className="font-semibold">{config.name}</div>
                        <div className="text-xs opacity-80">{config.title}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 h-48 bg-gray-50">
                    <div className="bg-white p-3 rounded-xl shadow-sm max-w-[80%]">
                      <p className="text-sm">{config.welcomeMessage}</p>
                    </div>
                  </div>
                  <div className="p-3 border-t">
                    <div className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-400">
                      Escribe un mensaje...
                    </div>
                  </div>
                </div>
                
                <button
                  className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white ml-auto"
                  style={{ backgroundColor: config.buttonColor }}
                >
                  {(() => {
                    const IconComponent = getIcon();
                    return <IconComponent className="w-6 h-6" />;
                  })()}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
