export interface ScienceTechLabsCard {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  categories?: string[];
  readTime?: string;
  href?: string;
  slug?: string;
}

export const SCIENCE_TECH_LABS_PAGE_SLUG = 'science-tech-labs';

export function slugifyScienceLabTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'lab'
  );
}

export const SCIENCE_TECH_LABS_DEFAULTS = {
  sectionLabel: 'Specialized Lab Infrastructure',
  sectionTitle: 'Labs Built for Real Discovery',
  sectionDescription: 'Fully equipped science and technology labs designed around the way students actually learn — through hands-on testing, measurement, and precision experimentation.',
  featured: {
    category: 'Featured · Advanced Research',
    title: 'Advanced Multidisciplinary Innovation Lab',
    description: 'A flagship high-throughput research space bringing together precision optics, computational modeling, and rapid hardware prototyping. Designed to bridge the gap between academic theory and real-world industrial research, giving students access to industry-grade testing benches, calibrated instrumentation, and integrated collaboration pods.',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?auto=format&fit=crop&w=1200&q=85',
    readMoreLabel: 'Explore Lab Programme',
  },
  filters: ['All', 'Physics', 'Chemistry', 'Biology', 'Computing', 'Robotics', 'STEM'],
  cards: [
    {
      category: 'Physics',
      categories: ['Physics'],
      title: 'Precision Physics Laboratories',
      description: 'Engineered for foundational and advanced physics coursework, featuring vibration-isolated optical benches, precision digital sensors, air-track kinematics setups, and dedicated electromagnetism test bays. Workstations empower students to safely verify core scientific laws through direct quantitative observation.',
      readTime: 'Full Specs Available',
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=900&q=85',
    },
    {
      category: 'Chemistry',
      categories: ['Chemistry'],
      title: 'Modern Chemistry Laboratories',
      description: 'Equipped with ducted fume hoods, acid-resistant phenolic resin countertops, emergency wash stations, and dedicated analytical chemistry zones. From organic synthesis to titrations and spectrometry, the facility balances rigorous laboratory safety protocols with open sightlines that enable collaborative student experiments.',
      readTime: 'OSHA & Safety Compliant',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85',
    },
    {
      category: 'Biology',
      categories: ['Biology'],
      title: 'Biology & Life Sciences Labs',
      description: 'Designed for immersive exploration into molecular biology, histology, and environmental sciences. Outfitted with compound binocular microscopes, refrigerated centrifuges, incubation chambers, and ergonomic specimen preparation bays that give learners hands-on exposure to modern biological inquiry.',
      readTime: 'Specimen Ready',
      image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=85',
    },
    {
      category: 'Computing',
      categories: ['Computing'],
      title: 'Computer Science & AI Labs',
      description: 'High-performance computing workstations equipped with GPU acceleration, dual-display monitors, and isolated sandbox development networks. Tailored for intensive programming, machine learning training, algorithm visualization, and systems engineering coursework with robust power distribution.',
      readTime: 'High-Compute Stations',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=85',
    },
    {
      category: 'Robotics',
      categories: ['Robotics'],
      title: 'Electronics & Robotics Labs',
      description: 'A complete multidisciplinary hardware workspace featuring digital oscilloscopes, function generators, temperature-regulated soldering stations, and rapid prototyping bins. Students design, solder, and test embedded microcontrollers, IoT sensor arrays, and autonomous robotics platforms from schematic to prototype.',
      readTime: 'Rapid Prototyping Ready',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=900&q=85',
    },
    {
      category: 'STEM',
      categories: ['STEM'],
      title: 'STEM Integration Studios',
      description: 'Modular and reconfigurable project spaces combining digital fabrication tools, modular power drops, and mobile tool carts. Ideal for interdisciplinary capstone challenges where mechanical prototyping, electronic hardware, and software development intersect seamlessly in a collaborative studio format.',
      readTime: 'Modular Stations',
      image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=900&q=85',
    },
  ] as ScienceTechLabsCard[],
  latestTitle: 'Specialized Laboratory Programmes',
  viewAllLabel: 'View all labs',
  readMoreLabel: 'Explore Lab',
  newsletterLabel: 'Equip Your Campus',
  newsletterTitle: 'Plan your next lab with our specialists.',
  newsletterDescription: 'Receive customized lab floor plans, equipment sourcing lists, and safety compliance guides directly to your institutional inbox.',
  newsletterPlaceholder: 'Enter your campus email address',
  newsletterButtonLabel: 'Consult Now',
};

