import {
  Activity,
  AlignLeft,
  Archive,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  AtSign,
  Ban,
  Bell,
  Book,
  BookAudio,
  BookCheck,
  BookOpen,
  BookOpenText,
  BookPlus,
  BookText,
  BookX,
  Bookmark,
  Bot,
  Calendar,
  CalendarClock,
  CalendarX2,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CircleHelp,
  Clock3,
  Copy,
  ChevronLeft,
  ChevronRight,
  Dot,
  Download,
  EllipsisVertical,
  ExternalLink,
  Eye,
  EyeOff,
  Feather,
  File,
  FileSearch,
  FileText,
  Flag,
  Flame,
  Form,
  GitMerge,
  Globe,
  GraduationCap,
  Heart,
  HeartHandshake,
  Highlighter,
  History,
  Home,
  Image,
  Info,
  LayoutDashboard,
  Library,
  LibraryBig,
  LayoutGrid,
  Link,
  List,
  ListFilter,
  Lock,
  LockOpen,
  LogOut,
  Logs,
  Mail,
  MailCheck,
  MailPlus,
  MailX,
  MapPin,
  Menu,
  Megaphone,
  MessageCircle,
  MessageCircleHeart,
  MessageSquare,
  MessageSquareQuote,
  MonitorSmartphone,
  Moon,
  MoreHorizontal,
  Newspaper,
  NotepadText,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Pen,
  PencilLine,
  Pin,
  PinOff,
  Plus,
  QrCode,
  RefreshCw,
  ScrollText,
  Search,
  SearchAlert,
  Send,
  Settings,
  Settings2,
  Share,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SquareChartGantt,
  Star,
  Sun,
  ImagePlus,
  TextAlignStart,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
  Type,
  Upload,
  User,
  UserPlus,
  UserRoundArrowLeft,
  UserRoundPlus,
  UserRound,
  UserRoundCheck,
  UserRoundCog,
  Users,
  UsersRound,
  Video,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { forwardRef } from 'react';

import { BrandMarkIcon } from './BrandMarkIcon';
import { UsersGlyphIcon } from './UsersGlyphIcon';
import { CommunityGlyphIcon } from './CommunityGlyphIcon';
import { DiscussionGlyphIcon } from './DiscussionGlyphIcon';
import { EmojiGlyphIcon } from './EmojiGlyphIcon';
import { EyeOffGlyphIcon } from './EyeOffGlyphIcon';
import { LibraryGlyphIcon } from './LibraryGlyphIcon';
import { NavBooksIcon } from './NavBooksIcon';
import { NavHomeIcon } from './NavHomeIcon';
import { PollGlyphIcon } from './PollGlyphIcon';
import { PriceTagGlyphIcon } from './PriceTagGlyphIcon';
import { QuillGlyphIcon } from './QuillGlyphIcon';
import { ImagePenIcon } from './ImagePenIcon';
import { ProfileFeedIcon } from './ProfileFeedIcon';
import { ProfileActivityIcon } from './ProfileActivityIcon';

export type IconSource = 'lucide' | 'towelbooks';

export type IconCategory =
  | 'actions'
  | 'admin'
  | 'brand'
  | 'content'
  | 'feedback'
  | 'identity'
  | 'media'
  | 'navigation'
  | 'social';

export interface IconCatalogEntry {
  category: IconCategory;
  component: LucideIcon;
  source: IconSource;
}

function defineIcon(
  component: LucideIcon,
  source: IconSource,
  category: IconCategory,
): IconCatalogEntry {
  return {
    category,
    component,
    source,
  };
}

const Google = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width={props.size ?? 24}
    height={props.size ?? 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth ?? 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8 h-6 v8 h6 v-3 h-3" />
  </svg>
)) as LucideIcon;

const Facebook = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width={props.size ?? 24}
    height={props.size ?? 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth ?? 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)) as LucideIcon;

const Twitter = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width={props.size ?? 24}
    height={props.size ?? 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth ?? 2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)) as LucideIcon;

