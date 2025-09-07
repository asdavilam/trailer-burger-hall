// src/app/api/feedback/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';


type ResendSendResult = {
  data?: { id?: string } | null
  error?: { message?: string } | null
}

// —— Validación ————————————————————————————————————————
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  type: z.enum(['queja', 'sugerencia', 'otro']),
  order_ref: z.string().optional().nullable(),
  message: z.string().min(10),
  honeypot: z.string().optional().nullable(),
  elapsedMs: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const service =
      process.env.SUPABASE_SERVICE_ROLE ??
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

    if (!url || !service) {
      return NextResponse.json(
        { ok: false, error: 'env_missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { apikey: service, Authorization: `Bearer ${service}` } },
    });

    const resendKey = process.env.RESEND_API_KEY || '';
    const emailFrom = process.env.EMAIL_FROM || ''; // ej: "Trailer Burger Hall <notificaciones@tudominio.com>"
    const emailTo = process.env.EMAIL_TO || 'trailerburgerhall@gmail.com';

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'bad_request', detail: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // —— Anti-abuso ——————————————————————————————————————————
    const { name, email, phone, type, order_ref, message, honeypot, elapsedMs } = parsed.data;

    // Honeypot
    if (honeypot && honeypot.trim() !== '') {
      return NextResponse.json({ ok: true }); // silenciar bots
    }

    // Tiempo mínimo de interacción (p. ej. 2.5s)
    if (typeof elapsedMs === 'number' && elapsedMs < 2500) {
      return NextResponse.json({ ok: false, error: 'too_fast' }, { status: 429 });
    }

    // Rate-limit simple por email (máx 3 por hora)
    {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase
        .from('feedback')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo)
        .eq('email', email);

      if (!error && typeof count === 'number' && count >= 3) {
        return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
      }
    }

    // —— Normalización ligera ———————————————————————————————
    const normPhone = phone?.trim() || null;
    const normOrder = order_ref?.trim() || null;
    const normMsg = message.trim();

    // —— Inserción en BD ————————————————————————————————————
    const { data: inserted, error: insErr } = await supabase
      .from('feedback')
      .insert({
        name,
        email,
        phone: normPhone,
        type,
        order_ref: normOrder,
        message: normMsg,
        //status: 'new',
      })
      .select()
      .single();

    if (insErr) {
      console.error('[feedback] insert error', insErr);
      return NextResponse.json(
        { ok: false, error: 'db_insert', detail: { code: insErr.code, message: insErr.message } },
        { status: 500 }
      );
    }

    // —— Emails ——————————————————————————————————————————————
    // Si tienes Resend configurado y un remitente verificado, enviamos:
    if (resendKey && emailFrom) {
      const resend = new Resend(resendKey);

      // 1) Correo al admin (EMAIL_TO) con el contenido
      const adminSubject = `Nuevo ${type} recibido — ${name}`;
      const adminHtml = `
        <h2>Nuevo ${type}</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${normPhone ? `<p><strong>Teléfono:</strong> ${normPhone}</p>` : ''}
        ${normOrder ? `<p><strong>Referencia de pedido:</strong> ${normOrder}</p>` : ''}
        <p><strong>Mensaje:</strong></p>
        <p>${normMsg.replace(/\n/g, '<br/>')}</p>
      `;

      let adminStatus: 'sent' | 'error' = 'sent';
      let adminMsgId: string | null = null;
      let adminErrMsg: string | null = null;

      try {
    const adminRes = (await resend.emails.send({
      from: emailFrom,
      to: emailTo,
      subject: adminSubject,
      html: adminHtml,
      replyTo: email,
    })) as ResendSendResult;

    if (adminRes.error?.message) {
      adminStatus = 'error';
      adminErrMsg = adminRes.error.message;
    } else {
      adminMsgId = adminRes.data?.id ?? null;
    }
  } catch (e: unknown) {
    adminStatus = 'error';
    adminErrMsg = e instanceof Error ? e.message : 'send_failed';
  } finally {
    await supabase.from('email_log').insert({
      kind: 'feedback_admin',
      to_email: emailTo,
      subject: adminSubject,
      status: adminStatus,
      message_id: adminMsgId,
      error: adminErrMsg,
      payload: { name, email, phone: normPhone, type, order_ref: normOrder },
    });
  }

      // 2) Auto-reply al cliente
      const userSubject = 'Gracias por contactarnos — Trailer Burger Hall 🍔';
      const userHtml = `
        <p>Hola ${name},</p>
        <p>¡Gracias por escribirnos! Hemos recibido tu ${type} y nuestro equipo lo revisará pronto.</p>
        <p>Responderemos a este mismo correo en cuanto sea posible.</p>
        <br/>
        <p>🍔 Trailer Burger Hall</p>
      `;

      let userStatus: 'sent' | 'error' = 'sent';
      let userMsgId: string | null = null;
      let userErrMsg: string | null = null;

     try {
    const userRes = (await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: userSubject,
      html: userHtml,
      replyTo: emailTo,
    })) as ResendSendResult;

    if (userRes.error?.message) {
      userStatus = 'error';
      userErrMsg = userRes.error.message;
    } else {
      userMsgId = userRes.data?.id ?? null;
    }
  } catch (e: unknown) {
    userStatus = 'error';
    userErrMsg = e instanceof Error ? e.message : 'send_failed';
  } finally {
    await supabase.from('email_log').insert({
      kind: 'feedback_ack',
      to_email: email,
      subject: userSubject,
      status: userStatus,
      message_id: userMsgId,
      error: userErrMsg,
      payload: { name, type },
    });
  }
} else {
      // Sin Resend configurado: dejamos registro "skipped"
      await supabase.from('email_log').insert([
        {
          kind: 'feedback_admin',
          to_email: emailTo,
          subject: `Nuevo ${type} recibido — ${name}`,
          status: 'skipped',
        },
        {
          kind: 'feedback_ack',
          to_email: email,
          subject: 'Gracias por contactarnos — Trailer Burger Hall 🍔',
          status: 'skipped',
        },
      ]);
    }

    return NextResponse.json({ ok: true, id: inserted.id });
  } catch (e: any) {
    console.error('[feedback] route error', e);
    return NextResponse.json(
      { ok: false, error: 'server_error', detail: e?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}