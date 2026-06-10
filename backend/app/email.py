"""Email service — sends confirmation and reminder emails via Resend API."""

import httpx
import logging

from app.config import settings

logger = logging.getLogger(__name__)

DAYS_ES   = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo']
MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio',
             'agosto','septiembre','octubre','noviembre','diciembre']


def _fmt_date(dt) -> str:
    return f"{DAYS_ES[dt.weekday()]} {dt.day} de {MONTHS_ES[dt.month-1]} de {dt.year}"


def _fmt_time(dt) -> str:
    return dt.strftime("%H:%M")


def _service_rows(appt) -> str:
    """Build one row per service (multi-service aware)."""
    services = [as_.service for as_ in (appt.appointment_services or []) if as_.service]
    if not services and appt.service:
        services = [appt.service]

    html = ""
    for i, svc in enumerate(services):
        label = "Servicio" if len(services) == 1 else f"Servicio {i + 1}"
        price = f"${svc.price:,.0f}".replace(",", ".")
        html += f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Jost',Helvetica,Arial,sans-serif;">
            <span style="color:#9A9490;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;">{label}</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Cormorant Garamond',Georgia,serif;">
            <span style="color:#2A2420;font-size:14px;">{svc.name}</span>
            <span style="color:#9A9490;font-size:11px;margin-left:6px;">{price}</span>
          </td>
        </tr>"""

    if len(services) > 1:
        total = sum(svc.price for svc in services)
        total_fmt = f"${total:,.0f}".replace(",", ".")
        html += f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Jost',Helvetica,Arial,sans-serif;">
            <span style="color:#9A9490;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;">Total</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Cormorant Garamond',Georgia,serif;">
            <span style="color:#C9A05A;font-size:15px;font-weight:600;">{total_fmt}</span>
          </td>
        </tr>"""

    return html


def _details_rows(appt) -> str:
    rows = [
        ("Fecha", _fmt_date(appt.start_datetime), False),
        ("Hora",  _fmt_time(appt.start_datetime), True),
    ]
    html = _service_rows(appt)
    for i, (label, value, accent) in enumerate(rows):
        border = "border-bottom:1px solid #E8E0D5;" if i < len(rows) - 1 else ""
        val_color = "#C9A05A" if accent else "#2A2420"
        val_size  = "20px" if accent else "14px"
        val_weight = "600" if accent else "400"
        html += f"""
        <tr>
          <td style="padding:12px 0;{border}font-family:'Jost',Helvetica,Arial,sans-serif;">
            <span style="color:#9A9490;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;">{label}</span>
          </td>
          <td align="right" style="padding:12px 0;{border}font-family:'Cormorant Garamond',Georgia,serif;">
            <span style="color:{val_color};font-size:{val_size};font-weight:{val_weight};">{value}</span>
          </td>
        </tr>"""
    return html


def _notes_block(appt) -> str:
    if not appt.notes:
        return ""
    notes = appt.notes.strip()
    if notes.startswith("Opciones:"):
        first_line = notes.split("\n")[0]
        opts = first_line.replace("Opciones:", "").strip()
        return f"""
        <p style="margin:20px 0 0;color:#9A9490;font-size:12px;text-align:center;
                  font-family:'Jost',Helvetica,Arial,sans-serif;letter-spacing:0.05em;">
          Opciones seleccionadas: <span style="color:#C9A05A;">{opts}</span>
        </p>"""
    return f"""
        <p style="margin:20px 0 0;color:#9A9490;font-size:12px;text-align:center;
                  font-family:'Jost',Helvetica,Arial,sans-serif;">
          Nota: {notes}
        </p>"""


