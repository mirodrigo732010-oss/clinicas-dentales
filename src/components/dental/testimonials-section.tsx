'use client';

import { motion } from 'framer-motion';
import { Star, Play, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useElenaStore, ContextSection } from '@/lib/store/elena-store';
import { useEffect } from 'react';

const testimonials = [
  {
    name: 'María García',
    role: 'Diseño de Sonrisa',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    content: 'Mi experiencia fue increíble. Tenía mucho miedo al dentista desde pequeña, pero el equipo me hizo sentir tan cómoda que ahora hasta espero mis citas. Mi sonrisa nunca había lucido mejor.',
    rating: 5,
    hasVideo: true,
  },
  {
    name: 'Carlos Rodríguez',
    role: 'Implante Dental',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    content: 'Después de años buscando una solución para mi diente perdido, encontré la respuesta perfecta aquí. El implante quedó tan natural que nadie nota la diferencia. Profesionalismo total.',
    rating: 5,
    hasVideo: true,
  },
  {
    name: 'Ana Martínez',
    role: 'Ortodoncia Invisible',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    content: 'Los alineadores invisibles cambiaron mi vida. En 8 meses corrigieron mi sonrisa sin que nadie notara que llevaba tratamiento. Muy recomendable para adultos que quieren discreción.',
    rating: 5,
    hasVideo: false,
  },
  {
    name: 'Pedro Sánchez',
    role: 'Limpieza y Blanqueamiento',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    content: 'La tecnología que usan es impresionante. Mi limpieza fue rápida y cómoda, y el blanqueamiento dejó mis dientes varios tonos más claros. Volveré siempre aquí.',
    rating: 5,
    hasVideo: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function TestimonialsSection() {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold: 0.2,
  });
  
  const setCurrentSection = useElenaStore((state) => state.setCurrentSection);

  useEffect(() => {
    if (isIntersecting) {
      setCurrentSection('testimonios' as ContextSection);
    }
  }, [isIntersecting, setCurrentSection]);

  return (
    <section
      ref={ref}
      id="testimonios"
      className="py-20 md:py-32 bg-white"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#0077B6]/10 text-[#0077B6] rounded-full text-sm font-medium mb-4">
            Testimonios
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Lo Que Dicen Nuestros Pacientes
          </h2>
          <p className="text-gray-600 text-lg">
            Más de 2000 pacientes han transformado su sonrisa con nosotros.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={testimonial.name} variants={itemVariants}>
              <Card className="h-full bg-gradient-to-b from-white to-[#F5F5F5] border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-[#0077B6]/20 mb-4" />
                  
                  {/* Content */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    "{testimonial.content}"
                  </p>
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={testimonial.image} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                    
                    {/* Video button */}
                    {testimonial.hasVideo && (
                      <button className="w-10 h-10 bg-[#0077B6] rounded-full flex items-center justify-center text-white hover:bg-[#005a8c] transition-colors">
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-16 border-t border-gray-200"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0077B6]">4.9</div>
            <div className="text-sm text-gray-500">Google Reviews</div>
          </div>
          <div className="w-px h-12 bg-gray-200 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0077B6]">2000+</div>
            <div className="text-sm text-gray-500">Pacientes Satisfechos</div>
          </div>
          <div className="w-px h-12 bg-gray-200 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0077B6]">15+</div>
            <div className="text-sm text-gray-500">Años de Experiencia</div>
          </div>
          <div className="w-px h-12 bg-gray-200 hidden sm:block" />
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0077B6]">100%</div>
            <div className="text-sm text-gray-500">Garantía en Tratamientos</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
