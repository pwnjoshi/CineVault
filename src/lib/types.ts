export interface ArchivalCandidate {
  id: string;
  title: string;
  source_name: string;
  pd_claim: 'verified' | 'unverified' | 'commercial';
  price: string;
  resolution: string;
  duration_formatted: string;
  thumbnail_url: string;
  preview_video_url?: string;
  archive_url: string;
  relevance_score: number;
  notes?: string;
  clearance_details?: {
    provenance: string;
    copyright_status: string;
    eo_risk_rating: string;
    commercial_readiness: string;
  };
}

export interface ScriptScene {
  scene_number: number;
  heading: string;
  narration: string;
  duration_seconds: number;
  timecode_start: string;
  timecode_end: string;
  visual_search_query: string;
  candidates: ArchivalCandidate[];
}

export interface ScriptTimelineResult {
  script_title: string;
  total_scenes: number;
  total_duration_seconds: number;
  total_duration_formatted: string;
  scenes: ScriptScene[];
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  roleTitle: string;
  token: string;
  provider: 'clerk' | 'demo';
}