def _base_template(title: str, subtitle: str, body_extra: str, appt) -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#EDE8E0;font-family:'Jost',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDE8E0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#FAFAF8;">

        <!-- Header bar -->
        <tr>
          <td style="background:#2A2420;padding:30px 40px;text-align:center;">
            <p style="margin:0;color:#F5F0EA;font-family:'Cormorant Garamond',Georgia,serif;
                      font-size:20px;font-weight:400;letter-spacing:0.28em;text-transform:uppercase;">
              Studio Clau Miranda
            </p>
            <p style="margin:6px 0 0;color:#6A6460;font-size:9px;letter-spacing:0.35em;
                      text-transform:uppercase;font-family:'Jost',Helvetica,Arial,sans-serif;">
              Peluquería &amp; Estética
            </p>
          </td>
        </tr>

        <!-- Gold accent line -->
        <tr><td style="height:3px;background:#C9A05A;"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:44px 40px 36px;">

            <h1 style="margin:0 0 10px;font-family:'Cormorant Garamond',Georgia,serif;
                       font-size:30px;font-weight:400;color:#2A2420;text-align:center;
                       letter-spacing:0.04em;">
              {title}
            </h1>
            <p style="margin:0 0 32px;color:#7A7470;font-size:13px;text-align:center;
                      line-height:1.7;letter-spacing:0.02em;">
              {subtitle}
            </p>

            <!-- Thin divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td style="border-top:1px solid #E2DBD0;"></td></tr>
            </table>

            <!-- Details card -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#F5F0EA;border-top:2px solid #C9A05A;">
              <tr><td style="padding:18px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  {_details_rows(appt)}
                </table>
              </td></tr>
            </table>

            {_notes_block(appt)}
            {body_extra}

            <!-- Thin divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr><td style="border-top:1px solid #E2DBD0;"></td></tr>
            </table>

            <p style="margin:24px 0 0;color:#9A9490;font-size:11px;text-align:center;
                      line-height:1.8;letter-spacing:0.03em;">
              ¿Necesitas cancelar o modificar tu cita?<br>
              <a href="https://wa.me/56958306982"
                 style="color:#C9A05A;text-decoration:none;letter-spacing:0.05em;">
                Escríbenos por WhatsApp
              </a>
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#2A2420;padding:16px 40px;text-align:center;">
            <p style="margin:0;color:#6A6460;font-size:9px;letter-spacing:0.2em;
                      text-transform:uppercase;font-family:'Jost',Helvetica,Arial,sans-serif;">
              Studio Clau Miranda &nbsp;&mdash;&nbsp; studioclaumiranda.cl
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def build_confirmation_html(appt) -> str:
    name = appt.user.name if appt.user else "Cliente"
    return _base_template(
        title="Reserva Confirmada",
        subtitle=f"Hola <strong style='color:#2A2420;font-weight:500;'>{name}</strong>, tu cita ha sido registrada exitosamente.",
        body_extra="",
        appt=appt,
    )


def build_reminder_html(appt) -> str:
    name = appt.user.name if appt.user else "Cliente"
    time_str = _fmt_time(appt.start_datetime)
    return _base_template(
        title="Recordatorio de Cita",
        subtitle=f"Hola <strong style='color:#2A2420;font-weight:500;'>{name}</strong>, te recordamos que <strong style='color:#2A2420;font-weight:500;'>hoy a las {time_str}</strong> tienes una cita con nosotros.",
        body_extra="""
        <p style="margin:20px 0 0;color:#9A9490;font-size:11px;text-align:center;
                  line-height:1.7;font-style:italic;letter-spacing:0.03em;">
          Si no puedes asistir, por favor avísanos con anticipación.
        </p>""",
        appt=appt,
    )


async def _send(to_email: str, subject: str, html: str) -> None:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping email to %s", to_email)
        return
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.FROM_EMAIL,
                "to":   [to_email],
                "subject": subject,
                "html": html,
            },
        )
    if response.status_code >= 400:
        logger.error("Resend error sending to %s: %s %s", to_email, response.status_code, response.text)
    else:
        logger.info("Email sent to %s (status %s)", to_email, response.status_code)


async def send_confirmation_email(appt) -> None:
    if not appt.user or not appt.user.email:
        return
    subject = f"Reserva confirmada — {_fmt_date(appt.start_datetime)}"
    await _send(appt.user.email, subject, build_confirmation_html(appt))


async def send_reminder_email(appt) -> None:
    if not appt.user or not appt.user.email:
        return
    subject = f"Recordatorio: tu cita es hoy a las {_fmt_time(appt.start_datetime)}"
    await _send(appt.user.email, subject, build_reminder_html(appt))


STYLIST_EMAIL = "studioclaumiranda@gmail.com"


