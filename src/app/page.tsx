'use client';

import { useState } from 'react';
import { Navbar } from '@/components/dental/navbar';
import { HeroSection } from '@/components/dental/hero-section';
import { TechnologySection } from '@/components/dental/technology-section';
import { TreatmentsSection } from '@/components/dental/treatments-section';
import { ExperienceSection } from '@/components/dental/experience-section';
import { TestimonialsSection } from '@/components/dental/testimonials-section';
import { Footer } from '@/components/dental/footer';
import { ElenaWrapper } from '@/components/dental/elena-wrapper';
import { AppointmentModal } from '@/components/dental/appointment-modal';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<string | undefined>();

  const openAppointmentModal = (treatment?: string) => {
    setSelectedTreatment(treatment);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar onBookAppointment={() => openAppointmentModal()} />
      
      <div className="flex-1">
        <HeroSection onBookAppointment={() => openAppointmentModal()} />
        <TechnologySection />
        <TreatmentsSection onBookAppointment={openAppointmentModal} />
        <ExperienceSection />
        <TestimonialsSection />
      </div>
      
      <Footer onBookAppointment={() => openAppointmentModal()} />
      
      {/* Elena AI Widget */}
      <ElenaWrapper />

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        treatment={selectedTreatment}
      />
    </main>
  );
}
