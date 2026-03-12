'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Twitter, Navigation, MessageCircle, ExternalLink, Car, Train, Bus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterProps {
  onBookAppointment?: () => void;
}

const quickLinks = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Tecnología', href: '#tecnologia' },
  { label: 'Tratamientos', href: '#tratamientos' },
  { label: 'Experiencia', href: '#experiencia' },
  { label: 'Testimonios', href: '#testimonios' },
];

const treatments = [
  { label: 'Diseño de Sonrisa', href: '#tratamientos' },
  { label: 'Ortodoncia Invisible', href: '#tratamientos' },
  { label: 'Implantes Dentales', href: '#tratamientos' },
  { label: 'Blanqueamiento', href: '#tratamientos' },
  { label: 'Limpieza Dental', href: '#tratamientos' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

// Coordenadas de la dirección: Jacarandas 54 Col. Ahuehuetes, San Bartolo Tenayuca, Tlalnepantla, Edo. Méx. CP 54150
// La calle Jacarandas está cerca de Av. Tlalnepantla-Tenayuca #25 (Plaza Encuentro/Coppel)
// Referencia: entre calles Ahuehuetes y Jacarandas
const MAP_LAT = 19.5318;
const MAP_LNG = -99.1725;
const MAP_QUERY = encodeURIComponent('Jacarandas 54, Col. Ahuehuetes, San Bartolo Tenayuca, Tlalnepantla, Estado de México, CP 54150');

export function Footer({ onBookAppointment }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#0077B6] via-[#00a8e8] to-[#0077B6] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-heading text-2xl font-bold mb-2">
                ¿Listo para tu mejor sonrisa?
              </h3>
              <p className="text-white/80">
                Agenda tu cita de valoración gratuita hoy mismo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button 
                onClick={onBookAppointment}
                className="bg-white text-[#0077B6] hover:bg-gray-100 px-8 py-6 text-lg shadow-lg"
              >
                Agendar Cita Gratuita
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map & Contact Section - Redesigned */}
      <div className="relative bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center mb-12">
            <h3 className="font-heading text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Encuéntranos
            </h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Estamos ubicados en una zona de fácil acceso con múltiples opciones de transporte público y estacionamiento cercano.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            {/* Contact Info Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address Card */}
              <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-[#0077B6]/50 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0077B6] to-[#00a8e8] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Dirección</h4>
                    <p className="text-gray-400 leading-relaxed">
                      Jacarandas 54, Col. Ahuehuetes<br />
                      Tlalnepantla, Estado de México
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-[#0077B6]/50 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Teléfono / WhatsApp</h4>
                    <a href="tel:5517489261" className="text-gray-400 hover:text-white transition-colors block">
                      55 1748 9261
                    </a>
                    <a 
                      href="https://wa.me/5215517489261" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#25D366] hover:text-[#128C7E] transition-colors mt-1 text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Schedule Card */}
              <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-[#0077B6]/50 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Horario</h4>
                    <p className="text-gray-400">
                      Lun - Vie: 9:00 - 20:00<br />
                      Sábado: 9:00 - 14:00
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0077B6] to-[#00a8e8] hover:from-[#005a8c] hover:to-[#0077B6] text-white px-5 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] font-medium"
                >
                  <Navigation className="w-5 h-5" />
                  Cómo llegar
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </a>
                <a
                  href={`https://www.waze.com/ul?ll=${MAP_LAT},${MAP_LNG}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-5 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] font-medium"
                >
                  <Car className="w-5 h-5" />
                  Waze
                  <ExternalLink className="w-4 h-4 opacity-70" />
                </a>
              </div>
            </div>

            {/* Map Container */}
            <div className="lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 group h-full min-h-[400px]">
                {/* Decorative corner */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#0077B6]/30 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#00a8e8]/30 to-transparent z-10 pointer-events-none"></div>
                
                {/* OpenStreetMap iframe */}
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${MAP_LNG - 0.01}%2C${MAP_LAT - 0.006}%2C${MAP_LNG + 0.01}%2C${MAP_LAT + 0.006}&layer=mapnik&marker=${MAP_LAT}%2C${MAP_LNG}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  loading="lazy"
                  title="Ubicación de Clínica Dental Sonrisa Perfecta"
                  className="grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                
                {/* Overlay with link */}
                <a
                  href={`https://www.openstreetmap.org/?mlat=${MAP_LAT}&mlon=${MAP_LNG}#map=16/${MAP_LAT}/${MAP_LNG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-20 opacity-0"
                  aria-label="Ver mapa ampliado"
                >
                  Ver mapa ampliado
                </a>
                
                {/* Map controls overlay */}
                <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:text-[#0077B6] transition-colors"
                    title="Ver en Google Maps"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Transport info */}
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Train className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-white">Metro La Raza</span>
                <p className="text-gray-500">20 min en transporte</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Bus className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-white">Av. Tlalnepantla-Tenayuca</span>
                <p className="text-gray-500">Rutas frente a la clínica</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-sm">
                <span className="font-medium text-white">Estacionamiento</span>
                <p className="text-gray-500">Disponible en la zona</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0077B6] to-[#00a8e8] rounded-xl flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                    <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 7.8 8.4 8.3 9.2C6.5 10.5 5.5 12.6 5.5 15C5.5 18.6 8.4 22 12 22C15.6 22 18.5 18.6 18.5 15C18.5 12.6 17.5 10.5 15.7 9.2C16.2 8.4 16.5 7.5 16.5 6.5C16.5 4 14.5 2 12 2Z"/>
                  </svg>
                </div>
                <span className="font-heading font-bold text-xl">Sonrisa Perfecta</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Tu clínica dental de confianza en Tlalnepantla. Tecnología de vanguardia y un equipo dedicado a tu bienestar.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gradient-to-br hover:from-[#0077B6] hover:to-[#00a8e8] hover:text-white transition-all duration-300"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-6">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-[#00a8e8] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatments */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-6">Tratamientos</h4>
              <ul className="space-y-3">
                {treatments.map((treatment) => (
                  <li key={treatment.label}>
                    <a
                      href={treatment.href}
                      className="text-gray-400 hover:text-[#00a8e8] transition-colors"
                    >
                      {treatment.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-heading font-semibold text-lg mb-6">Contacto</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#00a8e8] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-400">Jacarandas 54</span>
                    <br />
                    <span className="text-gray-400">Col. Ahuehuetes, Tlalnepantla</span>
                    <br />
                    <span className="text-gray-400">Estado de México</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#00a8e8]" />
                  <a href="tel:5517489261" className="text-gray-400 hover:text-white transition-colors">
                    55 1748 9261
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-[#00a8e8]" />
                  <a 
                    href="https://wa.me/5215517489261" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#00a8e8] flex-shrink-0 mt-0.5" />
                  <div className="text-gray-400">
                    <div>Lun - Vie: 9:00 - 20:00</div>
                    <div>Sábado: 9:00 - 14:00</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2024 Clínica Dental Sonrisa Perfecta. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
              <a href="/admin" className="hover:text-white transition-colors text-gray-600">Doctor</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
