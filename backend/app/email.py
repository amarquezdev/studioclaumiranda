"""Email service — sends confirmation and reminder emails via Resend API."""

import httpx

from app.config import settings

DAYS_ES   = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo']
MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio',
             'agosto','septiembre','octubre','noviembre','diciembre']


def _fmt_date(dt) -> str:
    return f"{DAYS_ES[dt.weekday()]} {dt.day} de {MONTHS_ES[dt.month-1]} de {dt.year}"


def _fmt_time(dt) -> str:
    return dt.strftime("%H:%M")


def _details_rows(appt) -> str:
    rows = [
        ("Servicio", appt.service.name if appt.service else "—"),
        ("Fecha",    _fmt_date(appt.start_datetime)),
        ("Hora",     _fmt_time(appt.start_datetime), True),
    ]
    html = ""
    for i, row in enumerate(rows):
        label, value = row[0], row[1]
        accent = len(row) == 3
        border = "border-bottom:1px solid #E0D9D2;" if i < len(rows) - 1 else ""
        val_style = f"color:#6E8060;font-size:20px;font-weight:bold;" if accent else "color:#2A2420;font-size:14px;"
        html += f"""
        <tr>
          <td style="padding:10px 0;{border}">
            <span style="color:#8A8480;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;">{label}</span>
          </td>
          <td align="right" style="padding:10px 0;{border}">
            <span style="{val_style}">{value}</span>
          </td>
        </tr>"""
    return html


def _notes_block(appt) -> str:
    if not appt.notes:
        return ""
    # Extract option names if present
    notes = appt.notes.strip()
    if notes.startswith("Opciones:"):
        first_line = notes.split("\n")[0]
        opts = first_line.replace("Opciones:", "").strip()
        return f"""
        <p style="margin:16px 0 0;color:#8A8480;font-size:12px;text-align:center;">
          Opciones seleccionadas: <span style="color:#6E8060;">{opts}</span>
        </p>"""
    return f"""
        <p style="margin:16px 0 0;color:#8A8480;font-size:12px;text-align:center;">
          Nota: {notes}
        </p>"""


def _base_template(header_icon: str, title: str, subtitle: str, body_extra: str, appt) -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#F0EBE3;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EBE3;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E0D9D2;">

        <!-- Header -->
        <tr>
          <td style="background:#2A2420;padding:28px 40px;text-align:center;">
            <p style="margin:0;color:#F7F2EC;font-family:Georgia,serif;font-size:18px;
                      font-weight:normal;letter-spacing:0.25em;text-transform:uppercase;">
              Studio Clau Miranda
            </p>
            <p style="margin:5px 0 0;color:#6A6460;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;">
              Peluquería &amp; Estética
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">

            <!-- Icon -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding-bottom:20px;">
                <div style="width:52px;height:52px;background:#6E8060;border-radius:50%;
                            display:inline-block;text-align:center;line-height:52px;
                            font-size:22px;color:#FFFFFF;">
                  {header_icon}
                </div>
              </td></tr>
            </table>

            <h1 style="margin:0 0 6px;font-family:Georgia,serif;font-size:26px;
                       font-weight:normal;color:#2A2420;text-align:center;">
              {title}
            </h1>
            <p style="margin:0 0 28px;color:#8A8480;font-size:14px;text-align:center;line-height:1.6;">
              {subtitle}
            </p>

            <!-- Details card -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#F7F2EC;border-left:3px solid #6E8060;">
              <tr><td style="padding:16px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  {_details_rows(appt)}
                </table>
              </td></tr>
            </table>

            {_notes_block(appt)}
            {body_extra}

            <p style="margin:28px 0 0;color:#8A8480;font-size:12px;text-align:center;line-height:1.7;">
              ¿Necesitas cancelar o modificar tu cita?<br>
              Escríbenos a
              <a href="mailto:contacto@studioclaumiranda.cl"
                 style="color:#6E8060;text-decoration:none;">
                contacto@studioclaumiranda.cl
              </a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F7F2EC;padding:18px 40px;text-align:center;
                     border-top:1px solid #E0D9D2;">
            <p style="margin:0;color:#B0A8A4;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;">
              Studio Clau Miranda &nbsp;·&nbsp; studioclaumiranda.cl
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
        header_icon="✓",
        title="¡Reserva confirmada!",
        subtitle=f"Hola <strong style='color:#2A2420;'>{name}</strong>, tu cita ha sido registrada exitosamente.",
        body_extra="",
        appt=appt,
    )


def build_reminder_html(appt) -> str:
    name = appt.user.name if appt.user else "Cliente"
    return _base_template(
        header_icon="◷",
        title="Recordatorio de cita",
        subtitle=f"Hola <strong style='color:#2A2420;'>{name}</strong>, te recordamos que <strong style='color:#2A2420;'>mañana</strong> tienes una cita con nosotros.",
        body_extra="""
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
          <tr><td align="center">
            <p style="margin:0;color:#8A8480;font-size:12px;font-style:italic;">
              Si no puedes asistir, por favor avísanos con anticipación.
            </p>
          </td></tr>
        </table>""",
        appt=appt,
    )


async def _send(to_email: str, subject: str, html: str) -> None:
    """Calls Resend REST API to send an email."""
    if not settings.RESEND_API_KEY:
        return
    async with httpx.AsyncClient(timeout=10.0) as client:
        await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.FROM_EMAIL,
                "to":   [to_email],
                "subject": subject,
                "html": html,
            },
        )


async def send_confirmation_email(appt) -> None:
    if not appt.user or not appt.user.email:
        return
    subject = f"Reserva confirmada — {_fmt_date(appt.start_datetime)}"
    await _send(appt.user.email, subject, build_confirmation_html(appt))


async def send_reminder_email(appt) -> None:
    if not appt.user or not appt.user.email:
        return
    subject = f"Recordatorio: tu cita es mañana a las {_fmt_time(appt.start_datetime)}"
    await _send(appt.user.email, subject, build_reminder_html(appt))
