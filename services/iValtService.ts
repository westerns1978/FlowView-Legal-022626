/**
 * iVALT Service - Working Version from Other Apps
 * No changes needed to Supabase or iVALT
 */

export interface IValtAuthStatus {
  status: 'pending' | 'success' | 'failed';
  message: string;
  step?: number;
}

export class IValtService {
  private pollingTimer: any = null;
  private requestId: string | null = null;
  private phoneNumber: string = '';

  // CRITICAL: Fixed URL - must be .supabase.co/functions/v1/ivalt-auth
  private readonly SUPABASE_URL = 'https://ldzzlndsspkyohvzfiiu.supabase.co';
  private readonly SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkenpsbmRzc3BreW9odnpmaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MTEzMDUsImV4cCI6MjA3NzI4NzMwNX0.SK2Y7XMzeGQoVMq9KAmEN1vwy7RjtbIXZf6TyNneFnI';

  async initiateHandshake(phoneNumber: string): Promise<void> {
    // Format phone number (in case user enters without +1)
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    const formatted = cleanDigits.length === 10 ? `+1${cleanDigits}` : `+${cleanDigits}`;
    
    this.phoneNumber = formatted;
    console.log('[FlowView iVALT] Initiating handshake for:', this.phoneNumber);
    
    // Correct endpoint path: /functions/v1/ivalt-auth
    const response = await fetch(`${this.SUPABASE_URL}/functions/v1/ivalt-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
        'apikey': this.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        action: 'start-auth',
        mobile: this.phoneNumber,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[FlowView iVALT] Handshake failed:', errorText);
      throw new Error(`Handshake failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'iVALT rejected the request');
    }
    
    this.requestId = data.request_id;
    console.log('[FlowView iVALT] Handshake successful. Request ID:', this.requestId);
  }

  startPolling(
    onUpdate: (status: IValtAuthStatus) => void,
    onSuccess: () => void,
    onFail: (err: string) => void
  ): void {
    const poll = async () => {
      try {
        const response = await fetch(`${this.SUPABASE_URL}/functions/v1/ivalt-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
            'apikey': this.SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'validate',
            mobile: this.phoneNumber,
            request_id: this.requestId,
          }),
        });

        const data = await response.json();

        // Terminal success
        if (data.status === 'success') {
          this.cleanup();
          console.log('[FlowView iVALT] Authentication successful!');
          onUpdate({ status: 'success', message: 'Access Granted' });
          setTimeout(onSuccess, 200);
          return;
        }

        // Error
        if (data.status === 'error') {
          this.cleanup();
          console.error('[FlowView iVALT] Authentication failed:', data.message);
          onFail(data.message || 'Authentication failed');
          return;
        }

        // Still pending
        onUpdate({
          status: 'pending',
          message: data.message || 'Awaiting approval...',
          step: data.step,
        });

        // Poll again in 2 seconds
        this.pollingTimer = setTimeout(poll, 2000);
        
      } catch (error) {
        console.warn('[FlowView iVALT] Network error, retrying...', error);
        // Retry with longer delay on network error
        this.pollingTimer = setTimeout(poll, 3000);
      }
    };

    // Start polling after 500ms delay
    setTimeout(poll, 500);
  }

  cleanup(): void {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  cancel(): void {
    this.cleanup();
  }
}

export const ivalt = new IValtService();