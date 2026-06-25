/**
 * Wedring Matrimony — Unified Icon System
 *
 * Single entry point for all app icons, standardized on lucide-react-native.
 * Screens import { Icon } from '../components/common/Icon' and reference icons by
 * a stable semantic name, so the underlying library can change in ONE place and
 * sizing/stroke stay consistent app-wide.
 *
 * Usage:  <Icon name="heart" size={20} color={colors.primary} />
 *         <Icon name="chevronRight" />            // sensible defaults
 */
import React from 'react';
import {
  Heart, Star, Crown, ShieldCheck, BadgeCheck, MapPin, GraduationCap,
  Briefcase, Bell, Settings, User, Users, Home, Search, MessageCircle,
  ChevronRight, ChevronLeft, X, Check, CheckCheck, Lock, Unlock, Phone,
  Mail, Edit3, Camera, Image as ImageIcon, Trash2, LogOut, Globe,
  ShieldQuestion, FileText, HelpCircle, Sparkles, Filter, SlidersHorizontal,
  Calendar, Clock, Gift, Wallet, CreditCard, TrendingUp, Eye, EyeOff,
  ArrowRight, ArrowLeft, Plus, Minus, MoreVertical, Share2, Flag,
  CircleUserRound, HeartHandshake, Cake, Languages, Utensils, Cigarette,
  Wine, Building2, Ban, Info, AlertCircle, RefreshCw, WifiOff, Inbox,
} from 'lucide-react-native';
import { colors } from '../../theme';

// Semantic name -> lucide component. Keep names UI-intent, not library-specific.
const ICONS = {
  heart: Heart,
  star: Star,
  crown: Crown,
  verified: BadgeCheck,
  shield: ShieldCheck,
  location: MapPin,
  education: GraduationCap,
  occupation: Briefcase,
  bell: Bell,
  settings: Settings,
  user: User,
  users: Users,
  home: Home,
  search: Search,
  chat: MessageCircle,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  close: X,
  check: Check,
  checkAll: CheckCheck,
  lock: Lock,
  unlock: Unlock,
  phone: Phone,
  mail: Mail,
  edit: Edit3,
  camera: Camera,
  image: ImageIcon,
  trash: Trash2,
  logout: LogOut,
  globe: Globe,
  privacy: ShieldQuestion,
  document: FileText,
  help: HelpCircle,
  sparkles: Sparkles,
  filter: Filter,
  sliders: SlidersHorizontal,
  calendar: Calendar,
  clock: Clock,
  gift: Gift,
  wallet: Wallet,
  card: CreditCard,
  trending: TrendingUp,
  eye: Eye,
  eyeOff: EyeOff,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  plus: Plus,
  minus: Minus,
  more: MoreVertical,
  share: Share2,
  flag: Flag,
  profileCircle: CircleUserRound,
  match: HeartHandshake,
  age: Cake,
  languages: Languages,
  food: Utensils,
  smoking: Cigarette,
  drinking: Wine,
  company: Building2,
  block: Ban,
  info: Info,
  alert: AlertCircle,
  refresh: RefreshCw,
  offline: WifiOff,
  inbox: Inbox,
};

const Icon = ({ name, size = 22, color = colors.textPrimary, strokeWidth = 2, fill = 'none', style }) => {
  const Cmp = ICONS[name];
  if (!Cmp) {
    if (__DEV__) console.warn(`[Icon] unknown icon name: "${name}"`);
    return null;
  }
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} fill={fill} style={style} />;
};

export const ICON_NAMES = Object.keys(ICONS);
export default Icon;
export { Icon };
