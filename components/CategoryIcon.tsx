import {
  Stethoscope,
  Monitor,
  HardHat,
  GraduationCap,
  TrendingUp,
  Wheat,
  Sparkles,
  UtensilsCrossed,
  Hammer,
  Languages,
  Baby,
  Globe,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>> = {
  healthcare:   Stethoscope,
  'it-tech':    Monitor,
  engineering:  HardHat,
  teaching:     GraduationCap,
  accounting:   TrendingUp,
  farming:      Wheat,
  seasonal:     Sparkles,
  hospitality:  UtensilsCrossed,
  trades:       Hammer,
  tefl:         Languages,
  'au-pair':    Baby,
  other:        Globe,
};

interface Props {
  id: string;
  size?: number;
  color?: string;
}

export default function CategoryIcon({ id, size = 40, color = '#F8F5F0' }: Props) {
  const Icon = ICONS[id] ?? Globe;
  return <Icon size={size} strokeWidth={1.5} color={color} />;
}