def _build_stylist_html(appt, title: str, intro: str) -> str:
    client_name  = appt.user.name  if appt.user else "Desconocido"
    client_email = appt.user.email if appt.user else "—"
    client_phone = (appt.user.phone or "—") if appt.user else "—"

    contact_rows = f"""
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Jost',Helvetica,Arial,sans-serif;">
            <span style="color:#9A9490;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;">Cliente</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Cormorant Garamond',Georgia,serif;">
            <span style="color:#2A2420;font-size:14px;">{client_name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Jost',Helvetica,Arial,sans-serif;">
            <span style="color:#9A9490;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;">Correo</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Cormorant Garamond',Georgia,serif;">
            <span style="color:#2A2420;font-size:14px;">{client_email}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Jost',Helvetica,Arial,sans-serif;">
            <span style="color:#9A9490;font-size:10px;text-transform:uppercase;letter-spacing:0.18em;">Teléfono</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #E8E0D5;font-family:'Cormorant Garamond',Georgia,serif;">
            <span style="color:#2A2420;font-size:14px;">{client_phone}</span>
          </td>
        </tr>"""

    details  = _details_rows(appt)
    notes    = _notes_block(appt)

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#EDE8E0;font-family:'Jost',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EDE8E0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#FAFAF8;">

        <tr>
          <td style="background:#2A2420;padding:30px 40px;text-align:center;">
            <p style="margin:0;color:#F5F0EA;font-family:'Cormorant Garamond',Georgia,serif;
                      font-size:20px;font-weight:400;letter-spacing:0.28em;text-transform:uppercase;">
              Studio Clau Miranda
            </p>
            <p style="margin:6px 0 0;color:#6A6460;font-size:9px;letter-spacing:0.35em;
                      text-transform:uppercase;font-family:'Jost',Helvetica,Arial,sans-serif;">
              Peluquería &amp; Estética
            </p>
          </td>
        </tr>

        <tr><td style="height:3px;background:#C9A05A;"></td></tr>

        <tr>
          <td style="padding:44px 40px 36px;">

            <h1 style="margin:0 0 10px;font-family:'Cormorant Garamond',Georgia,serif;
                       font-size:30px;font-weight:400;color:#2A2420;text-align:center;
                       letter-spacing:0.04em;">
              {title}
            </h1>
            <p style="margin:0 0 32px;color:#7A7470;font-size:13px;text-align:center;
                      line-height:1.7;letter-spacing:0.02em;">
              {intro}
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td style="border-top:1px solid #E2DBD0;"></td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#F5F0EA;border-top:2px solid #C9A05A;margin-bottom:16px;">
              <tr><td style="padding:18px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  {contact_rows}
                </table>
              </td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#F5F0EA;border-top:2px solid #2A2420;">
              <tr><td style="padding:18px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  {details}
                </table>
              </td></tr>
            </table>

            {notes}

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
              <tr><td style="border-top:1px solid #E2DBD0;"></td></tr>
            </table>

          </td>
        </tr>

        <tr>
          <td style="background:#2A2420;padding:16px 40px;text-align:center;">
            <p style="margin:0;color:#6A6460;font-size:9px;letter-spacing:0.2em;
                      text-transform:uppercase;font-family:'Jost',Helvetica,Arial,sans-serif;">
              Studio Clau Miranda &nbsp;&mdash;&nbsp; studioclaumiranda.cl
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def build_stylist_notification_html(appt) -> str:
    date_str = _fmt_date(appt.start_datetime)
    time_str = _fmt_time(appt.start_datetime)
    return _build_stylist_html(
        appt,
        title="Nueva Reserva",
        intro=f"Tienes una nueva cita agendada para el <strong style=\"color:#2A2420;\">{date_str}</strong> a las <strong style=\"color:#C9A05A;\">{time_str}</strong>.",
    )


def build_stylist_modification_html(appt) -> str:
    date_str = _fmt_date(appt.start_datetime)
    time_str = _fmt_time(appt.start_datetime)
    return _build_stylist_html(
        appt,
        title="Cita Modificada",
        intro=f"Una cita ha sido modificada. Nueva fecha: <strong style=\"color:#2A2420;\">{date_str}</strong> a las <strong style=\"color:#C9A05A;\">{time_str}</strong>.",
    )


def build_modification_client_html(appt) -> str:
    name = appt.user.name if appt.user else "Cliente"
    return _base_template(
        title="Cita Modificada",
        subtitle=f"Hola <strong style='color:#2A2420;font-weight:500;'>{name}</strong>, los detalles de tu cita han sido actualizados.",
        body_extra="",
        appt=appt,
    )


async def send_stylist_notification_email(appt) -> None:
    subject = f"Nueva reserva — {_fmt_date(appt.start_datetime)} a las {_fmt_time(appt.start_datetime)}"
    await _send(STYLIST_EMAIL, subject, build_stylist_notification_html(appt))


async def send_modification_emails(appt) -> None:
    date_str = _fmt_date(appt.start_datetime)
    time_str = _fmt_time(appt.start_datetime)
    if appt.user and appt.user.email:
        await _send(
            appt.user.email,
            f"Cita modificada — {date_str} a las {time_str}",
            build_modification_client_html(appt),
        )
    await _send(
        STYLIST_EMAIL,
        f"Cita modificada — {date_str} a las {time_str}",
        build_stylist_modification_html(appt),
    )