export const iconCatalog = {
  activity: defineIcon(Activity, 'lucide', 'admin'),
  archive: defineIcon(Archive, 'lucide', 'admin'),
  'arrow-down-up': defineIcon(ArrowUpDown, 'lucide', 'actions'),
  'arrow-right': defineIcon(ArrowRight, 'lucide', 'actions'),
  'arrow-up': defineIcon(ArrowUp, 'lucide', 'actions'),
  'at-sign': defineIcon(AtSign, 'lucide', 'identity'),
  ban: defineIcon(Ban, 'lucide', 'admin'),
  bell: defineIcon(Bell, 'lucide', 'feedback'),
  book: defineIcon(Book, 'lucide', 'admin'),
  'book-audio': defineIcon(BookAudio, 'lucide', 'content'),
  'book-check': defineIcon(BookCheck, 'lucide', 'content'),
  'book-open': defineIcon(BookOpen, 'lucide', 'content'),
  'book-open-text': defineIcon(BookOpenText, 'lucide', 'admin'),
  'book-plus': defineIcon(BookPlus, 'lucide', 'content'),
  'book-text': defineIcon(BookText, 'lucide', 'content'),
  'book-x': defineIcon(BookX, 'lucide', 'content'),
  bookmark: defineIcon(Bookmark, 'lucide', 'content'),
  bot: defineIcon(Bot, 'lucide', 'content'),
  'brand-mark': defineIcon(BrandMarkIcon, 'towelbooks', 'brand'),
  calendar: defineIcon(Calendar, 'lucide', 'content'),
  'calendar-clock': defineIcon(CalendarClock, 'lucide', 'content'),
  'calendar-x': defineIcon(CalendarX2, 'lucide', 'content'),
  check: defineIcon(Check, 'lucide', 'feedback'),
  'chevron-down': defineIcon(ChevronDown, 'lucide', 'actions'),
  'chevron-left': defineIcon(ChevronLeft, 'lucide', 'navigation'),
  'chevron-right': defineIcon(ChevronRight, 'lucide', 'navigation'),
  'chevrons-up-down': defineIcon(ChevronsUpDown, 'lucide', 'admin'),
  'circle-help': defineIcon(CircleHelp, 'lucide', 'feedback'),
  'clock-3': defineIcon(Clock3, 'lucide', 'content'),
  copy: defineIcon(Copy, 'lucide', 'actions'),
  'users-glyph': defineIcon(UsersGlyphIcon, 'towelbooks', 'identity'),
  'community-glyph': defineIcon(CommunityGlyphIcon, 'towelbooks', 'navigation'),
  'discussion-glyph': defineIcon(DiscussionGlyphIcon, 'towelbooks', 'content'),
  dot: defineIcon(Dot, 'lucide', 'content'),
  'emoji-glyph': defineIcon(EmojiGlyphIcon, 'towelbooks', 'content'),
  download: defineIcon(Download, 'lucide', 'actions'),
  'ellipsis-vertical': defineIcon(EllipsisVertical, 'lucide', 'actions'),
  eye: defineIcon(Eye, 'lucide', 'feedback'),
  'eye-off': defineIcon(EyeOff, 'lucide', 'feedback'),
  'eye-off-glyph': defineIcon(EyeOffGlyphIcon, 'towelbooks', 'feedback'),
  'external-link': defineIcon(ExternalLink, 'lucide', 'actions'),
  facebook: defineIcon(Facebook, 'towelbooks', 'social'),
  feather: defineIcon(Feather, 'lucide', 'content'),
  file: defineIcon(File, 'lucide', 'content'),
  'file-search': defineIcon(FileSearch, 'lucide', 'admin'),
  'file-text': defineIcon(FileText, 'lucide', 'content'),
  flag: defineIcon(Flag, 'lucide', 'feedback'),
  flame: defineIcon(Flame, 'lucide', 'feedback'),
  form: defineIcon(Form, 'lucide', 'content'),
  'git-merge': defineIcon(GitMerge, 'lucide', 'admin'),
  globe: defineIcon(Globe, 'lucide', 'identity'),
  // The Lucide-style Google icon is a monochrome placeholder only.
  // Do NOT use it for "Sign in with Google" OAuth buttons — those require the
  // official Google G logo per branding guidelines (GoogleGLogo component in
  // apps/web/src/features/auth/ui/GoogleGLogo.tsx).
  google: defineIcon(Google, 'towelbooks', 'social'),
  'graduation-cap': defineIcon(GraduationCap, 'lucide', 'content'),
  heart: defineIcon(Heart, 'lucide', 'feedback'),
  'heart-handshake': defineIcon(HeartHandshake, 'lucide', 'feedback'),
  highlighter: defineIcon(Highlighter, 'lucide', 'content'),
  history: defineIcon(History, 'lucide', 'content'),
  home: defineIcon(Home, 'lucide', 'navigation'),
  image: defineIcon(Image, 'lucide', 'media'),
  'image-pen': defineIcon(ImagePenIcon, 'towelbooks', 'actions'),
  info: defineIcon(Info, 'lucide', 'feedback'),
  'layout-dashboard': defineIcon(LayoutDashboard, 'lucide', 'admin'),
  'layout-grid': defineIcon(LayoutGrid, 'lucide', 'navigation'),
  library: defineIcon(Library, 'lucide', 'content'),
  'library-big': defineIcon(LibraryBig, 'lucide', 'content'),
  'library-glyph': defineIcon(LibraryGlyphIcon, 'towelbooks', 'content'),
  link: defineIcon(Link, 'lucide', 'actions'),
  list: defineIcon(List, 'lucide', 'navigation'),
  'list-filter': defineIcon(ListFilter, 'lucide', 'actions'),
  lock: defineIcon(Lock, 'lucide', 'identity'),
  'lock-open': defineIcon(LockOpen, 'lucide', 'identity'),
  'log-out': defineIcon(LogOut, 'lucide', 'actions'),
  logs: defineIcon(Logs, 'lucide', 'navigation'),
  mail: defineIcon(Mail, 'lucide', 'identity'),
  'mail-check': defineIcon(MailCheck, 'lucide', 'identity'),
  'mail-plus': defineIcon(MailPlus, 'lucide', 'identity'),
  'mail-x': defineIcon(MailX, 'lucide', 'identity'),
  'map-pin': defineIcon(MapPin, 'lucide', 'content'),
  menu: defineIcon(Menu, 'lucide', 'navigation'),
  'megaphone-glyph': defineIcon(Megaphone, 'lucide', 'content'),
  'message-circle': defineIcon(MessageCircle, 'lucide', 'content'),
  'message-circle-heart': defineIcon(MessageCircleHeart, 'lucide', 'content'),
  'message-square': defineIcon(MessageSquare, 'lucide', 'admin'),
  'message-square-quote': defineIcon(MessageSquareQuote, 'lucide', 'content'),
  'monitor-smartphone': defineIcon(MonitorSmartphone, 'lucide', 'identity'),
  moon: defineIcon(Moon, 'lucide', 'identity'),
  'more-horizontal': defineIcon(MoreHorizontal, 'lucide', 'actions'),
  'nav-books': defineIcon(NavBooksIcon, 'towelbooks', 'navigation'),
  'nav-home': defineIcon(NavHomeIcon, 'towelbooks', 'navigation'),
  newspaper: defineIcon(Newspaper, 'lucide', 'content'),
  'notepad-text': defineIcon(NotepadText, 'lucide', 'content'),
  palette: defineIcon(Palette, 'lucide', 'brand'),
  'panel-left-close': defineIcon(PanelLeftClose, 'lucide', 'navigation'),
  'panel-left-open': defineIcon(PanelLeftOpen, 'lucide', 'navigation'),
  pen: defineIcon(Pen, 'lucide', 'actions'),
  'pencil-line': defineIcon(PencilLine, 'lucide', 'actions'),
  pin: defineIcon(Pin, 'lucide', 'actions'),
  'pin-off': defineIcon(PinOff, 'lucide', 'actions'),
  plus: defineIcon(Plus, 'lucide', 'actions'),
  'poll-glyph': defineIcon(PollGlyphIcon, 'towelbooks', 'content'),
  'price-tag-glyph': defineIcon(PriceTagGlyphIcon, 'towelbooks', 'content'),
  'profile-feed': defineIcon(ProfileFeedIcon, 'towelbooks', 'navigation'),
  'profile-activity': defineIcon(ProfileActivityIcon, 'towelbooks', 'content'),
  'qr-code': defineIcon(QrCode, 'lucide', 'actions'),
  'quill-glyph': defineIcon(QuillGlyphIcon, 'towelbooks', 'content'),
  'refresh-cw': defineIcon(RefreshCw, 'lucide', 'admin'),
  search: defineIcon(Search, 'lucide', 'actions'),
  'search-alert': defineIcon(SearchAlert, 'lucide', 'feedback'),
  'scroll-text': defineIcon(ScrollText, 'lucide', 'content'),
  send: defineIcon(Send, 'lucide', 'actions'),
  settings: defineIcon(Settings, 'lucide', 'navigation'),
  'settings-2': defineIcon(Settings2, 'lucide', 'navigation'),
  share: defineIcon(Share, 'lucide', 'actions'),
  shield: defineIcon(Shield, 'lucide', 'admin'),
  'shield-check': defineIcon(ShieldCheck, 'lucide', 'feedback'),
  'sliders-horizontal': defineIcon(SlidersHorizontal, 'lucide', 'actions'),
  sparkles: defineIcon(Sparkles, 'lucide', 'feedback'),
  'square-chart-gantt': defineIcon(SquareChartGantt, 'lucide', 'content'),
  star: defineIcon(Star, 'lucide', 'feedback'),
  sun: defineIcon(Sun, 'lucide', 'identity'),
  'text-align-left': defineIcon(AlignLeft, 'lucide', 'content'),
  'text-align-start': defineIcon(TextAlignStart, 'lucide', 'content'),
  'thumbs-down': defineIcon(ThumbsDown, 'lucide', 'feedback'),
  'thumbs-up': defineIcon(ThumbsUp, 'lucide', 'feedback'),
  'trash-2': defineIcon(Trash2, 'lucide', 'actions'),
  'triangle-alert': defineIcon(TriangleAlert, 'lucide', 'admin'),
  twitter: defineIcon(Twitter, 'towelbooks', 'social'),
  type: defineIcon(Type, 'lucide', 'brand'),
  upload: defineIcon(Upload, 'lucide', 'admin'),
  'image-plus': defineIcon(ImagePlus, 'lucide', 'actions'),
  user: defineIcon(User, 'lucide', 'identity'),
  'user-plus': defineIcon(UserPlus, 'lucide', 'admin'),
  'user-round': defineIcon(UserRound, 'lucide', 'identity'),
  'user-round-arrow-left': defineIcon(UserRoundArrowLeft, 'lucide', 'identity'),
  'user-round-plus': defineIcon(UserRoundPlus, 'lucide', 'admin'),
  'user-round-check': defineIcon(UserRoundCheck, 'lucide', 'admin'),
  'user-round-cog': defineIcon(UserRoundCog, 'lucide', 'identity'),
  users: defineIcon(Users, 'lucide', 'identity'),
  'users-round': defineIcon(UsersRound, 'lucide', 'identity'),
  video: defineIcon(Video, 'lucide', 'content'),
  x: defineIcon(X, 'lucide', 'actions'),
} as const satisfies Record<string, IconCatalogEntry>;

export type IconName = keyof typeof iconCatalog;

export const iconNames = Object.keys(iconCatalog) as IconName[];
