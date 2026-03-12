'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Link2, Upload, Save, RefreshCw, Trash2, 
  Loader2, CheckCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface KnowledgeData {
  content: string;
  updatedAt: string;
}

export function KnowledgePanel() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'web'>('text');
  
  // Form states
  const [textInput, setTextInput] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/knowledge');
      const result = await response.json();
      setContent(result.knowledge?.content || '');
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      showMessage('error', 'Error al cargar el conocimiento');
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

  // Save main content directly
  const handleSaveContent = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        showMessage('success', '✅ Conocimiento guardado correctamente');
      } else {
        showMessage('error', result.error || 'Error al guardar');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  // Clear all knowledge
  const handleClearAll = async () => {
    if (!confirm('¿Eliminar TODO el conocimiento? Esta acción no se puede deshacer.')) return;
    
    try {
      await fetch('/api/admin/knowledge?action=clear', { method: 'DELETE' });
      setContent('');
      showMessage('success', 'Conocimiento eliminado');
    } catch (error) {
      showMessage('error', 'Error al eliminar');
    }
  };

  // Extract from web
  const handleExtractWeb = async () => {
    if (!webUrl) {
      showMessage('error', 'Ingresa una URL');
      return;
    }

    setExtracting(true);
    try {
      const response = await fetch('/api/admin/knowledge/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webUrl }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data?.content) {
        setPreviewContent(result.data.content);
        setPreviewTitle(result.data.title || webUrl);
        showMessage('success', 'Contenido extraído. Revisa y agrega.');
      } else {
        showMessage('error', result.error || 'No se pudo extraer contenido');
      }
    } catch (error) {
      showMessage('error', 'Error al extraer contenido');
    } finally {
      setExtracting(false);
    }
  };

  // Upload file (PDF or Word)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isWord = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
    
    if (!isPdf && !isWord) {
      showMessage('error', 'Solo se aceptan archivos PDF o Word (.docx)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showMessage('error', 'El archivo es muy grande (máximo 15MB)');
      return;
    }

    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/knowledge/file', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success && result.data?.content) {
        setPreviewContent(result.data.content);
        setPreviewTitle(file.name);
        showMessage('success', `Archivo procesado: ${result.data.pages || 1} página(s)`);
      } else {
        showMessage('error', result.error || 'Error al procesar archivo');
      }
    } catch (error) {
      showMessage('error', 'Error al procesar el archivo');
    } finally {
      setExtracting(false);
      e.target.value = '';
    }
  };

  // Add text content
  const handleAddText = async () => {
    if (!textInput.trim()) {
      showMessage('error', 'Ingresa contenido');
      return;
    }

    setSaving(true);
    try {
      // Add to existing content
      const newContent = content 
        ? content + '\n\n---\n\n' + textInput
        : textInput;
      
      const response = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setContent(newContent);
        setTextInput('');
        showMessage('success', '✅ Contenido agregado');
      } else {
        showMessage('error', result.error || 'Error al agregar');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  // Add preview content (from file or web)
  const handleAddPreview = async () => {
    if (!previewContent.trim()) return;

    setSaving(true);
    try {
      const header = `\n\n=== ${previewTitle} ===\n\n`;
      const newContent = content 
        ? content + header + previewContent
        : previewTitle + '\n\n' + previewContent;
      
      const response = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setContent(newContent);
        setPreviewContent('');
        setPreviewTitle('');
        setWebUrl('');
        showMessage('success', '✅ Contenido agregado al conocimiento');
      } else {
        showMessage('error', result.error || 'Error al agregar');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'text', label: 'Escribir', icon: FileText },
    { id: 'file', label: 'Subir Archivo', icon: Upload },
    { id: 'web', label: 'Página Web', icon: Link2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0077B6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">
            Base de Conocimiento de Elena
          </h2>
          <p className="text-gray-600 mt-1">
            Agrega información que Elena usará para responder. Esta información es privada.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="destructive" onClick={handleClearAll}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input methods */}
        <Card>
          <CardHeader className="pb-2">
            {/* Tabs */}
            <div className="flex gap-1 border-b -mx-6 px-6 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setPreviewContent('');
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                    activeTab === tab.id
                      ? 'bg-[#0077B6] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {activeTab === 'text' && (
              <>
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Escribe aquí la información para Elena...

Ejemplos:
• Precios específicos
• Información de doctores
• Políticas de la clínica
• Promociones actuales
• Procedimientos detallados"
                  rows={10}
                  className="resize-none"
                />
                <Button 
                  onClick={handleAddText} 
                  disabled={!textInput.trim() || saving}
                  className="w-full bg-[#0077B6] hover:bg-[#005a8c]"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Agregar al Conocimiento
                </Button>
              </>
            )}

            {activeTab === 'file' && (
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0077B6] transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Arrastra un archivo o haz clic</p>
                  <p className="text-sm text-gray-400 mb-4">PDF o Word (.docx) - Máximo 15MB</p>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="pointer-events-none">
                    Seleccionar Archivo
                  </Button>
                </div>
                {extracting && (
                  <div className="flex items-center justify-center py-4 text-[#0077B6]">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Procesando archivo...
                  </div>
                )}
              </div>
            )}

            {activeTab === 'web' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={webUrl}
                    onChange={(e) => setWebUrl(e.target.value)}
                    placeholder="https://ejemplo.com/pagina"
                    type="url"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleExtractWeb} 
                    disabled={!webUrl || extracting}
                    className="bg-[#0077B6] hover:bg-[#005a8c]"
                  >
                    {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Ingresa una URL para extraer el contenido de la página
                </p>
              </div>
            )}

            {/* Preview */}
            {previewContent && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold mb-2 text-[#0077B6]">📝 Vista previa: {previewTitle}</h4>
                <Textarea
                  value={previewContent}
                  onChange={(e) => setPreviewContent(e.target.value)}
                  rows={8}
                  className="bg-gray-50"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{previewContent.length.toLocaleString()} caracteres</span>
                </div>
                <Button 
                  onClick={handleAddPreview}
                  disabled={saving}
                  className="w-full mt-3 bg-green-600 hover:bg-green-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Agregar al Conocimiento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Current knowledge */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>📚 Conocimiento Actual</span>
              <span className="text-sm font-normal text-gray-500">
                {content.length.toLocaleString()} caracteres
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="No hay conocimiento guardado. Agrega información usando las opciones de la izquierda."
              rows={18}
              className="flex-1 font-mono text-sm resize-none"
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-500">
                Puedes editar directamente
              </p>
              <Button 
                onClick={handleSaveContent}
                disabled={saving}
                className="bg-[#0077B6] hover:bg-[#005a8c]"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
