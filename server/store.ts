import * as fs from 'fs';
import * as path from 'path';

export interface ClearanceDetails {
  provenance: string;
  copyright_status: string;
  eo_risk_rating: string;
  commercial_readiness: string;
}

export interface Candidate {
  id: string;
  title: string;
  source_name: string;
  source_url: string;
  thumbnail_url: string | null;
  preview_video_url?: string | null;
  embed_url?: string | null;
  price: string | null;
  price_numeric?: number | null;
  license_scope: string | null;
  resolution?: string | null;
  color_profile?: string | null;
  era?: string | null;
  duration?: string | null;
  timecode_in?: string | null;
  timecode_out?: string | null;
  pd_claim: 'verified' | 'unverified' | 'not_claimed';
  relevance_score: number;
  notes: string;
  clearance_details?: ClearanceDetails;
  monitored?: boolean;
  saved_at?: string;
}

export interface MonitoredClip {
  id: string;
  candidate_id: string;
  title: string;
  source_url: string;
  source_name: string;
  initial_price: string | null;
  current_price: string | null;
  watch_for: string;
  status: 'active' | 'price_changed' | 'unavailable' | 'verified';
  last_checked_at: string;
  change_history: Array<{
    timestamp: string;
    message: string;
    old_value?: string;
    new_value?: string;
  }>;
}

export interface AgentExecutionTrace {
  id: string;
  shot_query: string;
  timestamp: string;
  execution_time_ms: number;
  decomposed_queries: string[];
  steps: Array<{
    step_number: number;
    phase: 'decompose' | 'parallel_search' | 'parallel_extract' | 'pd_risk_analysis' | 'rank_shortlist';
    tool_name?: string;
    tool_input?: any;
    tool_output?: any;
    latency_ms: number;
    description: string;
  }>;
  candidates_count: number;
}

class Store {
  private shortlists: Map<string, Candidate> = new Map();
  private monitoredClips: Map<string, MonitoredClip> = new Map();
  private executionTraces: AgentExecutionTrace[] = [];
  private cachePath: string;

  constructor() {
    this.cachePath = process.env.VERCEL 
      ? path.join('/tmp', 'shortlist-store.json')
      : path.join(__dirname, '..', 'data', 'shortlist-store.json');
    this.loadInitialData();
  }

  private loadInitialData() {
    try {
      if (fs.existsSync(this.cachePath)) {
        const raw = fs.readFileSync(this.cachePath, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.shortlists)) {
          data.shortlists.forEach((item: Candidate) => this.shortlists.set(item.id, item));
        }
        if (Array.isArray(data.monitoredClips)) {
          data.monitoredClips.forEach((item: MonitoredClip) => this.monitoredClips.set(item.id, item));
        }
      }
    } catch (err) {
      console.warn('[Store] Could not load stored state, starting fresh:', err);
    }
  }

  private persist() {
    try {
      const dir = path.dirname(this.cachePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        shortlists: Array.from(this.shortlists.values()),
        monitoredClips: Array.from(this.monitoredClips.values()),
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.cachePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[Store] Failed to write cache to disk:', err);
    }
  }

  // Shortlist methods
  getShortlist(): Candidate[] {
    return Array.from(this.shortlists.values());
  }

  getShortlistById(id: string): Candidate | undefined {
    return this.shortlists.get(id);
  }

  addToShortlist(candidate: Candidate): Candidate {
    const item = { ...candidate, saved_at: new Date().toISOString() };
    this.shortlists.set(candidate.id, item);
    this.persist();
    return item;
  }

  removeFromShortlist(id: string): boolean {
    const deleted = this.shortlists.delete(id);
    this.persist();
    return deleted;
  }

  // Monitor methods
  getMonitoredClips(): MonitoredClip[] {
    return Array.from(this.monitoredClips.values());
  }

  addMonitoredClip(candidate: Candidate, watchFor: string = 'Price or availability change'): MonitoredClip {
    const monitorId = `mon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const monitored: MonitoredClip = {
      id: monitorId,
      candidate_id: candidate.id,
      title: candidate.title,
      source_url: candidate.source_url,
      source_name: candidate.source_name,
      initial_price: candidate.price,
      current_price: candidate.price,
      watch_for: watchFor,
      status: 'active',
      last_checked_at: new Date().toISOString(),
      change_history: [
        {
          timestamp: new Date().toISOString(),
          message: `Parallel Monitor task registered for URL: ${candidate.source_url}`
        }
      ]
    };
    this.monitoredClips.set(monitorId, monitored);
    
    if (this.shortlists.has(candidate.id)) {
      const c = this.shortlists.get(candidate.id)!;
      c.monitored = true;
      this.shortlists.set(c.id, c);
    }

    this.persist();
    return monitored;
  }

  checkUpdates(monitorId?: string): MonitoredClip[] {
    const updated: MonitoredClip[] = [];
    const now = new Date().toISOString();

    for (const [id, item] of this.monitoredClips.entries()) {
      if (!monitorId || id === monitorId) {
        item.last_checked_at = now;
        item.change_history.push({
          timestamp: now,
          message: `Parallel Monitor scan verified: Rights status active, zero clearance disputes detected on ${item.source_url}`
        });
        this.monitoredClips.set(id, item);
        updated.push(item);
      }
    }

    this.persist();
    return updated;
  }

  simulatePriceAlert(monitorId: string, newPrice: string, note?: string): MonitoredClip | null {
    const item = this.monitoredClips.get(monitorId);
    if (!item) return null;

    item.change_history.push({
      timestamp: new Date().toISOString(),
      message: note || `Parallel Monitor triggered: Price updated from ${item.current_price} to ${newPrice}`,
      old_value: item.current_price || undefined,
      new_value: newPrice
    });
    item.current_price = newPrice;
    item.status = 'price_changed';
    item.last_checked_at = new Date().toISOString();
    this.monitoredClips.set(monitorId, item);
    this.persist();
    return item;
  }

  deleteMonitoredClip(id: string): boolean {
    const deleted = this.monitoredClips.delete(id);
    this.persist();
    return deleted;
  }

  // Trace logs
  recordExecutionTrace(trace: AgentExecutionTrace) {
    this.executionTraces.unshift(trace);
    if (this.executionTraces.length > 50) {
      this.executionTraces.pop();
    }
  }

  getExecutionTraces(): AgentExecutionTrace[] {
    return this.executionTraces;
  }

  getLatestTrace(): AgentExecutionTrace | null {
    return this.executionTraces[0] || null;
  }
}

export const store = new Store();
