import Link from 'next/link';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0077B6] to-[#005a8c] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-[#0077B6] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Clínica Dental Sonrisa Perfecta
        </h1>
        <p className="text-gray-600 mb-2">
          Versión 2.0 - Correcciones incluidas
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-left">
          <p className="text-sm text-green-800 font-medium mb-1">✅ Correcciones incluidas:</p>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Calendario permite agendar el día de hoy</li>
            <li>• Botón de WhatsApp al confirmar cita</li>
            <li>• Elena responde correctamente</li>
          </ul>
        </div>

        {/* Download Button */}
        <a
          href="/clinica-dental-v2.zip"
          download
          className="inline-flex items-center justify-center gap-3 bg-[#0077B6] hover:bg-[#005a8c] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all transform hover:scale-105 shadow-lg w-full mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
          Descargar ZIP v2.0 (234 KB)
        </a>

        <div className="border-t pt-4 mt-4">
          <Link href="/" className="text-[#0077B6] hover:underline text-sm">
            Ver la página de la clínica
          </Link>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
          <h3 className="font-semibold text-gray-800 mb-2">📋 Instrucciones:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Descarga el nuevo ZIP</li>
            <li>2. Sube los archivos a GitHub (reemplaza los anteriores)</li>
            <li>3. En EasyPanel, haz clic en "Redeploy"</li>
            <li>4. ¡Listo!</li>
          </ol>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Admin: admin@sonrisaperfecta.es / admin123
        </div>
      </div>
    </div>
  );
}
