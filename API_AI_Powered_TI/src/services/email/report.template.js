export const generateReportHTML = (candidate, analysis) => {
  const { skills_match, culture_fit, retention, overall } = analysis.result || {}

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #f9fafb;
    }
    .container {
      background: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #111827;
      font-size: 24px;
      margin: 0;
    }
    .header p {
      color: #6b7280;
      margin: 5px 0 0;
    }
    .score-card {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
    .score-number {
      font-size: 48px;
      font-weight: 700;
      color: ${getScoreColor(overall?.score || 0)};
    }
    .score-label {
      font-size: 14px;
      color: #6b7280;
    }
    .section {
      margin: 25px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .section h3 {
      margin: 0 0 10px 0;
      color: #111827;
    }
    .section h3 .icon {
      font-size: 20px;
      margin-right: 8px;
    }
    .skill-item {
      display: inline-block;
      background: #e5e7eb;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      margin: 3px 4px 3px 0;
    }
    .skill-item.match {
      background: #d1fae5;
      color: #065f46;
    }
    .skill-item.missing {
      background: #fee2e2;
      color: #991b1b;
    }
    .bullet-list {
      padding-left: 20px;
      margin: 5px 0;
    }
    .bullet-list li {
      margin: 5px 0;
    }
    .footer {
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    .recommendation {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }
    .recommendation.shortlist {
      background: #d1fae5;
      color: #065f46;
    }
    .recommendation.reject {
      background: #fee2e2;
      color: #991b1b;
    }
    .recommendation.need_more_info {
      background: #fef3c7;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Kết quả đánh giá hồ sơ</h1>
      <p>Cảm ơn bạn đã ứng tuyển vào vị trí <strong>${candidate.position_applied}</strong></p>
    </div>

    <!-- Overall Score -->
    <div class="score-card">
      <div class="score-number">${overall?.score || 0}</div>
      <div class="score-label">Điểm tổng quan</div>
      <div style="margin-top: 10px;">
        <span class="recommendation ${overall?.recommendation || 'need_more_info'}">
          ${overall?.recommendation === 'shortlist' ? 'Ứng viên tiềm năng' :
    overall?.recommendation === 'reject' ? 'Chưa phù hợp' :
      'Cần xem xét thêm'}
        </span>
      </div>
      <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">
        ${overall?.summary || ''}
      </p>
    </div>

    <!-- Skills Match -->
    <div class="section">
      <h3><span class="icon">[Kỹ năng]</span> Kỹ năng phù hợp</h3>
      <p><strong>Điểm: ${skills_match?.score || 0}/100</strong></p>
      <div style="margin: 10px 0;">
        <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Kỹ năng đáp ứng:</p>
        <div>
          ${(skills_match?.matched_skills || []).map(s =>
    `<span class="skill-item match">${s}</span>`
  ).join('') || '<span style="color: #6b7280; font-size: 14px;">Chưa có kỹ năng phù hợp</span>'}
        </div>
      </div>
      <div>
        <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Kỹ năng còn thiếu:</p>
        <div>
          ${(skills_match?.missing_skills || []).map(s =>
    `<span class="skill-item missing">${s}</span>`
  ).join('') || '<span style="color: #6b7280; font-size: 14px;">Bạn đáp ứng đầy đủ kỹ năng</span>'}
        </div>
      </div>
      ${(skills_match?.suggestions || []).length > 0 ? `
      <div style="margin-top: 10px; padding: 12px; background: #fef3c7; border-radius: 6px;">
        <p style="font-size: 14px; color: #92400e; margin: 0;">
          <strong>Gợi ý phát triển:</strong> ${skills_match.suggestions.join('; ')}
        </p>
      </div>` : ''}
    </div>

    <!-- Culture Fit -->
    <div class="section">
      <h3><span class="icon">[Văn hóa]</span> Văn hóa công ty</h3>
      <p><strong>Điểm: ${culture_fit?.score || 0}/100</strong></p>
      <p style="font-size: 14px; color: #4b5563;">${culture_fit?.analysis || ''}</p>
      ${(culture_fit?.strengths || []).length > 0 ? `
      <div style="margin-top: 10px;">
        <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Điểm mạnh:</p>
        <ul class="bullet-list">
          ${culture_fit.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>` : ''}
      ${(culture_fit?.improvements || []).length > 0 ? `
      <div>
        <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Có thể cải thiện:</p>
        <ul class="bullet-list">
          ${culture_fit.improvements.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>

    <!-- Retention -->
    <div class="section">
      <h3><span class="icon">[Dự báo]</span> Dự báo gắn bó</h3>
      <p><strong>Điểm: ${retention?.score || 0}/100</strong></p>
      <p style="font-size: 14px; color: #4b5563;">${retention?.analysis || ''}</p>
      ${retention?.advice ? `
      <div style="margin-top: 10px; padding: 12px; background: #dbeafe; border-radius: 6px;">
        <p style="font-size: 14px; color: #1e40af; margin: 0;">
          <strong>Lời khuyên:</strong> ${retention.advice}
        </p>
      </div>` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Báo cáo này được tạo tự động bởi <strong>Talent Intelligence Platform</strong></p>
      <p>Đây là thông tin tham khảo để bạn hiểu rõ hơn về hồ sơ của mình.</p>
    </div>
  </div>
</body>
</html>
  `
}

// Tạo text content cho email (plain text)
export const generateReportText = (candidate, analysis) => {
  const { overall } = analysis.result || {}

  return `
KẾT QUẢ ĐÁNH GIÁ HỒ SƠ
========================

Cảm ơn bạn đã ứng tuyển vào vị trí: ${candidate.position_applied}

Điểm tổng quan: ${overall?.score || 0}/100
Khuyến nghị: ${overall?.recommendation === 'shortlist' ? 'Ứng viên tiềm năng' :
    overall?.recommendation === 'reject' ? 'Chưa phù hợp' :
      'Cần xem xét thêm'}

Đánh giá tổng quan:
${overall?.summary || ''}

---
Báo cáo được tạo tự động bởi Talent Intelligence Platform
  `
}