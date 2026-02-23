/**
 * icons.js — Static Lucide icon resolution map.
 *
 * question option `icon` strings are resolved here to React components.
 * Every icon imported here is statically analysed by Vite and tree-shaken.
 * Falls back to `Square` for any unknown icon name.
 */
import {
  Monitor, Terminal, Server, GitMerge, Bot, Smartphone, Boxes,
  User, Users, Globe,
  Cpu, Sparkles, MousePointer2, Wind, FileText,
  ListChecks, Wand2,
  Layers, Triangle, Hexagon, Flame, Circle, Code2, Coffee,
  Database, Leaf, Zap, CreditCard, GitBranch,
  Cloud, HardDrive, HelpCircle,
  Lock, Unlock,
  DatabaseBackup,
  ShieldAlert, ShieldCheck,
  Sprout, Rocket, Building2,
  TrendingUp, Minus,
  Package, Box, Banknote,
  Square, CheckSquare,
} from 'lucide-react'

export const ICON_MAP = {
  // Q1 — project types
  Monitor, Terminal, Server, GitMerge, Bot, Smartphone, Boxes,
  // Q3 — end user
  User, Users, Globe,
  // Q4 — LLM target
  Cpu, Sparkles, MousePointer2, Wind, FileText,
  // Q5a — stack approach
  ListChecks, Wand2,
  // Q5b — frontend
  Layers, Triangle, Hexagon, Flame,
  // Q5b — backend
  Circle, Code2, Coffee,
  // Q5b — database
  Database, Leaf, Zap, CreditCard, GitBranch,
  // Q5b — infrastructure (safe fallbacks for uncertain icon names)
  Container:  Box,        // 'Container' → Box
  Bolt:       Zap,        // 'Bolt' → Zap (supabase)
  BanknoteX:  Banknote,   // 'BanknoteX' → Banknote (Q9 no-payments)
  DatabaseZap: Database,  // 'DatabaseZap' → Database (Q8 yes)
  DatabaseOff: Database,  // 'DatabaseOff' → Database (Q8 no)
  LockKeyhole: Lock,      // 'LockKeyhole' → Lock
  LockKeyholeOpen: Unlock,// 'LockKeyholeOpen' → Unlock
  // Q6 — deployment
  Cloud, HardDrive, HelpCircle,
  // Q7-Q10 — security booleans
  ShieldAlert, ShieldCheck,
  // Q11 — scale
  Sprout, Rocket, Building2,
  // Q12 — scaling
  TrendingUp, Minus,
  // Fallbacks
  Package, Box, Banknote, Lock, Unlock,
  Square, CheckSquare,
}

/**
 * Resolves a Lucide icon name string to a component.
 * Returns Square as fallback for unknown names.
 */
export function resolveIcon(name) {
  return ICON_MAP[name] ?? Square
}
