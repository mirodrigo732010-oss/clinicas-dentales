'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Smile, CircleDot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useElenaStore, ContextSection } from '@/lib/store/elena-store';
import { useEffect } from 'react';

interface TreatmentsSectionProps {
  onBookAppointment?: (treatment?: string) => void;
}

const treatments = [
  {
    title: 'Diseño de Sonrisa',
    description: 'Transforma tu sonrisa con un plan personalizado. Utilizamos tecnología digital para mostrarte el resultado antes de comenzar.',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80',
    icon: Sparkles,
    duration: '2-4 semanas',
    startingPrice: 'Desde $15,000 MXN',
    features: ['Simulación digital 3D', 'Plan personalizado', 'Materiales premium'],
  },
  {
    title: 'Ortodoncia Invisible',
    description: 'Alineadores transparentes prácticamente invisibles. Corrige tu sonrisa sin que nadie lo note.',
    image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&q=80',
    icon: Smile,
    duration: '6-18 meses',
    startingPrice: 'Desde $35,000 MXN',
    features: ['Alineadores removibles', 'Sin brackets metálicos', 'Resultados predecibles'],
  },
  {
    title: 'Implantes Dentales',
    description: 'Solución permanente para dientes perdidos. Recupera la funcionalidad y estética de tu sonrisa.',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80',
    icon: CircleDot,
    duration: '3-6 meses',
    startingPrice: 'Desde $18,000 MXN',
    features: ['Aspecto natural', 'Solución permanente', 'Garantía extendida'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export function TreatmentsSection({ onBookAppointment }: TreatmentsSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold: 0.2,
  });
  
  const setCurrentSection = useElenaStore((state) => state.setCurrentSection);

  useEffect(() => {
    if (isIntersecting) {
      setCurrentSection('tratamientos' as ContextSection);
    }
  }, [isIntersecting, setCurrentSection]);

  return (
    <section
      ref={ref}
      id="tratamientos"
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
            Nuestros Tratamientos
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tratamientos Premium
          </h2>
          <p className="text-gray-600 text-lg">
            Soluciones personalizadas con los mejores materiales y la tecnología más avanzada.
          </p>
        </motion.div>

        {/* Treatments Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {treatments.map((treatment) => (
            <motion.div key={treatment.title} variants={itemVariants}>
              <Card className="group h-full bg-white border border-gray-100 hover:border-[#0077B6]/30 hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={treatment.image}
                      alt={treatment.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <treatment.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{treatment.duration}</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{treatment.startingPrice}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                      {treatment.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{treatment.description}</p>
                    
                    <ul className="space-y-2 mb-6">
                      {treatment.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-[#0077B6] rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full bg-[#0077B6] hover:bg-[#005a8c] text-white group/btn"
                      onClick={() => onBookAppointment?.(treatment.title)}
                    >
                      Solicitar Cita
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
