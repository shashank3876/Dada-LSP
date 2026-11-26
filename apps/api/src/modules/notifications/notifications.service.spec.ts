import { NotificationsService } from './notifications.service';

describe('NotificationsService - Dual OTP (MSG91 SMS + Resend Email)', () => {
  let service: NotificationsService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    delete process.env.MSG91_AUTH_KEY;
    delete process.env.RESEND_API_KEY;
    service = new NotificationsService();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('Phone / SMS OTP (MSG91)', () => {
    it('operates in simulation mode when MSG91_AUTH_KEY is not configured', async () => {
      const result = await service.sendPhoneOtp('+919876543210', '482910', {
        organizationName: 'TechCorp Solutions',
        purpose: 'Corporate Portal Registration',
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
      expect(result.channel).toBe('SMS_SIMULATED');
      expect(result.recipient).toBe('+919876543210');
      expect(result.messageId).toMatch(/^msg91_sim_/);
    });

    it('formats 10-digit Indian mobile numbers with 91 prefix in simulation mode', async () => {
      const result = await service.sendPhoneOtp('9876543210', '123456');

      expect(result.success).toBe(true);
      expect(result.recipient).toBe('+919876543210');
    });

    it('dispatches to MSG91 SendOTP v5 API when MSG91_AUTH_KEY is present', async () => {
      process.env.MSG91_AUTH_KEY = 'test_msg91_auth_key';
      const liveService = new NotificationsService();

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: 'OTP sent successfully',
          type: 'success',
          request_id: 'msg91_req_8923712',
        }),
      } as any);

      const result = await liveService.sendPhoneOtp('9876543210', '654321', {
        organizationName: 'Acme Corp',
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(false);
      expect(result.channel).toBe('SMS');
      expect(result.messageId).toBe('msg91_req_8923712');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.msg91.com/api/v5/otp',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            authkey: 'test_msg91_auth_key',
          }),
        }),
      );
    });

    it('gracefully handles MSG91 network or upstream API error', async () => {
      process.env.MSG91_AUTH_KEY = 'test_msg91_auth_key';
      const liveService = new NotificationsService();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          message: 'Invalid Auth Key',
          type: 'error',
        }),
      } as any);

      const result = await liveService.sendPhoneOtp('9876543210', '654321');

      expect(result.success).toBe(false);
      expect(result.simulated).toBe(false);
      expect(result.error).toContain('Invalid Auth Key');
    });
  });

  describe('Email OTP (Resend)', () => {
    it('operates in simulation mode when RESEND_API_KEY is not configured', async () => {
      const result = await service.sendEmailOtp('shashank@yopmail.com', '482910', {
        recipientName: 'Shashank G',
        organizationName: 'TechCorp Solutions',
        purpose: 'Portal Access Verification',
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
      expect(result.channel).toBe('EMAIL_SIMULATED');
      expect(result.recipient).toBe('shashank@yopmail.com');
      expect(result.messageId).toMatch(/^resend_sim_/);
    });

    it('dispatches to Resend Emails API when RESEND_API_KEY is present', async () => {
      process.env.RESEND_API_KEY = 're_test_key_123';
      const liveService = new NotificationsService();

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'resend_email_id_98234',
        }),
      } as any);

      const result = await liveService.sendEmailOtp('priya@techcorp.in', '772211', {
        recipientName: 'Priya Sharma',
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(false);
      expect(result.channel).toBe('EMAIL');
      expect(result.messageId).toBe('resend_email_id_98234');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer re_test_key_123',
          }),
        }),
      );
    });

    it('gracefully handles Resend API failures', async () => {
      process.env.RESEND_API_KEY = 're_test_key_123';
      const liveService = new NotificationsService();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: jest.fn().mockResolvedValue({
          message: 'Domain not verified',
        }),
      } as any);

      const result = await liveService.sendEmailOtp('test@unverified.com', '123456');

      expect(result.success).toBe(false);
      expect(result.simulated).toBe(false);
      expect(result.error).toContain('Domain not verified');
    });
  });

  describe('Dual OTP Dispatch', () => {
    it('dispatches both phone and email OTP concurrently', async () => {
      const result = await service.sendDualOtp({
        mobile: '+919876543210',
        email: 'employee@techcorp.in',
        otp: '883311',
        organizationName: 'TechCorp Solutions',
        recipientName: 'Rajesh Kumar',
        purpose: 'Employee Registration',
      });

      expect(result.emailResult).toBeDefined();
      expect(result.emailResult.success).toBe(true);
      expect(result.emailResult.simulated).toBe(true);

      expect(result.smsResult).toBeDefined();
      expect(result.smsResult?.success).toBe(true);
      expect(result.smsResult?.simulated).toBe(true);
    });

    it('handles dual OTP when mobile is not provided (email only)', async () => {
      const result = await service.sendDualOtp({
        email: 'employee@techcorp.in',
        otp: '883311',
        organizationName: 'TechCorp Solutions',
        recipientName: 'Rajesh Kumar',
      });

      expect(result.emailResult.success).toBe(true);
      expect(result.smsResult).toBeUndefined();
    });
  });
});
