export async function downloadCertificatePng(certificate) {
  if (certificate.is_verified === false || certificate.is_verified === "false") {
    throw new Error("This certificate is revoked or not verified.");
  }
  const width = 1600;
  const height = 1100;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser cannot create certificate images.");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#071A35");
  gradient.addColorStop(1, "#123D68");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(42, 42, width - 84, height - 84);
  ctx.strokeStyle = "#C69B43";
  ctx.lineWidth = 8;
  ctx.strokeRect(68, 68, width - 136, height - 136);
  ctx.lineWidth = 2;
  ctx.strokeRect(88, 88, width - 176, height - 176);

  ctx.textAlign = "center";
  ctx.fillStyle = "#123D68";
  ctx.font = "bold 48px Georgia";
  ctx.fillText("INTERNSHIPHUB", width / 2, 190);
  ctx.fillStyle = "#64748B";
  ctx.font = "italic 23px Georgia";
  ctx.fillText("Opportunities Without Borders", width / 2, 232);

  ctx.fillStyle = "#C69B43";
  ctx.font = "bold 28px Georgia";
  ctx.fillText("CERTIFICATE OF COMPLETION", width / 2, 340);
  ctx.fillStyle = "#475569";
  ctx.font = "28px Georgia";
  ctx.fillText("This certificate is proudly presented to", width / 2, 425);

  ctx.fillStyle = "#102B4C";
  ctx.font = "bold 64px Georgia";
  const name = String(certificate.certificate_full_name || certificate.student_name || "Student");
  ctx.fillText(name.slice(0, 52), width / 2, 535);

  ctx.fillStyle = "#475569";
  ctx.font = "26px Georgia";
  ctx.fillText("for successfully completing the internship", width / 2, 620);
  ctx.fillStyle = "#123D68";
  ctx.font = "bold 36px Georgia";
  ctx.fillText(String(certificate.internship_title || "Internship").slice(0, 64), width / 2, 690);
  ctx.fillStyle = "#475569";
  ctx.font = "25px Georgia";
  ctx.fillText(`at ${String(certificate.company_name || "Company").slice(0, 70)}`, width / 2, 755);

  const date = certificate.issue_date
    ? new Date(certificate.issue_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  ctx.font = "22px Arial";
  ctx.fillText(`Issue Date: ${date}`, width / 2, 850);
  ctx.fillStyle = "#123D68";
  ctx.font = "bold 22px Arial";
  ctx.fillText(`Certificate ID: ${certificate.certificate_id || "—"}`, width / 2, 910);
  ctx.fillStyle = "#64748B";
  ctx.font = "18px Arial";
  ctx.fillText("Verify this certificate using its unique ID on InternShipHub.", width / 2, 965);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Unable to export certificate PNG.");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${certificate.certificate_id || "InternShipHub-Certificate"}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
