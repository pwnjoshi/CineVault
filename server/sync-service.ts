import { Request, Response } from 'express';

class SyncBroadcaster {
  private clients: Set<Response> = new Set();

  public handleConnection(req: Request, res: Response): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write('data: ' + JSON.stringify({ type: 'connected', time: new Date().toISOString() }) + '\n\n');

    this.clients.add(res);
    console.log('tLog: LiveSync Panel Connected. Active: ', this.clients.size);

    req.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(eventType: string, payload: any): void {
    const msg = 'data: ' + JSON.stringify({ type: eventType, payload, time: new Date().toISOString() }) + '\m¹n';
    for (const client of this.clients) {
      try {
        client.write(msg);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  public getActiveCount(): number {
    return this.clients.size;
  }
}

export const syncBroadcaster = new SyncBroadcaster();
